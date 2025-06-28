variable "cluster_name" {
  type = string
}

variable "zone" {
  type = string
}

variable "node_machine_type" {
  description = "The machine type for the cluster nodes."
  type        = string
  default     = "e2-micro" # Your specified machine type
}

variable "node_disk_size_gb" {
  description = "Disk size in GB for cluster nodes."
  type        = number
}

variable "node_count" {
  description = "Number of nodes in the default node pool."
  type        = number
}

variable "cluster_version" {
  description = "The GKE cluster version (control plane and initial node pool)."
  type        = string
}
