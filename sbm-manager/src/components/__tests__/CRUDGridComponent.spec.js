import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: vi.fn(),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}))

import CRUDGridComponent from '../CRUDGridComponent.vue'

const OptionsStub = {
  name: 'OptionsComponent',
  emits: ['toggle-secret-fields', 'import', 'export'],
  template: '<div data-testid="options" />',
}

const ConfirmStub = {
  name: 'ConfirmComponent',
  props: ['message', 'loading'],
  emits: ['confirm', 'cancel'],
  template: '<div data-testid="confirm"><button data-testid="confirm-delete" @click="$emit(\'confirm\')">Confirmar</button><button data-testid="cancel-delete" @click="$emit(\'cancel\')">Cancelar</button></div>',
}

const fields = [
  { key: 'id', hideInGrid: true },
  { key: 'sku', label: 'SKU' },
  { key: 'description', label: 'Descripción' },
  { key: 'price_configuration_label', label: 'Configuración de precio' },
]

const product = {
  id: 7,
  sku: 'SKU-7',
  description: 'Fetuccini',
  price_configuration_label: 'Precio producto',
}

function page(results = [product], count = results.length) {
  return { data: { count, next: null, previous: null, results } }
}

function mountGrid(apiClient, extraProps = {}) {
  return mount(CRUDGridComponent, {
    props: {
      resourceName: 'Producto',
      endpoint: 'products/',
      apiClient,
      rowKey: 'id',
      fields,
      includeVisibleFilter: false,
      showDeletedFilter: false,
      allowUpdate: false,
      allowDelete: true,
      showPropertiesButton: true,
      showOpenColumn: false,
      ...extraProps,
    },
    global: {
      stubs: {
        OptionsComponent: OptionsStub,
        ConfirmComponent: ConfirmStub,
        GridDetailContainerComponent: true,
      },
    },
  })
}

