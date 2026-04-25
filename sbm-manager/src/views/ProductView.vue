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
      get-endpoint="products/" post-endpoint="products/" iconClass="fas fa-dolly" :fields="fields"
      :showPropertiesButton="true" :showCalculationComponent="true" :baseNetAmount="selectedBaseNetAmount"
      :netAmount="selectedNetAmount" :grossAmount="selectedGrossAmount" :ivaAmount="selectedIVAAmount"
      :additionalTaxAmount="selectedAditionalTaxAmount" :retentionAmount="selectedRetentionAmount"
      :calculationConfig="selectedCalculationConfig" :configFormResourcePath="'products'"
      :configFormLookupField="'code'" :detailExtraProps="extraVariables" @row-selected="handleProductSelected"
      @refresh="handleRefresh" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '../api/axios'
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue'
import FranchiseSelector from '../components/FranchiseSelectorComponent.vue'
import PropertiesComponent from '../components/PropertiesComponent.vue'

/* =========================
   FRANCHISE STATE
========================= */

const franchises = ref([])
const selectedFranchise = ref('')
const selectedFranchiseCode = ref('')

/* =========================
   PRODUCT STATE
========================= */


const selectedCalculationConfig = ref(null)
const selectedBaseNetAmount = ref(null)
const selectedNetAmount = ref(null)
const selectedGrossAmount = ref(null)
const selectedIVAAmount = ref(null)
const selectedAditionalTaxAmount = ref(null)
const selectedRetentionAmount = ref(null)
const MODULE_ID = 1

const selectedProduct = ref(null)

/* =========================
   EXTRA VARIABLES
========================= */

const extraVariables = computed(() => ({
  base_net_amount: {
    key: 'base_net_amount',
    label: 'Valor Base Neto',
    value: selectedBaseNetAmount.value,
    data_type: 5
  }
}))

/* =========================
   FIELDS CONFIG
========================= */

const fields = ref([
  { key: 'id', hideInGrid: true, omitInForm: true },
  { key: 'sku', label: 'SKU', type: 'text', omitInForm: true, readOnlyOnConfigure: true },
  { key: 'description', label: 'Descripción', type: 'textarea', required: true, readOnlyOnConfigure: true },

  { key: 'price_configuration_input', label: 'Configuración Precio', type: 'dynamic-select', labelKey: 'price_configuration', valueKey: 'code', endpoint: '/price-configurations/', required: true, quickConfigure: false },

  { key: 'price_configuration', hideInGrid: true, omitInForm: true },
  { key: 'price_configuration_label', hideInGrid: true, omitInForm: true },

  { key: 'base_net_amount', label: 'Valor Base NETO', type: 'number', hideInGrid: true, omitInForm: true },
  { key: 'base_net_amount_input', label: 'Valor Base NETO', type: 'number', required: true, quickConfigure: false },

  { key: 'net_amount', label: 'Costo NETO', type: 'price', hideInGrid: false, omitInForm: true, secretField: true, quickConfigure: false },
  { key: 'gross_amount', label: 'Costo BRUTO', type: 'price', hideInGrid: false, omitInForm: true, secretField: true },
  { key: 'iva_amount', label: 'IVA Compra', type: 'price', hideInGrid: false, omitInForm: true, secretField: true },

  { key: 'aditional_tax_amount', hideInGrid: true, omitInForm: true },
  { key: 'retention_amount', hideInGrid: true, omitInForm: true },

  { key: 'price', hideInGrid: true, omitInForm: true },

  { key: 'obs', label: 'Observaciones', type: 'textarea', required: true },
  { key: 'package_unit', label: 'Unidades Empaque', type: 'number', required: true },
  { key: 'min_package_purchase', label: 'Mínimo Compra', type: 'number', required: true },

  { key: 'provider', label: 'Proveedor', type: 'dynamic-select', labelKey: 'provider', valueKey: 'id', endpoint: '/providers/', hideInGrid: true, omitInForm: false, required: true, readOnlyOnConfigure: true },
  { key: 'provider_name', label: 'Proveedor', hideInGrid: false, omitInForm: true, secretField: true },

  { key: 'type', label: 'Tipo', type: 'dynamic-select', labelKey: 'type', valueKey: 'id', endpoint: '/item-types/', hideInGrid: true, omitInForm: false, required: true },
  { key: 'type_name', label: 'Tipo', hideInGrid: false, omitInForm: true },

  { key: 'item_group', label: 'Grupo', type: 'dynamic-select', labelKey: 'group_name', valueKey: 'id', endpoint: '/item-groups/', hideInGrid: true, omitInForm: false, required: true },
  { key: 'item_group_name', label: 'Grupo', hideInGrid: false, omitInForm: true },

  { key: 'category', label: 'Categoría', type: 'dynamic-select', labelKey: 'category', valueKey: 'id', endpoint: '/item-categories/', hideInGrid: true, omitInForm: false, required: true },
  { key: 'category_name', label: 'Categoría', hideInGrid: false, omitInForm: true },

  { key: 'url', label: 'URL', type: 'text' },

  { key: 'package', label: 'Empaque', type: 'dynamic-select', labelKey: 'description', valueKey: 'id', endpoint: '/packages/', hideInGrid: true, omitInForm: false, required: true },
  { key: 'package_description', label: 'Embalaje', hideInGrid: false, omitInForm: true },

  { key: 'is_active', label: 'Activo', type: 'checkbox' },
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox', hideInGrid: false, omitInForm: false },
  { key: 'is_deleted', label: 'Eliminado', hideInGrid: false, omitInForm: true },

  { key: 'created_at', label: 'Fecha creación', hideInGrid: false, omitInForm: true },
  { key: 'updated_at', hideInGrid: true, omitInForm: true },
  { key: 'confirmed_at', hideInGrid: true, omitInForm: true },
  { key: 'deleted_at', hideInGrid: true, omitInForm: true },

  { key: 'created_by', hideInGrid: true, omitInForm: true },
  { key: 'confirmed_by', hideInGrid: true, omitInForm: true },
  { key: 'updated_by', hideInGrid: true, omitInForm: true },
  { key: 'deleted_by', hideInGrid: true, omitInForm: true },

  { key: 'log', hideInGrid: true, omitInForm: true },
  { key: 'version', hideInGrid: true, omitInForm: true },
])

/* =========================
   FRANCHISE HANDLER
========================= */

const onFranchiseChange = payload => {
  selectedFranchiseCode.value = payload.code
}

/* =========================
   PRODUCT SELECT
========================= */

const handleProductSelected = product => {
  if (!product) return

  selectedProduct.value = product

  selectedBaseNetAmount.value = product.base_net_amount
  selectedNetAmount.value = product.net_amount
  selectedGrossAmount.value = product.gross_amount
  selectedIVAAmount.value = product.iva_amount
  selectedAditionalTaxAmount.value = product.aditional_tax_amount
  selectedRetentionAmount.value = product.retention_amount

  selectedCalculationConfig.value = {
    code: product.price_configuration,

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

/* =========================
   INIT
========================= */

onMounted(async () => {
  const res = await axios.get('franchises/')
  franchises.value = res.data.results || res.data
})
</script>