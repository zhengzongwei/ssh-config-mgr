use std::process::Command;

#[tauri::command]
pub fn launch_terminal_ssh(
    host: String,
    port: u16,
    user: String,
    identity_file: Option<String>,
) -> Result<String, String> {
    let mut ssh_cmd = format!("ssh {}@{} -p {}", user, host, port);
    if let Some(ref id_file) = identity_file {
        if !id_file.is_empty() {
            ssh_cmd.push_str(&format!(" -i {}", id_file));
        }
    }

    let bash_cmd = format!("{}; exec bash", ssh_cmd);
    let wrapped_cmd = format!("bash -c '{}'", bash_cmd);

    // Try terminal emulators in order of preference
    let terminals: Vec<(&str, Vec<&str>)> = vec![
        ("gnome-terminal", vec!["--", "bash", "-c", &bash_cmd]),
        ("konsole", vec!["-e", "bash", "-c", &bash_cmd]),
        ("xfce4-terminal", vec!["-e", &wrapped_cmd]),
        ("mate-terminal", vec!["-e", &wrapped_cmd]),
        ("xterm", vec!["-e", "bash", "-c", &bash_cmd]),
    ];

    for (term, args) in &terminals {
        if Command::new("which")
            .arg(term)
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            match Command::new(term).args(args).spawn() {
                Ok(_) => return Ok(format!("正在连接 {}@{}...", user, host)),
                Err(_) => continue,
            }
        }
    }

    Err("未找到可用的终端模拟器".to_string())
}
