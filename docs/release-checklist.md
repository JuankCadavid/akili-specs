# Release Checklist

Use this checklist before publishing `akili-specs`.

## Branch Flow

`feat/<name>` / `fix/<name>` → `dev` → `master`; nothing is committed or pushed to `dev` or `master` directly.

1. Change notes land under `CHANGELOG.md` > `Unreleased` through feature PRs into `dev`.
2. Cut `release/vX.Y.Z` from an up-to-date `dev`, run `npm run release:*`, verify, commit, and open a PR into `dev`.
3. Open a PR `dev` → `master`; merge with a **merge commit**.
4. On an up-to-date `master`: tag, push the tag, publish, verify dist-tags, GitHub Release, smoke test.
5. Resync `dev` (see *Resync*).

## Preflight

- [ ] Confirm this update should be published now, not only committed to the repository.
- [ ] Confirm all intended repo changes are committed before running the release script.
- [ ] Confirm `CHANGELOG.md` has meaningful notes under `Unreleased`.
- [ ] If this release refreshes the default registry table in `docs/model-routing.md`, refresh `.claude/templates/model-registry.json` in the same commit — `test/registry-drift.test.js` (run by `npm test`) fails when the two disagree.
- [ ] Confirm `package.json` version matches the release version.
- [ ] Confirm `CHANGELOG.md` has a dated section for the release.
- [ ] Confirm `releases/vX.Y.Z.md` exists.
- [ ] Confirm npm authentication with `npm whoami --registry=https://registry.npmjs.org/`.
- [ ] Confirm the current npm user is a maintainer for `akili-specs`.
- [ ] Confirm package name is available or configured for the intended registry.
- [ ] Confirm license and publishing policy.
- [ ] Confirm no secrets, service account keys, or local config files are included.

## Release Policy

- Repository updates and npm updates are controlled separately.
- Package-affecting repository changes require changelog notes before release preparation.
- `npm run release:status` checks local release files, npm versions, remote tags, and GitHub Releases for drift.
- The `Release Status` GitHub Actions workflow runs the same drift check on pushes to `master` and `dev`, pull requests, and manual dispatches.
- `release:status` lists prereleases (`-` versions, `next` dist-tag) separately from stable versions.
- npm updates require a version bump, release notes, verification, release commit, publish, and smoke test.
- Never publish from uncommitted changes.
- Never claim npm is updated until publish and post-publish smoke test both succeed.
- If publish fails, keep the release commit and fix the blocker. Do not create a replacement version unless the failed version was actually published.

## Prerelease (`next`)

From an up-to-date `dev` (on `dev`, clean working tree, `HEAD` equal to `origin/dev`):

```bash
npm run release:next -- <patch|minor|major> --dry-run
npm run release:next -- <patch|minor|major> [--otp=<code>]
```

The guards check the branch, a clean tree, sync with `origin/dev`, a stable source version, that the source version is published, and that the bumped base version is ahead of every published stable version (so a stale `dev` refuses). The `X.Y.Z-next.N` version is written to `package.json` only for the publish and is never committed. Confirm with `npm view akili-specs dist-tags` that `next` shows the new version. Prereleases get no `CHANGELOG.md` section, no `releases/` notes, no tag and no GitHub Release.

## Verify Locally

Start on `release/vX.Y.Z`, cut from an up-to-date `dev`. Prepare a version bump from committed changes:

```bash
npm run release:patch
```

Use `release:minor` for new commands or workflow additions and `release:major` for breaking changes.

Then verify (the release script also wrote `.claude/templates/digests.json` and rewrote any template `since=` marker whose section changed — its `git add` hint lists every file to stage):

```bash
npm test
npm run verify:cli
node bin/akili.js install --tool both --dry-run
npm run pack:dry-run
npm run release:status
git diff --check
```

When verification passes, commit the release changes (the script's `git add` hint lists the files) and open a PR into `dev`. Once it merges, open a PR `dev` → `master` and merge it with a **merge commit**.

## Verify Packed Tarball

```bash
npm pack
npm install -g ./akili-specs-<version>.tgz
akili install --tool both --dry-run
akili doctor --tool claude
```

Remove the generated tarball after testing unless it is being attached to a release.

## Publish

Only after the `dev` → `master` merge, on an up-to-date `master`, tag and push the tag first (`git tag vX.Y.Z`, then `git push origin vX.Y.Z`), then publish.

For public npm publishing:

```bash
npm whoami --registry=https://registry.npmjs.org/
npm publish --access public --registry=https://registry.npmjs.org/
```

If npm requires two-factor authentication, pass the current one-time password:

```bash
npm publish --access public --registry=https://registry.npmjs.org/ --otp=<code>
```

For private registry publishing, configure the registry first and publish using the registry's required access mode.

## Post-Publish Smoke Test

```bash
npx akili-specs@<version> list
npx akili-specs@<version> install --tool both --dry-run
npm view akili-specs version --registry=https://registry.npmjs.org/
npm run release:status
```

## GitHub Release

- [ ] Verify `npm view akili-specs dist-tags` in its own command before `gh release create`.
- [ ] Tag the release, for example `v0.2.0` (already pushed in *Publish*).
- [ ] Create a GitHub release using `releases/v0.2.0.md`.
- [ ] Include publish/install instructions in the release body.

## Slack Notification

Publishing the GitHub Release fires the **Release Notify** workflow
(`.github/workflows/release-notify.yml`), which posts a summary to Slack. It runs on
`release: published` — the last step of the flow, after `npm publish` — so a release that never
reached npm is never announced.

The summary is built from `releases/vX.Y.Z.md`, so Slack can never disagree with what shipped. It
digests each `### Added` / `### Changed` / `### Fixed` section down to the **bold headline** of every
bullet and links out for the detail.

Setup is one-time. **See [Slack notifications](slack-notifications.md)** for creating the webhook,
storing and rotating the secret, pointing at a different channel, adding a second channel, and
troubleshooting.

Preview the message before releasing:

```bash
npm run notify:slack -- --dry-run
```

- [ ] `SLACK_WEBHOOK_URL` secret is configured (first release only — `gh secret list` to confirm).
- [ ] After publishing the GitHub Release, confirm the message actually arrived in the channel. A green workflow run is **not** proof: the script exits `0` when the secret is missing, by design.

## Resync

After the stable release, bring `master`'s merge commit back into `dev`: branch `sync/master-into-dev` from `dev`, run `git merge origin/master`, open a PR into `dev`, and merge it with a **merge commit**. Squash or rebase would leave `master`'s merge commit outside `dev`, so the next `dev` → `master` PR would not be up to date.
