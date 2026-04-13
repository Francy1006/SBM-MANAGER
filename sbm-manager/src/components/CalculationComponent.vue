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

      <div v-if="translateRows.length" class="table-responsive mb-4">
        <table class="table table-sm table-bordered">
          <thead class="table-secondary">
            <tr>
              <th>Descripción Cálculo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in translateRows" :key="row.id">
              <td class="fw-semibold">{{ row.text }}</td>
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
  code: { type: [String, Number], required: true },

  contextKey: { type: String, default: 'code' },

  formulaEndpoint: { type: String, required: true },
  formulaResponsePath: { type: String, required: true },

  variablesEndpoint: { type: String, required: true },
  variablesQueryParams: { type: Object, default: () => ({}) },

  extraVariables: { type: Object, default: () => ({}) }
})

const titleToShow = computed(() => (props.title ?? '').trim())
const descriptionToShow = computed(() => (props.description ?? '').trim())

const loading = ref(false)
const formulaTemplate = ref(null)
const formulaTranslate = ref(null)
const translateRows = ref([])

const fields = reactive([])

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
  if (!props.formulaEndpoint) return

  const query = new URLSearchParams({
    [props.contextKey]: props.code
  })

  const response = await api.get(`${props.formulaEndpoint}?${query.toString()}`)

  const path = String(props.formulaResponsePath).split('.')
  let value = response.data

  for (const key of path) {
    if (value == null) break
    value = /^\d+$/.test(key) ? value[Number(key)] : value[key]
  }

  formulaTemplate.value = value || null
  formulaTranslate.value = response.data?.formula_translate || null
}

/* ================================
   FETCH VARIABLES
================================ */

async function fetchVariables() {
  if (!props.code || props.code === 'null') return
  if (!props.variablesEndpoint) return

  const query = new URLSearchParams({
    [props.contextKey]: props.code
  })

  Object.entries(props.variablesQueryParams || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      query.append(key, value)
    }
  })

  const response = await api.get(`${props.variablesEndpoint}?${query.toString()}`)

  const keepKeys = new Set()
  Object.keys(props.extraVariables || {}).forEach(k => keepKeys.add(k))

  for (let i = fields.length - 1; i >= 0; i--) {
    if (!keepKeys.has(fields[i].key)) fields.splice(i, 1)
  }

  ; (response.data || []).forEach(v => {
    const key = String(v.var || '').trim()
    if (!key) return

    const existing = fields.find(f => f.key === key)

    if (!existing) {
      fields.push({
        key,
        label: key,
        value: Number(v.value)
      })
      return
    }

    existing.value = Number(v.value)
  })

  Object.entries(props.extraVariables || {}).forEach(([key, rawValue]) => {
    const cleanKey = String(key).trim()
    if (!cleanKey) return

    const isObjectValue =
      rawValue !== null &&
      typeof rawValue === 'object' &&
      !Array.isArray(rawValue)

    const label = isObjectValue
      ? (rawValue.label || cleanKey)
      : cleanKey

    const value = isObjectValue
      ? Number(rawValue.value)
      : Number(rawValue)

    const existing = fields.find(f => f.key === cleanKey)

    if (!existing) {
      fields.push({
        key: cleanKey,
        label,
        value
      })
      return
    }

    existing.label = label
    existing.value = value
  })
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


function buildTranslateRows() {
  translateRows.value = []

  if (!formulaTranslate.value) return

  const parts = String(formulaTranslate.value)
    .split(';')
    .map(p => p.trim())
    .filter(Boolean)

  translateRows.value = parts.map((line, index) => ({
    id: `${index}-${line}`,
    text: line
  }))
}
/* ================================
   INIT / WATCH
================================ */

onMounted(async () => {
  if (!props.code || props.code === 'null') return
  await fetchFormula()
  await fetchVariables()
  calculateFormula()
  buildTranslateRows()
})

watch(() => props.code, async (newVal, oldVal) => {
  if (!newVal || newVal === 'null' || newVal === oldVal) return
  await fetchFormula()
  await fetchVariables()
  calculateFormula()
  buildTranslateRows()
})

watch(() => props.extraVariables, async () => {
  if (!props.code || props.code === 'null') return
  await fetchVariables()
  calculateFormula()
  buildTranslateRows()
}, { deep: true })
</script>