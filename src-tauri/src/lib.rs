mod commands;
mod db;
mod models;

use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .setup(|app| {
            let db_conn = db::initialize_database().expect("Failed to initialize database");
            app.manage(Mutex::new(db_conn));
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::host_commands::get_hosts,
            commands::host_commands::add_host,
            commands::host_commands::update_host,
            commands::host_commands::delete_host,
            commands::group_commands::get_groups,
            commands::group_commands::add_group,
            commands::group_commands::update_group,
            commands::group_commands::delete_group,
            commands::sync_commands::sync_ssh_config,
        ])
        .run(context)
        .expect("error while running tauri application");
}
