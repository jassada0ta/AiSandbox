/**
 * Thin client for the SandboxApi Strapi backend.
 *
 * `VITE_API_BASE_URL` is normally empty: in production the SPA is served from
 * the Strapi origin under `/app`, and in development vite.config.js proxies
 * `/api` and `/graphql` to Strapi. Set it only when the API lives elsewhere.
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const apiUrl = (path) => `${API_BASE_URL}${path}`

async function parseError(response) {
  const body = await response.text()
  let message = `${response.status} ${response.statusText}`

  try {
    const json = JSON.parse(body)
    message = json?.error?.message || json?.errors?.[0]?.message || message
  } catch {
    // Non-JSON error body; the status line is the best we have.
  }

  return new Error(message)
}

/** GET a Strapi REST endpoint, e.g. `restRequest('/api/articles')`. */
export async function restRequest(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    headers: { Accept: 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) {
    throw await parseError(response)
  }

  return response.json()
}

/** POST a GraphQL query to the `@strapi/plugin-graphql` endpoint. */
export async function graphqlRequest(query, variables = {}) {
  const response = await fetch(apiUrl('/graphql'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw await parseError(response)
  }

  const { data, errors } = await response.json()

  if (errors?.length) {
    throw new Error(errors[0].message)
  }

  return data
}

/**
 * Probes the GraphQL endpoint with a trivial introspection query. Used by the
 * home screen (and the e2e suite) to show whether the backend is reachable.
 */
export async function checkGraphqlConnection() {
  const data = await graphqlRequest('{ __schema { queryType { name } } }')
  return data.__schema.queryType.name
}
