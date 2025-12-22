# 📘 Developer Workflow Guide: Gitflow + Notion

This guide outlines our standard operating procedure for managing code changes. We follow the **Gitflow Workflow** for branching but use **Notion Ticket IDs** to name our branches and link code back to project tasks.

## 1. The Golden Rule

**Every branch** (except `main`, `staging`, and `develop`) must correspond to a Notion ticket.

- **Ticket ID:** `WEB-12` (Example)
- **Branch Name:** `feature/WEB-12-short-description`

---

## 2. Branch Types & Naming Conventions

We use standard Gitflow prefixes (`feature/`, `hotfix/`, `release/`) combined with the Notion ID.

| Branch Type | Source | Merge Target | Naming Format | Example |
| --- | --- | --- | --- | --- |
| Feature | `develop` | `develop` | `feature/ID-description` | `feature/WEB-42-user-login` |
| Bugfix (bugs on develop) | `develop` | `develop` | `bugfix/ID-description` | `bugfix/WEB-43-fix-header-crash` |
| Hotfix (bugs on prod) | `main` | `main` and `develop` | `hotfix/ID-description` | `hotfix/WEB-99-urgent-security-patch` |
| Release | `develop` | `main` and `develop` | `release/vX.X.X` | `release/v1.0.0` |

---

## 3. Workflow Steps

### Phase 1: Start a Ticket

1. **Pick a task** in Notion and move it to "In Progress".
2. **Copy the ID** (e.g., `WEB-42`).
3. **Create your branch** based on the type of work.

**For Features (Standard Work):**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/WEB-42-add-login-page
```

**For Hotfixes (Production Emergencies):**

```bash
git checkout main
git pull origin main
git checkout -b hotfix/WEB-99-fix-payment-bug
```

### Phase 2: Commits

Start commit messages with the ticket ID. This helps when reading `git log` later.

```bash
git commit -m "WEB-42: Setup initial login form layout"
git commit -m "WEB-42: Add validation logic"
```

### Phase 3: Pull Request (The Notion Link)

When you are ready to merge, open a pull request (PR) in GitHub. This is where the automation happens.

1. **PR Title:** Include the ID.
    - Example: `WEB-42: Add Login Page Animation`
2. **PR Description:** Use **Magic Words** to link and close the ticket automatically.
    - Example: `This PR adds the fading animation to the login box. Fixes WEB-42.`

> Magic Words Reference:
> 

> - `Fixes WEB-42`, `Closes WEB-42`, `Resolved WEB-42` → Completes the ticket in Notion when merged.
> 

> - `References WEB-42` → Links the PR to Notion but keeps the ticket open.
> 

### Phase 4: Review & Merge

- **Features** are merged into `develop`.
- **Hotfixes** are merged into both `main` and `develop`.
- **Releases** are merged into both `main` and `develop`.

---

## 4. Cheat Sheet

| I want to... | Do this... |
| --- | --- |
| Start a new feature | `git checkout -b feature/WEB-XXX-name develop` |
| Fix a bug in dev | `git checkout -b bugfix/WEB-XXX-name develop` |
| Fix a bug in live (prod) | `git checkout -b hotfix/WEB-XXX-name main` |
| Link ticket without closing | Use `References WEB-XXX` in PR description |
| Auto-close ticket on merge | Use `Fixes WEB-XXX` in PR description |

---

### 💡 Why do we do this?

1. **Traceability:** If we find a bug in `main` six months from now, we can look at the git history, see `WEB-42`, and find the original design specs and discussion in Notion.
2. **Automation:** No need to manually move tickets to "Done" in Notion. GitHub does it for you.
3. **Organization:** Branch names are predictable and easy to search.