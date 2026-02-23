<template>
    <div class="card border-0 shadow-sm mb-4">
  
      <!-- HEADER -->
      <div
        class="card-header d-flex justify-content-between align-items-center"
        :class="[headerBgClass, headerTextClass]"
      >
        <h6 class="mb-0 fw-bold d-flex align-items-center gap-2">
          <i :class="[icon, headerTextClass]"></i>
          <span>{{ title }}</span>
        </h6>
  
        <div class="text-end small">
          <span class="me-3">Count: <strong>{{ computedTotals.count }}</strong></span>
          <span class="me-3">SubTotal Neto: <strong>{{ formatPrice(computedTotals.sub_total_net) }}</strong></span>
          <span class="me-3">IVA: <strong>{{ formatPrice(computedTotals.sub_total_iva) }}</strong></span>
          <span>SubTotal Bruto: <strong>{{ formatPrice(computedTotals.sub_total_gross) }}</strong></span>
        </div>
      </div>
  
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm table-bordered align-middle mb-0">
  
            <thead class="text-center">
              <tr>
                <th style="min-width: 340px;">
                  <div class="position-relative">
                    <div class="input-group input-group-sm">
                      <input
                        v-model="searchText"
                        type="text"
                        class="form-control"
                        placeholder="Buscar..."
                        @input="onSearchInput"
                        @keydown.down.prevent="moveActive(1)"
                        @keydown.up.prevent="moveActive(-1)"
                        @keydown.enter.prevent="addSelected"
                        @keydown.esc.prevent="closeDropdown"
                        @blur="onBlur"
                      />
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        :disabled="!selectedItem"
                        @click="addSelected"
                      >
                        Agregar
                      </button>
                    </div>
  
                    <div
                      v-if="dropdownOpen"
                      class="list-group position-absolute w-100 shadow-sm"
                      style="z-index: 30; max-height: 240px; overflow:auto;"
                    >
                      <button
                        v-for="(it, i) in results"
                        :key="it.__k"
                        type="button"
                        class="list-group-item list-group-item-action text-start"
                        :class="{ active: i === activeIndex }"
                        @mousedown.prevent="selectItem(it, i)"
                      >
                        <div class="fw-semibold">{{ it[skuField] }}</div>
                        <div class="small opacity-75">{{ it[descField] }}</div>
                      </button>
  
                      <div v-if="loading" class="list-group-item small text-muted">
                        Buscando...
                      </div>
                      <div v-else-if="results.length === 0" class="list-group-item small text-muted">
                        Sin resultados
                      </div>
                    </div>
                  </div>
                </th>
  
                <th style="width: 110px;">Cantidad</th>
                <th style="width: 150px;">Neto</th>
                <th style="width: 150px;">IVA</th>
                <th style="width: 150px;">Bruto</th>
                <th style="width: 70px;">Acción</th>
              </tr>
            </thead>
  
            <tbody>
              <tr v-if="safeRows.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  No hay registros. Agrega el primero usando el buscador.
                </td>
              </tr>
  
              <tr v-for="row in safeRows" :key="row.__key">
                <td>
                  <div class="fw-semibold">
                    {{ row.item_sku }}
                    <span v-if="row.description" class="text-muted">
                      — {{ row.description }}
                    </span>
                  </div>
                  <div v-if="row.obs" class="small text-muted">
                    {{ row.obs }}
                  </div>
                </td>
  
                <td class="text-center">
                  <input
                    type="number"
                    min="1"
                    class="form-control form-control-sm text-center"
                    v-model.number="row.quantity"
                    @input="emitChange"
                  />
                </td>
  
                <td class="text-center">
                  <input
                    type="number"
                    class="form-control form-control-sm text-center"
                    v-model.number="row.net_amount"
                    @input="emitChange"
                  />
                </td>
  
                <td class="text-center">
                  <input
                    type="number"
                    class="form-control form-control-sm text-center"
                    v-model.number="row.iva_amount"
                    @input="emitChange"
                  />
                </td>
  
                <td class="text-center">
                  <input
                    type="number"
                    class="form-control form-control-sm text-center"
                    v-model.number="row.gross_amount"
                    @input="emitChange"
                  />
                </td>
  
                <td class="text-center">
                  <button
                    class="btn btn-outline-danger btn-sm"
                    @click="removeRow(row.__key)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
  
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { computed, ref, watch } from 'vue'
import axios from '../api/axios'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  title: { type: String, default: 'Tabla' },
  icon: { type: String, default: 'fas fa-table' },
  itemType: { type: String, required: true },
  searchBaseUrl: { type: String, required: true },
  headerBgClass: { type: String, default: 'bg-white' },
  headerTextClass: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const localRows = ref([])

