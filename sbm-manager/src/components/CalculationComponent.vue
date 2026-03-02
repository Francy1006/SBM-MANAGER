<!-- CalculationComponent.vue (COMPLETO CORREGIDO) -->
<template>
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-body">

      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 v-if="titleToShow" class="fw-bold mb-1">
            {{ titleToShow }}
          </h6>
          <p v-if="descriptionToShow" class="text-muted small mb-0">
            {{ descriptionToShow }}
          </p>
        </div>
      </div>

      <div class="table-responsive mb-4">
        <table class="table table-sm table-bordered">
          <thead class="table-secondary">
            <tr>
              <th>Variable</th>
              <th class="text-end">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in fields" :key="field.key">
              <td class="fw-semibold">{{ field.label }}</td>
              <td class="text-end">{{ formatValue(field.value) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h6 class="fw-bold border-bottom pb-2 mb-3 text-secondary">
        Resultados
      </h6>

      <div class="table-responsive">
        <table class="table table-sm table-bordered">
          <thead class="table-dark">
            <tr>
              <th>Concepto</th>
              <th class="text-end">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in results" :key="r.label">
              <td class="fw-semibold">{{ r.label }}</td>
              <td class="text-end">{{ formatByType(r.value, r.format) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import api from '../api/axios'

const props = defineProps({
  title: String,
  description: String,
  code: { type: String, required: true },
  baseNetAmount: { type: [Number, String], required: true },
  extraVariables: { type: Object, default: null }
})

const titleToShow = computed(() => (props.title ?? '').trim())
const descriptionToShow = computed(() => (props.description ?? '').trim())

const loading = ref(false)
const formulaTemplate = ref(null)

const fields = reactive([
  { key: 'base_net_amount', label: 'Valor Base Neto', value: 0 }
])

const results = ref([])

/* ================================
   FORMAT
================================ */

function formatByType(value, format) {
  if (value == null || isNaN(value)) return '-'

  switch (format) {
    case 'currency_int':
      return '$' + Number(value).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    case 'currency_2':
      return '$' + Number(value).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    case 'percentage':
      return Number(value * 100).toLocaleString('es-CL') + '%'
    default:
      return '$' + Number(value).toLocaleString('es-CL')
  }
}

function formatValue(val, decimals = 0) {
  if (val == null || isNaN(val)) return '-'
  if (val > 0 && val < 1) return Number(val * 100).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + '%'
  return '$' + Number(val).toLocaleString('es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/* ================================
   FETCH FORMULA
================================ */

async function fetchFormula() {
  if (!props.code || props.code === 'null') return
  const response = await api.get(`/price-configuration-formula/?code=${props.code}`)
  formulaTemplate.value = response.data?.[0]?.formula_template || null
}

/* ================================
   FETCH VARIABLES
================================ */

async function fetchVariables() {
  if (!props.code || props.code === 'null') return

  const response = await api.get(`/formula-variables/?code=${props.code}`)

  const keepKeys = new Set(['base_net_amount'])
  if (props.extraVariables && typeof props.extraVariables === 'object') {
    Object.keys(props.extraVariables).forEach(k => keepKeys.add(k))
  }

  for (let i = fields.length - 1; i >= 0; i--) {
    if (!keepKeys.has(fields[i].key)) fields.splice(i, 1)
  }

  ;(response.data || []).forEach(v => {
    const k = String(v.var || '').trim()
    if (!k || k === 'base_net_amount') return
    if (!fields.find(f => f.key === k)) {
      fields.push({ key: k, label: k, value: Number(v.value) })
    } else {
      fields.find(f => f.key === k).value = Number(v.value)
    }
  })

  if (props.extraVariables && typeof props.extraVariables === 'object') {
    Object.entries(props.extraVariables).forEach(([k, v]) => {
      const key = String(k).trim()
      if (!key) return
      if (!fields.find(f => f.key === key)) {
        fields.push({ key, label: key, value: Number(v) })
      } else {
        fields.find(f => f.key === key).value = Number(v)
      }
    })
  }
}

/* ================================
   CALCULATION
================================ */

function calculateFormula() {
  if (!formulaTemplate.value) return

  loading.value = true
  results.value = []

  const context = {}
  fields.forEach(f => (context[f.key] = Number(f.value)))

  const cleanFormula = String(formulaTemplate.value).replace(/\|/g, '')
  const parts = cleanFormula.split(';')

  parts.forEach(p => {
    if (!p.trim()) return

    let [rawLabel, expr] = p.split('=')
    if (!rawLabel || !expr) return

    rawLabel = rawLabel.trim()
    expr = expr.trim()

    let label = rawLabel
    let format = 'currency_int'

    if (rawLabel.includes(':')) {
      const x = rawLabel.split(':')
      label = (x[0] || '').trim()
      format = (x[1] || '').trim()
    }

    Object.keys(context).forEach(v => {
      expr = expr.replaceAll(`\${${v}}`, String(context[v]))
    })

    let value = null
    try {
      value = eval(expr)
    } catch {
      value = null
    }

    results.value.push({ label, value, format })
  })

  loading.value = false
}

/* ================================
   INIT / WATCH
================================ */

async function initIfValid() {
  if (!props.code || props.code === 'null') return
  await fetchFormula()
  await fetchVariables()

  const baseField = fields.find(f => f.key === 'base_net_amount')
  if (baseField) {
    baseField.value = Number(props.baseNetAmount)
  }

  calculateFormula()
}

onMounted(async () => {
  await initIfValid()
})

watch(() => props.code, async (newVal) => {
  if (!newVal || newVal === 'null') return
  await fetchFormula()
  await fetchVariables()
  calculateFormula()
})

watch(() => props.baseNetAmount, (v) => {
  const f = fields.find(x => x.key === 'base_net_amount')
  if (f) f.value = Number(v)
  calculateFormula()
})

watch(() => props.extraVariables, async () => {
  if (!props.code || props.code === 'null') return
  await fetchVariables()
  calculateFormula()
}, { deep: true })
</script>