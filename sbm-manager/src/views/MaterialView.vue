<template>
  <div class="catalog-manager container-fluid py-4">
    <div class="card w-90 mx-4 mb-4">
      <div class="card-body">
        <h1 class="catalog-title ps-4 mb-4">
          <i class="fas fa-spoon"></i>
          Materiales
        </h1>
      </div>

      <div class="row">
        <div class="col-1"></div>
        <div class="col-10 w-100 text-center">
          <FranchiseSelector v-model="selectedFranchise" :franchises="franchises" />
        </div>
      </div>

      <br />
    </div>

    <CRUDManagerComponent v-if="selectedFranchise" title="" resourceName="Material" endpoint="materials/"
      get-endpoint="materials/" post-endpoint="materials/" iconClass="fas fa-spoon" :fields="fields"
      :apiClient="dpApi" rowKey="id" :includeVisibleFilter="false" :showDeletedFilter="false"
      :allowCreate="true" :allowUpdate="false" :allowDelete="true"
      detail-delete-endpoint="materials/{id}/delete/" :delete-audit-value="getMaterialAuditUser"
      :enableExtendedProperties="false" :showPropertiesButton="true" :showOpenColumn="false"
      :showCalculationComponent="false" :optionsProps="materialOptions" :propertiesEditable="true"
      :createDefaults="getMaterialCreateDefaults" :propertiesUpdateAuditValue="getMaterialAuditUser"
      configFormResourcePath="materials" configFormLookupField="code" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

import { dpApi, sbmApi } from '../api/clients'
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue'
import FranchiseSelector from '../components/FranchiseSelectorComponent.vue'

const franchises = ref([])
const selectedFranchise = ref('')

const materialOptions = {
  showToggleButton: true,
  toggleButtonText: '',
  toggleIconClass: '',
  iconHide: 'fas fa-eye',
  iconShow: 'fas fa-eye-slash',
  toggleClassWhenShown: 'btn-danger text-white',
  toggleClassWhenHidden: 'btn-warning text-dark',
  showImportButton: false,
  showExportButton: true,
  exportButtonClass: 'btn-outline-primary',
  exportButtonText: 'Exportar',
  exportIcon: 'fas fa-file-export'
}

