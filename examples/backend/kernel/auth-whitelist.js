'use strict'

/**
 * MDK Kernel — HRPC Auth Whitelist
 *
 * Restricts Kernel access to one Gateway via the HRPC firewall allowlist. Only
 * callers whose DHT public key is on the allowlist can connect; everyone else
 * is refused at the network layer.
 *
 * The Gateway dials the Kernel with one persistent key — its seed lives in the
 * Gateway store — and publishes it as `status.rpcClientKey` in its status file,
 * so the key exchange is two runs of this script:
 *
 *   1st run: no key published yet → Kernel starts open, the Gateway connects
 *            and publishes its key
 *   2nd run: that key is on the allowlist → the same Gateway is admitted and
 *            every other caller is refused
 *
 * Run (twice), then:
 *   curl localhost:3210/site-monitor/hashrate
 *
 * Delete ./store/http (the Gateway store) to reset the Gateway identity.
 * Ctrl+C to stop.
 */

const path = require('path')
const os = require('os')
const fs = require('fs')
const { getKernel, startGateway, bundledPluginDir, waitForDiscovery } = require('@tetherto/mdk-core')
const { startAvalonWorker } = require('@tetherto/mdk-worker-avalon')
const avMockServer = require('@tetherto/mdk-worker-avalon/mock/server')

const MOCK_PORT = 14032
const HTTP_PORT = 3210
const ROOT = path.join(os.tmpdir(), 'mdk-example-auth-whitelist')
const GATEWAY_ROOT = path.join(ROOT, 'gateway')
const STATUS_FILE = path.join(GATEWAY_ROOT, 'status', `wrk-node-http-${HTTP_PORT}.json`)

function publishedGatewayKey () {
  try { return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8')).rpcClientKey } catch { return null }
}

async function main () {
  avMockServer.createServer({ port: MOCK_PORT, host: '127.0.0.1', type: 'a1346', serial: 'AV-001' })

  const gatewayKey = publishedGatewayKey()
  const kernel = await getKernel({
    root: ROOT,
    hrpc: { whitelist: gatewayKey ? [gatewayKey] : [] }
  })

  const worker = await startAvalonWorker({
    workerId: 'avalon-a1346-auth-demo',
    model: 'a1346',
    storeDir: path.join(ROOT, 'worker-store'),
    seedDevices: [{
      info: { serialNum: 'AV-001', container: 'rack-1' },
      opts: { address: '127.0.0.1', port: MOCK_PORT, password: 'admin' }
    }]
  })
  await kernel.registerWorker(worker.runtime.getPublicKey())
  await waitForDiscovery(kernel)

  const gateway = await startGateway({
    kernel,
    port: HTTP_PORT,
    root: GATEWAY_ROOT,
    extraPluginDirs: [bundledPluginDir('site-monitor')]
  })

  console.log(`\n  Kernel key:  ${kernel.getPublicKey().toString('hex')}`)
  console.log(`  Gateway key: ${gateway.status.rpcClientKey}  (status.rpcClientKey)`)
  console.log(gatewayKey
    ? '  Allowlist:   [Gateway key] — only this Gateway is admitted'
    : '  Allowlist:   [] — open; restart this script to allowlist the Gateway key above')
  console.log(`\n  curl localhost:${HTTP_PORT}/site-monitor/hashrate`)
  console.log(`\n  Gateway store: ${path.resolve('store/http')} (delete to reset its identity)`)
  console.log('\n  Ctrl+C to stop.\n')
}

main().catch((err) => { console.error(err); process.exit(1) })