/* NORMALIZACIÓN */
watch(
  () => props.modelValue,
  (v) => {
    if (!Array.isArray(v)) {
      localRows.value = []
      return
    }

    localRows.value = v.map((r, idx) => ({
      __key: r?.__key ?? r?.id ?? `row-${idx}`,
      id: r?.id ?? null,
      item_sku: r?.item_sku ?? '',
      quantity: Number(r?.quantity ?? 1),
      net_amount: Number(r?.net_amount ?? 0),
      iva_amount: Number(r?.iva_amount ?? 0),
      gross_amount: Number(r?.gross_amount ?? 0),
      description: r?.description ?? null,
      obs: r?.obs ?? null
    }))
  },
  { immediate: true }
)

const safeRows = computed(() =>
  localRows.value.filter(r => r && typeof r === 'object')
)

/* ================== AUTOCOMPLETE ================== */

const searchText = ref('')
const results = ref([])
const loading = ref(false)
const dropdownOpen = ref(false)
const selectedItem = ref(null)
const activeIndex = ref(-1)

const skuField = 'sku'
const descField = 'description'

let debounceTimer = null

function buildUrl(query) {
  const api = process.env.VUE_APP_API_URL.replace(/\/$/, '')
  const base = (props.searchBaseUrl || '').replace(/^\//, '')
  return `${api}/${base}?search=${encodeURIComponent(query)}`
}

function onSearchInput() {
  selectedItem.value = null
  activeIndex.value = -1

  if (!searchText.value || searchText.value.length < 2) {
    results.value = []
    dropdownOpen.value = false
    return
  }

  clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => {
    loading.value = true
    dropdownOpen.value = true

    try {
      const { data } = await axios.get(buildUrl(searchText.value))
      const list = data?.results ?? []
      results.value = list.map(r => ({
        ...r,
        __k: r.code || r.sku
      }))
    } catch {
      results.value = []
    } finally {
      loading.value = false
    }
  }, 300)
}

function selectItem(it, i) {
  selectedItem.value = it
  activeIndex.value = i
  searchText.value = `${it[skuField]} - ${it[descField]}`
}

function addSelected() {
  if (!selectedItem.value) return

  localRows.value.push({
    __key: selectedItem.value.code || selectedItem.value.sku,
    id: selectedItem.value.code || null,
    item_sku: selectedItem.value.sku,
    description: selectedItem.value.description,
    obs: selectedItem.value.obs,
    quantity: 1,
    net_amount: Number(selectedItem.value.net_amount ?? 0),
    iva_amount: 0,
    gross_amount: Number(selectedItem.value.net_amount ?? 0)
  })

  emitChange()

  searchText.value = ''
  results.value = []
  dropdownOpen.value = false
  selectedItem.value = null
  activeIndex.value = -1
}

function closeDropdown() {
  dropdownOpen.value = false
}

function onBlur() {
  setTimeout(() => dropdownOpen.value = false, 150)
}

function moveActive(step) {
  if (!results.value.length) return

  let i = activeIndex.value + step
  if (i < 0) i = results.value.length - 1
  if (i >= results.value.length) i = 0

  activeIndex.value = i
  selectedItem.value = results.value[i]
}

/* ================== TABLE ================== */

function emitChange() {
  emit('update:modelValue', safeRows.value)
}

function removeRow(key) {
  localRows.value = localRows.value.filter(r => r.__key !== key)
  emitChange()
}

const computedTotals = computed(() => {
  let count = 0
  let net = 0
  let iva = 0
  let gross = 0

  for (const r of safeRows.value) {
    count++
    net += r.net_amount * r.quantity
    iva += r.iva_amount * r.quantity
    gross += r.gross_amount * r.quantity
  }

  return {
    count,
    sub_total_net: net,
    sub_total_iva: iva,
    sub_total_gross: gross
  }
})

function formatPrice(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '-'
  return '$' + n.toLocaleString('es-CL')
}
</script>