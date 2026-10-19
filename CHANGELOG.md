# Changelog: mdk-0.11.0

> For a high-level introduction, see the [release notes](./docs/reference/release-notes/0.11.0-release.md)

## v0.11.0

- Makes the **Kernel allowlist work for Gateway plugins**: every plugin's client now dials Kernel with the Gateway's persistent DHT
  key, the one the Gateway publishes as `status.rpcClientKey`, so one allowlist entry admits the whole Gateway and survives restarts
- Moves the **default data root from `os.tmpdir()/mdk` to `~/.mdk`**, created owner-only, so Kernel, Gateway and Worker identity
  seeds no longer sit in a shared temp directory
- Has `@tetherto/mdk-client` report a Kernel it cannot reach as **`ERR_MDK_CLIENT_UNAVAILABLE` on every request**, not only on
  connect
- Adds a **relaxed tool-admission mode to `@tetherto/mdk-agent`** (`strictToolGating: false`) so a domain agent on a stronger model
  can admit standard MCP tools, plus charter provenance on sessions and eval manifests

## Breaking changes

### Default data root moves to `~/.mdk`

[`@tetherto/mdk-core`](backend/core/mdk/README.md) now roots its local state in the user's home directory instead of the OS temp
directory.

| Default                      | Before                        | Now                   |
| ---------------------------- | ----------------------------- | --------------------- |
| `getKernel()` `opts.root`    | `os.tmpdir()/mdk`             | `~/.mdk`              |
| `startGateway()` `opts.root` | `os.tmpdir()/mdk/gateway`     | `~/.mdk/gateway`      |
| `DEFAULT_TOPIC_FILE`         | `os.tmpdir()/mdk/.dht-topic`  | `~/.mdk/.dht-topic`   |
| `DEFAULT_KEY_FILE`           | `os.tmpdir()/mdk/.kernel-key` | `~/.mdk/.kernel-key`  |

State under the old location is not read after upgrading. A stack that relied on the defaults starts with a fresh Kernel store, a new
DHT topic and a new Gateway identity, so an existing `auth.whitelist` entry for the Gateway no longer matches: allowlist the new
`status.rpcClientKey`, or pass `opts.root` to keep the previous directory. To run several examples side by side, [give each process its
own `HOME` rather than its own `TMPDIR`](docs/guides/miners/troubleshooting.md).

## Added

### Caller keypair for `@tetherto/mdk-client`

[`createMdkClient(config)`](backend/core/client/README.md) reads a new optional `config.kernelKeyPair`, either a DHT keypair
`{ publicKey, secretKey }` or a function returning one, and dials Kernel with it so the allowlist can name the caller. Without it the
caller key is random per process, as before. `createRawMdkClient({ hrpc })` takes the same value as `hrpc.keyPair`. A Gateway plugin's
`config` has it folded in (see Fixed), and [`docs/guides/gateway/plugins.md`](docs/guides/gateway/plugins.md) lists it with
`kernelKey` and `kernelBootstrap`.

### Relaxed tool admission and charter provenance in `@tetherto/mdk-agent`

`createAgent()` takes four new options, documented in [`README.md`](backend/core/agent/README.md) and
[`docs/TOOLS.md`](backend/core/agent/docs/TOOLS.md).

| Option             | Default | Effect                                                             |
| ------------------ | ------- | ------------------------------------------------------------------ |
| `strictToolGating` | `true`  | `false` admits standard MCP tools: any identifier-shaped name, no `_meta['x-mdk-agent']` block required, widened parameter types (date-time, UUID, id-shaped names, arrays of enums or refs) and no mandatory defaults |
| `capability`    | `'small'`, or `'mid'` when `strictToolGating` is `false` | Relaxed admission refuses `'small'` and throws at `createAgent()` |
| `charter`          | The built-in charter | Alias for `system`. When both are given, `charter` wins. An empty or non-string value throws |
| `charterVersion`   | `'v2'` for the built-in charter, `'custom'` for an override | Version stamp carried on the agent and every session |

Relaxed admission keeps the approval gate fail-safe. A tool with no `readOnlyHint` is treated as a write, and a tool named with a
mutating verb (`create`, `delete`, `exec`, `restart` and similar) is treated as a write even when it claims to be read-only. A tool
admitted without an `x-mdk-agent` block at the current contract version skips the result-contract check, since it never declared one.

The strict vocabulary also gains two entities, `report` and `measurement`, so `<verb>_report` and `<verb>_measurement` tools now pass
strict admission.

Eval runs record the configuration they ran under: the manifest gains `charterVersion`, `charterSha256` (a hash of the exact system
prompt) and `strictToolGating`, and `mdk-agent eval` passes the agent's values through.

## Changed

- **`@tetherto/mdk-client` wraps Kernel request failures.** A call through `createMdkClient` that fails without an `ERR_*` code now
  rejects with `ERR_MDK_CLIENT_UNAVAILABLE` (or the `opts.errorCode` override), keeping the original error as `cause`. Errors that
  already carry an `ERR_*` code pass through unchanged. Code that matched raw transport errors from a lost Kernel connection should
  match the code instead. The Gateway keeps serving HTTP while Kernel is unreachable, and Kernel-backed routes return that code until it
  is back, as the [security guide](docs/guides/security/index.md) now describes.
- **The [`auth-whitelist` example](examples/backend/kernel/auth-whitelist.js) is a two-run exchange.** The first run starts Kernel
  open and lets the Gateway publish its persistent key. The second run allowlists that key, so the same Gateway is admitted and every
  other caller is refused.

## Security

- **Identity seeds stay owner-only.** `@tetherto/mdk-core` creates its data directories with mode `0700`, and the Worker runtime
  creates its `storeDir` with mode `0700` and writes new persistent seed files with mode `0600`
  ([`worker-runtime.js`](backend/core/mdk-worker/lib/worker-runtime.js)). Together with the move out of the shared temp directory
  (see Breaking changes), another local user can no longer read a seed and present the Gateway's or a Worker's identity.

## Fixed

- **Allowlisting `status.rpcClientKey` now admits Gateway plugins.** The Gateway already published that key, but each plugin's client
  dialed Kernel with a random key of its own, so a non-empty `auth.whitelist` refused every plugin. The plugin context now hands each
  client the Gateway's persistent keypair through `config.kernelKeyPair`
  ([`plugin-gateway.js`](backend/core/gateway/workers/lib/plugin-gateway.js)). The keypair is resolved when the client connects, and a
  host without a DHT, such as the standalone MCP server, still dials with a random key. The Gateway, Kernel and security docs now say
  where to read the key and that it survives restarts.

> For previous releases, see the [changelog archive](./docs/reference/changelog-archive/2026-archive.md)
