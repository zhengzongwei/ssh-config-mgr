use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Group {
  pub id: String,
  pub name: String,
  #[serde(rename = "parentId")]
  pub parent_id: Option<String>,
  pub icon: Option<String>,
  pub color: Option<String>,
  pub order: i32,
  pub children: Option<Vec<Group>>,
}
