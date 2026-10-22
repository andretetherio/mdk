#!/usr/bin/env node
// Plans, verifies and publishes the MDK npm packages for
// .github/workflows/publish.yml and the release-PR pack check in ci.yml.
// Plain Node, no dependencies.
//
//   plan     [--ref <name> --ref-type tag|branch] [--selection '{"all":true}'] [--dist-tag latest]
//   verify   <tarball>...
//   publish  --plan plan.json --dir <tarball dir>
//
// --selection is the publish.yml form as JSON (toJSON(inputs)): either `all`,
// or one `mdk-*` checkbox per package to publish.
//
// Releases are tagged either repo-wide (v0.13.0) or per package
// (mdk-cli@0.12.1). A per-package tag must match that package's version and
// the package must be part of the run.
//
// Packages are discovered from the workspaces of the two install roots: the
// repo root (backend + packages/*) and ui/. A package is publishable when its
// package.json is not `private`, and ready when it also declares public access
// and a repository pointing at this repo (npm checks that against the
// provenance).
//
// Versions are per package: each one publishes the version in its own
// package.json, and only when that version isn't on npm yet. A release that
// bumps one package builds and publishes just that package. Publish order comes
// from the internal dependency graph: a package goes out only after everything
// it depends on.

import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const GROUPS = [
  { group: 'backend', root: '.' },
  { group: 'ui', root: 'ui' }
]
const REPOSITORY = 'tetherto/mdk'
const RUNTIME_DEP_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies']
const MIN_NPM = [11, 5, 1] // npm trusted publishing (OIDC)

const [command, ...rest] = process.argv.slice(2)
const { flags, positional } = parseArgs(rest)

try {
  if (command === 'plan') plan()
  else if (command === 'verify') verify()
  else if (command === 'publish') publish()
  else fail(`unknown command "${command}" (expected plan, verify or publish)`)
} catch (err) {
  fail(err instanceof Error ? err.message : String(err))
}

// --- plan -------------------------------------------------------------------

