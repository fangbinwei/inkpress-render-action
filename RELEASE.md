# Releasing

GitHub Actions are released via git tags. Users reference this action with `@v0` (floating major, recommended) or `@v0.1.x` (pinned).

## Day-to-day flow

```bash
# 1. Ensure dist/ is in sync with src/ (CI enforces this — release will fail if not)
pnpm install --frozen-lockfile
pnpm check:ci
pnpm build

# 2. If dist/ changed, commit it BEFORE the release script
git add dist/ && git commit -m "build: rebuild dist/ for release"

# 3. Bump version, tag, push
pnpm release:patch    # 0.1.0 → 0.1.1
# pnpm release:minor   # 0.1.0 → 0.2.0
# pnpm release:major   # 0.1.0 → 1.0.0
```

Each `release:*` script bumps `package.json`, commits, tags `vX.Y.Z`, and pushes commit + tag.

The pushed tag triggers `.github/workflows/release.yml`, which:

1. Creates a GitHub Release with auto-generated notes (from commits since last tag)
2. Force-updates the floating major tag (`v0` while we're 0.x; `v1` once we go stable)

Users on `uses: fangbinwei/inkpress-render-action@v0` automatically pick up the new patch.

## Why `dist/` matters

GitHub runs an action by checking out the tagged commit and executing `dist/index.js` directly. **There is no build step at action runtime.** So `dist/` must be committed and in sync with `src/` at every release tag. CI's `Verify dist/ is up to date` step enforces this on every PR — heed it.

## When to bump major

- **Pre-1.0** (`v0.x.y`): break things freely. README pins users to `@v0`, which floats over all 0.x.
- **Going stable** (`v1.0.0`):
  1. Update README examples from `@v0` to `@v1`
  2. Run `pnpm release:major` to cut `v1.0.0`
  3. After 1.0, future breaking changes must wait for `v2.0.0`

## Recovery

- **`pnpm version` rejected (dirty tree)**: commit or stash first.
- **release.yml failed mid-way (tag pushed but no Release / no `v0` update)**: re-run from Actions UI; the workflow is idempotent.
- **Wrong tag pushed**: never delete a published tag remotely (breaks users pinned to it). Bump forward instead.
