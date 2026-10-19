import { z } from 'zod'

/**
 * The tool authoring contract: what a tool must look like for a small model to route to it
 * reliably, and the renderer that turns compliant tools into the prompt block it reads.
 *
 * See docs/TOOLS.md for the authoring guide.
 */

export const TOOL_CONTRACT_VERSION = 'v2'

const UNVERSIONED_CONTRACT = 'v1'

export const VERB = Object.freeze({
  COUNT: 'count',
  LIST: 'list',
  GET: 'get',
  RANK: 'rank',
  SUMMARIZE: 'summarize',
  DIAGNOSE: 'diagnose',
  ACT: 'act'
})

export const ENTITY = Object.freeze({
  SITE: 'site', DEVICE: 'device', WORKER: 'worker', POOL: 'pool', REPORT: 'report', MEASUREMENT: 'measurement'
})

export const AXIS = Object.freeze({
  family: ['miner', 'container', 'powermeter', 'sensor', 'pool', 'all'],
  state: ['all', 'online', 'offline', 'error'],
  metric: ['hashrate', 'power', 'temperature', 'efficiency', 'uptime'],
  order: ['desc', 'asc']
})

/**
 * What each verb must return. The verb is the model's only expectation about the payload, so
 * the fields are named per verb and not per entity — `list_workers` and `list_devices` return
 * the same shape, and the model learns it once.
 *
 * `summary` is on every verb and is the sentence the model speaks verbatim; the remaining
 * fields exist so a consumer that is not a model (the gateway, a test) can read the answer
 * without parsing prose.
 */
export const RESULT = Object.freeze({
  [VERB.COUNT]: Object.freeze({ summary: 'text', count: 'count' }),
  [VERB.LIST]: Object.freeze({ summary: 'text', count: 'count', total: 'count', items: 'array' }),
  [VERB.GET]: Object.freeze({ summary: 'text', ref: 'text', attr: 'text', value: 'any' }),
  [VERB.RANK]: Object.freeze({ summary: 'text', metric: 'text', order: 'text', items: 'array', unavailable: 'count' }),
  [VERB.SUMMARIZE]: Object.freeze({ summary: 'text', totals: 'object' }),
  [VERB.DIAGNOSE]: Object.freeze({ summary: 'text', findings: 'array' }),
  [VERB.ACT]: Object.freeze({ summary: 'text', ref: 'text', action: 'text', outcome: 'text' })
})

const KIND = {
  text: (v) => typeof v === 'string' && v.trim().length > 0,
  count: (v) => Number.isInteger(v) && v >= 0,
  array: (v) => Array.isArray(v),
  object: (v) => v !== null && typeof v === 'object' && !Array.isArray(v),
  any: () => true
}

/**
 * The verb a tool name declares. Read by the result contract, the capability floor and the
 * loop's result check alike, so the naming convention lives in one place.
 */
export function verbOf (name) {
  return String(name ?? '').split('_')[0]
}

/**
 * Validate a tool's result payload against the contract for its verb. Never throws.
 *
 * Shape alone is not enough: a `list` whose `count` disagrees with `items` gives the model two
 * different answers to the same question, and it speaks the one that is wrong.
 */
export function validateToolResult (name, payload) {
  const verb = verbOf(name)
  const shape = RESULT[verb]
  if (!shape) return { ok: false, errors: [`no result contract for verb "${verb}" in "${name}"`] }
  if (!KIND.object(payload)) return { ok: false, errors: ['result must be a JSON object'] }

  const errors = []
  for (const [field, kind] of Object.entries(shape)) {
    if (payload[field] === undefined) errors.push(`missing "${field}" (${kind})`)
    else if (!KIND[kind](payload[field])) errors.push(`"${field}" must be ${kind}`)
  }
  if (verb === VERB.LIST && KIND.array(payload.items) && KIND.count(payload.count) &&
      payload.count !== payload.items.length) {
    errors.push(`count (${payload.count}) disagrees with items (${payload.items.length})`)
  }
  if (verb === VERB.LIST && KIND.count(payload.count) && KIND.count(payload.total) &&
      payload.count > payload.total) {
    errors.push(`count (${payload.count}) exceeds total (${payload.total})`)
  }
  if (verb === VERB.RANK && KIND.array(payload.items) && payload.items.some((i) => !KIND.object(i) || i[payload.metric] === undefined)) {
    errors.push(`every ranked item must carry its "${payload.metric}" value`)
  }
  return { ok: errors.length === 0, errors }
}

