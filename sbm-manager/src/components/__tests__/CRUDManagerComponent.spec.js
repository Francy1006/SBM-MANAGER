import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CRUDManagerComponent from '../CRUDManagerComponent.vue'

const GridStub = {
  name: 'CRUDGridComponent',
  props: ['apiClient', 'rowKey', 'endpoint', 'detailDeleteEndpoint'],
  emits: ['show-properties', 'row-selected', 'counts-updated', 'import', 'export'],
  methods: {
    fetchData() {},
    resetEditingState() {},
  },
  template: '<div data-testid="grid" />',
}

const FormStub = {
  name: 'SimpleFormComponent',
  props: ['show', 'isEdit', 'fields', 'values', 'loading', 'apiClient'],
  emits: ['save', 'close'],
  template: '<div data-testid="form" />',
}

const PropertiesStub = {
  name: 'PropertiesComponent',
  props: ['product', 'fields', 'editable', 'apiClient', 'editLoading'],
  emits: ['save-edit', 'close'],
  template: '<div data-testid="properties" />',
}

const productFields = [
  { key: 'id', omitInForm: true },
  { key: 'code', omitInForm: true },
  { key: 'sku', omitInForm: true, readOnlyOnConfigure: true },
  { key: 'description', required: true },
  { key: 'base_net_amount', type: 'number', required: true },
  { key: 'price_configuration', type: 'dynamic-select', required: true },
  { key: 'provider', readOnlyOnConfigure: true, required: true },
  { key: 'is_confirmed', type: 'checkbox' },
  { key: 'price', omitInForm: true },
  { key: 'net_amount', omitInForm: true },
  { key: 'created_by', omitInForm: true },
  { key: 'updated_by', omitInForm: true },
  { key: 'deleted_by', omitInForm: true },
  { key: 'created_at', omitInForm: true },
  { key: 'log', omitInForm: true },
]

function mountManager(apiClient, extraProps = {}) {
  return mount(CRUDManagerComponent, {
    props: {
      title: '',
      resourceName: 'Producto',
      endpoint: 'products/',
      getEndpoint: 'products/',
      postEndpoint: 'products/',
      apiClient,
      rowKey: 'id',
      fields: productFields,
      allowCreate: true,
      allowUpdate: false,
      allowDelete: true,
      propertiesEditable: true,
      enableExtendedProperties: false,
      configFormResourcePath: 'products',
      createDefaults: () => ({ code: 'product-code', created_by: 'creator-code' }),
      propertiesUpdateAuditValue: () => 'updater-code',
      ...extraProps,
    },
    global: {
      stubs: {
        CRUDGridComponent: GridStub,
        SimpleFormComponent: FormStub,
        PropertiesComponent: PropertiesStub,
        StatsGeneralComponent: true,
        ConfigFormComponent: true,
        ConfigListComponent: true,
      },
    },
  })
}

