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
  if (!props.formulaEndpoint) return

  try {
    const query = new URLSearchParams({
      [props.contextKey]: props.code
    })

    const response = await api.get(
      `${props.formulaEndpoint}?${query.toString()}`
    )

    // =========================
    // 1. NORMALIZAR RESPONSE
    // =========================
    let raw = response.data

    // si viene array, tomar primero
    if (Array.isArray(raw)) {
      raw = raw[0] || {}
    }

    // si viene path configurado
    if (props.formulaResponsePath && raw?.[props.formulaResponsePath]) {
      raw = raw[props.formulaResponsePath]
    }

    const data = raw || {}

    // =========================
    // 2. FORMULA TEXTOS
    // =========================
    formulaTemplate.value = data?.formula_template || null
    formulaTranslate.value = data?.formula_translate || null

    // =========================
    // 3. BUILD CALCULATION MAP
    // =========================
    const map = {}

    const details = data?.details || []

    if (Array.isArray(details)) {
      details.forEach(d => {
        const key = String(d.field || '').trim()
        if (!key) return

        map[key] = {
          label: String(d.label || key).trim(),
          data_type: Number(d.data_type) || 5
        }
      })
    }

    calculationMap.value = map

    // DEBUG (puedes borrar luego)
    console.log('FORMULA RAW:', response.data)
    console.log('FORMULA DATA:', data)
    console.log('CALC MAP:', map)

  } catch (e) {
    console.error('fetchFormula error:', e)
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
    const params = {
      code: props.code,
      ...(props.calculationConfig.variablesQueryParams || {})
    }

    const res = await api.get(props.calculationConfig.variablesEndpoint, { params })

    const data = res.data || []
    const merged = new Map()

    // =========================
    // BACKEND VARIABLES
    // =========================
    data.forEach(v => {
      merged.set(v.var, {
        key: v.var,
        label: v.label || v.var,
        value: Number(v.value) || 0,
        data_type: v.data_type ?? null
      })
    })

    // =========================
    // EXTRA VARIABLES (SIN module_id)
    // =========================
    Object.entries(props.extraVariables || {}).forEach(([key, obj]) => {
      if (key === 'module_id') return

      merged.set(key, {
        key,
        label: obj?.label || key,
        value: Number(obj?.value) || 0,
        data_type: obj?.data_type ?? null
      })
    })

    // =========================
    // 🔥 CLAVE: CLONAR OBJETOS (evita contaminación con results)
    // =========================
    const cleanFields = Array.from(merged.values()).map(f => ({
      key: f.key,
      label: f.label,
      value: f.value,
      data_type: f.data_type
    }))

    fields.splice(0, fields.length, ...cleanFields)

  } catch (e) {
    console.error('fetchVariables error:', e)
  } finally {
    loading.value = false
  }
}



/* ================================
   CALCULATION
================================ */



function calculateFormula() {
  if (!formulaTemplate.value) return

  loading.value = true

  // 🔥 SIEMPRE array nuevo
  const computedResults = []

  // =========================
  // 1. CONTEXTO (CLONADO)
  // =========================
  const context = {}
  fields.forEach(f => {
    context[f.key] = Number(f.value) || 0
  })

  // =========================
  // 2. MAP BACKEND (CLONADO)
  // =========================
  const map = {}
  Object.entries(calculationMap.value || {}).forEach(([key, val]) => {
    const cleanKey = (key || '').trim()
    map[cleanKey] = {
      label: val?.label || cleanKey,
      data_type: Number(val?.data_type) || 5
    }
  })

  // =========================
  // 3. PARSE FORMULA
  // =========================
  const parts = String(formulaTemplate.value)
    .split(';')
    .map(p => p.trim())
    .filter(Boolean)

  // =========================
  // 4. LOOP
  // =========================
  parts.forEach(p => {
    let [left, expr] = p.split('=')
    if (!left || !expr) return

    let [fieldRaw, inlineLabel] = left.split('|')

    const field = (fieldRaw || '').trim().replace(/\n/g, '')
    expr = (expr || '').trim()
    inlineLabel = inlineLabel ? inlineLabel.trim() : null

    // =========================
    // 5. REEMPLAZO VARIABLES
    // =========================
    Object.keys(context).forEach(key => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g')
      expr = expr.replace(regex, String(context[key]))
    })

    // =========================
    // 6. EVAL
    // =========================
    let value = 0
    try {
      value = Function(`"use strict"; return (${expr})`)()
    } catch (e) {
      console.warn('formula error:', expr, e)
    }

    // =========================
    // 7. LABEL + TYPE (SIN TOCAR fields)
    // =========================
    const meta = map[field]

    const finalLabel =
      meta?.label ||
      inlineLabel ||
      field

    const data_type =
      meta?.data_type ??
      5

    // =========================
    // 8. PUSH (OBJETO NUEVO)
    // =========================
    computedResults.push({
      field: String(field),
      label: String(finalLabel),
      value: Number(value) || 0,
      data_type: Number(data_type)
    })
  })

  // 🔥 CLAVE: REASIGNACIÓN LIMPIA
  results.value = computedResults.map(r => ({ ...r }))

  loading.value = false
}

function buildTranslateRows() {
  translateRows.value = []

  const raw = formulaTranslate.value

  if (!raw || typeof raw !== 'string') return

  const parts = raw
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
  loading.value = true

  await fetchFormula()      // trae template + translate + calculationMap
  buildTranslateRows()      // usa formulaTranslate ya cargado

  await fetchVariables()    // llena fields

  // 🔥 recién ahora tienes TODO listo
  calculateFormula()

  loading.value = false
})

watch(
  () => props.code,
  async (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return

    await fetchFormula()
    await fetchVariables()
    calculateFormula()
    buildTranslateRows()
  }
)

watch(
  () => props.extraVariables,
  (newVars) => {
    if (!newVars) return

    Object.entries(newVars).forEach(([key, obj]) => {

      if (key === 'module_id') return

      const existing = fields.find(f => f.key === key)

      if (existing) {
        existing.value = Number(obj?.value) || 0
        existing.data_type = obj?.data_type ?? existing.data_type
      } else {
        fields.push({
          key,
          label: obj?.label || key,
          value: Number(obj?.value) || 0,
          data_type: obj?.data_type ?? null
        })
      }
    })

    calculateFormula()
  },
  { deep: true, immediate: true }
)

watch(formulaTranslate, () => {
  buildTranslateRows()
})
</script>