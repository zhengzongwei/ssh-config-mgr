use crate::models::group::Group;
use tauri::State;
use std::sync::Mutex;

#[tauri::command]
pub fn get_groups(db_conn: State<Mutex<rusqlite::Connection>>) -> Result<Vec<Group>, String> {
    let conn = db_conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, name, parent_id, icon, color, display_order FROM groups ORDER BY display_order").unwrap();
    let group_iter = stmt.query_map([], |row| {
        Ok(Group {
            id: row.get(0)?,
            name: row.get(1)?,
            parent_id: row.get(2)?,
            icon: row.get(3)?,
            color: row.get(4)?,
            order: row.get(5)?,
            children: None,
        })
    }).unwrap();

    let mut groups = Vec::new();
    for group in group_iter {
        groups.push(group.unwrap());
    }
    Ok(groups)
}

#[tauri::command]
pub fn add_group(db_conn: State<Mutex<rusqlite::Connection>>, group: Group) -> Result<(), String> {
    let conn = db_conn.lock().unwrap();
    conn.execute(
        "INSERT INTO groups (id, name, parent_id, icon, color, display_order) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            group.id,
            group.name,
            group.parent_id,
            group.icon,
            group.color,
            group.order,
        ],
    ).unwrap();
    Ok(())
}

#[tauri::command]
pub fn update_group(db_conn: State<Mutex<rusqlite::Connection>>, group: Group) -> Result<(), String> {
    let conn = db_conn.lock().unwrap();
    conn.execute(
        "UPDATE groups SET name = ?1, parent_id = ?2, icon = ?3, color = ?4, display_order = ?5 WHERE id = ?6",
        rusqlite::params![
            group.name,
            group.parent_id,
            group.icon,
            group.color,
            group.order,
            group.id,
        ],
    ).unwrap();
    Ok(())
}

#[tauri::command]
pub fn delete_group(db_conn: State<Mutex<rusqlite::Connection>>, id: String) -> Result<(), String> {
    let conn = db_conn.lock().unwrap();
    // First, ungroup all hosts that belong to this group
    conn.execute("UPDATE hosts SET group_id = NULL WHERE group_id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM groups WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
