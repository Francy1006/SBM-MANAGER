import { beforeEach, describe, expect, it, vi } from 'vitest'

const axiosMock = vi.hoisted(() => ({ create: vi.fn(), clients: [] }))

vi.mock('axios', () => ({ default: { create: axiosMock.create } }))

function fakeClient() {
  const client = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
  axiosMock.clients.push(client)
  return client
}

async function loadClients() {
  vi.resetModules()
  axiosMock.clients = []
  axiosMock.create.mockImplementation(fakeClient)
  process.env.VUE_APP_API_URL = 'http://legacy.test/api'
  process.env.VUE_APP_SBM_API_URL = 'http://sbm.test/api'
  process.env.VUE_APP_DP_API_URL = 'http://dp.test/api'
  process.env.VUE_APP_API_USERNAME = 'fake-user'
  process.env.VUE_APP_API_PASSWORD = 'fake-password'
  return import('../clients')
}

describe('clientes HTTP por dominio', () => {
  beforeEach(() => {
    localStorage.clear()
    window.location.hash = '#/productos'
  })

  it('crea clientes separados, normaliza URLs y preserva Basic para DP-API', async () => {
    const { dpApi, sbmApi } = await loadClients()

    expect(axiosMock.create).toHaveBeenCalledTimes(2)
    expect(axiosMock.create.mock.calls[0][0]).toMatchObject({
      baseURL: 'http://sbm.test/api/',
      timeout: 10000,
    })
    expect(axiosMock.create.mock.calls[1][0]).toMatchObject({
      baseURL: 'http://dp.test/api/',
      timeout: 10000,
    })
    expect(axiosMock.create.mock.calls[1][0].headers.Authorization).toBe(
      `Basic ${btoa('fake-user:fake-password')}`
    )
    expect(sbmApi).toBe(axiosMock.clients[0])
    expect(dpApi).toBe(axiosMock.clients[1])
    expect(axiosMock.clients[0].interceptors.request.use).toHaveBeenCalledOnce()
    expect(axiosMock.clients[1].interceptors.request.use).not.toHaveBeenCalled()
  })

  it('agrega el Bearer actual sólo a peticiones SBM', async () => {
    localStorage.setItem('token', 'fake-token')
    await loadClients()
    const requestInterceptor = axiosMock.clients[0].interceptors.request.use.mock.calls[0][0]

    expect(requestInterceptor({ headers: {} })).toEqual({
      headers: { Authorization: 'Bearer fake-token' },
    })
  })

  it('limpia la sesión ante 401 de SBM pero no ante errores de DP-API', async () => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('uuid', 'fake-user-code')
    localStorage.setItem('email', 'qa@example.test')
    localStorage.setItem('name', 'QA')
    await loadClients()

    const sbmReject = axiosMock.clients[0].interceptors.response.use.mock.calls[0][1]
    await expect(sbmReject({ response: { status: 401 } })).rejects.toEqual({ response: { status: 401 } })
    expect(localStorage.getItem('token')).toBeNull()
    expect(window.location.hash).toBe('#/login')

    localStorage.setItem('token', 'preserved-token')
    const dpReject = axiosMock.clients[1].interceptors.response.use.mock.calls[0][1]
    await expect(dpReject({ response: { status: 401 } })).rejects.toEqual({ response: { status: 401 } })
    expect(localStorage.getItem('token')).toBe('preserved-token')
  })

  it('usa /api/ y omite Authorization cuando no hay configuración', async () => {
    vi.resetModules()
    axiosMock.clients = []
    axiosMock.create.mockImplementation(fakeClient)
    delete process.env.VUE_APP_API_URL
    delete process.env.VUE_APP_SBM_API_URL
    delete process.env.VUE_APP_DP_API_URL
    delete process.env.VUE_APP_API_USERNAME
    delete process.env.VUE_APP_API_PASSWORD

    await import('../clients')

    expect(axiosMock.create.mock.calls[0][0].baseURL).toBe('/api/')
    expect(axiosMock.create.mock.calls[1][0].headers).not.toHaveProperty('Authorization')
  })
})