/**
 * The default boundary for a fleet tool set that reports present state — what the six MDK demo
 * tools do not answer. It is a default, not a law: replace it with `notCovered` when your tools
 * cover more, and pass `[]` to drop the block entirely.
 *
 * Some boundary is needed because `useWhen` is a positive index only. With nothing to route
 * away from, each tool absorbs the questions that merely sound like its topic — "is it under
 * warranty" reaches get_device because it names a device, "email the team" reaches act_device
 * because it is an action. Both are refusals, not routes. Measured on a 4B, stating this took
 * questions no tool covers from 60% to 86%.
 *
 * Keep it true of the tools actually admitted. A line here that contradicts a tool in the list
 * is worse than no line at all: the model is told to decline a question it can answer.
 */
export const NOT_COVERED = Object.freeze([
  'the past, history, or how anything has changed over time',
  'forecasts, predictions, or what will happen next',
  'costs, prices, power bills, revenue or profitability',
  'people, shifts, scheduling, notifications, messages or orders',
  'purchase, warranty, ownership, firmware choice or anything not reported by the hardware',
  'anything outside this site, including other sites and the wider network'
])

export const CAPABILITY = Object.freeze({ SMALL: 'small', MID: 'mid', LARGE: 'large' })
const CAPABILITY_RANK = { small: 0, mid: 1, large: 2 }

/**
 * Floors that belong to the verb itself, whatever a tool declares.
 *
 * Most verbs are routing and relaying: the tool computes, the model repeats. `diagnose` is not
 * — it asks the model to reason from evidence to a cause, which no result shape can hand it
 * ready-made. Measured on a 4B, questions of that shape scored 0/4, and every failure was a
 * confident wrong answer rather than a refusal, which is the worst outcome the contract has.
 *
 * A tool cannot opt out by declaring a lower floor; validateTool rejects that.
 */
export const VERB_FLOOR = Object.freeze({ [VERB.DIAGNOSE]: CAPABILITY.MID })

const NAME_PATTERN = new RegExp(`^(${Object.values(VERB).join('|')})_(${Object.values(ENTITY).join('|')})s?$`)

// Relaxed gating drops the verb_entity convention: a standard MCP tool ("search_files",
// "get-weather") is named by whoever authored the server, not by this taxonomy. The name still
// has to be a single identifier token so it renders and parses as a call.
const RELAXED_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/

export const AGENT_META_KEY = 'x-mdk-agent'

export const agentMeta = (tool) => tool?._meta?.[AGENT_META_KEY]

export const AgentMetaSchema = z.object({
  enabled: z.literal(true),
  answers: z.string().min(1),
  useWhen: z.array(z.string().min(1)).min(2).max(6),
  notFor: z.array(z.string()).default([]),
  outOfScope: z.array(z.string()).default([]),
  returns: z.string().min(1),
  minCapability: z.enum([CAPABILITY.SMALL, CAPABILITY.MID, CAPABILITY.LARGE]),
  contract: z.string().min(1).default(UNVERSIONED_CONTRACT)
})

/**
 * Validate a tool descriptor. Never throws, so one bad tool cannot take down the rest.
 *
 * `meta` is the parsed block with defaults applied — read that, not the raw `_meta`, or an
 * omitted optional field arrives undefined.
 *
 * `strictToolGating` (default true) is the small-model floor: the verb_entity name, the
 * `_meta['x-mdk-agent']` routing block, declared mutability, and the closed parameter vocabulary.
 * Relaxed gating drops those so a domain agent backed by a stronger model can admit the standard
 * MCP tools a Gateway or external server already exposes — a declared `_meta` block is still
 * honoured when present, but its absence is not a rejection.
 */
