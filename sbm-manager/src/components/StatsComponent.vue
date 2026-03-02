<template>
  <div class="card shadow-sm mb-4">
    <div class="card-body">

      <h6 class="fw-bold mb-3">
        {{ title }}
      </h6>

      <div v-if="!chartData1.length" class="text-muted text-center py-4">
        Sin datos históricos
      </div>

      <div v-else style="overflow-x:auto;">
        <div style="height:300px; min-width:700px; padding-left:40px;">
          <canvas ref="canvasRef"></canvas>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import 'chartjs-adapter-date-fns'

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  title: { type: String, default: 'Histórico de Precios' },
  x: { type: Object, required: true },   // { key, label }
  y: { type: Object, required: true },   // { key, label }
  values: { type: Array, default: () => [] },

  // ✅ opcional (2da línea)
  y2: { type: Object, default: null },     // { key, label }
  values2: { type: Array, default: () => [] }
})

const canvasRef = ref(null)
let chartInstance = null

const chartData1 = ref([])
const chartData2 = ref([])

/* =========================
   HELPERS
========================= */

function getBootstrapPrimary() {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--bs-primary')
    return (v || '').trim() || '#0d6efd'
  } catch {
    return '#0d6efd'
  }
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDateFloatingLabel(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike)
  if (Number.isNaN(d.getTime())) return '-'

  const hh = pad2(d.getHours())
  const mm = pad2(d.getMinutes())

  const datePart = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(d)

  const cap = datePart.charAt(0).toUpperCase() + datePart.slice(1)
  return `${hh}:${mm} hrs, ${cap}`
}

function buildSeries(valuesArr, yKey) {
  const arr = (valuesArr || [])
    .map(v => {
      const rawX = v?.[props.x.key]
      const dt = rawX ? new Date(rawX) : null
      return {
        x: dt && !Number.isNaN(dt.getTime()) ? dt : null,
        y: Number(v?.[yKey]),
        is_current: Boolean(v?.is_current),
        _raw: v
      }
    })
    .filter(p => p.x && Number.isFinite(p.y))
    .sort((a, b) => a.x - b.x)

  if (arr.length && !arr.some(p => p.is_current)) {
    arr[arr.length - 1].is_current = true
  }

  return arr
}

function findXBounds(...series) {
  const all = series.flat().filter(Boolean)
  if (!all.length) return { xMin: undefined, xMax: undefined }

  const first = all[0]?.x
  const last = all[all.length - 1]?.x

  const padMs = 60 * 1000
  const xMin = first ? new Date(first.getTime() - padMs) : undefined
  const xMax = last ? new Date(last.getTime() + padMs) : undefined
  return { xMin, xMax }
}

/* =========================
   BUILD DATA
========================= */

function buildData() {
  chartData1.value = buildSeries(props.values, props.y.key)

  if (props.y2 && props.y2.key && (props.values2 || []).length) {
    chartData2.value = buildSeries(props.values2, props.y2.key)
  } else {
    chartData2.value = []
  }
}

/* =========================
   RENDER
========================= */

function renderChart() {
  if (!canvasRef.value || !chartData1.value.length) return

  if (chartInstance) chartInstance.destroy()

  const primary = getBootstrapPrimary()
  const { xMin, xMax } = findXBounds(chartData1.value, chartData2.value)

  const datasets = [
    {
      label: props.y.label,
      data: chartData1.value,
      parsing: false,
      clip: false,
      borderColor: primary,
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBorderWidth: 2,
      pointBorderColor: '#ffffff',
      pointBackgroundColor: (ctx) => {
        const p = ctx?.raw
        return p?.is_current ? '#198754' : '#ffc107'
      },
      tension: 0.3
    }
  ]

  // ✅ 2da línea (roja) SOLO si viene y2/values2
  if (chartData2.value.length) {
    datasets.push({
      label: props.y2?.label || 'Costo',
      data: chartData2.value,
      parsing: false,
      clip: false,
      borderColor: '#dc3545',
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBorderWidth: 2,
      pointBorderColor: '#ffffff',
      pointBackgroundColor: (ctx) => {
        const p = ctx?.raw
        return p?.is_current ? '#198754' : '#ffc107'
      },
      tension: 0.3
    })
  }

  chartInstance = new Chart(canvasRef.value, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { left: 30, right: 20 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const it = items?.[0]
              const p = it?.raw
              return p?.x ? formatDateFloatingLabel(p.x) : ''
            },
            label: (item) => {
              const dsLabel = item?.dataset?.label || ''
              const p = item?.raw
              const val = Number(p?.y)
              if (!Number.isFinite(val)) return ''
              return `${dsLabel}: $${val.toLocaleString('es-CL')}`
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          offset: true,
          min: xMin,
          max: xMax,
          time: { tooltipFormat: 'PPpp' },
          ticks: { autoSkip: true, maxRotation: 0 },
          title: { display: true, text: props.x.label }
        },
        y: {
          title: { display: true, text: props.y.label }
        }
      }
    }
  })
}

/* =========================
   WATCHERS
========================= */

watch(
  () => [props.values, props.values2, props.y, props.y2],
  () => {
    buildData()
    renderChart()
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  buildData()
  renderChart()
})
</script>