describe('CRUDGridComponent en el flujo Product', () => {
  beforeEach(() => {
    vi.stubGlobal('alert', vi.fn())
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('carga y representa la página Product sin filtros legacy', async () => {
    const apiClient = { get: vi.fn().mockResolvedValue(page()), post: vi.fn() }
    const wrapper = mountGrid(apiClient)
    await flushPromises()

    expect(apiClient.get).toHaveBeenCalledWith(
      'products/?page=1&page_size=20&ordering=-created_at'
    )
    expect(apiClient.get.mock.calls[0][0]).not.toContain('is_visible')
    expect(wrapper.text()).toContain('SKU-7')
    expect(wrapper.text()).toContain('Fetuccini')
    expect(wrapper.text()).toContain('Precio producto')
    expect(wrapper.text()).toContain('Mostrando 1 - 1 de 1 elementos')
    expect(wrapper.emitted('counts-updated')[0][0]).toEqual({ total: 1, deleted: 0 })
  })

  it('muestra carga inicial, estado vacío y fallo HTTP recuperable', async () => {
    let rejectRequest
    const apiClient = {
      get: vi.fn(() => new Promise((resolve, reject) => { rejectRequest = reject })),
      post: vi.fn(),
    }
    const wrapper = mountGrid(apiClient)
    expect(wrapper.find('[role="status"]').exists()).toBe(true)

    rejectRequest(new Error('network'))
    await flushPromises()

    expect(wrapper.text()).toContain('No hay elementos disponibles')
    expect(wrapper.vm.loading).toBe(false)
    expect(wrapper.vm.error).toBe('Error al cargar los datos')
  })

  it('busca, ordena y pagina enviando parámetros a DP-API', async () => {
    const apiClient = { get: vi.fn().mockResolvedValue(page([product], 45)), post: vi.fn() }
    const wrapper = mountGrid(apiClient)
    await flushPromises()

    wrapper.vm.searchTerm = 'pasta fresca'
    await wrapper.vm.searchData()
    expect(apiClient.get).toHaveBeenLastCalledWith(expect.stringContaining('search=pasta+fresca'))

    await wrapper.vm.toggleSort('sku')
    expect(apiClient.get).toHaveBeenLastCalledWith(expect.stringContaining('ordering=sku'))
    await wrapper.vm.goToPage(2)
    expect(apiClient.get).toHaveBeenLastCalledWith(expect.stringContaining('page=2'))
  })

  it('obtiene detalle por id usando el cliente inyectado', async () => {
    const apiClient = {
      get: vi.fn()
        .mockResolvedValueOnce(page())
        .mockResolvedValueOnce({ data: { ...product, obs: 'Detalle' } }),
      post: vi.fn(),
    }
    const wrapper = mountGrid(apiClient)
    await flushPromises()
    wrapper.vm.selected = ['7']
    await wrapper.vm.showProperties()

    expect(apiClient.get).toHaveBeenLastCalledWith('products/7/')
    expect(wrapper.emitted('show-properties')[0][0]).toMatchObject({ id: 7, obs: 'Detalle' })
  })

  it('cancela eliminación lógica sin emitir ninguna petición', async () => {
    const apiClient = { get: vi.fn().mockResolvedValue(page()), post: vi.fn() }
    const wrapper = mountGrid(apiClient, {
      detailDeleteEndpoint: 'products/{id}/delete/',
      deleteAuditValue: () => 'user-code',
    })
    await flushPromises()
    wrapper.vm.selected = ['7']
    await wrapper.vm.$nextTick()
    await wrapper.get('button.btn-danger').trigger('click')
    await wrapper.get('[data-testid="cancel-delete"]').trigger('click')

    expect(apiClient.post).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="confirm"]').exists()).toBe(false)
  })

  it('confirma eliminación mediante POST lógico, nunca DELETE, y refresca', async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue(page()),
      post: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn(),
    }
    const wrapper = mountGrid(apiClient, {
      detailDeleteEndpoint: 'products/{id}/delete/',
      deleteAuditValue: () => 'user-code',
    })
    await flushPromises()
    wrapper.vm.selected = ['7']
    wrapper.vm.deleteSelected()
    await wrapper.vm.$nextTick()
    await wrapper.get('[data-testid="confirm-delete"]').trigger('click')
    await flushPromises()

    expect(apiClient.post).toHaveBeenCalledWith('products/7/delete/', {
      deleted_by: 'user-code',
    })
    expect(apiClient.delete).not.toHaveBeenCalled()
    expect(apiClient.get).toHaveBeenCalledTimes(2)
    expect(wrapper.vm.selected).toEqual([])
  })

  it('no elimina sin identidad de auditoría y deja la interfaz utilizable', async () => {
    const apiClient = { get: vi.fn().mockResolvedValue(page()), post: vi.fn() }
    const wrapper = mountGrid(apiClient, {
      detailDeleteEndpoint: 'products/{id}/delete/',
      deleteAuditValue: () => null,
    })
    await flushPromises()
    wrapper.vm.selected = ['7']
    wrapper.vm.deleteSelected()
    await wrapper.vm.confirmDelete()

    expect(apiClient.post).not.toHaveBeenCalled()
    expect(alert).toHaveBeenCalledWith('No fue posible identificar al usuario que elimina Producto.')
    expect(wrapper.vm.deleting).toBe(false)
  })

  it('mantiene selección y helpers de presentación deterministas', async () => {
    const apiClient = { get: vi.fn().mockResolvedValue(page()), post: vi.fn() }
    const wrapper = mountGrid(apiClient)
    await flushPromises()

    wrapper.vm.toggleAllSelection()
    expect(wrapper.vm.selected).toEqual(['7'])
    expect(wrapper.emitted('row-selected').at(-1)[0]).toEqual(product)
    wrapper.vm.toggleAllSelection()
    expect(wrapper.vm.selected).toEqual([])
    wrapper.vm.toggleAllSelection()
    wrapper.vm.toggleRowSelection()
    wrapper.vm.configureSelected()
    expect(wrapper.emitted('configure')[0][0]).toEqual(product)
    wrapper.vm.resetEditingState()
    expect(wrapper.vm.editingRowId).toBeNull()

    expect(wrapper.vm.getStateName(2)).toBe(2)
    expect(wrapper.vm.capitalize('producto')).toBe('Producto')
    expect(wrapper.vm.formatSumValue(1500)).toBe('$1.500')
    expect(wrapper.vm.isPercentField('sku')).toBe(false)
    expect(wrapper.vm.getPercentColorClass(10)).toBe('text-danger')
    expect(wrapper.vm.getPercentIconClass(120)).toBe('fas fa-crown')
    expect(wrapper.vm.getCellClass('sku', 'SKU-7')).toBe('')
    expect(wrapper.vm.getDynamicSelectLabel({ key: 'provider' }, null)).toBe('-')
    wrapper.vm.dynamicSelectOptions = { provider: [{ id: 3, name: 'Proveedor QA' }] }
    expect(wrapper.vm.getDynamicSelectLabel({ key: 'provider' }, 3)).toBe('Proveedor QA')
    wrapper.vm.deleteSelected()
    expect(alert).toHaveBeenCalledWith('Por favor selecciona al menos un item para eliminar')
  })

  it('propaga import/export y controla expansión sin alterar datos Product', async () => {
    const apiClient = { get: vi.fn().mockResolvedValue(page()), post: vi.fn() }
    const wrapper = mountGrid(apiClient, {
      showDetailComponent: true,
      detailTablesConfig: [],
      detailFieldsConfig: {},
    })
    await flushPromises()

    wrapper.vm.handleImport()
    wrapper.vm.handleExport({ format: 'PDF' })
    wrapper.vm.handleExport({ format: 'XLSX' })
    wrapper.vm.toggleDetailRow(product)
    expect(wrapper.vm.isRowExpanded(product)).toBe(true)
    wrapper.vm.openRow(product)
    expect(wrapper.vm.isRowExpanded(product)).toBe(false)
    expect(wrapper.vm.buildDetailTables(product)).toEqual([])
    expect(wrapper.emitted('import')).toHaveLength(1)
    expect(alert).toHaveBeenCalledWith('Export PDF pendiente')
  })

  it('mantiene el flujo de eliminación recuperable ante error HTTP', async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue(page()),
      post: vi.fn().mockRejectedValue({
        response: { status: 400, data: { detail: 'No se puede eliminar' } },
        message: 'Request failed',
      }),
    }
    const wrapper = mountGrid(apiClient, {
      detailDeleteEndpoint: 'products/{id}/delete/',
      deleteAuditValue: () => 'user-code',
    })
    await flushPromises()
    wrapper.vm.selected = ['7']
    wrapper.vm.deleteSelected()
    await wrapper.vm.confirmDelete()

    expect(alert).toHaveBeenCalledWith('Error al eliminar item: No se puede eliminar')
    expect(wrapper.vm.deleting).toBe(false)
    expect(wrapper.vm.showDeleteConfirmation).toBe(false)
  })
})
