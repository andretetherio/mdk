# Proposal: selective npm releases

Status: parked. The npm publish workflow that shipped releases every package at
the same version from a `vX.Y.Z` tag. This branch keeps a working, tested
version of the workflow for when MDK packages start releasing on their own
schedule.

## What this branch adds on top of the shipped workflow

- **Pick packages in the Run workflow form.** GitHub has no multi-select input,
  so the form has an `all` checkbox (default) plus one checkbox per package. The
  form goes to the planner as JSON (`toJSON(inputs)`), which validates it:
  `all` plus individual boxes, or nothing ticked, fails; a ready package with no
  checkbox only gets a warning and can still go out with `all`. GitHub allows 25
  inputs per form (17 used).
- **Per-package versions.** Each package publishes the version in its own
  `package.json` when that version isn't on npm yet, so a release that bumps one
  package builds and publishes only that one. Internal dependency specs must be
  an exact version or a `^`/`~` range that includes the dependency's current
  version (npm semantics for 0.x and prereleases); a package can't go out ahead
  of a dependency version that is neither in the run nor on npm.
- **Per-package tags.** Besides `vX.Y.Z`, runs can start from `mdk-cli@0.12.1`:
  that package must be at that version and selected, and anything else the run
  publishes is named in a warning. The github-ops `release` environment would
  need `{ "tag": "mdk-*@*" }` next to `v*`.
- **Build matrix.** One build job per install root (repo root, `ui/`) in
  parallel, each building only the selected packages.

## Picking it up

1. Rebase this branch onto `main` and diff `.github/` against the shipped
   workflow; the shared pieces (build-packages action, ci.yml wiring, verify,
   publish) are the same.
2. Update `RELEASING.md` and the `bump-mdk` skill for independent versions.
3. Add `mdk-*@*` to the `release` environment in tetherto/github-ops.

Tested on this branch: planner scenarios against a stubbed registry (one
package bumped, two related packages bumped, unreleased dependency, prerelease
on `latest`, every checkbox combination, per-package tag mismatches), 19
semver range cases against npm semantics, and a dry run on GitHub Actions in
the fork (9 backend tarballs built and verified).
