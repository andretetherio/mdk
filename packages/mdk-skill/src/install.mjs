#!/usr/bin/env node
// CLI wrapper around the programmatic `installSkills()` (see index.mjs).
//
//   node src/install.mjs [--client cursor|claude|all] [--target <project-root>]
//
// The project root defaults to the enclosing git repo of cwd, so this works
// both inside the monorepo and when consumed from npm.

import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { installSkills } from './index.mjs'

function findProjectRoot (startDir) {
  let dir = startDir
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return startDir
    dir = parent
  }
}

const USAGE = 'usage: node src/install.mjs [--client cursor|claude|all] [--target <project-root>]'

let values
try {
  ({ values } = parseArgs({
    options: {
      client: { type: 'string', default: 'all' },
      target: { type: 'string' },
      help: { type: 'boolean', short: 'h' }
    }
  }))
} catch (err) {
  console.error(`ERR_ARGS: ${err.message}\n${USAGE}`)
  process.exit(2)
}
if (values.help) {
  console.log(USAGE)
  process.exit(0)
}

const { client, target } = values
const projectRoot = target ? path.resolve(process.cwd(), target) : findProjectRoot(process.cwd())

try {
  const { skills, installed } = installSkills({ client, target: projectRoot })
  for (const { dir, removed } of installed) {
    console.log(`installed ${skills.length} skill(s) -> ${path.relative(process.cwd(), dir) || '.'}`)
    if (removed.length) console.log(`removed ${removed.length} stale skill(s): ${removed.join(', ')}`)
  }
  console.log('done — installed skill dirs are generated artifacts; keep them gitignored')
} catch (err) {
  console.error(`ERR_INSTALL: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}
