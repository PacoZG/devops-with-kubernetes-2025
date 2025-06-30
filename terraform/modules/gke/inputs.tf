variable "cluster_name" {
  description = "The name of the GKE cluster."
  type        = string
}

variable "zone" {
  description = "The zone for the GKE cluster."
  type        = string
}

variable "node_machine_type" {
  description = "The machine type for the cluster nodes."
  type        = string
}

variable "node_disk_size_gb" {
  description = "The disk size for the cluster nodes in GB."
  type        = string
}

variable "cluster_version" {
  description = "The Kubernetes version for the cluster."
  type        = string
}

variable "node_count" {
  description = "The initial number of nodes in the node pool when autoscaling is disabled. Ignored if autoscaling is true."
  type        = number
  default     = 3
}

variable "enable_autoscaling" {
  description = "Set to true to enable autoscaling for the node pool."
  type        = bool
  default     = false
}

variable "min_node_count" {
  description = "The minimum number of nodes in the node pool when autoscaling is enabled."
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "The maximum number of nodes in the node pool when autoscaling is enabled."
  type        = number
  default     = 5
}
