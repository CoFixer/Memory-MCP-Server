---
name: "execute-pr-workflow"
description: "Automates the full Git PR lifecycle: checks changes → creates feature branch → commits → pushes → creates PR to dev → merges → cleans up branches. Invoke with '/skill:execute-pr-workflow'."
---

# Execute PR Workflow

Automates the full Git PR lifecycle on the **current** working tree:

1. Checks for uncommitted changes
2. Creates a feature branch
3. Commits and pushes changes
4. Creates a PR to `dev`
5. Merges the PR
6. Cleans up branches

## Hard rules

- Stop immediately if not on `dev`, `main`, or `master` (must start from a base branch)
- Do not proceed if no changes exist
- Do not proceed if PR creation fails
- Do not proceed if PR has merge conflicts (notify user)
- Never stage secrets (`.env*`, credentials files)

## Workflow (PowerShell commands)

### 0) Starting branch guard

```powershell
$startBranch = (git branch --show-current).Trim()
if ([string]::IsNullOrWhiteSpace($startBranch)) { throw "Detached HEAD. Checkout dev/main first." }
if ($startBranch -notin @('dev','main','master')) {
  throw "Must start from dev/main/master. Current branch: $startBranch"
}
```

### 1) Ensure there are changes

```powershell
$status = git status --porcelain
if (-not $status) { throw "No changes to commit. Make changes first." }
```

### 2) Generate branch name from changes

```powershell
# Get list of changed files
$changedFiles = ($status | ForEach-Object { $_.Substring(3) })

# Determine type and scope
$type = "feat"
if ($changedFiles | Where-Object { $_ -like '*test*' -or $_ -like '*spec*' }) { $type = "test" }
elseif ($changedFiles | Where-Object { $_ -like '*.md' -or $_ -like 'docs/*' }) { $type = "docs" }
elseif ($changedFiles | Where-Object { $_ -like '*fix*' -or $_ -like '*bug*' }) { $type = "fix" }
elseif ($changedFiles | Where-Object { $_ -like '*refactor*' }) { $type = "refactor" }
elseif ($changedFiles | Where-Object { $_ -like '*chore*' -or $_ -like '*config*' }) { $type = "chore" }

# Use first changed directory or file as scope
$scope = "project"
$firstFile = $changedFiles | Select-Object -First 1
if ($firstFile -match '^([^/\\]+)[/\\]') { $scope = $matches[1] }

# Generate descriptive branch name
$desc = ($firstFile -replace '[^a-zA-Z0-9]', '-') -replace '-+', '-' -replace '^-|-$', ''
if ($desc.Length -gt 40) { $desc = $desc.Substring(0, 40) }
$branch = "$type/$scope-$desc"
$branch = $branch -replace '-+', '-' -replace '^-|-$', ''
```

### 3) Create feature branch

```powershell
git checkout -b $branch
if ($LASTEXITCODE -ne 0) { throw "Failed to create branch: $branch" }
```

### 4) Stage safely

```powershell
git add -A
# Never commit secrets / envs
git reset HEAD -- .env .env.* 2>$null
git reset HEAD -- .opencode .gitmodules 2>$null
```

### 5) Create commit (Conventional Commits)

```powershell
# Generate commit message
$title = "$type($scope): automated changes"
$bodyLines = $changedFiles | ForEach-Object { "- $_" }
$body = $bodyLines -join "`n"

git commit -m "$title" -m "$body"
if ($LASTEXITCODE -ne 0) { throw "Commit failed." }
```

### 6) Push branch to origin

```powershell
git push -u origin $branch
if ($LASTEXITCODE -ne 0) { throw "Push failed." }
```

### 7) Create PR to dev

```powershell
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw "gh CLI is required." }
gh auth status

$prBody = @"
## Summary
Automated PR from skill workflow.

### Changes
$body

### Testing
- [ ] Verify changes in dev environment
"@

$prUrl = gh pr create --base dev --head $branch --title "$title" --body $prBody
if ([string]::IsNullOrWhiteSpace($prUrl)) { throw "PR creation failed." }
```

### 8) Check PR status and merge

```powershell
$prNumber = gh pr view $branch --json number --jq '.number'
$prStatus = gh pr view $branch --json mergeable,mergeStateStatus --jq '[.mergeable, .mergeStateStatus]'

if ($prStatus -like '*CONFLICTING*') {
  throw "PR #$prNumber has merge conflicts. Resolve manually."
}

# Merge the PR
gh pr merge $prNumber --merge --delete-branch=false
if ($LASTEXITCODE -ne 0) { throw "Merge failed for PR #$prNumber." }
```

### 9) Cleanup

```powershell
# Switch back to starting branch
git checkout $startBranch

# Pull latest changes
git pull origin $startBranch

# Delete local feature branch
git branch -D $branch 2>$null

# Delete remote feature branch
git push origin --delete $branch 2>$null
```

## Output to user

Return:
- Starting branch name
- Feature branch name
- Commit SHA + subject
- PR number and URL
- Merge status (MERGED / NOT MERGED) and any failure reason
- Cleanup status
