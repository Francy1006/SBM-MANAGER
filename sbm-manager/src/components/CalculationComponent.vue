<template>
  <h5><strong>Cálculo</strong></h5>
  <button 
    class="btn btn-danger btn-lg w-100 mt-2 mb-4 ps-3" 
    @click="calculateFormula"
    :disabled="loading"
  >
    <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-calculator'" class="me-2"></i> 
    {{ loading ? 'Calculando...' : 'Recalcular' }}
  </button>
  <div class="row mt-4">
    <div class="col-md-3 mb-3" v-for="field in fields" :key="field.key">
      <div :class="['card h-100', field.color === 'primary' ? 'bg-primary border-primary text-white' : '', field.color === 'secondary' ? 'bg-secondary border-secondary text-white' : '']">
        <div class="card-body">
          <label :for="field.key" class="form-label text-white">{{ field.label }}</label>
          <input
            :id="field.key"
            type="text"
            class="form-control"
            :value="formatCurrencyInput(field)"
            @input="onCurrencyInput($event, field)"
            disabled
          />
        </div>
      </div>
    </div>
  </div>
  <h5><strong>Resultados</strong></h5>
  <div class="row mt-4">
    <div class="col-md-2 mb-3" v-for="field in resultFields" :key="field.key">
      <div class="card h-100 bg-danger border-danger text-white">
        <div class="card-body">
          <label :for="field.key" class="form-label text-white">{{ field.label }}</label>
          <input
            :id="field.key"
            type="text"
            class="form-control"
            :value="formatCurrencyInput(field, 'danger')"
            @input="onCurrencyInput($event, field)"
            disabled
          />
        </div>
      </div>
    </div>
  </div>
  
  <!-- Alertas para mostrar resultados o errores -->
  <div v-if="calculationResult" class="alert alert-success mt-3" role="alert">
    <i class="fas fa-check-circle me-2"></i>
    Cálculo completado exitosamente
  </div>
  
  <div v-if="calculationError" class="alert alert-danger mt-3" role="alert">
    <i class="fas fa-exclamation-triangle me-2"></i>
    {{ calculationError }}
  </div>
</template>

<script setup>
import { reactive, onMounted, watch, ref } from 'vue';
import api from '../api/axios';

const props = defineProps({
  code: {
    type: String,
    required: true
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

// Estados para el cálculo
const loading = ref(false);
const calculationResult = ref(null);
const calculationError = ref(null);

function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return '';
  return '$' + Number(val).toLocaleString('es-CL', { maximumFractionDigits: 0 });
}

function formatDouble(val) {
  if (val === null || val === undefined || isNaN(val)) return '';
  // Formato: xxx.xxx,xx
  return Number(val).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCurrencyInput(field, forceType = null) {
  if (forceType === 'danger' || field.color === 'primary') {
    return formatCurrency(field.value);
  } else if (field.color === 'secondary') {
    return formatDouble(field.value);
  }
  return field.value;
}

function parseCurrencyInput(str) {
  // Elimina todo lo que no sea número o coma o punto
  const clean = str.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(/,/g, '.');
  return clean ? parseFloat(clean) : null;
}

function onCurrencyInput(event, field) {
  field.value = parseCurrencyInput(event.target.value);
}

// base_neto es fijo y primary
const fields = reactive([
  { key: 'base_neto', label: 'VALOR BASE NETO', value: null, color: 'primary' }
]);

const resultFields = reactive([
  { key: 'neto', label: 'Neto', value: null },
  { key: 'iva', label: 'IVA', value: null },
  { key: 'impuesto_adicional', label: 'Impuesto Adicional', value: null },
  { key: 'retencion', label: 'Retención', value: null },
  { key: 'bruto', label: 'Bruto', value: null },
]);

function setBaseNetAmount(val) {
  fields[0].value = val;
}

function setResultAmounts() {
  if (props.netAmount !== null) {
    const netField = resultFields.find(field => field.key === 'neto');
    if (netField) netField.value = props.netAmount;
  }
  if (props.ivaAmount !== null) {
    const ivaField = resultFields.find(field => field.key === 'iva');
    if (ivaField) ivaField.value = props.ivaAmount;
  }
  if (props.additionalTaxAmount !== null) {
    const taxField = resultFields.find(field => field.key === 'impuesto_adicional');
    if (taxField) taxField.value = props.additionalTaxAmount;
  }
  if (props.retentionAmount !== null) {
    const retentionField = resultFields.find(field => field.key === 'retencion');
    if (retentionField) retentionField.value = props.retentionAmount;
  }
  if (props.grossAmount !== null) {
    const grossField = resultFields.find(field => field.key === 'bruto');
    if (grossField) grossField.value = props.grossAmount;
  }
}

async function fetchFields(code) {
  if (!code) return;
  try {
    const response = await api.get(`/formula-variables/?code=${code}`);
    const dynamicFields = response.data.filter(item => item.var !== 'base_neto').map(item => ({
      key: item.var,
      label: `${item.var} (${item.variable_type})`,
      value: item.value ?? null,
      color: 'secondary'
    }));
    fields.splice(1, fields.length - 1, ...dynamicFields);
  } catch (e) {
    fields.splice(1, fields.length - 1);
  }
}

// Función principal para calcular la fórmula
async function calculateFormula() {
  if (!props.code) {
    calculationError.value = 'No se ha proporcionado un código SKU válido';
    return;
  }

  loading.value = true;
  calculationError.value = null;
  calculationResult.value = null;
  let response = null;

  try {
    // Enviar el SKU del producto seleccionado
    const payload = { sku: props.selectedProductSku };
    response = await api.post('/product-price-calculation/', payload);


    // Actualizar los campos de resultado con los datos recibidos
    if (response.data && typeof response.data === 'object') {
      Object.keys(response.data).forEach(key => {
        const resultField = resultFields.find(field => field.key === key);
        if (resultField) {
          resultField.value = response.data[key];
        }
      });
    }

    calculationResult.value = 'Cálculo completado exitosamente';
    setTimeout(() => { calculationResult.value = null; }, 3000);

  } catch (error) {
    console.error('Error en el cálculo:', error);
    if (error.response?.data?.detail) {
      calculationError.value = error.response.data.detail;
    } else if (error.response?.data?.message) {
      calculationError.value = error.response.data.message;
    } else if (error.message) {
      calculationError.value = `Error de conexión: ${error.message}`;
      console.log(response);
    } else {
      calculationError.value = 'Error desconocido al realizar el cálculo';
    }
    setTimeout(() => { calculationError.value = null; }, 5000);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  setBaseNetAmount(props.baseNetAmount);
  setResultAmounts();
  fetchFields(props.code);
});

watch(() => props.code, (newCode) => {
  fetchFields(newCode);
});

watch(() => props.baseNetAmount, (newVal) => {
  setBaseNetAmount(newVal);
});

watch(() => [props.netAmount, props.grossAmount, props.ivaAmount, props.additionalTaxAmount, props.retentionAmount], () => {
  setResultAmounts();
});
</script> 