provider "google" {
  project = "paco-learning-project"
  region  = "europe-north1"
  zone    = "europe-north1-b"
}

terraform {
  required_providers {
    google = {
      source  = "google"
      version = "~> 4.80"
    }
  }
}

# I switched from using “dwk-cluster” to “paco-learning-project”
# as this project is part of my company’s Google Cloud account
# and is intended solely for educational and learning purposes.
