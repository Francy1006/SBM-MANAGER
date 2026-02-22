<template>
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <!-- HEADER -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0 fw-bold d-flex align-items-center gap-2">
            <i :class="iconClass"></i>
            <span>{{ title }}</span>
          </h6>
  
          <div class="text-end small text-muted">
            <span class="me-3">Count: <strong>{{ computedTotals.count }}</strong></span>
            <span class="me-3">SubTotal Neto: <strong>{{ formatPrice(computedTotals.sub_total_net) }}</strong></span>
            <span class="me-3">IVA: <strong>{{ formatPrice(computedTotals.sub_total_iva) }}</strong></span>
            <span>SubTotal Bruto: <strong>{{ formatPrice(computedTotals.sub_total_gross) }}</strong></span>
          </div>
        </div>
  
        <!-- TABLE -->
        <div class="table-responsive">
          <table class="table table-sm table-bordered align-middle mb-0">
            <thead class="table-light">
              <tr class="text-center">
                <th style="min-width: 340px;">Buscar y agregar</th>
                <th style="width: 110px;">Cantidad</th>
                <th style="width: 150px;">Neto</th>
                <th style="width: 150px;">IVA</th>
                <th style="width: 150px;">Bruto</th>
                <th style="width: 70px;">Acción</th>
              </tr>
            </thead>
  
            <tbody>
              <tr v-if="localRows.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  No hay registros. Agrega el primero usando el buscador.
                </td>
              </tr>
  
              <tr v-for="row in localRows" :key="row.__key">
                <td>
                  <div class="fw-semibold">
                    {{ row.item_sku }}
                    <span v-if="row.description" class="text-muted">— {{ row.description }}</span>
                  </div>
                  <div v-if="row.obs" class="small text-muted">{{ row.obs }}</div>
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
                  <button class="btn btn-outline-danger btn-sm" @click="removeRow(row.__key)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
  
              <!-- ADD ROW -->
              <tr>
                <td class="position-relative">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-white">
                      <i class="fas fa-search text-muted"></i>
                    </span>
  
                    <input
                      type="text"
                      class="form-control"
                      :placeholder="placeholderText"
                      v-model="searchTerm"
                      @input="debouncedSearch"
                      @focus="onFocus"
                      @blur="onBlur"
                      @keydown.down.prevent="moveActive(1)"
                      @keydown.up.prevent="moveActive(-1)"
                      @keydown.enter.prevent="selectActive()"
                    />
  
                    <button class="btn btn-outline-secondary" type="button" @click="clearSearch">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
  
                  <div
                    v-if="showDropdown"
                    class="list-group position-absolute w-100 shadow-sm"
                    style="z-index: 50; max-height: 260px; overflow: auto;"
                  >
                    <div v-if="searchLoading" class="list-group-item text-muted small">
                      <i class="fas fa-spinner fa-spin me-2"></i>Buscando...
                    </div>
  
                    <button
                      v-for="(item, idx) in searchResults"
                      :key="(item.sku || item.code || idx) + '-' + idx"
                      type="button"
                      class="list-group-item list-group-item-action"
                      :class="idx === activeIndex ? 'active' : ''"
                      @mousedown.prevent="selectItem(item)"
                      @mouseenter="activeIndex = idx"
                    >
                      <div class="fw-semibold">
                        {{ item.sku }}
                        <span class="text-muted">— {{ item.description || '-' }}</span>
                      </div>
                      <div v-if="item.obs" class="small text-muted">{{ item.obs }}</div>
                    </button>
  
                    <div
                      v-if="!searchLoading && searchTerm.trim() && searchResults.length === 0"
                      class="list-group-item text-muted small"
                    >
                      Sin resultados.
                    </div>
                  </div>
                </td>
  
                <td class="text-center">
                  <input type="number" min="1" class="form-control form-control-sm text-center" v-model.number="draft.quantity" />
                </td>
  
                <td class="text-center">
                  <input type="number" class="form-control form-control-sm text-center" v-model.number="draft.net_amount" />
                </td>
  
                <td class="text-center">
                  <input type="number" class="form-control form-control-sm text-center" v-model.number="draft.iva_amount" />
                </td>
  
                <td class="text-center">
                  <input type="number" class="form-control form-control-sm text-center" v-model.number="draft.gross_amount" />
                </td>
  
                <td class="text-center">
                  <button class="btn btn-success btn-sm" @click="addDraftIfSelected" :disabled="!draft.item_sku">
                    <i class="fas fa-plus"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div class="small text-muted mt-2">
          Tip: escribe SKU o descripción y selecciona con click o Enter.
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, reactive, ref, watch } from 'vue';
  import api from '../api/axios';
  
  const props = defineProps({
    modelValue: { type: Array, default: () => [] }, // v-model
    title: { type: String, default: 'Tabla' },
    icon: { type: String, default: 'fas fa-table' },
    itemType: { type: String, required: true }, // 'product' | 'material' | 'service'
    placeholder: { type: String, default: '' },
  
    // ✅ para evitar warnings: NO requerido
    searchBaseUrl: { type: String, default: '' },   // ej: '/products/?search='
    lookupEndpoint: { type: String, default: '' },  // ej: '/products/lookup/' con params {q, limit}
  
    // opcionales desde backend
    items: { type: Array, default: () => [] },
    subtotals: { type: Object, default: null },
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const localRows = ref([]);
  const searchTerm = ref('');
  const searchResults = ref([]);
  const searchLoading = ref(false);
  const showDropdown = ref(false);
  const activeIndex = ref(0);
  let timeoutId = null;
  let blurTimeoutId = null;
  
  const iconClass = computed(() => props.icon || 'fas fa-table');
  
  const placeholderText = computed(() => {
    if (props.placeholder) return props.placeholder;
    const t = props.itemType === 'product' ? 'producto' : (props.itemType === 'material' ? 'material' : 'servicio');
    return `Buscar ${t} por SKU o descripción...`;
  });
  
  const draft = reactive({
    item_type: props.itemType,
    item_sku: '',
    description: null,
    obs: null,
    quantity: 1,
    net_amount: null,
    iva_amount: null,
    gross_amount: null,
  });
  
  function normalizeIncomingRows(inRows) {
    const safe = Array.isArray(inRows) ? inRows : [];
    localRows.value = safe.map((r, idx) => ({
      __key: r.__key ?? r.id ?? `${props.itemType}-${r.item_sku}-${idx}-${Math.random().toString(16).slice(2)}`,
      id: r.id ?? null,
      item_type: props.itemType,
      item_sku: r.item_sku,
      quantity: Number(r.quantity ?? 1),
      net_amount: r.net_amount ?? null,
      iva_amount: r.iva_amount ?? null,
      gross_amount: r.gross_amount ?? null,
      description: r.description ?? null,
      obs: r.obs ?? null,
      is_deleted: r.is_deleted ?? false,
    }));
  }
  
  watch(
    () => props.modelValue,
    (v) => normalizeIncomingRows(v),
    { immediate: true, deep: true }
  );
  
  function emitChange() {
    const payload = localRows.value.map(r => ({
      id: r.id,
      item_type: props.itemType,
      item_sku: r.item_sku,
      quantity: r.quantity,
      net_amount: r.net_amount,
      iva_amount: r.iva_amount,
      gross_amount: r.gross_amount,
      description: r.description ?? null,
      obs: r.obs ?? null,
      is_deleted: r.is_deleted ?? false,
    }));
    emit('update:modelValue', payload);
  }
  
  function removeRow(key) {
    localRows.value = localRows.value.filter(r => r.__key !== key);
    emitChange();
  }
  
  function clearSearch() {
    searchTerm.value = '';
    searchResults.value = [];
    showDropdown.value = false;
    activeIndex.value = 0;
  
    draft.item_sku = '';
    draft.description = null;
    draft.obs = null;
  }
  
  function onFocus() {
    if (blurTimeoutId) clearTimeout(blurTimeoutId);
    if (searchResults.value.length > 0) showDropdown.value = true;
  }
  
  function onBlur() {
    if (blurTimeoutId) clearTimeout(blurTimeoutId);
    blurTimeoutId = setTimeout(() => {
      showDropdown.value = false;
    }, 150);
  }
  
  function debouncedSearch() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => searchLookup(), 350);
  }
  
  async function searchLookup() {
    const q = (searchTerm.value || '').trim();
  
    draft.item_sku = '';
    draft.description = null;
    draft.obs = null;
  
    if (!q) {
      searchResults.value = [];
      showDropdown.value = false;
      return;
    }
  
    searchLoading.value = true;
    showDropdown.value = true;
  
    try {
      let res;
  
      // 1) prefer lookupEndpoint (?q=)
      if (props.lookupEndpoint) {
        res = await api.get(props.lookupEndpoint, { params: { q, limit: 10 } });
        const items = res.data?.results;
        searchResults.value = Array.isArray(items) ? items : [];
      }
      // 2) fallback searchBaseUrl (concatenado)
      else if (props.searchBaseUrl) {
        res = await api.get(`${props.searchBaseUrl}${encodeURIComponent(q)}`);
        const items = res.data?.results ?? res.data;
        searchResults.value = Array.isArray(items) ? items : [];
      } else {
        searchResults.value = [];
      }
  
      activeIndex.value = 0;
    } catch (e) {
      searchResults.value = [];
    } finally {
      searchLoading.value = false;
    }
  }
  
  function moveActive(delta) {
    if (!showDropdown.value || searchResults.value.length === 0) return;
    const n = searchResults.value.length;
    activeIndex.value = (activeIndex.value + delta + n) % n;
  }
  
  function selectActive() {
    if (!showDropdown.value || searchResults.value.length === 0) return;
    selectItem(searchResults.value[activeIndex.value]);
  }
  
  function selectItem(item) {
    draft.item_sku = item.sku;
    draft.description = item.description ?? null;
    draft.obs = item.obs ?? null;
    showDropdown.value = false;
  }
  
  function addDraftIfSelected() {
    if (!draft.item_sku) return;
  
    const exists = localRows.value.some(r => String(r.item_sku) === String(draft.item_sku));
    if (exists) {
      clearSearch();
      return;
    }
  
    localRows.value.push({
      __key: `${props.itemType}-${draft.item_sku}-${Date.now()}`,
      id: null,
      item_type: props.itemType,
      item_sku: draft.item_sku,
      quantity: Number(draft.quantity ?? 1),
      net_amount: draft.net_amount,
      iva_amount: draft.iva_amount,
      gross_amount: draft.gross_amount,
      description: draft.description,
      obs: draft.obs,
      is_deleted: false,
    });
  
    emitChange();
    clearSearch();
  
    draft.quantity = 1;
    draft.net_amount = null;
    draft.iva_amount = null;
    draft.gross_amount = null;
  }
  
  const computedTotals = computed(() => {
    if (props.subtotals && typeof props.subtotals === 'object') {
      return {
        count: Number(props.subtotals.count ?? 0),
        sub_total_net: Number(props.subtotals.sub_total_net ?? 0),
        sub_total_iva: Number(props.subtotals.sub_total_iva ?? 0),
        sub_total_gross: Number(props.subtotals.sub_total_gross ?? 0),
      };
    }
  
    const safeNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
  
    let count = 0;
    let sub_total_net = 0;
    let sub_total_iva = 0;
    let sub_total_gross = 0;
  
    for (const r of localRows.value) {
      count += 1;
      const q = safeNum(r.quantity || 1);
      sub_total_net += safeNum(r.net_amount) * q;
      sub_total_iva += safeNum(r.iva_amount) * q;
      sub_total_gross += safeNum(r.gross_amount) * q;
    }
  
    return { count, sub_total_net, sub_total_iva, sub_total_gross };
  });
  
  function formatPrice(val) {
    const n = Number(val);
    if (!Number.isFinite(n)) return '-';
    return '$' + n.toLocaleString('es-CL');
  }
  </script>