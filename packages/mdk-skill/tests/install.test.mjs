import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { installSkills, CLIENT_DIRS } from '../src/index.mjs'

const STAMPED = '---\nname: x\nmetadata:\n  suite: mdk-developer-skill\n  mdk_version: "0.0.0"\n---\n# old\n'
const USER = '---\nname: mdk-mine\ndescription: user-authored\n---\n# mine\n'

describe('installSkills', () => {
  let target
  before(() => { target = fs.mkdtempSync(path.join(os.tmpdir(), 'mdk-skill-install-')) })
  after(() => { fs.rmSync(target, { recursive: true, force: true }) })

  it('sweeps stale MDK-shipped skills and leaves user-authored skills alone', () => {
    const dir = path.join(target, ...CLIENT_DIRS.claude)
    fs.mkdirSync(path.join(dir, 'mdk-renamed-away'), { recursive: true })
    fs.writeFileSync(path.join(dir, 'mdk-renamed-away', 'SKILL.md'), STAMPED)
    fs.mkdirSync(path.join(dir, 'mdk-mine'), { recursive: true })
    fs.writeFileSync(path.join(dir, 'mdk-mine', 'SKILL.md'), USER)
    fs.mkdirSync(path.join(dir, 'no-skill-md'), { recursive: true })

    const { skills, installed } = installSkills({ client: 'claude', target })

    assert.ok(skills.includes('mdk'))
    assert.deepEqual(installed[0].removed, ['mdk-renamed-away'])
    assert.equal(fs.existsSync(path.join(dir, 'mdk-renamed-away')), false)
    assert.equal(fs.existsSync(path.join(dir, 'mdk-mine', 'SKILL.md')), true)
    assert.equal(fs.existsSync(path.join(dir, 'no-skill-md')), true)
    for (const s of skills) assert.equal(fs.existsSync(path.join(dir, s, 'SKILL.md')), true)
  })

  it('reports nothing removed on a clean rerun', () => {
    const { installed } = installSkills({ client: 'claude', target })
    assert.deepEqual(installed[0].removed, [])
  })
})
