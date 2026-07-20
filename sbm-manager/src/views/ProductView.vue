<template>
  <div class="catalog-manager container-fluid py-4">
    <div class="card w-90 mx-4 mb-4">
      <div class="card-body">
        <h1 class="catalog-title ps-4 mb-4">
          <i class="fas fa-dolly"></i>
          Productos
        </h1>
      </div>

      <div class="row">
        <div class="col-1"></div>

        <div class="col-10 w-100 text-center">
          <FranchiseSelector v-model="selectedFranchise" :franchises="franchises" @change="onFranchiseChange" />
        </div>
      </div>

      <br />
    </div>

    <CRUDManagerComponent v-if="selectedFranchise" title="" resourceName="Producto" endpoint="products/"
      get-endpoint="products/" post-endpoint="products/" iconClass="fas fa-dolly" :fields="fields" :apiClient="dpApi"
      rowKey="id" :includeVisibleFilter="false" :showDeletedFilter="false" :allowCreate="true" :allowUpdate="false"
      :allowDelete="true" detail-delete-endpoint="products/{id}/delete/" :delete-audit-value="getProductAuditUser"
      :enableExtendedProperties="false" :showPropertiesButton="true" :showOpenColumn="false"
      :showCalculationComponent="false" :optionsProps="productOptions" :propertiesEditable="true"
      :createDefaults="getProductCreateDefaults"
      :propertiesUpdateAuditValue="getProductAuditUser" :baseNetAmount="selectedBaseNetAmount"
      :netAmount="selectedNetAmount" :grossAmount="selectedGrossAmount" :ivaAmount="selectedIVAAmount"
      :additionalTaxAmount="selectedAditionalTaxAmount" :retentionAmount="selectedRetentionAmount"
      :calculationConfig="selectedCalculationConfig" configFormResourcePath="products" configFormLookupField="code"
      :detailExtraProps="extraVariables" @row-selected="handleProductSelected" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import { dpApi, sbmApi } from '../api/clients'
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue'
import FranchiseSelector from '../components/FranchiseSelectorComponent.vue'

const MODULE_ID = 1

const franchises = ref([])
const selectedFranchise = ref('')
const selectedFranchiseCode = ref('')

const selectedBaseNetAmount = ref(null)
const selectedNetAmount = ref(null)
const selectedGrossAmount = ref(null)
const selectedIVAAmount = ref(null)
const selectedAditionalTaxAmount = ref(null)
const selectedRetentionAmount = ref(null)
const selectedCalculationConfig = ref(null)

const productOptions = {
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
    required: true,
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
    required: true,
    hideInGrid: true
  },
  {
    key: 'price_configuration',
    label: 'Configuración de precio',
    type: 'dynamic-select',
    labelKey: 'price_configuration',
    valueKey: 'code',
    endpoint: '/price-configuration/?record_type=1&is_confirmed=true/',
    required: true,
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
    required: true
  },
  {
    key: 'min_package_purchase',
    label: 'Mínimo de compra',
    type: 'number',
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
    type: 'text'
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
    hideInGrid: false,
    omitInForm: true
  },
  {
    key: 'updated_at',
    label: 'Fecha de actualización',
    hideInGrid: false,
    omitInForm: true
  },
  {
    key: 'confirmed_at',
    label: 'Fecha de confirmación',
    hideInGrid: false,
    omitInForm: true
  },
  {
    key: 'deleted_at',
    label: 'Fecha de eliminación',
    hideInGrid: false,
    omitInForm: true
  },
  { key: 'created_by', hideInGrid: true, omitInForm: true },
  { key: 'confirmed_by', hideInGrid: true, omitInForm: true },
  { key: 'updated_by', hideInGrid: true, omitInForm: true },
  { key: 'deleted_by', hideInGrid: true, omitInForm: true },
  { key: 'version', hideInGrid: true, omitInForm: true }
]

const getProductAuditUser = () => localStorage.getItem('uuid')

const getProductCreateDefaults = () => ({
  code: crypto.randomUUID(),
  created_by: getProductAuditUser()
})

const extraVariables = computed(() => ({
  base_net_amount: {
    key: 'base_net_amount',
    label: 'Valor Base Neto',
    value: selectedBaseNetAmount.value,
    data_type: 5
  }
}))

const onFranchiseChange = payload => {
  selectedFranchiseCode.value = payload?.code ?? ''
}

const handleProductSelected = product => {
  if (!product) {
    resetSelectedPriceState()
    return
  }

  selectedBaseNetAmount.value = product.base_net_amount ?? null
  selectedNetAmount.value = product.net_amount ?? null
  selectedGrossAmount.value = product.gross_amount ?? null
  selectedIVAAmount.value = product.iva_amount ?? null
  selectedAditionalTaxAmount.value = product.aditional_tax_amount ?? null
  selectedRetentionAmount.value = product.retention_amount ?? null

  selectedCalculationConfig.value = {
    code: product.price_configuration ?? null,
    formulaEndpoint: '/price-configuration-formula/',
    formulaResponsePath: product.calculation?.formulaResponsePath ?? null,
    variablesEndpoint: '/formula-variables/',
    detailEndpoint: '/price-configuration-detail/',
    variablesQueryParams: {
      module_id: MODULE_ID
    },
    contextKey: 'code'
  }
}

const resetSelectedPriceState = () => {
  selectedBaseNetAmount.value = null
  selectedNetAmount.value = null
  selectedGrossAmount.value = null
  selectedIVAAmount.value = null
  selectedAditionalTaxAmount.value = null
  selectedRetentionAmount.value = null
  selectedCalculationConfig.value = null
}

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
