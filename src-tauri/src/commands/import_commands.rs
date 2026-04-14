use std::fs;
use directories::UserDirs;
use tauri::State;
use std::sync::Mutex;

struct ParsedSshHost {
    name: String,
    hostname: String,
    port: u16,
    user: String,
    identity_file: Option<String>,
}

fn parse_ssh_config_file(content: &str) -> Vec<ParsedSshHost> {
    let mut hosts: Vec<ParsedSshHost> = Vec::new();
    let mut cur_name: Option<String> = None;
    let mut cur_hostname: Option<String> = None;
    let mut cur_port: u16 = 22;
    let mut cur_user = String::new();
    let mut cur_identity: Option<String> = None;

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        // Split keyword from value (supports space or = separator)
        let idx = match trimmed.find(|c: char| c.is_whitespace() || c == '=') {
            Some(i) => i,
            None => continue,
        };
        let key = &trimmed[..idx];
        let val = trimmed[idx..].trim_start_matches(|c: char| c.is_whitespace() || c == '=').trim();

        if key.eq_ignore_ascii_case("Host") {
            // Save the previous parsed host block
            if let Some(name) = cur_name.take() {
                if name != "*" {
                    let hostname = cur_hostname.take().unwrap_or_else(|| name.clone());
                    hosts.push(ParsedSshHost {
                        name,
                        hostname,
                        port: cur_port,
                        user: if cur_user.is_empty() {
                            std::env::var("USER").unwrap_or_else(|_| "root".to_string())
                        } else {
                            std::mem::take(&mut cur_user)
                        },
                        identity_file: cur_identity.take(),
                    });
                }
            }
            // Reset state for new block
            cur_hostname = None;
            cur_port = 22;
            cur_user = String::new();
            cur_identity = None;
            // Take first alias (SSH config allows multiple, we use the first)
            let alias = val.split_whitespace().next().unwrap_or("").to_string();
            cur_name = if alias.is_empty() { None } else { Some(alias) };
        } else if key.eq_ignore_ascii_case("HostName") {
            cur_hostname = Some(val.to_string());
        } else if key.eq_ignore_ascii_case("Port") {
            cur_port = val.parse().unwrap_or(22);
        } else if key.eq_ignore_ascii_case("User") {
            cur_user = val.to_string();
        } else if key.eq_ignore_ascii_case("IdentityFile") {
            cur_identity = Some(val.to_string());
        }
    }

    // Don't forget the last block
    if let Some(name) = cur_name {
        if name != "*" {
            let hostname = cur_hostname.unwrap_or_else(|| name.clone());
            hosts.push(ParsedSshHost {
                name,
                hostname,
                port: cur_port,
                user: if cur_user.is_empty() {
                    std::env::var("USER").unwrap_or_else(|_| "root".to_string())
                } else {
                    cur_user
                },
                identity_file: cur_identity,
            });
        }
    }

    hosts
}

fn generate_uuid() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let mut b = [0u8; 16];
    for i in 0..16 {
        b[i] = rng.gen::<u8>();
    }
    b[6] = (b[6] & 0x0f) | 0x40; // UUIDv4 version
    b[8] = (b[8] & 0x3f) | 0x80; // variant
    format!(
        "{:02x}{:02x}{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}",
        b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7],
        b[8], b[9], b[10], b[11], b[12], b[13], b[14], b[15]
    )
}

fn now_rfc3339() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let hours = (secs % 86400) / 3600;
    let minutes = (secs % 3600) / 60;
    let seconds = secs % 60;
    let mut days = secs / 86400;

    let mut year = 1970u64;
    loop {
        let days_in_year = if year % 4 == 0 && (year % 100 != 0 || year % 400 == 0) { 366u64 } else { 365u64 };
        if days < days_in_year { break; }
        days -= days_in_year;
        year += 1;
    }

    let leap = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    let month_days: [u64; 12] = if leap {
        [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    } else {
        [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    };

    let mut month = 1u64;
    for &md in &month_days {
        if days < md { break; }
        days -= md;
        month += 1;
    }
    let day = days + 1;

    format!("{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z", year, month, day, hours, minutes, seconds)
}

#[tauri::command]
pub fn import_ssh_config(db_conn: State<Mutex<rusqlite::Connection>>) -> Result<String, String> {
    let user_dirs = UserDirs::new().ok_or("无法获取用户主目录")?;
    let config_path = user_dirs.home_dir().join(".ssh").join("config");

    if !config_path.exists() {
        return Ok("~/.ssh/config 文件不存在，无需导入".to_string());
    }

    let content = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let parsed = parse_ssh_config_file(&content);

    if parsed.is_empty() {
        return Ok("~/.ssh/config 中没有找到可导入的主机配置".to_string());
    }

    let conn = db_conn.lock().unwrap();
    let mut imported = 0usize;
    let mut skipped = 0usize;

    for h in parsed {
        // Skip if a host with the same name already exists
        let exists: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM hosts WHERE name = ?1)",
            rusqlite::params![h.name],
            |row| row.get(0),
        ).unwrap_or(false);

        if exists {
            skipped += 1;
            continue;
        }

        let now = now_rfc3339();
        let id = generate_uuid();
        let auth_type = if h.identity_file.is_some() { "key" } else { "password" };

        conn.execute(
            "INSERT INTO hosts (id, name, host, port, user, auth_type, identity_file, group_id, tags, color, notes, show_in_vscode, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, NULL, NULL, NULL, NULL, 1, ?8, ?9)",
            rusqlite::params![id, h.name, h.hostname, h.port, h.user, auth_type, h.identity_file, now, now],
        ).map_err(|e| e.to_string())?;

        imported += 1;
    }

    Ok(format!("导入完成：新增 {} 条，跳过 {} 条（已存在）", imported, skipped))
}
