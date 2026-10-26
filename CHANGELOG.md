# Changelog: mdk-0.12.1

> For a high-level introduction, see the [release notes](./docs/reference/release-notes/0.12.1-release.md)

## v0.12.1

- Moves the **UI to zod 4**: `@tetherto/mdk-react-devkit` now peers on `zod` `^4.6.6`, `@hookform/resolvers` `^5.9.2` and
  `react-hook-form` `^7.55.0`, with the same validator messages and exported signatures
- Drops the **`@tetherto/mdk-fonts` package**: apps take JetBrains Mono from `@fontsource-variable/jetbrains-mono`, one variable
  font file per script for every weight
- Clears **four high-severity advisories** published after v0.12.0, in zod, happy-dom, undici and body-parser

## Breaking changes

### `@tetherto/mdk-react-devkit` peers on zod 4

zod 3 is affected by GHSA-mrhx-c7xc-m3w5 and has no patched release, so the devkit's form stack moves to zod 4.

| Peer dependency       | v0.12.0   | v0.12.1   |
| --------------------- | --------- | --------- |
| `zod`                 | `^3.24.0` | `^4.6.6`  |
| `@hookform/resolvers` | `^4.1.0`  | `^5.9.2`  |
| `react-hook-form`     | `^7.54.0` | `^7.55.0` |

The `validators` helpers and the `loginSchema`, `profileSchema` and `contactSchema` exports keep their signatures and messages.
An app that builds its own zod schemas follows the zod 4 migration: `required_error`, `invalid_type_error` and `errorMap` become
a single `error` option. Under `@hookform/resolvers` 5, a schema whose input and output types differ (for example a field with
`.default()`) needs `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`, or the default moved into
`defaultValues`.

### `@tetherto/mdk-fonts` is removed

Replace `import '@tetherto/mdk-fonts/jetbrains-mono.css'` with an `@font-face` for `'JetBrains Mono'` that points at
`@fontsource-variable/jetbrains-mono`'s files, as [`ui/apps/catalog/src/fonts.css`](ui/apps/catalog/src/fonts.css) and
[`examples/mdk-ui-shell-template/src/fonts.css`](examples/mdk-ui-shell-template/src/fonts.css) do. Declaring the face keeps the
family name devkit's `--font-mono` asks for (Fontsource's own stylesheet registers `'JetBrains Mono Variable'`) and keeps
`font-display: optional`. Without the font, devkit falls back to the system monospace stack.

## Changed

- **JetBrains Mono** loads as one variable woff2 per script covering weights 100 to 800. The Latin file is about 40 KB, where
  the removed package shipped about 53 KB per static weight, and the Latin Extended file (about 15 KB, including ₿) is only
  fetched when a page renders one of its characters. Weight 800 renders as a real weight instead of a synthesised bold. The
  Fontsource subsets do not include box-drawing characters, arrows or geometric shapes such as ▲ ▼ ● ■, which now render in
  the fallback monospace font
- **The UI shell template** and the catalog declare the face in a local `src/fonts.css`; the `mvp-site` example drops the
  unused `@tetherto/mdk-fonts` dependency

## Removed

- **`@tetherto/mdk-fonts`** (`ui/packages/fonts`), with its entries in the UI build and the package reference

## Security

| Advisory            | Package     | Resolution                                                                                         |
| ------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| GHSA-mrhx-c7xc-m3w5 | zod         | The UI moves to zod 4.6.6 or later; no 3.x release is patched                                      |
| GHSA-834v-8h66-3h79 | happy-dom   | Test environment raised to `^21.0.4` in the UI packages                                            |
| GHSA-xjj6-f33q-929c | undici      | UI lockfile at 7.30.1; the root override floor rises from `>=6.24.0` to `>=8.12.2` (resolves 8.12.3) |
| GHSA-27r3-jxmh-p828 | body-parser | Root lockfile at 2.4.0                                                                             |

body-parser 2.4.0 requires `qs` `^6.16.1`, so the root `qs` security override moves from 6.16.0 to 6.16.1.

## Dependencies

| Package                                                     | Change                                                                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `@tetherto/mdk-react-devkit`                                | `zod`, `@hookform/resolvers` and `react-hook-form` as in the table above (dev and peer); `happy-dom` `^20.0.0` → `^21.0.4` (dev) |
| `@tetherto/mdk-react-adapter`, `@tetherto/mdk-ui-agent`     | `happy-dom` `^20.0.0` → `^21.0.4` (dev)                                                                    |
| `ui/apps/catalog`                                           | Adds `@fontsource-variable/jetbrains-mono` `^5.3.0`, drops `@tetherto/mdk-fonts`, and takes the zod 4 form stack |
| `examples/mdk-ui-shell-template`                            | Adds `@fontsource-variable/jetbrains-mono` `^5.3.0`, drops `@tetherto/mdk-fonts`                           |
| `examples/mvp-site/ui`                                      | Drops `@tetherto/mdk-fonts`                                                                                |
| Root                                                        | Overrides move `undici` to `>=8.12.2` and `qs` to 6.16.1                                                   |

> For previous releases, see the [changelog archive](./docs/reference/changelog-archive/2026-archive.md)
