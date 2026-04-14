use crate::models::host::HostConfig;
use crate::db;
use tauri::State;
use std::sync::Mutex;

#[tauri::command]
pub fn get_hosts(db_conn: State<Mutex<rusqlite::Connection>>) -> Result<Vec<HostConfig>, String> {
    let conn = db_conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, name, host, port, user, auth_type, identity_file, group_id, tags, color, notes, created_at, updated_at FROM hosts").unwrap();
    let host_iter = stmt.query_map([], |row| {
        let tags_str: Option<String> = row.get(8)?;
        let tags = tags_str.map(|s| serde_json::from_str(&s).unwrap_or_else(|_| vec![]));

        Ok(HostConfig {
            id: row.get(0)?,
            name: row.get(1)?,
            host: row.get(2)?,
            port: row.get(3)?,
            user: row.get(4)?,
            auth_type: row.get(5)?,
            identity_file: row.get(6)?,
            group: row.get(7)?,
            tags: tags,
            color: row.get(9)?,
            notes: row.get(10)?,
            custom_options: None,
            created_at: row.get(11)?,
            updated_at: row.get(12)?,
        })
    }).unwrap();

    let mut hosts = Vec::new();
    for host in host_iter {
        hosts.push(host.unwrap());
    }
    Ok(hosts)
}

#[tauri::command]
pub fn add_host(db_conn: State<Mutex<rusqlite::Connection>>, host: HostConfig) -> Result<(), String> {
    let conn = db_conn.lock().unwrap();
    let tags_str = host.tags.map(|t| serde_json::to_string(&t).unwrap());

    conn.execute(
        "INSERT INTO hosts (id, name, host, port, user, auth_type, identity_file, group_id, tags, color, notes, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
        rusqlite::params![
            host.id,
            host.name,
            host.host,
            host.port,
            host.user,
            host.auth_type,
            host.identity_file,
            host.group,
            tags_str,
            host.color,
            host.notes,
            host.created_at,
            host.updated_at,
        ],
    ).unwrap();
    Ok(())
}
