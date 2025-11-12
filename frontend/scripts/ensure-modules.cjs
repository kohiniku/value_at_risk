#!/usr/bin/env node
const { existsSync } = require('node:fs')
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const projectRoot = path.join(__dirname, '..')
const modulesDir = path.join(projectRoot, 'node_modules')
const required = ['tailwindcss-animate', 'html-to-image', 'jspdf']

const missing = !existsSync(modulesDir)
  ? required
  : required.filter((pkg) => !existsSync(path.join(modulesDir, pkg)))

if (missing.length === 0) {
  process.exit(0)
}

const reason = !existsSync(modulesDir)
  ? 'node_modules directory not found'
  : `missing packages: ${missing.join(', ')}`

console.log(`[ensure-modules] ${reason}. Running pnpm install...`)
const result = spawnSync('pnpm', ['install', '--frozen-lockfile'], {
  cwd: projectRoot,
  stdio: 'inherit',
})

if (result.status !== 0) {
  console.error('[ensure-modules] pnpm install failed')
  process.exit(result.status ?? 1)
}
