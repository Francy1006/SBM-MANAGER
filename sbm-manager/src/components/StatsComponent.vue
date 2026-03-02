<template>
  <div class="card shadow-sm mb-4">
    <div class="card-body">

      <h6 class="fw-bold mb-3">
        {{ title }}
      </h6>

      <div v-if="!chartData.length" class="text-muted text-center py-4">
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

// ✅ NECESARIO para que funcione TimeScale (evita "time is not a registered scale")
// npm i chartjs-adapter-date-fns
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
  values: { type: Array, default: () => [] } // [{ created_at, base_net_amount, is_current? }]
})

const canvasRef = ref(null)
let chartInstance = null
const chartData = ref([])

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

  // "Lunes 31 de Marzo 2026"
  const datePart = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(d)

  // Capitalizar primera letra (Intl entrega "lunes...")
  const cap = datePart.charAt(0).toUpperCase() + datePart.slice(1)

  return `${hh}:${mm} hrs, ${cap}`
}

/* =========================
   BUILD DATA
========================= */

function buildData() {
  chartData.value = (props.values || [])
    .map(v => {
      const rawX = v?.[props.x.key]
      const dt = rawX ? new Date(rawX) : null
      return {
        // ✅ TimeScale necesita Date (o timestamp)
        x: dt && !Number.isNaN(dt.getTime()) ? dt : null,
        y: Number(v?.[props.y.key]),
        // ✅ si backend no lo trae, inferimos "actual" como el último por fecha
        is_current: Boolean(v?.is_current),
        _raw: v
      }
    })
    .filter(p => p.x && Number.isFinite(p.y))
    .sort((a, b) => a.x - b.x)

  // Si no viene is_current, marcamos el último como actual
  if (chartData.value.length && !chartData.value.some(p => p.is_current)) {
    chartData.value[chartData.value.length - 1].is_current = true
  }
}

/* =========================
   RENDER
========================= */

function renderChart() {
  if (!canvasRef.value || !chartData.value.length) return

  if (chartInstance) chartInstance.destroy()

  const primary = getBootstrapPrimary()

  const firstX = chartData.value[0]?.x
  const lastX = chartData.value[chartData.value.length - 1]?.x
  const padMs = 60 * 1000 // 1 minuto (puedes subir a 5*60*1000)

  const xMin = firstX ? new Date(firstX.getTime() - padMs) : undefined
  const xMax = lastX ? new Date(lastX.getTime() + padMs) : undefined

  chartInstance = new Chart(canvasRef.value, {
    type: 'line',
    data: {
      datasets: [
        {
          label: props.y.label,
          data: chartData.value,
          parsing: false,
          clip: false,

          // ✅ línea primary
          borderColor: primary,
          borderWidth: 2,

          // ✅ puntos: amarillo histórico, verde actual
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
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      layout: {
        padding: {
          left: 30,
          right: 20
        }
      },

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
              const p = item?.raw
              const val = Number(p?.y)
              if (!Number.isFinite(val)) return ''
              return `${props.y.label}: $${val.toLocaleString('es-CL')}`
            }
          }
        }
      },

      scales: {
        x: {
          type: 'time',
          offset: true,   // 🔥 separa el primer punto del borde
          min: xMin,
          max: xMax,
          time: {
            tooltipFormat: 'PPpp'
          },
          ticks: {
            autoSkip: true,
            maxRotation: 0
          },
          title: {
            display: true,
            text: props.x.label
          }
        },
        y: {
          title: {
            display: true,
            text: props.y.label
          }
        }
      }
    }
  })
}

/* =========================
   WATCHERS
========================= */

watch(
  () => props.values,
  () => {
    buildData()
    renderChart()
  },
  { immediate: true }
)

onMounted(() => {
  buildData()
  renderChart()
})
</script>