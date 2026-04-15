use std::fs;
use tauri::State;
use std::sync::Mutex;
use directories::UserDirs;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportHost {
    pub name: String,
    pub host: String,
    pub port: i32,
    pub user: String,
    pub auth_type: String,
    pub identity_file: Option<String>,
    pub group_name: Option<String>,
    pub tags: Option<Vec<String>>,
    pub color: Option<String>,
    pub notes: Option<String>,
}

fn get_export_data(db_conn: &Mutex<rusqlite::Connection>) -> Result<Vec<ExportHost>, String> {
    let conn = db_conn.lock().unwrap();

    // Get all groups first
    let mut group_stmt = conn.prepare("SELECT id, name FROM groups").map_err(|e| e.to_string())?;
    let group_iter = group_stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    }).map_err(|e| e.to_string())?;

    let mut groups: std::collections::HashMap<String, String> = std::collections::HashMap::new();
    for group_result in group_iter {
        if let Ok((id, name)) = group_result {
            groups.insert(id, name);
        }
    }

    // Get all hosts
    let mut stmt = conn.prepare(
        "SELECT id, name, host, port, user, auth_type, identity_file, group_id, tags, color, notes FROM hosts ORDER BY name"
    ).map_err(|e| e.to_string())?;

    let host_iter = stmt.query_map([], |row| {
        let group_id: Option<String> = row.get(7)?;
        let tags_str: Option<String> = row.get(8)?;

        Ok(ExportHost {
            name: row.get(1)?,
            host: row.get(2)?,
            port: row.get(3)?,
            user: row.get(4)?,
            auth_type: row.get(5)?,
            identity_file: row.get(6)?,
            group_name: group_id.as_ref().and_then(|gid| groups.get(gid).cloned()),
            tags: tags_str.map(|s| serde_json::from_str(&s).unwrap_or_default()),
            color: row.get(9)?,
            notes: row.get(10)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut hosts = Vec::new();
    for host_result in host_iter {
        hosts.push(host_result.map_err(|e| e.to_string())?);
    }

    Ok(hosts)
}

#[tauri::command]
pub fn export_json(db_conn: State<Mutex<rusqlite::Connection>>, path: String) -> Result<String, String> {
    let hosts = get_export_data(&db_conn)?;

    let json = serde_json::to_string_pretty(&hosts).map_err(|e| e.to_string())?;

    fs::write(&path, json).map_err(|e| e.to_string())?;

    Ok(format!("已导出 {} 条主机到 JSON 文件", hosts.len()))
}

#[tauri::command]
pub fn export_toml(db_conn: State<Mutex<rusqlite::Connection>>, path: String) -> Result<String, String> {
    let hosts = get_export_data(&db_conn)?;

    let mut toml_str = String::new();

    // Group hosts by group
    let mut groups: std::collections::HashMap<String, Vec<&ExportHost>> = std::collections::HashMap::new();
    let mut ungrouped: Vec<&ExportHost> = Vec::new();

    for host in &hosts {
        if let Some(ref group_name) = host.group_name {
            groups.entry(group_name.clone()).or_default().push(host);
        } else {
            ungrouped.push(host);
        }
    }

    // Write grouped hosts
    for (group_name, group_hosts) in groups {
        toml_str.push_str(&format!("# {}\n\n", group_name));
        for host in group_hosts {
            toml_str.push_str(&format!(
                "[[hosts]]\nname = \"{}\"\nhost = \"{}\"\nport = {}\nuser = \"{}\"\nauth_type = \"{}\"\n",
                host.name, host.host, host.port, host.user, host.auth_type
            ));
            if let Some(ref identity_file) = host.identity_file {
                toml_str.push_str(&format!("identity_file = \"{}\"\n", identity_file));
            }
            if let Some(ref color) = host.color {
                toml_str.push_str(&format!("color = \"{}\"\n", color));
            }
            if let Some(ref notes) = host.notes {
                toml_str.push_str(&format!("notes = \"{}\"\n", notes.replace("\n", "\\n")));
            }
            if let Some(ref tags) = host.tags {
                if !tags.is_empty() {
                    toml_str.push_str(&format!("tags = {}\n", serde_json::to_string(tags).unwrap()));
                }
            }
            toml_str.push('\n');
        }
    }

    // Write ungrouped hosts
    if !ungrouped.is_empty() {
        toml_str.push_str("# 未分组\n\n");
        for host in ungrouped {
            toml_str.push_str(&format!(
                "[[hosts]]\nname = \"{}\"\nhost = \"{}\"\nport = {}\nuser = \"{}\"\nauth_type = \"{}\"\n",
                host.name, host.host, host.port, host.user, host.auth_type
            ));
            if let Some(ref identity_file) = host.identity_file {
                toml_str.push_str(&format!("identity_file = \"{}\"\n", identity_file));
            }
            if let Some(ref color) = host.color {
                toml_str.push_str(&format!("color = \"{}\"\n", color));
            }
            if let Some(ref notes) = host.notes {
                toml_str.push_str(&format!("notes = \"{}\"\n", notes.replace("\n", "\\n")));
            }
            toml_str.push('\n');
        }
    }

    fs::write(&path, toml_str).map_err(|e| e.to_string())?;

    Ok(format!("已导出 {} 条主机到 TOML 文件", hosts.len()))
}

#[tauri::command]
pub fn export_ssh_config(db_conn: State<Mutex<rusqlite::Connection>>, path: String) -> Result<String, String> {
    let hosts = get_export_data(&db_conn)?;

    let mut config = String::new();
    config.push_str("# SSH Config Export\n");
    config.push_str(&format!("# Generated at {}\n\n", chrono_lite_now()));

    // Group hosts by group
    let mut groups: std::collections::HashMap<String, Vec<&ExportHost>> = std::collections::HashMap::new();
    let mut ungrouped: Vec<&ExportHost> = Vec::new();

    for host in &hosts {
        if let Some(ref group_name) = host.group_name {
            groups.entry(group_name.clone()).or_default().push(host);
        } else {
            ungrouped.push(host);
        }
    }

    // Write grouped hosts
    for (group_name, group_hosts) in groups {
        config.push_str(&format!("# --- {} ---\n\n", group_name));
        for host in group_hosts {
            config.push_str(&format!("Host {}\n", host.name));
            config.push_str(&format!("    HostName {}\n", host.host));
            config.push_str(&format!("    Port {}\n", host.port));
            config.push_str(&format!("    User {}\n", host.user));
            if let Some(ref identity_file) = host.identity_file {
                config.push_str(&format!("    IdentityFile {}\n", identity_file));
            }
            if let Some(ref notes) = host.notes {
                for line in notes.lines() {
                    config.push_str(&format!("    # {}\n", line));
                }
            }
            config.push('\n');
        }
    }

    // Write ungrouped hosts
    if !ungrouped.is_empty() {
        config.push_str("# --- 未分组 ---\n\n");
        for host in ungrouped {
            config.push_str(&format!("Host {}\n", host.name));
            config.push_str(&format!("    HostName {}\n", host.host));
            config.push_str(&format!("    Port {}\n", host.port));
            config.push_str(&format!("    User {}\n", host.user));
            if let Some(ref identity_file) = host.identity_file {
                config.push_str(&format!("    IdentityFile {}\n", identity_file));
            }
            if let Some(ref notes) = host.notes {
                for line in notes.lines() {
                    config.push_str(&format!("    # {}\n", line));
                }
            }
            config.push('\n');
        }
    }

    fs::write(&path, config).map_err(|e| e.to_string())?;

    Ok(format!("已导出 {} 条主机到 SSH config 文件", hosts.len()))
}

fn chrono_lite_now() -> String {
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

    format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", year, month, day, hours, minutes, seconds)
}

#[tauri::command]
pub fn get_default_export_path(format: String) -> Result<String, String> {
    let user_dirs = UserDirs::new().ok_or("无法获取用户主目录")?;
    let home = user_dirs.home_dir();

    let filename = match format.as_str() {
        "json" => "ssh-hosts-export.json",
        "toml" => "ssh-hosts-export.toml",
        "ssh" => "ssh-config-export",
        _ => "ssh-hosts-export",
    };

    let path = home.join(filename);
    Ok(path.to_string_lossy().to_string())
}