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

// I reframed from using "dwk-cluster" to using "paco-learning-project" since
// this project is part of my company's Google Cloud account and is intended
// for educational and study-related use only.
