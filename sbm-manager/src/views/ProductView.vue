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
          <FranchiseSelector
            v-model="selectedFranchise"
            :franchises="franchises"
            @change="onFranchiseChange"
          />
        </div>
      </div>
      <br />
    </div>

    <CRUDManagerComponent
      v-if="selectedFranchise"
      title=""
      resourceName="Producto"
      endpoint="products/"
      get-endpoint="products/"
      post-endpoint="products/"
      iconClass="fas fa-dolly"
      :fields="fields"
      :showCalculationComponent="true"
      :calculationCode="selectedPriceConfiguration"
      :baseNetAmount="selectedBaseNetAmount"
      :netAmount="selectedNetAmount"
      :grossAmount="selectedGrossAmount"
      :ivaAmount="selectedIVAAmount"
      :additionalTaxAmount="selectedAditionalTaxAmount"
      :retentionAmount="selectedRetentionAmount"
      @row-selected="handleProductSelected"
      @refresh="handleRefresh"
    />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from '../api/axios'
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue'
import FranchiseSelector from '../components/FranchiseSelectorComponent.vue'

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

const fields = ref([
  { key: 'sku', label: 'SKU', type: 'text', required: true },
  { key: 'description', label: 'Descripción', type: 'textarea', required: true },
  { key: 'obs', label: 'Observaciones', type: 'textarea', required: true },
  { key: 'package_unit', label: 'Unidad Empaque', type: 'number', required: true },
  { key: 'min_package_purchase', label: 'Mínimo Compra', type: 'number', required: true },

  { key: 'provider', label: 'Proveedor', type: 'dynamic-select', endpoint: '/providers/' },
  { key: 'type', label: 'Tipo', type: 'dynamic-select', endpoint: '/item-types/' },
  { key: 'item_group', label: 'Grupo', type: 'dynamic-select', endpoint: '/item-groups/' },
  { key: 'category', label: 'Categoría', type: 'dynamic-select', endpoint: '/item-categories/' },
  { key: 'package', label: 'Empaque', type: 'dynamic-select', endpoint: '/packages/' },

  { key: 'price_configuration', label: 'Config Precio', type: 'dynamic-select', endpoint: '/price-configurations/' },

  { key: 'is_active', label: 'Activo', type: 'checkbox' }
])

const onFranchiseChange = payload => {
  selectedFranchiseCode.value = payload.code
}

const handleProductSelected = product => {
  if (!product) return

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