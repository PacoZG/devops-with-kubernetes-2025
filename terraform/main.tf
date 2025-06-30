data "google_client_config" "default" {}

locals {
  project_id = data.google_client_config.default.project
  region     = data.google_client_config.default.region
  zone       = data.google_client_config.default.zone
}

module "gke" {
  source            = "./modules/gke"
  cluster_name      = "dwk-cluster"
  zone              = local.zone
  node_machine_type = "e2-medium"
  node_disk_size_gb = "32"
  cluster_version   = "1.32"

  enable_autoscaling = true # Set this to true to enable
  min_node_count     = 3    # Your desired minimum node count
  max_node_count     = 6    # Your desired maximum node count
}