function plan () {
  const distTag = flags['dist-tag'] || 'latest'

  const workspaces = discover()
  const publishable = workspaces.filter((w) => !w.private)
  const byName = new Map(workspaces.map((w) => [w.name, w]))
  const notReady = new Map(publishable.map((p) => [p.name, readinessGaps(p)]).filter(([, gaps]) => gaps.length))
  const errors = []
  const skipped = []

  const { all, label, packages: picked } = select(publishable, notReady, flags.selection || '{"all":true}', errors)
  let selected = picked
  if (all) {
    // A full run publishes what's ready and reports the rest instead of
    // failing on packages nobody has prepared for npm yet.
    skipped.push(...selected.filter((p) => notReady.has(p.name)))
    selected = selected.filter((p) => !notReady.has(p.name))
  } else {
    for (const pkg of selected.filter((p) => notReady.has(p.name))) {
      errors.push(`${pkg.name} isn't ready for npm: ${notReady.get(pkg.name).join('; ')}`)
    }
  }
  if (!selected.length && !errors.length) errors.push('no packages are ready for npm')

  const published = new Map()
  const isPublished = (name, version) => {
    const key = `${name}@${version}`
    if (!published.has(key)) published.set(key, npmHasVersion(name, version))
    return published.get(key)
  }
  const todo = new Set(selected.filter((p) => !isPublished(p.name, p.version)).map((p) => p.name))

  for (const pkg of selected) {
    if (!parseVersion(pkg.version)) errors.push(`${pkg.name} has an invalid version "${pkg.version}"`)
    if (todo.has(pkg.name) && pkg.version.includes('-') && distTag === 'latest') {
      errors.push(`${pkg.name}@${pkg.version} is a prerelease; publish it under a dist-tag other than "latest"`)
    }

    // Every runtime dependency on another workspace must be publishable, pin a
    // range that includes that workspace's version, and that version must be on
    // npm or go out in this run. Otherwise the published package can't be
    // installed, or installs a different version than it was built against.
    for (const [dep, spec] of internalDeps(pkg, byName)) {
      const target = byName.get(dep)
      if (target.private) {
        errors.push(`${pkg.name} depends on ${dep}, which is private and won't be on npm`)
        continue
      }
      if (notReady.has(dep)) {
        errors.push(`${pkg.name} depends on ${dep}, which isn't ready for npm: ${notReady.get(dep).join('; ')}`)
        continue
      }
      const ok = satisfies(spec, target.version)
      if (ok === null) {
        errors.push(`${pkg.name} depends on ${dep}@"${spec}"; use an exact version or a ^/~ range, e.g. "^${target.version}"`)
      } else if (!ok) {
        errors.push(`${pkg.name} depends on ${dep}@"${spec}", which doesn't include ${dep}'s version ${target.version}`)
      } else if (todo.has(pkg.name) && !todo.has(dep) && !isPublished(dep, target.version)) {
        errors.push(`${pkg.name} needs ${dep}@${target.version}, which is neither in this run nor on npm`)
      }
    }
  }

  const tagged = packageTag(flags.ref, flags['ref-type'], byName, selected, errors)

  if (errors.length) fail('plan failed:\n  - ' + [...new Set(errors)].join('\n  - '))

  const waves = computeWaves(publishable, byName)
  const packages = selected
    .map((pkg) => ({
      name: pkg.name,
      version: pkg.version,
      group: pkg.group,
      path: pkg.path,
      wave: waves.get(pkg.name),
      tarball: tarballName(pkg.name, pkg.version),
      status: todo.has(pkg.name) ? 'publish' : 'published'
    }))
    .sort((a, b) => a.wave - b.wave || a.name.localeCompare(b.name))

  const pending = packages.filter((p) => p.status === 'publish')
  const include = GROUPS.map(({ group, root }) => ({
    group,
    root,
    packages: pending.filter((p) => p.group === group).map((p) => p.name).join(' ')
  })).filter((g) => g.packages)

  console.log(`npm publish plan for ${flags.ref || 'this checkout'} (${label}, dist-tag: ${distTag})`)
  for (const p of packages) {
    console.log(`  wave ${p.wave}  ${`${p.name}@${p.version}`.padEnd(40)} ${p.status === 'publish' ? 'to publish' : 'already on npm, skipped'}`)
  }
  for (const p of skipped) {
    console.log(`::warning::${p.name} skipped, not ready for npm: ${notReady.get(p.name).join('; ')}`)
  }
  if (!all) {
    for (const p of packages.filter((p) => p.status !== 'publish')) {
      console.log(`::warning::${p.name}@${p.version} is already on npm; bump its version to publish it again`)
    }
  }
  const others = pending.filter((p) => tagged && p.name !== tagged.name)
  if (others.length) {
    console.log(`::warning::running from tag ${flags.ref} also publishes ${others.map((p) => `${p.name}@${p.version}`).join(', ')}`)
  }

  summary([
    `### npm publish plan${flags.ref ? `: ${flags.ref}` : ''}`,
    '',
    `dist-tag \`${distTag}\` · ${label} · ${pending.length} to publish, ${packages.length - pending.length} already on npm, ${skipped.length} not ready`,
    '',
    '| Wave | Package | Version | Status |',
    '| --- | --- | --- | --- |',
    ...packages.map((p) => `| ${p.wave} | \`${p.name}\` | ${p.version} | ${p.status === 'publish' ? 'publish' : 'already on npm'} |`),
    ...skipped.map((p) => `| – | \`${p.name}\` | ${p.version} | not ready: ${notReady.get(p.name).join('; ')} |`)
  ])

  output('plan', JSON.stringify({ distTag, packages }))
  output('matrix', JSON.stringify({ include }))
  output('publish-count', String(pending.length))
}

// A per-package tag (mdk-cli@0.12.1) names the package and version the run is
// for: that package must exist at exactly that version and be selected.
// Repo-wide tags (v0.13.0) and branches carry no such constraint.
function packageTag (ref, refType, byName, selected, errors) {
  const m = refType === 'tag' && /^(mdk-[a-z0-9-]+)@(.+)$/.exec(ref || '')
  if (!m) return null
  const name = `@tetherto/${m[1]}`
  const pkg = byName.get(name)
  if (!pkg) {
    errors.push(`tag ${ref} names ${name}, which isn't a workspace in this checkout`)
  } else if (pkg.version !== m[2]) {
    errors.push(`tag ${ref} is for ${m[2]}, but ${name} is at ${pkg.version} in this checkout`)
  } else if (!selected.some((p) => p.name === name)) {
    errors.push(`tag ${ref} is for ${name}, which isn't selected; check "all" or ${m[1]}`)
  }
  return pkg ? { name, version: m[2] } : null
}

