# Releasing MDK

This document is for maintainers cutting a release. For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Release checklist

Copy this into the PR or release ticket for each release.

### Prepare (private repo)

- [ ] Create release branch: `release/<version>`
- [ ] Update `"version"` in every tracked `package.json` (root, `backend/`, `packages/`, `ui/`, `examples/`; not the vendored `backend/lib/mdk-crypto-lib`), following the [`bump-mdk`](./skills/bump-mdk/SKILL.md) skill
- [ ] Update any pinned `^semver` `@tetherto/*` references in [`ui/packages/`](./ui/packages/) to match the new version
- [ ] Refresh lockfiles: `npm install` at the repo root, in [`ui/`](./ui/README.md), and in each `examples/**` directory with its own `package-lock.json`; [`bump-mdk`](./skills/bump-mdk/SKILL.md) has the exact commands and drift check
- [ ] Confirm no unexpected changes in [`package-lock.json`](./package-lock.json) files
- [ ] Regenerate the generated pages: `npm run regenerate-docs`, then commit anything it changes
- [ ] Confirm nothing is left stale: `npm run regenerate-docs -- --check` passes — run this explicitly rather than relying on
      the `docs-freshness` CI workflow, which only triggers on a PR that touches the
      specific source/generated paths it watches, and warns on drift rather than blocking
- [ ] Update [`README.md`](./README.md) — version badge and any inline version references
- [ ] Add entry for `v<version>` in [`CHANGELOG.md`](./CHANGELOG.md)
- [ ] Add release notes file at `docs/reference/release-notes/<version>-release.md`
- [ ] Run tests — pass
- [ ] Run build — pass
- [ ] Private CI passes on the release branch

### Promote

- [ ] Promote the verified commit to the public repo (`mdk`)
- [ ] Spot-check a [`package.json`](./package.json) version to confirm the commit arrived intact

### Verify and tag (public repo)

- [ ] Confirm all `package.json` versions match the release version
- [ ] Public CI passes
- [ ] Create tag: `v<version>`
- [ ] Push tag to origin

### Publish

- [ ] Publish from the tagged commit: the packages marked `publishable` in the [package reference](./docs/reference/packages.md)
- [ ] Confirm published packages show the correct version
