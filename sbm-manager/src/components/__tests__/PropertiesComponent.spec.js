import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import PropertiesComponent from '../PropertiesComponent.vue'

const FormStub = {
  name: 'SimpleFormComponent',
  props: ['fields', 'values', 'loading', 'apiClient'],
  emits: ['save', 'close'],
  template: '<div data-testid="edit-form"><button data-testid="save-edit" @click="$emit(\'save\', { description: \'Actualizado\' })">Guardar</button></div>',
}

const fields = [
  { key: 'id', hideInGrid: true, omitInForm: true },
  { key: 'sku', label: 'SKU', omitInForm: true, readOnlyOnConfigure: true },
  { key: 'description', label: 'Descripción', type: 'textarea', required: true },
  { key: 'base_net_amount', label: 'Valor Base Neto', type: 'number', required: true },
  { key: 'net_amount', label: 'Costo neto', type: 'price', omitInForm: true },
  { key: 'provider', label: 'Proveedor', type: 'dynamic-select', readOnlyOnConfigure: true },
  { key: 'provider_name', label: 'Proveedor', omitInForm: true },
  { key: 'is_deleted', label: 'Eliminado', type: 'checkbox', omitInForm: true },
]

const product = {
  id: 7,
  sku: 'SKU-7',
  description: 'Fetuccini',
  base_net_amount: 1000,
  net_amount: 1190,
  provider: 3,
  provider_name: 'Proveedor QA',
  is_deleted: false,
}

function mountProperties(extraProps = {}) {
  return mount(PropertiesComponent, {
    props: {
      product,
      fields,
      configResource: 'products',
      lookupField: 'code',
      enableExtendedData: false,
      editable: true,
      apiClient: { get: vi.fn(), patch: vi.fn() },
      ...extraProps,
    },
    global: {
      stubs: {
        SimpleFormComponent: FormStub,
        ConfigLinkTableComponent: true,
        CalculationComponent: true,
        StatsComponent: true,
      },
    },
  })
}

describe('PropertiesComponent en Product', () => {
  it('muestra datos y labels calculados sin exponer campos internos', () => {
    const wrapper = mountProperties()

    expect(wrapper.text()).toContain('SKU-7 - Fetuccini')
    expect(wrapper.find('input[value="Proveedor QA"]').exists()).toBe(true)
    expect(wrapper.find('input[value="$1.190"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('log')
    expect(wrapper.text()).not.toContain('Avanzado')
    expect(wrapper.text()).not.toContain('Configuración')
  })

  it('abre edición controlada y conserva campos Product read-only', async () => {
    const apiClient = { get: vi.fn(), patch: vi.fn() }
    const wrapper = mountProperties({ apiClient })
    await wrapper.get('button.btn-primary').trigger('click')

    const form = wrapper.findComponent(FormStub)
    const formFields = form.props('fields')
    const byKey = Object.fromEntries(formFields.map(field => [field.key, field]))
    expect(form.props('apiClient').patch).toBe(apiClient.patch)
    expect(form.props('values')).toEqual(product)
    expect(byKey.provider.readOnlyOnConfigure).toBe(true)
    expect(byKey.provider.disabled).toBe(false)
    expect(formFields.some(field => field.key === 'sku')).toBe(false)
    expect(formFields.some(field => field.key === 'net_amount')).toBe(false)
    expect(formFields.some(field => field.key === 'is_deleted')).toBe(false)
  })

  it('propaga el payload observable del formulario al manager', async () => {
    const wrapper = mountProperties()
    await wrapper.get('button.btn-primary').trigger('click')
    await wrapper.get('[data-testid="save-edit"]').trigger('click')

    expect(wrapper.emitted('save-edit')[0][0]).toEqual({ description: 'Actualizado' })
  })

  it('abre secciones extendidas bajo demanda sin requerir configuración inexistente', async () => {
    const wrapper = mountProperties({
      enableExtendedData: true,
      editable: false,
      fields: [
        ...fields,
        { key: 'status_name', type: 'pill_name', pillMap: { ACTIVO: 'bg-success' } },
        { key: 'custom_value' },
      ],
      product: { ...product, status_name: 'ACTIVO', custom_value: 'Dato' },
    })
    const headings = wrapper.findAll('h5')
    await headings[0].trigger('click')
    await headings[1].trigger('click')

    expect(wrapper.emitted('load-advanced')).toHaveLength(1)
    expect(wrapper.text()).toContain('Custom Value')
    expect(wrapper.find('.bg-success').text()).toBe('ACTIVO')
  })
})