function readinessGaps (pkg) {
  const gaps = []
  const repo = pkg.manifest.repository
  const url = typeof repo === 'string' ? repo : repo?.url || ''
  if (pkg.manifest.publishConfig?.access !== 'public') gaps.push('publishConfig.access is not "public"')
  if (!url.replace(/\.git$/, '').endsWith(`github.com/${REPOSITORY}`)) gaps.push(`repository.url doesn't point at ${REPOSITORY}`)
  else if (repo?.directory !== pkg.path) gaps.push(`repository.directory should be "${pkg.path}"`)
  return gaps
}

// Reads the publish.yml checkboxes: `all`, or one `mdk-*` box per package
// (named after the package without its @tetherto/ scope). Other form fields
// (dist-tag, dry-run) are ignored.
function select (publishable, notReady, json, errors) {
  let form
  try {
    form = JSON.parse(json)
  } catch {
    errors.push(`--selection is not valid JSON: ${json}`)
    return { all: false, label: 'invalid selection', packages: [] }
  }

  const short = (name) => name.replace(/^@tetherto\//, '')
  const boxes = Object.keys(form).filter((key) => key.startsWith('mdk-'))
  const checked = boxes.filter((key) => form[key] === true || form[key] === 'true')
  const all = form.all === true || form.all === 'true'

  // A package that's ready but has no checkbox can still go out with `all`;
  // flag it so publish.yml gets updated.
  if (boxes.length) {
    for (const pkg of publishable.filter((p) => !notReady.has(p.name) && !boxes.includes(short(p.name)))) {
      console.log(`::warning::${pkg.name} has no checkbox in publish.yml; it can only be published with "all"`)
    }
  }

  if (all && checked.length) errors.push(`"all" and individual packages are both checked (${checked.join(', ')}); pick one`)
  if (!all && !checked.length) errors.push('nothing selected: check "all" or at least one package')
  if (all) return { all: true, label: 'all', packages: publishable }

  const packages = []
  for (const key of checked) {
    const pkg = publishable.find((p) => short(p.name) === key)
    if (pkg) packages.push(pkg)
    else errors.push(`${key} is checked but isn't a publishable package in this checkout`)
  }
  return { all: false, label: `selected: ${checked.join(', ')}`, packages }
}

// Wave 1 has no internal dependencies; every other package sits one wave after
// the latest of its dependencies. Packages in the same wave are independent.
function computeWaves (publishable, byName) {
  const waves = new Map()
  const visiting = new Set()
  const visit = (pkg) => {
    if (waves.has(pkg.name)) return waves.get(pkg.name)
    if (visiting.has(pkg.name)) fail(`dependency cycle through ${pkg.name}`)
    visiting.add(pkg.name)
    let wave = 1
    for (const [dep] of internalDeps(pkg, byName)) {
      const target = byName.get(dep)
      if (!target.private) wave = Math.max(wave, visit(target) + 1)
    }
    visiting.delete(pkg.name)
    waves.set(pkg.name, wave)
    return wave
  }
  for (const pkg of publishable) visit(pkg)
  return waves
}

function internalDeps (pkg, byName) {
  const out = new Map()
  for (const field of RUNTIME_DEP_FIELDS) {
    for (const [dep, spec] of Object.entries(pkg.manifest[field] || {})) {
      if (byName.has(dep) && dep !== pkg.name) out.set(dep, spec)
    }
  }
  return out
}

function discover () {
  const found = []
  for (const { group, root } of GROUPS) {
    const patterns = readJson(path.join(root, 'package.json')).workspaces || []
    const exclude = new Set(patterns.filter((p) => p.startsWith('!')).flatMap((p) => glob(root, p.slice(1))))
    for (const pattern of patterns.filter((p) => !p.startsWith('!'))) {
      for (const dir of glob(root, pattern)) {
        if (exclude.has(dir)) continue
        const manifest = readJson(path.join(root, dir, 'package.json'))
        if (!manifest.name) continue
        found.push({
          name: manifest.name,
          version: manifest.version,
          private: manifest.private === true,
          group,
          path: path.posix.join(root, dir),
          manifest
        })
      }
    }
  }

  const seen = new Map()
  for (const w of found) {
    if (seen.has(w.name) && seen.get(w.name).path !== w.path) {
      fail(`${w.name} is declared twice: ${seen.get(w.name).path} and ${w.path}`)
    }
    seen.set(w.name, w)
  }
  return [...seen.values()]
}

function glob (root, pattern) {
  return fs.globSync(`${pattern.replace(/\/$/, '')}/package.json`, { cwd: root })
    .filter((f) => !f.split(path.sep).includes('node_modules'))
    .map((f) => path.dirname(f))
}

// --- versions ---------------------------------------------------------------

function parseVersion (version) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(version || '')
  return m && { tuple: [+m[1], +m[2], +m[3]], pre: m[4] ? m[4].split('.') : [] }
}

