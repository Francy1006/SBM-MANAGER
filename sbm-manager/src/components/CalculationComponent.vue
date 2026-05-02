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
              <th>{{ labels.variable || 'Variable' }}</th>
              <th class="text-end">{{ labels.value || 'Valor' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in visibleFields" :key="field.key">
              <td class="fw-semibold">{{ field.label }}</td>
              <td class="text-end">{{ formatByType(field.value, field.data_type) }}</td>
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
        {{ labels.results || 'Resultados' }}
      </h6>

      <div class="table-responsive">
        <table class="table table-sm table-bordered">
          <thead class="table-dark">
            <tr>
              <th>{{ labels.concept || 'Concepto' }}</th>
              <th class="text-end">{{ labels.amount || 'Monto' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in results" :key="r.label">
              <td class="fw-semibold">{{ r.label }}</td>
              <td class="text-end">
                {{ formatByType(r.value, r.data_type) }}
              </td>
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

  variablesQueryParams: { type: Object, default: () => ({}) },

  module_id: { type: [String, Number], default: null },
  extraVariables: { type: Object, default: () => ({}) },
  labels: { type: Object, default: () => ({}) },
  moduleContext: { type: Object, default: null },
  calculationConfig: { type: Object, default: () => ({}) },
})

const titleToShow = computed(() => (props.title ?? '').trim())
const descriptionToShow = computed(() => (props.description ?? '').trim())

const loading = ref(false)
const formulaTemplate = ref(null)
const formulaTranslate = ref(null)
const translateRows = ref([])

const fields = reactive([])

const results = ref([])
const calculationMap = ref({})

// 🔽 AGREGAR debajo de "const results = ref([])"
const visibleFields = computed(() => {
  const template = formulaTemplate.value
  const vars = new Set()

  if (template) {
    const matches = String(template).match(/\$\{(.*?)\}/g) || []

    matches.forEach(m => {
      const v = m.replace('${', '').replace('}', '').trim()
      vars.add(v)
    })
  }

  // 🔥 CLAVE: si no hay variables detectadas, muestra todo
  if (vars.size === 0) {
    return fields
  }

  return fields.filter(f => vars.has(f.key))
})

/* ================================
   FORMAT
================================ */

function formatByType(value, dataType) {
  if (value == null || isNaN(value)) return '-'

  switch (Number(dataType)) {

    case 1: // decimal
      return Number(value).toLocaleString('es-CL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      })

    case 2: // percentage
      return Number(value * 100).toLocaleString('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }) + '%'

    case 3: // text
    case 4: // long text
      return String(value)

    case 5: // currency_int1
      return '$' + Number(value).toLocaleString('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })

    case 6: // currency_int2
      return '$' + Number(value).toLocaleString('es-CL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })

    default:
      return Number(value).toLocaleString('es-CL')
  }
}

/* ================================
   FETCH FORMULA
================================ */

async function fetchFormula() {
  if (!props.code || props.code === 'null') return
  try {
    const query = new URLSearchParams({
      [props.contextKey]: props.code
    })

    const response = await api.get(
      `${props.formulaEndpoint}?${query.toString()}`
    )

    // =========================
    // NORMALIZAR SIEMPRE ARRAY
    // =========================
    const raw = Array.isArray(response.data)
      ? response.data[0]
      : response.data

    formulaTemplate.value = raw?.formula_template || null
    formulaTranslate.value = raw?.formula_translate || null

    // =========================
    // DETAILS SAFE
    // =========================
    const details = raw?.details ?? []

    const map = {}

    details.forEach(d => {
      const key = String(d?.field || '').trim()
      if (!key) return

      map[key] = {
        label: String(d?.label || key).trim(),
        data_type: Number(d?.data_type || 5)
      }
    })

    calculationMap.value = map

  } catch (e) {
    console.error(e)
    formulaTemplate.value = null
    formulaTranslate.value = null
    calculationMap.value = {}
  }
}

/* ================================
   FETCH VARIABLES
================================ */

async function fetchVariables() {
  loading.value = true

  try {
    const config = props.calculationConfig || {}

    if (!config?.variablesEndpoint) {
      console.error('❌ variablesEndpoint missing')
      return
    }

    let params

    switch (Number(config.module_id)) {

      // =========================
      // PRODUCT
      // =========================
      case 1:
        params = {
          module_id: 1,
          code: config.queryValue || config.code || props.code
        }
        break

      // =========================
      // ORDER
      // =========================
      case 2:
        params = {
          module_id: 2,
          code: props.calculationConfig.variablesQueryParams.code
        }
        break

      default:
        console.warn('⚠️ module_id no soportado:', config.module_id)
        return
    }

    console.log('📡 VARIABLES REQUEST:', config.variablesEndpoint, params)

    const res = await api.get(config.variablesEndpoint, { params })

    const data = res.data || []
    const merged = new Map()

    data.forEach(v => {
      const key = String(v.var || '').trim()
      if (!key) return

      merged.set(key, {
        key,
        label: v.label || key,
        value: Number(v.value) || 0,
        data_type: v.data_type ?? 5
      })
    })

    Object.entries(props.extraVariables || {}).forEach(([key, obj]) => {
      if (key === 'module_id') return

      merged.set(key, {
        key,
        label: obj?.label || key,
        value: Number(obj?.value) || 0,
        data_type: obj?.data_type ?? 5
      })
    })

    fields.splice(
      0,
      fields.length,
      ...Array.from(merged.values()).map(f => ({ ...f }))
    )

  } catch (e) {
    console.error('fetchVariables error:', e)
  } finally {
    loading.value = false
  }
}


function resolveProductVariables(config) {
  return {
    module_id: 1,
    code: config.queryValue || config.code || props.code
  }
}

function resolveOrderVariables(config) {
  return {
    module_id: 2,
    code: config.queryValue || config.code || props.code
  }
}


/* ================================
   CALCULATION
================================ */



function calculateFormula() {
  console.log("formulaTemplate.value : " + formulaTemplate.value)
  if (!formulaTemplate.value) return

  const context = {}

  // SOLO INPUTS → nunca results
  fields.forEach(f => {
    context[f.key] = Number(f.value) || 0
  })



  const map = calculationMap.value || {}

  const computedResults = []

  const parts = String(formulaTemplate.value)
    .split(';')
    .map(p => p.replace(/;+$/, '').trim()) // 🔥 limpia ; al final
    .filter(p => p.length > 0)

  parts.forEach(line => {
    let [left, expr] = line.split('=')
    if (!left || !expr) return

    let [field, inlineLabel] = left.split('|')

    field = (field || '').trim()
    expr = (expr || '').trim()
    inlineLabel = inlineLabel ? inlineLabel.trim() : null
    console.log("works 2!")
    // reemplazo variables
    Object.keys(context).forEach(k => {
      expr = expr.replaceAll(`\$\{${k}\}`, context[k])
      console.log("expr: " + expr)
    })

    let value = 0
    try {
      value = Function(`"use strict"; return (${expr})`)()
    } catch (e) {
      console.warn('error formula:', expr)
    }

    const meta = map[field]



    computedResults.push({
      field,
      label: meta?.label || inlineLabel || field,
      value: Number(value) || 0,
      data_type: meta?.data_type || 5
    })
  })

  results.value = computedResults
}

function buildTranslateRows() {
  translateRows.value = []

  const raw = formulaTranslate.value
  if (!raw || typeof raw !== 'string') return

  translateRows.value = raw
    .replace(/;\s*\n/g, '\n') // 🔥 mueve/elimina ; antes del salto
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map((line, i) => ({
      id: i,
      text: line
    }))
}

/* ================================
   INIT / WATCH
================================ */

onMounted(async () => {
  loading.value = true

  await fetchFormula()
  buildTranslateRows()

  loading.value = false
})

watch(
  () => props.code,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return

    await fetchFormula()
    await fetchVariables()
    // calculateFormula()
    buildTranslateRows()
  }
)

watch(
  () => props.extraVariables,
  (newVars) => {
    if (!newVars) return

    fields.splice(0, fields.length) // 🔥 CLAVE

    Object.entries(newVars).forEach(([key, obj]) => {
      if (key === 'module_id') return

      fields.push({
        key,
        label: obj?.label || key,
        value: Number(obj?.value) || 0,
        data_type: obj?.data_type ?? null
      })
    })

    // calculateFormula()
  },
  { deep: true, immediate: true }
)

watch(formulaTranslate, () => {
  buildTranslateRows()
})

watch(
  () => props.calculationConfig,
  async (val) => {
    if (!val?.variablesEndpoint) return

    await fetchVariables()
    // calculateFormula()
  },
  { deep: true, immediate: true }
)

watch(
  [formulaTemplate, fields],
  () => {
    if (!formulaTemplate.value || !fields.length) return
    calculateFormula()
  },
  { deep: true, immediate: true }
)
</script>