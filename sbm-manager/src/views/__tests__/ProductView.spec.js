import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  dpApi: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  sbmApi: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

vi.mock('../../api/clients', () => apiMocks)

import ProductView from '../ProductView.vue'

const CRUDManagerStub = {
  name: 'CRUDManagerComponent',
  inheritAttrs: false,
  props: [
    'apiClient', 'rowKey', 'fields', 'createDefaults', 'deleteAuditValue',
    'propertiesUpdateAuditValue', 'detailDeleteEndpoint', 'allowCreate',
    'allowUpdate', 'allowDelete', 'includeVisibleFilter', 'showDeletedFilter',
    'propertiesEditable', 'endpoint', 'getEndpoint', 'postEndpoint',
    'baseNetAmount', 'netAmount', 'grossAmount', 'ivaAmount',
    'additionalTaxAmount', 'retentionAmount', 'calculationConfig',
  ],
  template: '<div data-testid="product-manager" />',
}

const FranchiseSelectorStub = {
  name: 'FranchiseSelector',
  props: ['modelValue', 'franchises'],
  emits: ['update:modelValue', 'change'],
  template: '<button data-testid="select-franchise" @click="$emit(\'update:modelValue\', 4); $emit(\'change\', { id: 4, code: \'FR-4\' })">Marca</button>',
}

function mountView() {
  return mount(ProductView, {
    global: {
      stubs: {
        CRUDManagerComponent: CRUDManagerStub,
        FranchiseSelector: FranchiseSelectorStub,
      },
    },
  })
}

describe('ProductView', () => {
  beforeEach(() => {
    localStorage.clear()
    apiMocks.sbmApi.get.mockResolvedValue({
      data: { results: [{ id: 4, code: 'FR-4', franchise: 'Ditaly' }] },
    })
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'product-code') })
  })

  it('carga franquicias sólo mediante sbmApi', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(apiMocks.sbmApi.get).toHaveBeenCalledOnce()
    expect(apiMocks.sbmApi.get).toHaveBeenCalledWith('franchises/')
    expect(apiMocks.dpApi.get).not.toHaveBeenCalled()
    expect(wrapper.findComponent(FranchiseSelectorStub).props('franchises')).toEqual([
      { id: 4, code: 'FR-4', franchise: 'Ditaly' },
    ])
    expect(wrapper.find('[data-testid="product-manager"]').exists()).toBe(false)
  })

  it('deja un fallo de franquicias en estado recuperable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    apiMocks.sbmApi.get.mockRejectedValueOnce(new Error('network'))

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.findComponent(FranchiseSelectorStub).props('franchises')).toEqual([])
  })

  it('configura el flujo Product con dpApi y sus endpoints canónicos', async () => {
    localStorage.setItem('uuid', 'user-code')
    const wrapper = mountView()
    await flushPromises()
    await wrapper.get('[data-testid="select-franchise"]').trigger('click')

    const manager = wrapper.findComponent(CRUDManagerStub)
    expect(manager.exists()).toBe(true)
    expect(manager.props()).toMatchObject({
      apiClient: apiMocks.dpApi,
      rowKey: 'id',
      endpoint: 'products/',
      getEndpoint: 'products/',
      postEndpoint: 'products/',
      detailDeleteEndpoint: 'products/{id}/delete/',
      allowCreate: true,
      allowUpdate: false,
      allowDelete: true,
      includeVisibleFilter: false,
      showDeletedFilter: false,
      propertiesEditable: true,
    })
    expect(manager.props('createDefaults')()).toEqual({
      code: 'product-code',
      created_by: 'user-code',
    })
    expect(manager.props('deleteAuditValue')()).toBe('user-code')
    expect(manager.props('propertiesUpdateAuditValue')()).toBe('user-code')
  })

  it('protege nombres, selectores y campos read-only del contrato Product', async () => {
    const wrapper = mountView()
    await flushPromises()
    await wrapper.get('[data-testid="select-franchise"]').trigger('click')

    const fields = wrapper.findComponent(CRUDManagerStub).props('fields')
    const byKey = Object.fromEntries(fields.map(field => [field.key, field]))

    expect(byKey.item_group.endpoint).toBe('/item-groups/')
    expect(byKey.provider).toMatchObject({ endpoint: '/providers/', readOnlyOnConfigure: true })
    expect(byKey.type.endpoint).toBe('/item-types/')
    expect(byKey.category.endpoint).toBe('/item-categories/')
    expect(byKey.package.endpoint).toBe('/packages/')
    expect(byKey.price_configuration.endpoint).toBe('/price-configuration/?record_type=1&is_confirmed=true/')
    expect(byKey.base_net_amount).toMatchObject({ required: true, type: 'number' })
    expect(byKey.sku.omitInForm).toBe(true)
    expect(byKey.price.omitInForm).toBe(true)
    expect(byKey.price_configuration_label.omitInForm).toBe(true)
    expect(fields.some(field => field.key === 'group')).toBe(false)
    expect(fields.some(field => field.key === 'log')).toBe(false)
  })

  it('proyecta precios backend read-only al seleccionar y limpia el estado al deseleccionar', async () => {
    const wrapper = mountView()
    await flushPromises()
    await wrapper.get('[data-testid="select-franchise"]').trigger('click')
    const manager = wrapper.findComponent(CRUDManagerStub)

    manager.vm.$emit('row-selected', {
      base_net_amount: 1000,
      net_amount: 1190,
      gross_amount: 1400,
      iva_amount: 190,
      aditional_tax_amount: 10,
      retention_amount: 5,
      price_configuration: 'config-1',
    })
    await wrapper.vm.$nextTick()

    expect(manager.props()).toMatchObject({
      baseNetAmount: 1000,
      netAmount: 1190,
      grossAmount: 1400,
      ivaAmount: 190,
      additionalTaxAmount: 10,
      retentionAmount: 5,
    })
    expect(manager.props('calculationConfig')).toMatchObject({
      code: 'config-1',
      variablesQueryParams: { module_id: 1 },
    })

    manager.vm.$emit('row-selected', null)
    await wrapper.vm.$nextTick()
    expect(manager.props('baseNetAmount')).toBeNull()
    expect(manager.props('calculationConfig')).toBeNull()
  })
})
