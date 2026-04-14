use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct HostConfig {
  pub id: String,
  pub name: String,
  pub host: String,
  pub port: u16,
  pub user: String,
  #[serde(rename = "authType")]
  pub auth_type: String, // "password", "key", "agent"
  #[serde(rename = "identityFile")]
  pub identity_file: Option<String>,
  pub group: Option<String>,
  pub tags: Option<Vec<String>>,
  pub color: Option<String>,
  pub notes: Option<String>,
  #[serde(rename = "customOptions")]
  pub custom_options: Option<std::collections::HashMap<String, String>>,
  #[serde(rename = "createdAt")]
  pub created_at: String,
  #[serde(rename = "updatedAt")]
  pub updated_at: String,
}
