# Exercise 3.9: DBaaS vs DIY

### Finally, create a new workflow so that deleting a branch deletes the environment

After reading through part of the documentations, google research and personal
experience, this is some of the PROs and CONs of using either of the database
solutions.

Choosing between **Google Cloud SQL** and **self-managed PostgreSQL on GKE**
depends on your goals, resources, and workload requirements. Below is a detailed
pros and cons breakdown for both options.

---

### ☁️ Google Cloud SQL (Managed DBaaS)

#### Pros

- ✅ **Quick setup** — Deploy in minutes via console or CLI
- ✅ **Fully managed** — Google handles patching, upgrades, backups, and
  maintenance
- ✅ **Built-in High Availability** — Regional instances with automated
  failover (~60s downtime)
- ✅ **Point-in-Time Recovery (PITR)** — Automated WAL-based backups with minimal
  config
- ✅ **Security-first** — IAM integration, private IP, automatic OS patching
- ✅ **Low operational overhead** — No dedicated DBA (Database Administrator) or
  SRE (Site Reliability Engineer) required
- ✅ **Easy monitoring & logging** — Integrated with Cloud Monitoring and Cloud
  Logging
- ✅ **Faster time-to-market** — Teams focus on app development, not database ops

#### Cons

- ❌ **Higher direct costs** — Pay for CPU, memory, storage, and backup
  separately
- ❌ **Limited control** — No access to superuser, limited PostgreSQL extensions
- ❌ **Vendor lock-in** — Heavily integrated with Google Cloud services
- ❌ **Manual intervention for major upgrades** — No in-place version upgrades

---

### ⚙️ Self-Managed PostgreSQL on GKE (with PVCs & Operators)

#### Pros

- ✅ **Full control** — Customize PostgreSQL versions, configs, and extensions
- ✅ **Kubernetes-native** — Integrates naturally with GKE workloads and CI/CD
- ✅ **No vendor lock-in** — Easier migration across clouds or on-prem
- ✅ **Lower infra costs** — No Cloud SQL premium pricing; uses open-source
  tooling
- ✅ **Custom storage & scaling** — Choose disk types, sizes, node pools
- ✅ **Use of operators** — Automate backups, HA, PITR with tools like
  CloudNativePG or Crunchy

#### Cons

- ❌ **Complex setup** — Requires YAMLs for PVCs, StatefulSets, services,
  Operator install
- ❌ **Full responsibility for maintenance** — Upgrades, backups, failover,
  tuning, monitoring
- ❌ **Manual backups & PITR** — Must configure WAL archiving and external
  storage
- ❌ **Security burden** — You manage access control, patching, secrets,
  encryption
- ❌ **Higher TCO in production** — Operational load often outweighs infra
  savings
- ❌ **Requires advanced expertise** — PostgreSQL + Kubernetes + DevOps + Cloud
  security

---

While self-managed PostgreSQL on GKE may seem cheaper at first glance, the
hidden cost lies in ongoing operations. Maintaining the database requires a team
of highly skilled Database Administrators (DBAs), Site Reliability Engineers (
SREs), and Kubernetes experts, whose time and expertise come at a premium. In
many cases, these operational costs can match or even exceed those of using a
managed solution like Cloud SQL, making the self-managed approach difficult to
justify unless full control is a critical requirement.

### 🧠 TL;DR: When to Use What?

| Use Case                         | Recommended Option  |
|----------------------------------|---------------------|
| Fast setup with minimal ops      | ✅ Google Cloud SQL  |
| Full DB customization and tuning | ✅ PostgreSQL on GKE |
| Mission-critical HA + PITR       | ✅ Google Cloud SQL  |
| Kubernetes-native tooling        | ✅ PostgreSQL on GKE |
| Lower-cost dev/test environments | ✅ PostgreSQL on GKE |
| No dedicated DB ops team         | ✅ Google Cloud SQL  |
