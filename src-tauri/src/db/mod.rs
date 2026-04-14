use rusqlite::{Connection, Result};

pub fn initialize_database() -> Result<Connection> {
    let path = "database.db";
    let conn = Connection::open(&path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS hosts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            host TEXT NOT NULL,
            port INTEGER NOT NULL,
            user TEXT NOT NULL,
            auth_type TEXT NOT NULL,
            identity_file TEXT,
            group_id TEXT,
            tags TEXT,
            color TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS groups (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT,
            icon TEXT,
            color TEXT,
            display_order INTEGER NOT NULL
        )",
        [],
    )?;

    Ok(conn)
}