export function validateTool (tool, { strictToolGating = true } = {}) {
  const errors = []
  const name = tool?.name
  if (strictToolGating) {
    if (typeof name !== 'string' || !NAME_PATTERN.test(name)) {
      errors.push(`name must be <verb>_<entity>, e.g. count_devices (verbs: ${Object.values(VERB).join('|')}; entities: ${Object.values(ENTITY).join('|')})`)
    }
  } else if (typeof name !== 'string' || !RELAXED_NAME_PATTERN.test(name)) {
    errors.push('name must be a single identifier token (letters, digits, "_" or "-")')
  }
  if (!tool?.description) errors.push('description is required — the model routes on it')

  // Strict mode requires the routing contract; relaxed mode only validates one that is present,
  // leaving a synthesized fallback to admitTools when it is absent.
  const rawMeta = agentMeta(tool)
  const parsed = AgentMetaSchema.safeParse(rawMeta)
  if (rawMeta !== undefined && !parsed.success) {
    errors.push(`_meta["${AGENT_META_KEY}"] invalid: ${parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'} ${i.message}`).join('; ')}`)
  } else if (strictToolGating && !parsed.success) {
    errors.push(`_meta["${AGENT_META_KEY}"] invalid: missing or empty`)
  }

  const floor = VERB_FLOOR[verbOf(name)]
  if (floor && parsed.success && CAPABILITY_RANK[parsed.data.minCapability] < CAPABILITY_RANK[floor]) {
    errors.push(`a ${verbOf(name)}_* tool needs minCapability "${floor}" or higher, not "${parsed.data.minCapability}"`)
  }

  // Mutability must be declared under strict gating. Relaxed gating tolerates an absent hint —
  // admission treats it as a write (readOnlyHint: false), the fail-safe that keeps approval on —
  // but a present hint must still be a boolean.
  const hints = tool?.annotations ?? {}
  const hintDeclared = typeof hints.readOnlyHint === 'boolean'
  if (!hintDeclared && (strictToolGating || hints.readOnlyHint !== undefined)) {
    errors.push('annotations.readOnlyHint must be declared true or false')
  }
  const readOnly = hintDeclared ? hints.readOnlyHint : (strictToolGating ? undefined : false)
  if (name?.startsWith(`${VERB.ACT}_`) && readOnly !== false) {
    errors.push('an act_* tool must declare readOnlyHint: false')
  }

  errors.push(...validateParams(tool?.inputSchema, { strictToolGating }))
  return { ok: errors.length === 0, errors, meta: parsed.success ? parsed.data : undefined }
}

/**
 * Name the kind of a single parameter, or null when strict gating admits no kind for it.
 *
 * A small model cannot be trusted to invent a value, so strict gating admits only parameters it
 * can copy from the prompt or from context: an enum to pick from, a bounded integer, a date-time,
 * an id it has seen, or an array of those. A plain string with no enum and no id shape is free
 * text — the hole through which a hallucinated value enters — and classifies to null.
 *
 * Relaxed gating never returns null: an id-shaped name ('id' or '*Id') is an id, and anything
 * else falls back to 'text', so a standard MCP schema renders rather than being withheld.
 */
export function classifyParam (param, spec, { strictToolGating = true } = {}) {
  if (Array.isArray(spec?.enum) && spec.enum.length > 0) return 'enum'
  if (spec?.type === 'integer' && Number.isFinite(spec.minimum) && Number.isFinite(spec.maximum) &&
      spec.minimum <= spec.maximum) return 'int'
  if (spec?.type === 'string' && typeof spec?.['x-mdk-ref'] === 'string') return 'ref'
  if (!strictToolGating) {
    if (spec?.type === 'string' && spec?.format === 'date-time') return 'date'
    if (spec?.type === 'array' && (Array.isArray(spec.items?.enum) || typeof spec.items?.['x-mdk-ref'] === 'string')) return 'array'
    if (spec?.type === 'string' && (spec?.format === 'uuid' || typeof spec?.['x-mdk-id'] === 'string')) return 'id'
    if (param === 'id' || /Id$/.test(String(param))) return 'id'
    return 'text'
  }
  return null
}

function validateParams (inputSchema, { strictToolGating = true } = {}) {
  const errors = []
  const props = inputSchema?.properties ?? {}
  const required = new Set(Array.isArray(inputSchema?.required) ? inputSchema.required : [])
  for (const [param, spec] of Object.entries(props)) {
    if (!strictToolGating && !RELAXED_NAME_PATTERN.test(param)) {
      errors.push(`param "${param}" has an invalid name (letters, digits, "_" or "-" only)`)
    }
    if (!spec || typeof spec !== 'object') {
      errors.push(`param "${param}" must be an object schema`)
      continue
    }
    const kind = classifyParam(param, spec, { strictToolGating })
    if (!kind) {
      errors.push(`param "${param}" must be an enum, a bounded integer, or an id reference (x-mdk-ref) — never free text`)
    }
    if (kind === 'enum' && spec.enum.some((v) => String(v).includes('|'))) {
      errors.push(`param "${param}" has an enum value containing "|", which the prompt cannot render unambiguously`)
    }
    if (kind === 'array' && Array.isArray(spec.items?.enum)) {
      if (spec.items.enum.length === 0) {
        errors.push(`param "${param}" array enum cannot be empty`)
      } else if (spec.items.enum.some((v) => String(v).includes('|'))) {
        errors.push(`param "${param}" has an array enum value containing "|", which the prompt cannot render unambiguously`)
      }
    }
    // A default on every optional param is a strict-mode requirement: the small-model prompt
    // renders one so the model never has to decide whether to omit a field. A standard MCP schema
    // rarely carries defaults, so relaxed gating does not demand them.
    if (strictToolGating && !required.has(param) && spec?.default === undefined) {
      errors.push(`optional param "${param}" needs a default`)
    }
  }
  return errors
}

const MAX_TOOL_NAME_LEN = 64
const MAX_PROMPT_LINE_LEN = 200
const MAX_RETURNS_LEN = 100
const MAX_TYPE_DESC_LEN = 32

const oneLine = (s, max = MAX_PROMPT_LINE_LEN) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

// Mutating verbs: match kebab/snake prefixes case-insensitively, or camelCase (e.g. deleteFile, runQuery)
const MUTATING_PREFIX = /^(act|create|update|delete|remove|write|set|send|exec|run|kill|restart|stop)(?:[-_]|$)/i
const MUTATING_CAMEL = /^(act|create|update|delete|remove|write|set|send|exec|run|kill|restart|stop)[A-Z]/
const isMutatingName = (name) => MUTATING_PREFIX.test(name) || MUTATING_CAMEL.test(name)

/**
 * Routing metadata synthesized for a standard MCP tool that carries none, so relaxed gating can
 * render and route it. The tool's own description is all the routing signal a standard server
 * gives us; the `useWhen` phrasings and the `returns` line are placeholders a stronger model
 * tolerates, not the curated index a 4B needs — which is why this is relaxed-mode only.
 */
function fallbackMeta (tool, capability) {
  const label = oneLine(tool?.description || tool?.name || 'tool', MAX_PROMPT_LINE_LEN)
  return {
    enabled: true,
    answers: label,
    useWhen: [label, `calling ${oneLine(tool?.name, MAX_TOOL_NAME_LEN)}`],
    notFor: [],
    outOfScope: [],
    returns: 'result object',
    minCapability: capability,
    contract: TOOL_CONTRACT_VERSION,
    synthesized: true
  }
}

/**
 * Split tools into the ones this model may see and the ones it may not, each skip carrying a
 * reason. A tool whose capability floor exceeds the model is withheld rather than misused.
 *
 * `strictToolGating` (default true) keeps every small-model check: agent-enabled, the full
 * contract, the capability floor. Relaxed gating drops the `_meta` requirement and the
 * contract/floor screens — a domain agent admits what its Gateway exposes — while still
 * rejecting a tool whose name or parameters cannot be rendered into a call.
 */
export function admitTools (tools = [], { capability, strictToolGating = true } = {}) {
  const cap = capability ?? (strictToolGating ? CAPABILITY.SMALL : CAPABILITY.MID)
  if (!Object.hasOwn(CAPABILITY_RANK, cap)) {
    throw new Error(`admitTools: unknown capability "${cap}" (expected ${Object.values(CAPABILITY).join(', ')})`)
  }
  if (!strictToolGating && CAPABILITY_RANK[cap] < CAPABILITY_RANK[CAPABILITY.MID]) {
    throw new Error(`admitTools: strictToolGating:false requires capability "mid" or higher, got "${cap}"`)
  }
  const admitted = []
  const skipped = []
  for (const tool of tools) {
    const declaredMeta = agentMeta(tool)
    if (declaredMeta?.enabled === false) {
      skipped.push({ name: tool?.name, reason: 'not agent-enabled' })
      continue
    }
    if (strictToolGating && declaredMeta?.enabled !== true) {
      skipped.push({ name: tool?.name, reason: 'not agent-enabled' })
      continue
    }
    const { ok, errors, meta } = validateTool(tool, { strictToolGating })
    if (!ok) {
      skipped.push({ name: tool?.name, reason: errors[0] })
      continue
    }
    if (!strictToolGating) {
      const hints = tool?.annotations ?? {}
      const hintDeclared = typeof hints.readOnlyHint === 'boolean'
      const claimedReadOnly = hintDeclared && hints.readOnlyHint === true && !isMutatingName(tool.name)
      const annotations = { ...tool?.annotations, readOnlyHint: claimedReadOnly }
      // AgentMetaSchema is a plain z.object that strips undeclared keys during safeParse, so meta
      // never carries a server-declared synthesized flag; delete ensures it even if schema parsing changes.
      const cleanMeta = meta ? { ...meta } : undefined
      if (cleanMeta) delete cleanMeta.synthesized
      // No contract or capability screen in relaxed mode: admit the tool, attaching its declared
      // routing block when valid and a synthesized one otherwise so the renderer has a block to read.
      const resolvedMeta = cleanMeta ?? fallbackMeta(tool, cap)
      resolvedMeta.contractChecked = cleanMeta?.contract === TOOL_CONTRACT_VERSION
      admitted.push({
        ...tool,
        annotations,
        _meta: { ...tool._meta, [AGENT_META_KEY]: resolvedMeta }
      })
      continue
    }
    // AgentMetaSchema is a plain z.object that strips undeclared keys during safeParse, so meta
    // never carries a server-declared synthesized flag; delete ensures it even if schema parsing changes.
    const cleanMeta = { ...meta, contractChecked: true }
    delete cleanMeta.synthesized
    if (cleanMeta.contract !== TOOL_CONTRACT_VERSION) {
      skipped.push({ name: tool.name, reason: `authored against contract ${cleanMeta.contract}, this agent speaks ${TOOL_CONTRACT_VERSION}` })
      continue
    }
    if (CAPABILITY_RANK[cleanMeta.minCapability] > CAPABILITY_RANK[cap]) {
      skipped.push({ name: tool.name, reason: `needs a ${cleanMeta.minCapability} model` })
      continue
    }
    admitted.push({ ...tool, _meta: { ...tool._meta, [AGENT_META_KEY]: cleanMeta } })
  }
  return { admitted, skipped }
}

/**
 * Render admitted tools as the prompt block. Every tool renders in the same shape, since the
 * repetition itself aids routing, and enum values print verbatim so the model copies them.
 *
 * Input must be admitTools().admitted; anything else throws.
 */
export function renderTools (tools = [], { strictToolGating = true } = {}) {
  return tools.map((tool) => {
    const meta = agentMeta(tool)
    if (!meta || !Array.isArray(meta.useWhen) || !Array.isArray(meta.notFor)) {
      throw new TypeError(`renderTools: "${tool?.name ?? tool}" is not an admitted tool (_meta["${AGENT_META_KEY}"] missing or not normalized) — pass admitTools().admitted`)
    }
    const lines = [`${oneLine(tool.name, MAX_TOOL_NAME_LEN)} — ${oneLine(meta.answers, MAX_PROMPT_LINE_LEN)}`]
    lines.push(`  use when : ${meta.useWhen.map((u) => `"${oneLine(u, MAX_PROMPT_LINE_LEN)}"`).join(', ')}`)
    if (meta.notFor.length) lines.push(`  not for  : ${meta.notFor.map((n) => oneLine(n, MAX_PROMPT_LINE_LEN)).join('; ')}`)
    const params = renderParams(tool.inputSchema, { strictToolGating })
    if (params) lines.push(`  params   : ${params}`)
    lines.push(`  returns  : ${oneLine(meta.returns, MAX_RETURNS_LEN)}`)
    return lines.join('\n')
  }).join('\n')
}

/**
 * The coverage boundary for a tool set: the standing exclusions plus anything the admitted
 * tools declare in `outOfScope`.
 *
 * This is the negative half of the tool block. The positive half (each tool's `useWhen`) tells
 * the model where to route; without this it has nothing to route *away* from, and declining
 * becomes the one behaviour the prompt cannot express.
 *
 * Under relaxed gating (strictToolGating: false), coverage rendering is omitted: a domain agent
 * with a stronger model and a custom charter defines its own out-of-scope boundaries in the
 * charter itself, rather than through MDK's fleet-specific negative-routing block.
 */
export function renderCoverage (tools = [], { notCovered = NOT_COVERED, strictToolGating = true } = {}) {
  if (!strictToolGating) return ''
  const declared = tools.flatMap((tool) => agentMeta(tool)?.outOfScope ?? [])
  const lines = [...new Set([...notCovered, ...declared])]
  if (!lines.length) return ''
  return [
    'NONE of these tools answers questions about:',
    ...lines.map((line) => `  - ${line}`),
    'For any of those, call NO tool at all. Say plainly that you do not have that ability, and',
    'offer the closest thing you can do. Calling a tool that cannot answer is worse than saying no.'
  ].join('\n')
}

function renderParams (inputSchema, { strictToolGating = true } = {}) {
  const props = inputSchema?.properties ?? {}
  return Object.entries(props).map(([param, spec]) => {
    const kind = classifyParam(param, spec, { strictToolGating })
    let type
    if (kind === 'enum') type = `[${spec.enum.join('|')}]`
    else if (kind === 'int') type = `<int ${spec.minimum}..${spec.maximum}>`
    else if (kind === 'ref') type = `<${spec['x-mdk-ref']} id>`
    else if (kind === 'date') type = '<ISO date-time>'
    else if (kind === 'id') {
      const ref = spec?.['x-mdk-ref']
      type = ref ? `<${ref} id>` : (param.endsWith('Id') ? '<id>' : `<${param} id>`)
    } else if (kind === 'array') {
      const itemDesc = spec?.items?.enum ? spec.items.enum.join('|') : (spec?.items?.['x-mdk-ref'] ? `<${spec.items['x-mdk-ref']} id>` : 'item')
      type = `[${itemDesc}, ...]`
    } else if (!strictToolGating) {
      // Relaxed gating renders any remaining type rather than throwing — a free-text param is a
      // valid MCP parameter here, not the contract breach it is under strict gating.
      type = `<${oneLine(spec?.type, MAX_TYPE_DESC_LEN) || 'text'}>`
    } else {
      throw new Error(`renderTools: param "${param}" is not admissible; render only admitTools().admitted`)
    }
    return `${param}=${type}${spec?.default !== undefined ? `=${JSON.stringify(spec.default)}` : ''}`
  }).join(', ')
}