describe('CRUDManagerComponent en el flujo Product', () => {
  beforeEach(() => {
    vi.stubGlobal('alert', vi.fn())
  })

  it('abre creación con defaults de auditoría y cliente DP inyectado', async () => {
    const apiClient = { post: vi.fn(), patch: vi.fn() }
    const wrapper = mountManager(apiClient)
    await wrapper.get('button.btn-success').trigger('click')

    const form = wrapper.findComponent(FormStub)
    expect(form.props('apiClient').post).toBe(apiClient.post)
    expect(form.props('isEdit')).toBe(false)
    expect(form.props('values')).toEqual({ code: 'product-code', created_by: 'creator-code' })
  })

  it('crea por POST con payload writable, acepta 201 y refresca', async () => {
    const created = { id: 8, sku: 'SKU-8', description: 'Ravioli' }
    const apiClient = {
      post: vi.fn().mockResolvedValue({ status: 201, data: created }),
      patch: vi.fn(),
    }
    const wrapper = mountManager(apiClient)
    await wrapper.get('button.btn-success').trigger('click')
    wrapper.findComponent(FormStub).vm.$emit('save', {
      description: 'Ravioli',
      base_net_amount: 1200,
      price_configuration: 'price-config',
      provider: 'provider-id',
      is_confirmed: false,
      sku: 'forged-sku',
      price: 'forged-price',
      log: 'forged-log',
    })
    await flushPromises()

    expect(apiClient.post).toHaveBeenCalledWith('products/', {
      code: 'product-code',
      description: 'Ravioli',
      base_net_amount: 1200,
      price_configuration: 'price-config',
      provider: 'provider-id',
      is_confirmed: false,
      created_by: 'creator-code',
    })
    expect(apiClient.patch).not.toHaveBeenCalled()
    expect(wrapper.emitted('created')[0][0]).toEqual(created)
    expect(wrapper.findComponent(FormStub).exists()).toBe(false)
  })

  it('mantiene loading activo durante la creación para bloquear doble envío', async () => {
    let resolvePost
    const apiClient = {
      post: vi.fn(() => new Promise(resolve => { resolvePost = resolve })),
      patch: vi.fn(),
    }
    const wrapper = mountManager(apiClient)
    await wrapper.get('button.btn-success').trigger('click')
    wrapper.findComponent(FormStub).vm.$emit('save', { description: 'Producto' })
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(FormStub).props('loading')).toBe(true)
    expect(apiClient.post).toHaveBeenCalledOnce()
    resolvePost({ status: 201, data: { id: 9 } })
    await flushPromises()
    expect(wrapper.vm.loading).toBe(false)
  })

  it('presenta errores 400 del backend y conserva el formulario', async () => {
    const apiClient = {
      post: vi.fn().mockRejectedValue({
        response: { data: { description: ['Este campo es obligatorio.'] } },
        message: 'Request failed',
      }),
      patch: vi.fn(),
    }
    const wrapper = mountManager(apiClient)
    await wrapper.get('button.btn-success').trigger('click')
    wrapper.findComponent(FormStub).vm.$emit('save', { description: '' })
    await flushPromises()

    expect(alert).toHaveBeenCalledWith(
      'Error al guardar Producto: description: Este campo es obligatorio.'
    )
    expect(wrapper.findComponent(FormStub).exists()).toBe(true)
    expect(wrapper.vm.loading).toBe(false)
  })

  it('actualiza Product por PATCH al id y excluye campos read-only o sin cambios', async () => {
    const original = {
      id: 7,
      sku: 'SKU-7',
      description: 'Original',
      base_net_amount: 1000,
      price_configuration: 'old-config',
      provider: 'provider-original',
      price: 'price-id',
      net_amount: 1190,
      is_confirmed: false,
    }
    const updated = { ...original, base_net_amount: 1250, price_configuration: 'new-config' }
    const apiClient = {
      post: vi.fn(),
      patch: vi.fn().mockResolvedValue({ status: 200, data: updated }),
    }
    const wrapper = mountManager(apiClient)
    wrapper.findComponent(GridStub).vm.$emit('show-properties', original)
    await wrapper.vm.$nextTick()
    wrapper.findComponent(PropertiesStub).vm.$emit('save-edit', {
      description: 'Original',
      base_net_amount: 1250,
      price_configuration: 'new-config',
      provider: 'forged-provider',
      sku: 'forged-sku',
      price: 'forged-price',
      net_amount: 999999,
      log: 'forged-log',
    })
    await flushPromises()

    expect(apiClient.patch).toHaveBeenCalledWith('products/7/', {
      base_net_amount: 1250,
      price_configuration: 'new-config',
      updated_by: 'updater-code',
    })
    expect(wrapper.emitted('updated')[0][0]).toBe(7)
    expect(wrapper.emitted('row-selected').at(-1)[0]).toEqual(updated)
  })

  it('no intenta PATCH si falta la identidad de auditoría', async () => {
    const apiClient = { post: vi.fn(), patch: vi.fn() }
    const wrapper = mountManager(apiClient, { propertiesUpdateAuditValue: () => null })
    wrapper.findComponent(GridStub).vm.$emit('show-properties', { id: 7, description: 'Original' })
    await wrapper.vm.$nextTick()
    wrapper.findComponent(PropertiesStub).vm.$emit('save-edit', { description: 'Cambio' })
    await flushPromises()

    expect(apiClient.patch).not.toHaveBeenCalled()
    expect(alert).toHaveBeenCalledWith('No fue posible identificar al usuario que actualiza Producto.')
  })

  it('coordina selección, contadores, cierre y eventos del grid', async () => {
    const wrapper = mountManager({ post: vi.fn(), patch: vi.fn() })
    const grid = wrapper.findComponent(GridStub)
    grid.vm.$emit('counts-updated', { total: 12, deleted: 2 })
    grid.vm.$emit('row-selected', { id: 7, description: 'Producto' })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('TOTAL lista 12')
    expect(wrapper.text()).toContain('TOTAL Eliminados 2')
    expect(wrapper.emitted('row-selected')[0][0]).toMatchObject({ id: 7 })

    grid.vm.$emit('show-properties', { id: 7, description: 'Producto' })
    await wrapper.vm.$nextTick()
    wrapper.findComponent(PropertiesStub).vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(PropertiesStub).exists()).toBe(false)
  })

  it('cierra creación y propaga import/export sin mutar Product', async () => {
    const wrapper = mountManager({ post: vi.fn(), patch: vi.fn() })
    await wrapper.get('button.btn-success').trigger('click')
    wrapper.findComponent(FormStub).vm.$emit('close')
    const grid = wrapper.findComponent(GridStub)
    grid.vm.$emit('import')
    grid.vm.$emit('export')
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(FormStub).exists()).toBe(false)
    expect(wrapper.emitted('import')).toHaveLength(1)
    expect(wrapper.emitted('export')).toHaveLength(1)
  })
})
