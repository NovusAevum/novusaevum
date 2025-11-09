# 🔧 CLI SYNC RESOLUTION GUIDE

## Problem Analysis

**Local Mac State:**
- Directory: `~/NovusAevum`
- Branch: `master`
- Status: Untracked files + nested Git repo

**Claude Web State:**
- Repository: `NovusAevum/novusaevum`
- Branch: `claude/check-tools-011CUx1BwXN3GVooCcnrKvan`
- Status: Clean, all changes committed

**Root Cause:**
The `--teleport` command requires you to be in a proper checkout of `NovusAevum/novusaevum`, but your local directory might be:
1. A different repository
2. Missing the remote configuration
3. On the wrong branch

---

## ✅ SOLUTION: Re-sync Local with Web Session

### Step 1: Backup Current Local Work
```bash
cd ~
mv NovusAevum NovusAevum-backup-$(date +%Y%m%d)
```

### Step 2: Fresh Clone from GitHub
```bash
# Clone the repository
git clone https://github.com/NovusAevum/novusaevum.git NovusAevum
cd NovusAevum

# Verify remote
git remote -v
# Should show: origin  https://github.com/NovusAevum/novusaevum.git
```

### Step 3: Checkout the Feature Branch
```bash
# Fetch all branches
git fetch origin

# Checkout the Claude Code feature branch
git checkout claude/check-tools-011CUx1BwXN3GVooCcnrKvan

# Verify you're on the right branch
git status
# Should show: On branch claude/check-tools-011CUx1BwXN3GVooCcnrKvan
```

### Step 4: Pull Latest Changes from Web Session
```bash
# Pull latest changes
git pull origin claude/check-tools-011CUx1BwXN3GVooCcnrKvan

# Verify all files are present
ls -la assets/headers/
# Should show all 5 SVG headers
```

### Step 5: Restore Your Local Files (if needed)
```bash
# Check backup directory for any local work
ls ~/NovusAevum-backup-*/

# Copy over any local files you want to keep
# (Be careful not to overwrite the new responsive headers!)
```

### Step 6: Test Teleport
```bash
# Now teleport should work
claude --teleport session_011CUx1BwXN3GVooCcnrKvan
```

---

## 🚀 ALTERNATIVE: Quick Fix Without Re-cloning

If you want to keep your current directory:

```bash
cd ~/NovusAevum

# Clean up nested repo
rm -rf github-profile/

# Add the correct remote (if missing)
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/NovusAevum/novusaevum.git

# Fetch all branches
git fetch origin

# Switch to the feature branch
git checkout -b claude/check-tools-011CUx1BwXN3GVooCcnrKvan origin/claude/check-tools-011CUx1BwXN3GVooCcnrKvan

# Pull latest
git pull origin claude/check-tools-011CUx1BwXN3GVooCcnrKvan

# Restore stashed files (if you stashed)
git stash pop

# Test teleport
claude --teleport session_011CUx1BwXN3GVooCcnrKvan
```

---

## ⚠️ Common Issues & Fixes

### Issue 1: "Not a checkout of NovusAevum/novusaevum"
**Fix:**
```bash
git remote -v
# If it doesn't show NovusAevum/novusaevum, update it:
git remote set-url origin https://github.com/NovusAevum/novusaevum.git
```

### Issue 2: "Working directory is not clean"
**Fix:**
```bash
# Stash ALL changes including untracked
git stash -u -m "Before teleport"

# Or if you want to keep files, commit them
git add .
git commit -m "Local changes before sync"
```

### Issue 3: Branch doesn't exist locally
**Fix:**
```bash
git fetch origin
git checkout -b claude/check-tools-011CUx1BwXN3GVooCcnrKvan origin/claude/check-tools-011CUx1BwXN3GVooCcnrKvan
```

---

## ✅ Final Verification Checklist

Before running `--teleport`:

- [ ] You're in `~/NovusAevum` directory
- [ ] `git remote -v` shows `NovusAevum/novusaevum`
- [ ] `git branch` shows `* claude/check-tools-011CUx1BwXN3GVooCcnrKvan`
- [ ] `git status` shows "working tree clean"
- [ ] All 5 SVG headers exist in `assets/headers/`

If all checks pass:
```bash
claude --teleport session_011CUx1BwXN3GVooCcnrKvan
```

---

## 📝 What Teleport Does

When you run `--teleport`:
1. Syncs your local CLI session with the web session
2. Brings in all context from the web conversation
3. Allows you to continue work seamlessly
4. All future changes will be in sync

**After teleport:** You can work locally with full context from the web session!

---

## 🔄 Post-Teleport Workflow

```bash
# Make changes locally
# ...

# Commit
git add .
git commit -m "Your changes"

# Push to sync with web
git push origin claude/check-tools-011CUx1BwXN3GVooCcnrKvan

# Continue on web or CLI - stays in sync!
```

---

**Need Help?** If issues persist, the fresh clone (Step 1-6 above) is the most reliable method.
