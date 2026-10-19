import { describe, it, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CLIENT_DIRS } from '../src/index.mjs'

const INSTALL = fileURLToPath(new URL('../src/install.mjs', import.meta.url))
const USAGE = /^usage: node src\/install\.mjs \[--client cursor\|claude\|all\] \[--target <project-root>\]$/m

// Each run gets a fresh temp cwd with no .git, so a regression that ignores
// bad args installs into that dir, where `installedClients` sees it.
const tmpDirs = []
function run (...args) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'mdk-skill-cli-'))
  tmpDirs.push(cwd)
  const { status, stdout, stderr } = spawnSync(process.execPath, [INSTALL, ...args], { cwd, encoding: 'utf8' })
  return { status, stdout, stderr, cwd }
}

function installedClients (root) {
  return Object.keys(CLIENT_DIRS).filter((c) => fs.existsSync(path.join(root, ...CLIENT_DIRS[c])))
}

describe('install.mjs CLI', () => {
  after(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }) })

  for (const flag of ['--help', '-h']) {
    it(`${flag} prints usage, exits 0, and installs nothing`, () => {
      const r = run(flag)
      assert.equal(r.status, 0)
      assert.match(r.stdout, USAGE)
      assert.equal(r.stderr, '')
      assert.deepEqual(installedClients(r.cwd), [])
    })
  }

  it('rejects an unknown option with exit 2 and installs nothing', () => {
    const r = run('--clinet', 'claude')
    assert.equal(r.status, 2)
    assert.match(r.stderr, /^ERR_ARGS: Unknown option '--clinet'/)
    assert.match(r.stderr, USAGE)
    assert.deepEqual(installedClients(r.cwd), [])
  })

  it('rejects a positional argument with exit 2 and installs nothing', () => {
    const r = run('stray')
    assert.equal(r.status, 2)
    assert.match(r.stderr, /^ERR_ARGS: Unexpected argument 'stray'/)
    assert.match(r.stderr, USAGE)
    assert.deepEqual(installedClients(r.cwd), [])
  })

  for (const flag of ['--client', '--target']) {
    it(`rejects ${flag} without a value with exit 2 and installs nothing`, () => {
      const r = run(flag)
      assert.equal(r.status, 2)
      assert.match(r.stderr, new RegExp(`^ERR_ARGS: Option '${flag} <value>' argument missing`))
      assert.match(r.stderr, USAGE)
      assert.deepEqual(installedClients(r.cwd), [])
    })
  }

  it('installs only the requested client', () => {
    const r = run('--client', 'cursor')
    assert.equal(r.status, 0, r.stderr)
    assert.match(r.stdout, /installed \d+ skill\(s\) -> \.cursor\/skills/)
    assert.deepEqual(installedClients(r.cwd), ['cursor'])
    assert.ok(fs.existsSync(path.join(r.cwd, ...CLIENT_DIRS.cursor, 'mdk', 'SKILL.md')))
  })
})
