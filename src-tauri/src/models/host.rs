use serde::{Deserialize, Serialize};

fn default_show_in_vscode() -> bool { true }

#[derive(Serialize, Deserialize, Debug)]
pub struct HostConfig {
  pub id: String,
  pub name: String,
  pub host: String,
  pub port: u16,
  pub user: String,
  #[serde(rename = "authType")]
  pub auth_type: String,
  #[serde(rename = "identityFile")]
  pub identity_file: Option<String>,
  pub group: Option<String>,
  pub tags: Option<Vec<String>>,
  pub color: Option<String>,
  pub notes: Option<String>,
  #[serde(rename = "showInVscode", default = "default_show_in_vscode")]
  pub show_in_vscode: bool,
  #[serde(rename = "customOptions")]
  pub custom_options: Option<std::collections::HashMap<String, String>>,
  #[serde(rename = "createdAt")]
  pub created_at: String,
  #[serde(rename = "updatedAt")]
  pub updated_at: String,
}
