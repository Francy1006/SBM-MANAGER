import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SimpleFormComponent from '../SimpleFormComponent.vue'

const fields = [
  { key: 'sku', label: 'SKU', type: 'text', omitInForm: true },
  { key: 'description', label: 'Descripción', type: 'textarea', required: true },
  { key: 'base_net_amount', label: 'Valor Base Neto', type: 'number', required: true },
  {
    key: 'provider',
    label: 'Proveedor',
    type: 'dynamic-select',
    endpoint: '/providers/',
    valueKey: 'id',
    labelKey: 'provider',
    required: true,
    readOnlyOnConfigure: true,
  },
  {
    key: 'price_configuration',
    label: 'Configuración de precio',
    type: 'dynamic-select',
    endpoint: '/price-configuration/?record_type=1&is_confirmed=true/',
    valueKey: 'code',
    labelKey: 'price_configuration',
    required: true,
  },
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox' },
  { key: 'net_amount', label: 'Neto', type: 'price', omitInForm: true },
]

function mountForm(apiClient, extraProps = {}) {
  return mount(SimpleFormComponent, {
    props: {
      show: true,
      isEdit: false,
      fields,
      values: {},
      loading: false,
      apiClient,
      title: 'Crear Producto',
      ...extraProps,
    },
  })
}

describe('SimpleFormComponent para Product', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renderiza campos Product y carga relaciones paginadas por el cliente inyectado', async () => {
    const apiClient = {
      get: vi.fn(async url => {
        if (url === 'providers/') {
          return { data: { results: [{ id: 3, provider: 'Proveedor QA' }] } }
        }
        return {
          data: {
            results: [{ code: 'config-1', price_configuration: 'Precio Producto' }],
          },
        }
      }),
    }
    const wrapper = mountForm(apiClient)
    await flushPromises()

    expect(apiClient.get).toHaveBeenCalledWith('providers/')
    expect(apiClient.get).toHaveBeenCalledWith(
      'price-configuration/?record_type=1&is_confirmed=true/'
    )
    expect(wrapper.find('label[for="simple-form-description"]').text()).toContain('Descripción')
    expect(wrapper.find('#simple-form-provider').text()).toContain('Proveedor QA')
    expect(wrapper.find('#simple-form-price_configuration').text()).toContain('Precio Producto')
    expect(wrapper.find('#simple-form-sku').exists()).toBe(false)
    expect(wrapper.find('#simple-form-net_amount').exists()).toBe(false)
  })

  it('transforma valores y emite sólo los campos editables visibles', async () => {
    const apiClient = {
      get: vi.fn(async url => ({
        data: url === 'providers/'
          ? [{ id: 'provider-1', provider: 'Proveedor QA' }]
          : [{ code: 'config-1', price_configuration: 'Precio Producto' }],
      })),
    }
    const wrapper = mountForm(apiClient)
    await flushPromises()

    await wrapper.find('#simple-form-description').setValue('Producto QA')
    await wrapper.find('#simple-form-base_net_amount').setValue('1500')
    await wrapper.find('#simple-form-provider').setValue('provider-1')
    await wrapper.find('#simple-form-price_configuration').setValue('config-1')
    await wrapper.find('#simple-form-is_confirmed').setValue(true)
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')[0][0]).toEqual({
      description: 'Producto QA',
      base_net_amount: 1500,
      provider: 'provider-1',
      price_configuration: 'config-1',
      is_confirmed: true,
    })
  })

  it('mantiene Provider inmutable en edición y conserva valores iniciales', async () => {
    const apiClient = { get: vi.fn().mockResolvedValue({ data: [] }) }
    const wrapper = mountForm(apiClient, {
      isEdit: true,
      values: {
        sku: 'SKU-7',
        description: 'Original',
        base_net_amount: 1000,
        provider: 3,
        price_configuration: 'config-1',
        is_confirmed: false,
        net_amount: 1190,
      },
    })
    await flushPromises()

    expect(wrapper.find('#simple-form-provider').attributes('disabled')).toBeDefined()
    expect(wrapper.find('#simple-form-description').element.value).toBe('Original')
    await wrapper.find('#simple-form-description').setValue('Actualizado')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')[0][0]).not.toHaveProperty('provider')
    expect(wrapper.emitted('save')[0][0]).not.toHaveProperty('sku')
    expect(wrapper.emitted('save')[0][0]).not.toHaveProperty('net_amount')
    expect(wrapper.emitted('save')[0][0].description).toBe('Actualizado')
  })

  it('deshabilita el envío mientras hay una solicitud activa', async () => {
    const wrapper = mountForm(
      { get: vi.fn().mockResolvedValue({ data: [] }) },
      { loading: true }
    )
    await flushPromises()

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button[type="submit"]').text()).toContain('Guardando...')
  })

  it('maneja errores de relaciones sin llamadas HTTP alternativas', async () => {
    const apiClient = { get: vi.fn().mockRejectedValue(new Error('network')) }
    const wrapper = mountForm(apiClient)
    await flushPromises()

    expect(wrapper.vm.dynamicOptions.provider).toEqual([])
    expect(wrapper.vm.dynamicOptions.price_configuration).toEqual([])
    expect(wrapper.vm.dynamicLoading.provider).toBe(false)
  })

  it('resetea y cierra el formulario sin conservar estado previo', async () => {
    const wrapper = mountForm({ get: vi.fn().mockResolvedValue({ data: [] }) })
    await flushPromises()
    await wrapper.find('#simple-form-description').setValue('Temporal')
    await wrapper.get('button[type="button"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.vm.form.description).toBe('')
    expect(wrapper.vm.getOptions({ options: [{ id: 1 }, null] })).toEqual([{ id: 1 }])
  })

  it('normaliza precio y mayúsculas como reglas de presentación', async () => {
    const wrapper = mount(SimpleFormComponent, {
      props: {
        show: true,
        fields: [
          { key: 'name', label: 'Nombre', type: 'text', uppercase: true },
          { key: 'amount', label: 'Monto', type: 'price' },
        ],
        values: { name: '', amount: 1200 },
        apiClient: { get: vi.fn() },
      },
    })
    await wrapper.find('#simple-form-name').setValue('producto')
    await wrapper.find('#simple-form-amount').setValue('$2.500')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')[0][0]).toEqual({ name: 'PRODUCTO', amount: 2500 })
  })
})
