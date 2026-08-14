import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ENV_KEYS = [
  'VUE_APP_API_URL',
  'VUE_APP_SBM_API_URL',
  'VUE_APP_DP_API_URL',
  'VUE_APP_API_USERNAME',
  'VUE_APP_API_PASSWORD',
  'VUE_APP_DP_API_USERNAME',
  'VUE_APP_DP_API_PASSWORD',
]

const originalEnv = Object.fromEntries(
  ENV_KEYS.map(key => [key, process.env[key]])
)

const { axiosMock, createdClients } = vi.hoisted(() => {
  const createdClients = []

  const axiosMock = {
    create: vi.fn(config => {
      const client = {
        config,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }

      createdClients.push(client)
      return client
    }),
  }

  return { axiosMock, createdClients }
})

vi.mock('axios', () => ({ default: axiosMock }))

const restoreEnv = () => {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

const normalizeBaseUrl = url => {
  const baseUrl = url || '/api/'
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
}

async function loadClients(overrides = {}) {
  vi.resetModules()
  restoreEnv()

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }

  return import('../clients')
}

beforeEach(() => {
  restoreEnv()
  createdClients.length = 0
  vi.clearAllMocks()
  localStorage.clear()
  window.location.hash = ''
})

afterEach(() => {
  restoreEnv()
  localStorage.clear()
})

describe('clientes HTTP por dominio', () => {
  it('crea clientes separados, normaliza URLs y preserva Basic para DP-API', async () => {
    const { sbmApi, dpApi } = await loadClients()

    expect(sbmApi).not.toBe(dpApi)
    expect(axiosMock.create).toHaveBeenCalledTimes(2)

    const sbmConfig = axiosMock.create.mock.calls[0][0]
    const dpConfig = axiosMock.create.mock.calls[1][0]

    expect(sbmConfig.baseURL).toBe(
      normalizeBaseUrl(originalEnv.VUE_APP_SBM_API_URL || originalEnv.VUE_APP_API_URL)
    )
    expect(dpConfig.baseURL).toBe(
      normalizeBaseUrl(originalEnv.VUE_APP_DP_API_URL)
    )
    expect(dpConfig.timeout).toBe(10000)

    const username = originalEnv.VUE_APP_DP_API_USERNAME || originalEnv.VUE_APP_API_USERNAME
    const password = originalEnv.VUE_APP_DP_API_PASSWORD || originalEnv.VUE_APP_API_PASSWORD

    if (username && password) {
      expect(dpConfig.headers.Authorization).toBe(
        `Basic ${btoa(`${username}:${password}`)}`
      )
    } else {
      expect(dpConfig.headers).not.toHaveProperty('Authorization')
    }
  })

  it('agrega el Bearer actual sólo a peticiones SBM', async () => {
    await loadClients()

    const token = String(Date.now())
    localStorage.setItem('token', token)

    const sbmClient = createdClients[0]
    const dpClient = createdClients[1]

    const sbmRequestInterceptor = sbmClient.interceptors.request.use.mock.calls[0][0]
    const sbmRequest = sbmRequestInterceptor({ headers: {} })

    expect(sbmRequest.headers.Authorization).toBe(`Bearer ${token}`)
    expect(dpClient.interceptors.request.use).not.toHaveBeenCalled()
  })

  it('limpia la sesión ante 401 de SBM pero no ante errores de DP-API', async () => {
    await loadClients()

    const sessionValue = String(Date.now())
    localStorage.setItem('token', sessionValue)
    localStorage.setItem('uuid', sessionValue)
    localStorage.setItem('email', sessionValue)
    localStorage.setItem('name', sessionValue)
    window.location.hash = '#/inicio'

    const sbmClient = createdClients[0]
    const dpClient = createdClients[1]

    const sbmResponseError = sbmClient.interceptors.response.use.mock.calls[0][1]
    const dpResponseError = dpClient.interceptors.response.use.mock.calls[0][1]

    const dpError = { response: { status: 401 } }
    await expect(dpResponseError(dpError)).rejects.toBe(dpError)
    expect(localStorage.getItem('token')).toBe(sessionValue)

    const sbmError = { response: { status: 401 } }
    await expect(sbmResponseError(sbmError)).rejects.toBe(sbmError)

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('uuid')).toBeNull()
    expect(localStorage.getItem('email')).toBeNull()
    expect(localStorage.getItem('name')).toBeNull()
    expect(window.location.hash).toBe('#/login')
  })

  it('propaga respuestas y errores HTTP sin alterar', async () => {
    await loadClients()

    const sbmClient = createdClients[0]
    const requestError = sbmClient.interceptors.request.use.mock.calls[0][1]
    const responseSuccess = sbmClient.interceptors.response.use.mock.calls[0][0]

    const requestFailure = new Error('request-error')
    await expect(requestError(requestFailure)).rejects.toBe(requestFailure)

    const response = { data: { ok: true } }
    expect(responseSuccess(response)).toBe(response)
  })

  it('usa /api/ y omite Authorization cuando no hay configuración', async () => {
    await loadClients({
      VUE_APP_API_URL: undefined,
      VUE_APP_SBM_API_URL: undefined,
      VUE_APP_DP_API_URL: undefined,
      VUE_APP_API_USERNAME: undefined,
      VUE_APP_API_PASSWORD: undefined,
      VUE_APP_DP_API_USERNAME: undefined,
      VUE_APP_DP_API_PASSWORD: undefined,
    })

    const sbmConfig = axiosMock.create.mock.calls[0][0]
    const dpConfig = axiosMock.create.mock.calls[1][0]

    expect(sbmConfig.baseURL).toBe('/api/')
    expect(dpConfig.baseURL).toBe('/api/')
    expect(sbmConfig.headers).not.toHaveProperty('Authorization')
    expect(dpConfig.headers).not.toHaveProperty('Authorization')
  })
})
