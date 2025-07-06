
# Define the GKE cluster itself
resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.zone

  min_master_version       = var.cluster_version
  remove_default_node_pool = true
  initial_node_count       = 1
}

# Define a specific node pool within the GKE cluster
resource "google_container_node_pool" "primary_nodes" {
  name     = "${var.cluster_name}-node-pool"
  location = var.zone
  cluster  = google_container_cluster.primary.name

  node_count = var.enable_autoscaling ? var.min_node_count : var.node_count

  node_config {
    machine_type = var.node_machine_type
    disk_size_gb = var.node_disk_size_gb
  }

  dynamic "autoscaling" {
    for_each = var.enable_autoscaling ? [1] : []
    content {
      min_node_count = var.min_node_count
      max_node_count = var.max_node_count
    }
  }

  lifecycle {
    ignore_changes = [
      node_config[0].kubelet_config,
      node_config[0].resource_labels
    ]
  }
}
