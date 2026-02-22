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
                <th style="min-width: 340px;">Buscar y agregar</th>
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
  
  const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    title: { type: String, default: 'Tabla' },
    icon: { type: String, default: 'fas fa-table' },
    itemType: { type: String, required: true },
    headerBgClass: { type: String, default: 'bg-white' },
    headerTextClass: { type: String, default: '' }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const localRows = ref([])
  
  /* 🔒 Normalización estricta */
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
  
  /* 🔒 Nunca usar localRows directo en template */
  const safeRows = computed(() =>
    localRows.value.filter(r => r && typeof r === 'object')
  )
  
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