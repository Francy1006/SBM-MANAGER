<template>
  <div class="properties-container">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="properties-title mb-0">{{ propertiesTitle }}</h3>
      <button @click="$emit('close')" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
        <i class="fas fa-arrow-left me-1"></i> Volver
      </button>
    </div>
    <div class="properties-content">
      <div class="row">
        <div class="col-md-6">
          <h4 class="mb-3">Información General</h4>
          <ul class="list-unstyled">
            <li v-for="field in fields" :key="field">
              <strong>{{ verboseNames[field] || field }}:</strong> {{ product ? product[field] : '' }}
            </li>
          </ul>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-12">
          <h4 class="mb-3">Datos del Sistema</h4>
          <ul class="list-unstyled">
            <li v-for="field in systemFields" :key="field">
              <strong>{{ systemVerboseNames[field] || field }}:</strong> {{ product ? product[field] : '' }}
            </li>
          </ul>
        </div>
      </div>
      <div class="row mt-4" v-if="configComponent">
        <div class="col-12">
          <component :is="configComponent" v-bind="configProps" />
          <CalculationComponent 
            v-if="showCalculationComponent" 
            :code="calculationCode" 
            :baseNetAmount="baseNetAmount"
            :netAmount="netAmount"
            :grossAmount="grossAmount"
            :ivaAmount="ivaAmount"
            :additionalTaxAmount="additionalTaxAmount"
            :retentionAmount="retentionAmount"
            :selectedProductSku="selectedProductSku"
          />
        </div>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import CalculationComponent from './CalculationComponent.vue';

const props = defineProps({
  product: { type: Object, default: null },
  total: Number,
  activos: Number,
  inactivos: Number,
  lastUpdate: String,
  status: String,
  configComponent: [Object, Function, String],
  configProps: Object,
  propertiesTitle: String,
  fields: Array,
  verboseNames: Object,
  systemFields: Array,
  systemVerboseNames: Object,
  showCalculationComponent: {
    type: Boolean,
    default: false
  },
  calculationCode: {
    type: String,
    default: ''
  },
  baseNetAmount: {
    type: [Number, String],
    default: null
  },
  netAmount: {
    type: [Number, String],
    default: null
  },
  grossAmount: {
    type: [Number, String],
    default: null
  },
  ivaAmount: {
    type: [Number, String],
    default: null
  },
  additionalTaxAmount: {
    type: [Number, String],
    default: null
  },
  retentionAmount: {
    type: [Number, String],
    default: null
  },
  selectedProductSku: {
    type: String,
    default: null
  }
});

const propertiesTitle = computed(() => {
  if (props.propertiesTitle) return props.propertiesTitle;
  if (props.product && props.product.sku) {
    return props.product.description
      ? `${props.product.sku} - ${props.product.description}`
      : props.product.sku;
  }
  return "Producto: Sistema de Gestión";
});

defineEmits(['close']);
</script>

<style scoped>
.properties-container {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

.properties-title {
  color: #495057;
  font-family: 'DINAlternate', sans-serif;
  font-weight: bold;
  margin-bottom: 20px;
  border-bottom: 2px solid #e53935;
  padding-bottom: 10px;
}

.properties-content {
  color: #6c757d;
  line-height: 1.6;
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .properties-container {
    padding: 15px;
  }
  
  .properties-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .properties-container {
    padding: 10px;
  }
  
  .properties-title {
    font-size: 1.1rem;
  }
}
</style> 