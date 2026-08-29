# git_branch prints the current branch name.
git_branch() {
    git branch --show-current
}

# git_current_commit prints the short hash of the checked-out commit.
git_current_commit() {
    git rev-parse --short HEAD
}

# git_is_dirty succeeds when the working tree has uncommitted changes.
git_is_dirty() {
    [[ -n "$(git status --porcelain)" ]]
}

# git_status_short prints a compact status summary.
git_status_short() {
    git status --porcelain | awk '{ print $1, $2 }' | head -n 20
}

# git_last_message prints the subject of the most recent commit.
git_last_message() {
    git log -1 --pretty=%s
}

# git_log_oneline prints the last n commits on one line each.
git_log_oneline() {
    local count="${1:-10}"
    git log -n "$count" --oneline
}

# git_diff_stat shows a numeric summary of uncommitted changes.
git_diff_stat() {
    git diff --stat && git diff --cached --stat
}

# git_untracked lists files not yet tracked by git.
git_untracked() {
    git ls-files --others --exclude-standard
}

# git_commit_all stages everything and commits with a message.
git_commit_all() {
    local message="${1:?missing message}"
    git add -A && git commit -m "$message"
}

# git_push_retry pulls with rebase and retries a failed push.
git_push_retry() {
    local branch
    branch=$(git_branch)
    if ! git push origin "$branch"; then
        git pull --rebase origin "$branch" && git push origin "$branch"
    fi
}

# git_sync pulls with rebase and pushes in one go.
git_sync() {
    local branch remote
    branch=$(git_branch)
    remote=$(git remote get-url origin 2>/dev/null)
    [[ -n "$remote" ]] || { printf 'no origin remote\n' >&2; return 1; }
    git pull --rebase origin "$branch" && git push origin "$branch"
}

# git_cleanup_merged deletes local branches already merged into main.
git_cleanup_merged() {
    local main="${1:-main}"
    git branch --merged "$main" | grep -v -E '(^\*|main|master)' | xargs -r git branch -d
}

# git_tag_exists tests whether a tag name already exists.
git_tag_exists() {
    local tag="${1:?missing tag}"
    git rev-parse -q --verify "refs/tags/$tag" >/dev/null
}

# git_release creates an annotated tag and pushes it.
git_release() {
    local tag="${1:?missing tag}" message="${2:-release $tag}"
    git tag -a "$tag" -m "$message" && git push origin "$tag"
}

# git_stash_save stashes changes with a descriptive message.
git_stash_save() {
    local message="${1:-wip}"
    git stash push -m "$message"
}

# git_root prints the top-level directory of the repository.
git_root() {
    git rev-parse --show-toplevel
}

# git_changed_files lists files changed in the last commit.
git_changed_files() {
    git diff --name-only HEAD~1 HEAD
}

# git_branch_contains lists branches containing a given commit.
git_branch_contains() {
    local commit="${1:-HEAD}"
    git branch -a --contains "$commit"
}

# git_author_stats counts commits per author in the repository.
git_author_stats() {
    git shortlog -sn | head -n 15
}

# git_file_log prints the commit history of a single file.
git_file_log() {
    local file="${1:?missing file}"
    git log --oneline -- "$file"
}

# git_switch_keep stashes, switches branches, and restores the stash.
git_switch_keep() {
    local target="${1:?missing branch}"
    git stash push -m 'auto before switch'
    git checkout "$target" || { git stash pop; return 1; }
    git stash pop
}