function compareVersions (a, b) {
  for (let i = 0; i < 3; i++) if (a.tuple[i] !== b.tuple[i]) return a.tuple[i] - b.tuple[i]
  if (!a.pre.length || !b.pre.length) return b.pre.length - a.pre.length
  for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
    const x = a.pre[i]
    const y = b.pre[i]
    if (x === undefined || y === undefined) return x === undefined ? -1 : 1
    if (x === y) continue
    const nx = /^\d+$/.test(x)
    const ny = /^\d+$/.test(y)
    if (nx && ny) return Number(x) - Number(y)
    if (nx !== ny) return nx ? -1 : 1
    return x < y ? -1 : 1
  }
  return 0
}

// Whether `version` satisfies `spec`, for the specs MDK uses between its own
// packages: an exact version, ^x.y.z or ~x.y.z. Returns null for anything else
// ("*", tags, unions, file: and workspace: specs). Follows npm: ^0.y.z stays
// within 0.y, and a prerelease only matches a range whose lower bound is a
// prerelease of the same x.y.z.
function satisfies (spec, version) {
  const m = /^([\^~]?)(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(spec.trim())
  const v = parseVersion(version)
  if (!m || !v) return null
  const low = parseVersion(m[2])
  if (v.pre.length && (!low.pre.length || low.tuple.join('.') !== v.tuple.join('.'))) return false
  if (m[1] === '') return compareVersions(v, low) === 0

  const [major, minor, patch] = low.tuple
  const high = m[1] === '~'
    ? [major, minor + 1, 0]
    : major > 0 ? [major + 1, 0, 0] : minor > 0 ? [0, minor + 1, 0] : [0, 0, patch + 1]
  return compareVersions(v, low) >= 0 && compareVersions(v, { tuple: high, pre: ['0'] }) < 0
}

// --- verify -----------------------------------------------------------------

// Checks that each tarball carries the version its package.json has in this
// checkout and every file its manifest points at (main, types, bin, exports),
// so a missing build fails here instead of shipping a package without its entry
// point.
function verify () {
  if (!positional.length) fail('verify needs at least one tarball')

  const versions = new Map(discover().map((w) => [w.name, w.version]))
  const errors = []
  for (const tarball of positional) {
    const files = new Set(execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' }).split('\n').filter(Boolean))
    const manifest = JSON.parse(execFileSync('tar', ['-xzOf', tarball, 'package/package.json'], { encoding: 'utf8' }))
    const expected = versions.get(manifest.name)
    const before = errors.length

    if (!expected) errors.push(`${tarball}: ${manifest.name} is not a workspace in this checkout`)
    else if (manifest.version !== expected) errors.push(`${tarball}: version ${manifest.version}, but ${manifest.name} is at ${expected}`)
    if (manifest.private) errors.push(`${tarball}: ${manifest.name} is private`)

    for (const entry of entryPoints(manifest)) {
      if (!files.has('package/' + entry)) errors.push(`${manifest.name}: ${entry} is referenced in package.json but missing from the tarball`)
    }
    if (errors.length === before) console.log(`ok ${manifest.name}@${manifest.version} (${files.size} files)`)
  }
  if (errors.length) fail('verify failed:\n  - ' + errors.join('\n  - '))
}

function entryPoints (manifest) {
  const out = new Set()
  const add = (value) => {
    if (typeof value === 'string') {
      if (!value.includes('*')) out.add(path.posix.normalize(value).replace(/^\.\//, ''))
    } else if (value && typeof value === 'object') {
      for (const v of Object.values(value)) add(v)
    }
  }
  for (const field of ['main', 'module', 'types', 'typings', 'bin', 'exports']) add(manifest[field])
  return [...out]
}

// --- publish ----------------------------------------------------------------

// Publishes the planned tarballs wave by wave and stops at the first failure.
// Versions already on npm are skipped, so re-running the workflow picks up
// where a failed run stopped.
function publish () {
  if (!flags.plan || !flags.dir) fail('publish needs --plan and --dir')
  checkNpm()

  const { distTag, packages } = readJson(flags.plan)
  const rows = []

  for (const pkg of packages) {
    const id = `${pkg.name}@${pkg.version}`
    if (pkg.status !== 'publish' || npmHasVersion(pkg.name, pkg.version)) {
      console.log(`skip ${id}: already on npm`)
      rows.push(`| ${pkg.wave} | \`${pkg.name}\` | ${pkg.version} | already on npm |`)
      continue
    }

    const tarball = path.join(flags.dir, pkg.tarball)
    if (!fs.existsSync(tarball)) fail(`missing tarball ${tarball} for ${id}`)

    console.log(`::group::wave ${pkg.wave}: publish ${id}`)
    const res = spawnSync('npm', ['publish', tarball, '--access', 'public', '--tag', distTag, '--ignore-scripts'], { stdio: 'inherit' })
    console.log('::endgroup::')

    if (res.status !== 0) {
      rows.push(`| ${pkg.wave} | \`${pkg.name}\` | ${pkg.version} | **failed** |`)
      summary(['### npm publish', '', '| Wave | Package | Version | Result |', '| --- | --- | --- | --- |', ...rows])
      fail(`publishing ${id} failed; fix the cause and re-run (already published packages are skipped)`)
    }
    rows.push(`| ${pkg.wave} | \`${pkg.name}\` | ${pkg.version} | published |`)
  }

  summary(['### npm publish', '', `dist-tag \`${distTag}\``, '', '| Wave | Package | Version | Result |', '| --- | --- | --- | --- |', ...rows])
}

function checkNpm () {
  const current = execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim()
  const parts = current.split('.').map(Number)
  for (let i = 0; i < MIN_NPM.length; i++) {
    if (parts[i] > MIN_NPM[i]) return
    if (parts[i] < MIN_NPM[i]) fail(`npm ${current} can't use trusted publishing; need ${MIN_NPM.join('.')} or newer`)
  }
}

// --- helpers ----------------------------------------------------------------

// `npm view name@version version` prints the version when it exists, prints
// nothing when the package exists without that version, and fails with E404
// when the package doesn't exist at all.
function npmHasVersion (name, version) {
  const res = spawnSync('npm', ['view', `${name}@${version}`, 'version'], { encoding: 'utf8' })
  if (res.status === 0) return res.stdout.trim() !== ''
  if (/E404|404 Not Found/.test(res.stderr)) return false
  fail(`npm view ${name}@${version} failed:\n${res.stderr}`)
}

function tarballName (name, version) {
  return `${name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`
}

function readJson (file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function output (key, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`)
}

function summary (lines) {
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n\n')
}

function parseArgs (args) {
  const flags = {}
  const positional = []
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2)
      const next = args[i + 1]
      flags[key] = next === undefined || next.startsWith('--') ? '' : args[++i]
    } else {
      positional.push(args[i])
    }
  }
  return { flags, positional }
}

function fail (message) {
  console.error(`::error::${message.split('\n')[0]}`)
  console.error(message)
  process.exit(1)
}
