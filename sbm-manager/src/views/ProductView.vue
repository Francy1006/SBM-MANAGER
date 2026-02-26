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

    <CRUDManagerComponent v-if="selectedFranchise" title="" resourceName="Producto" endpoint="products/list/"
      get-endpoint="products/list/" post-endpoint="products/" iconClass="fas fa-dolly" :fields="fields"
      :showPropertiesButton="true" :showCalculationComponent="true" :calculationCode="selectedPriceConfiguration"
      :baseNetAmount="selectedBaseNetAmount" :netAmount="selectedNetAmount" :grossAmount="selectedGrossAmount"
      :ivaAmount="selectedIVAAmount" :additionalTaxAmount="selectedAditionalTaxAmount"
      :configFormResourcePath="'products'" :configFormLookupField="'code'" :retentionAmount="selectedRetentionAmount"
      @row-selected="handleProductSelected" @refresh="handleRefresh">
      <template #properties>
        <PropertiesComponent :product="selectedProduct" :fields="fields" title="Propiedades del Producto"
          configResource="products" lookupField="code" />
      </template>
    </CRUDManagerComponent>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '../api/axios'
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue'
import FranchiseSelector from '../components/FranchiseSelectorComponent.vue'
import PropertiesComponent from '../components/PropertiesComponent.vue'

const franchises = ref([])
const selectedFranchise = ref('')
const selectedFranchiseCode = ref('')

const selectedPriceConfiguration = ref(null)
const selectedBaseNetAmount = ref(null)
const selectedNetAmount = ref(null)
const selectedGrossAmount = ref(null)
const selectedIVAAmount = ref(null)
const selectedAditionalTaxAmount = ref(null)
const selectedRetentionAmount = ref(null)
const selectedProduct = ref(null)

const fields = ref([
  { key: 'id', hideInGrid: true, omitInForm: true },
  { key: 'sku', label: 'SKU', type: 'text', required: true },
  { key: 'description', label: 'Descripción', type: 'textarea', required: true },
  { key: 'base_net_amount', label: 'Valor Base NETO', type: 'number', hideInGrid: true, omitInForm: false },
  { key: 'net_amount', label: 'Costo Neto', type: 'price', hideInGrid: false, omitInForm: true },
  { key: 'obs', label: 'Observaciones', type: 'textarea' },
  { key: 'package_unit', label: 'Unidades Empaque', type: 'number' },
  { key: 'min_package_purchase', label: 'Mínimo Compra', type: 'number' },
  { key: 'provider', label: 'Proveedor', type: 'dynamic-select', labelKey: 'provider', valueKey: 'id', endpoint: '/providers/', hideInGrid: true, omitInForm: false },
  { key: 'provider_name', label: 'Proveedor', hideInGrid: false, omitInForm: true },
  { key: 'type', label: 'Tipo', type: 'dynamic-select', labelKey: 'type', valueKey: 'id', endpoint: '/item-types/', hideInGrid: true, omitInForm: false },
  { key: 'type_name', label: 'Tipo', hideInGrid: false, omitInForm: true },
  { key: 'item_group', label: 'Grupo', type: 'dynamic-select', labelKey: 'group_name', valueKey: 'id', endpoint: '/item-groups/', hideInGrid: true, omitInForm: false },
  { key: 'item_group_name', label: 'Grupo', hideInGrid: false, omitInForm: true },
  { key: 'category', label: 'Categoría', type: 'dynamic-select', labelKey: 'category', valueKey: 'id', endpoint: '/item-categories/', hideInGrid: true, omitInForm: false },
  { key: 'category_name', label: 'Categoría', hideInGrid: false, omitInForm: true },
  { key: 'url', label: 'URL', type: 'text' },
  { key: 'package', label: 'Empaque', type: 'dynamic-select', labelKey: 'description', valueKey: 'id', endpoint: '/packages/', hideInGrid: true, omitInForm: false },
  { key: 'package_description', label: 'Embalaje', hideInGrid: false, omitInForm: true },
  { key: 'price_configuration', hideInGrid: true, omitInForm: true },
  { key: 'price_configuration_label', hideInGrid: true, omitInForm: true },
  { key: 'is_active', label: 'Activo', type: 'checkbox' },
  { key: 'is_confirmed', label: 'Confirmado', hideInGrid: false, omitInForm: true },
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
  { key: 'gross_amount', hideInGrid: true, omitInForm: true },
  { key: 'iva_amount', hideInGrid: true, omitInForm: true },
  { key: 'aditional_tax_amount', hideInGrid: true, omitInForm: true },
  { key: 'retention_amount', hideInGrid: true, omitInForm: true },
  { key: 'price', hideInGrid: true, omitInForm: true },

])

const onFranchiseChange = payload => {
  selectedFranchiseCode.value = payload.code
}

const handleProductSelected = product => {
  if (!product) {
    selectedProduct.value = null
    return
  }

  selectedProduct.value = product

  selectedPriceConfiguration.value = product.price_configuration
  selectedBaseNetAmount.value = product.base_net_amount
  selectedNetAmount.value = product.net_amount
  selectedGrossAmount.value = product.gross_amount
  selectedIVAAmount.value = product.iva_amount
  selectedAditionalTaxAmount.value = product.aditional_tax_amount
  selectedRetentionAmount.value = product.retention_amount
}

const handleRefresh = () => window.location.reload()

onMounted(async () => {
  const res = await axios.get('franchises/')
  franchises.value = res.data.results || res.data
})
</script>