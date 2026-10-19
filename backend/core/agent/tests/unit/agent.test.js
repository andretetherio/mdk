import test from 'brittle'
import { createAgent } from '../../index.js'
import { CHARTER, CHARTER_VERSION, CHARTER_VERSION_CUSTOM } from '../../src/charter.js'

// An external qvac provider is just a client handle — resolveProvider builds it without touching
// the network, so these tests exercise createAgent's config handling without a server or a GPU.
// No mcp is configured, so no tools are admitted and nothing reaches out.
const provider = () => ({ kind: 'qvac', mode: 'external', baseURL: 'http://127.0.0.1:1/v1', model: 'unused' })

test('strictToolGating defaults to true and is exposed on the agent', async (t) => {
  const agent = await createAgent({ provider: provider() })
  t.teardown(() => agent.close())
  t.is(agent.strictToolGating, true, 'the small-model floor is the default')
})

test('strictToolGating can be turned off, and a session inherits it', async (t) => {
  const agent = await createAgent({ provider: provider(), strictToolGating: false })
  t.teardown(() => agent.close())
  t.is(agent.strictToolGating, false)

  const session = await agent.createSession()
  t.is(session.strictToolGating, false, 'a conversation runs under the agent-wide mode')
})

test('the charter version defaults to the standard one and propagates to sessions', async (t) => {
  const agent = await createAgent({ provider: provider() })
  t.teardown(() => agent.close())
  t.is(agent.charterVersion, CHARTER_VERSION)

  const session = await agent.createSession()
  t.is(session.charterVersion, CHARTER_VERSION)
  t.is(session.system, CHARTER, 'and the standard charter is the system prompt')
})

test('a custom charter with no version given is stamped "custom"', async (t) => {
  const agent = await createAgent({ provider: provider(), charter: 'You are a grid oversight agent.' })
  t.teardown(() => agent.close())
  t.is(agent.charterVersion, CHARTER_VERSION_CUSTOM, 'an unnamed custom charter never claims the standard version')

  const session = await agent.createSession()
  t.is(session.system, 'You are a grid oversight agent.', 'charter is the session system prompt')
  t.is(session.charterVersion, CHARTER_VERSION_CUSTOM)
})

test('a custom charter keeps the version the caller names', async (t) => {
  const agent = await createAgent({ provider: provider(), charter: 'Domain oversight charter.', charterVersion: 'domain-v1' })
  t.teardown(() => agent.close())
  t.is(agent.charterVersion, 'domain-v1')

  const session = await agent.createSession()
  t.is(session.charterVersion, 'domain-v1', 'the named provenance follows the conversation')
})

test('charter is an alias for system — system still works and stamps custom', async (t) => {
  const agent = await createAgent({ provider: provider(), system: 'legacy charter text' })
  t.teardown(() => agent.close())
  t.is(agent.system, 'legacy charter text')
  t.is(agent.charterVersion, CHARTER_VERSION_CUSTOM)
})

test('createAgent throws when charter is empty or whitespace', async (t) => {
  await t.exception(async () => createAgent({ provider: provider(), charter: '' }),
    /charter must be a non-empty string/)
  await t.exception(async () => createAgent({ provider: provider(), charter: '   ' }),
    /charter must be a non-empty string/)
})

test('createAgent throws when strictToolGating: false is paired with capability: small', async (t) => {
  await t.exception(async () => createAgent({ provider: provider(), strictToolGating: false, capability: 'small' }),
    /strictToolGating:false requires capability "mid" or higher/)
})
