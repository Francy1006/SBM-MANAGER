<template>
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-body">

      <!-- HEADER -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 v-if="titleToShow" class="fw-bold mb-1 d-flex align-items-center gap-2">
            <span>{{ titleToShow }}</span>
          </h6>
          <p v-if="descriptionToShow" class="text-muted small mb-0">
            {{ descriptionToShow }}
          </p>
        </div>

        <button class="btn btn-outline-danger btn-sm" @click="calculateFormula" :disabled="loading">
          <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'" class="me-2"></i>
          {{ loading ? 'Calculando...' : 'Recalcular' }}
        </button>
      </div>

      <!-- VARIABLES -->
      <div class="table-responsive mb-4">
        <table class="table table-sm table-bordered align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Variable</th>
              <th class="text-end">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in fields" :key="field.key">
              <td class="fw-semibold">{{ field.label }}</td>
              <td class="text-end">{{ formatValueByType(field) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- RESULTADOS -->
      <h6 class="fw-bold border-bottom pb-2 mb-3 text-secondary">
        Resultados
      </h6>

      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Concepto</th>
              <th class="text-end">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in resultFields" :key="field.key">
              <td class="fw-semibold">{{ field.label }}</td>
              <td class="text-end">{{ formatCurrency(field.value) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ALERTAS -->
      <div v-if="calculationResult" class="alert alert-success mt-3 small mb-0">
        <i class="fas fa-check-circle me-2"></i>
        Cálculo completado exitosamente
      </div>

      <div v-if="calculationError" class="alert alert-danger mt-3 small mb-0">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ calculationError }}
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, watch, ref, computed } from 'vue'
import api from '../api/axios'

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  code: { type: String, required: true },
  baseNetAmount: { type: [Number, String], default: null },
  netAmount: { type: [Number, String], default: null },
  grossAmount: { type: [Number, String], default: null },
  ivaAmount: { type: [Number, String], default: null },
  additionalTaxAmount: { type: [Number, String], default: null },
  retentionAmount: { type: [Number, String], default: null },
  selectedProductSku: { type: String, default: null }
})

const emit = defineEmits(['calculated'])

const titleToShow = computed(() => ((props.title ?? '') + '').trim())
const descriptionToShow = computed(() => ((props.description ?? '') + '').trim())

const loading = ref(false)
const calculationResult = ref(null)
const calculationError = ref(null)

function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return '-'
  return '$' + Number(val).toLocaleString('es-CL')
}

function formatPercentage(val) {
  if (val === null || val === undefined || isNaN(val)) return '-'
  return (Number(val) * 100).toLocaleString('es-CL') + '%'
}

function formatValueByType(field) {
  if (field.value === null || field.value === undefined || isNaN(field.value)) {
    return '-'
  }

  // Si es menor a 1 asumimos que es tasa (ej: 0.19 → 19%)
  if (Number(field.value) > 0 && Number(field.value) < 1) {
    return (Number(field.value) * 100).toLocaleString('es-CL') + '%'
  }

  return '$' + Number(field.value).toLocaleString('es-CL')
}

const fields = reactive([
  { key: 'base_neto', label: 'Valor Base Neto', value: null }
])

const resultFields = reactive([
  { key: 'neto', label: 'Neto', value: null },
  { key: 'iva', label: 'IVA', value: null },
  { key: 'impuesto_adicional', label: 'Impuesto Adicional', value: null },
  { key: 'retencion', label: 'Retención', value: null },
  { key: 'bruto', label: 'Bruto', value: null },
])

function setBaseNetAmount(val) {
  fields[0].value = val
}

function setResultAmounts() {
  resultFields.find(f => f.key === 'neto').value = props.netAmount
  resultFields.find(f => f.key === 'iva').value = props.ivaAmount
  resultFields.find(f => f.key === 'impuesto_adicional').value = props.additionalTaxAmount
  resultFields.find(f => f.key === 'retencion').value = props.retentionAmount
  resultFields.find(f => f.key === 'bruto').value = props.grossAmount
}

async function fetchFields(code) {
  if (!code) return
  try {
    const response = await api.get(`/formula-variables/?code=${code}`)

    const dynamicFields = response.data
      .filter(item => item.var !== 'base_neto')
      .map(item => ({
        key: item.var,
        label: item.variable_type === 'percentage'
          ? `${item.var} (%)`
          : item.var,
        value: item.value ?? null,
        variable_type: item.variable_type ?? null
      }))

    fields.splice(1, fields.length - 1, ...dynamicFields)
  } catch {
    fields.splice(1)
  }
}

async function calculateFormula() {
  if (!props.code) return

  loading.value = true
  calculationError.value = null
  calculationResult.value = null

  try {
    const response = await api.post('/product-price-calculation/', {
      sku: props.selectedProductSku
    })

    if (response.data) {
      Object.keys(response.data).forEach(key => {
        const field = resultFields.find(f => f.key === key)
        if (field) field.value = response.data[key]
      })
    }

    calculationResult.value = 'ok'
    emit('calculated')
    setTimeout(() => calculationResult.value = null, 3000)

  } catch (error) {
    calculationError.value = error.response?.data?.detail || 'Error al realizar el cálculo'
    setTimeout(() => calculationError.value = null, 5000)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setBaseNetAmount(props.baseNetAmount)
  setResultAmounts()
  fetchFields(props.code)
})

watch(() => props.code, fetchFields)
watch(() => props.baseNetAmount, setBaseNetAmount)
watch(
  () => [props.netAmount, props.grossAmount, props.ivaAmount, props.additionalTaxAmount, props.retentionAmount],
  setResultAmounts
)
</script>