use std::net::{TcpStream, ToSocketAddrs};
use std::time::Duration;

#[tauri::command]
pub async fn check_host_connectivity(host: String, port: u16) -> Result<bool, String> {
    let addr = format!("{}:{}", host, port);
    
    // Attempt to resolve and connect with a 2-second timeout
    let addrs = match addr.to_socket_addrs() {
        Ok(iter) => iter,
        Err(e) => return Err(format!("DNS 解析失败: {}", e)),
    };

    for socket_addr in addrs {
        if let Ok(_) = TcpStream::connect_timeout(&socket_addr, Duration::from_secs(2)) {
            return Ok(true);
        }
    }
    
    Ok(false)
}
