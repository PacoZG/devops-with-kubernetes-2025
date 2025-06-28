output "cluster_name" {
  description = "The name of the GKE cluster."
  value       = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  description = "The IP address of the GKE cluster control plane."
  value       = google_container_cluster.primary.endpoint
}

output "cluster_location" {
  description = "The location (zone) of the GKE cluster."
  value       = google_container_cluster.primary.location
}

output "cluster_node_count" {
  description = "The node count of the GKE cluster."
  value       = google_container_cluster.primary.initial_node_count
}