const fields = [
  { key: 'id', hideInGrid: true, omitInForm: true },
  { key: 'code', hideInGrid: true, omitInForm: true },
  {
    key: 'sku',
    label: 'SKU',
    type: 'text',
    omitInForm: true,
    readOnlyOnConfigure: true
  },
  {
    key: 'description',
    label: 'Descripción',
    type: 'textarea',
    required: true
  },
  {
    key: 'obs',
    label: 'Observaciones',
    type: 'textarea',
    required: true
  },
  {
    key: 'base_net_amount',
    label: 'Valor Base Neto',
    type: 'number',
    min: 0.01,
    required: true,
    requiredOnCreate: true,
    hideInGrid: true
  },
  {
    key: 'price_configuration',
    label: 'Configuración de precio',
    type: 'dynamic-select',
    labelKey: 'price_configuration',
    valueKey: 'code',
    endpoint: '/price-configuration/?record_type=2&is_confirmed=true',
    required: true,
    requiredOnCreate: true,
    hideInGrid: true
  },
  {
    key: 'price_configuration_label',
    label: 'Configuración de precio',
    omitInForm: true
  },
  {
    key: 'net_amount',
    label: 'Costo neto',
    type: 'price',
    omitInForm: true,
    secretField: true
  },
  {
    key: 'iva_amount',
    label: 'IVA compra',
    type: 'price',
    omitInForm: true,
    secretField: true
  },
  {
    key: 'aditional_tax_amount',
    label: 'Impuesto adicional',
    type: 'price',
    omitInForm: true,
    secretField: true
  },
  {
    key: 'retention_amount',
    label: 'Retención',
    type: 'price',
    omitInForm: true,
    secretField: true
  },
  {
    key: 'gross_amount',
    label: 'Costo bruto',
    type: 'price',
    omitInForm: true,
    secretField: true
  },
  { key: 'price', hideInGrid: true, omitInForm: true },
  {
    key: 'package_unit',
    label: 'Unidades de empaque',
    type: 'number',
    min: 1,
    required: true
  },
  {
    key: 'min_package_purchase',
    label: 'Mínimo de compra',
    type: 'number',
    min: 1,
    required: true
  },
  {
    key: 'provider',
    label: 'Proveedor',
    type: 'dynamic-select',
    labelKey: 'provider',
    valueKey: 'id',
    endpoint: '/providers/',
    required: true,
    hideInGrid: true,
    readOnlyOnConfigure: true
  },
  {
    key: 'provider_name',
    label: 'Proveedor',
    omitInForm: true
  },
  {
    key: 'type',
    label: 'Tipo',
    type: 'dynamic-select',
    labelKey: 'type',
    valueKey: 'id',
    endpoint: '/item-types/',
    required: true,
    hideInGrid: true
  },
  {
    key: 'type_name',
    label: 'Tipo',
    omitInForm: true
  },
  {
    key: 'item_group',
    label: 'Grupo',
    type: 'dynamic-select',
    labelKey: 'group_name',
    valueKey: 'id',
    endpoint: '/item-groups/',
    required: true,
    hideInGrid: true
  },
  {
    key: 'item_group_name',
    label: 'Grupo',
    omitInForm: true
  },
  {
    key: 'category',
    label: 'Categoría',
    type: 'dynamic-select',
    labelKey: 'category',
    valueKey: 'id',
    endpoint: '/item-categories/',
    required: true,
    hideInGrid: true
  },
  {
    key: 'category_name',
    label: 'Categoría',
    omitInForm: true
  },
  {
    key: 'package',
    label: 'Empaque',
    type: 'dynamic-select',
    labelKey: 'description',
    valueKey: 'id',
    endpoint: '/packages/',
    required: true,
    hideInGrid: true
  },
  {
    key: 'package_description',
    label: 'Empaque',
    omitInForm: true
  },
  {
    key: 'url',
    label: 'URL',
    type: 'url'
  },
  {
    key: 'is_active',
    label: 'Activo',
    type: 'checkbox'
  },
  {
    key: 'is_confirmed',
    label: 'Confirmado',
    type: 'checkbox'
  },
  {
    key: 'is_deleted',
    label: 'Eliminado',
    type: 'checkbox',
    hideInGrid: true,
    omitInForm: true
  },
  {
    key: 'created_at',
    label: 'Fecha de creación',
    omitInForm: true
  },
  {
    key: 'updated_at',
    label: 'Fecha de actualización',
    omitInForm: true
  },
  {
    key: 'confirmed_at',
    label: 'Fecha de confirmación',
    omitInForm: true
  },
  {
    key: 'deleted_at',
    label: 'Fecha de eliminación',
    omitInForm: true
  },
  { key: 'created_by', hideInGrid: true, omitInForm: true },
  { key: 'confirmed_by', hideInGrid: true, omitInForm: true },
  { key: 'updated_by', hideInGrid: true, omitInForm: true },
  { key: 'deleted_by', hideInGrid: true, omitInForm: true },
  { key: 'version', hideInGrid: true, omitInForm: true }
]

const getMaterialAuditUser = () => localStorage.getItem('uuid')

const getMaterialCreateDefaults = () => ({
  code: crypto.randomUUID(),
  created_by: getMaterialAuditUser()
})

const loadFranchises = async () => {
  try {
    const response = await sbmApi.get('franchises/')
    franchises.value = response.data?.results ?? response.data ?? []
  } catch (error) {
    console.error('No fue posible cargar las franquicias.', error)
    franchises.value = []
  }
}

onMounted(loadFranchises)
</script>
