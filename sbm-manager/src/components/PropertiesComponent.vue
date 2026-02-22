<template>
  <div class="properties-container">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="properties-title mb-0">
        {{ computedTitle }}
      </h3>
      <button @click="$emit('close')" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
        <i class="fas fa-arrow-left me-1"></i> Volver
      </button>
    </div>

    <!-- 1️⃣ INFORMACIÓN GENERAL -->
    <div class="mb-5">
      <div class="row g-3">
        <div v-for="field in visibleFields" :key="field.key" class="col-12 col-md-6">
          <label class="form-label fw-semibold">
            {{ resolveLabel(field.key) }}
          </label>

          <div v-if="typeof product?.[field.key] === 'boolean'" class="form-control bg-light d-flex align-items-center">
            <i v-if="product[field.key]" class="fas fa-check text-success"></i>
            <i v-else class="fas fa-times text-danger"></i>
          </div>

          <div v-else-if="isCloudinary(product?.[field.key])" class="form-control bg-light text-center">
            <img :src="product[field.key]" style="max-height:120px; object-fit:contain;" />
          </div>

          <div v-else-if="field.type === 'pill_name' && product?.[field.key]" class="form-control bg-light">
            <span class="badge rounded-pill text-white" :class="getPillClass(field, product[field.key])">
              {{ String(product[field.key]).toUpperCase() }}
            </span>
          </div>

          <input
            v-else-if="field.type === 'price'"
            type="text"
            class="form-control bg-light"
            :value="formatPrice(product?.[field.key])"
            disabled
          />

          <textarea
            v-else-if="field.type === 'textarea'"
            class="form-control bg-light"
            :value="product?.[field.key] || '-'"
            rows="3"
            disabled
          />

          <input
            v-else
            type="text"
            class="form-control bg-light"
            :value="formatValue(product?.[field.key])"
            disabled
          />
        </div>
      </div>
    </div>

    <!-- 2️⃣ AVANZADO -->
    <div class="mb-5">
      <div
        class="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 text-secondary"
        style="cursor:pointer;"
        @click="toggleAdvanced"
      >
        <h5 class="fw-bold mb-0 d-flex align-items-center">
          <i class="fas fa-cog me-2"></i>
          Avanzado
        </h5>

        <i class="fas transition-icon" :class="showAdvanced ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </div>

      <transition name="slide-fade">
        <div v-if="showAdvanced">
          <div class="row g-3">
            <div v-for="(value, key) in safeAdvancedData" :key="key" class="col-12 col-md-6">
              <label class="form-label fw-semibold">
                {{ formatLabel(key) }}
              </label>

              <input type="text" class="form-control bg-light" :value="formatValue(value)" disabled />
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 3️⃣ CONFIGURACIÓN -->
    <div class="mb-5">
      <h5 class="fw-bold border-bottom pb-2 mb-3 text-success">
        Configuración
      </h5>

      <!-- LOADING / ERROR -->
      <div v-if="configLoading" class="text-center py-4">
        <div class="spinner-border text-success" role="status"></div>
      </div>

      <div v-else-if="configError" class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ configError }}
      </div>

      <div v-else-if="!configData" class="alert alert-secondary">
        No hay configuración disponible.
      </div>

      <div v-else>
        <!-- 3.1 INFORMATIVE -->
        <div class="mb-4">
          <div class="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 text-secondary">
            <h6 class="fw-bold mb-0 d-flex align-items-center">
              <i class="fas fa-info-circle me-2"></i>
              Informativa
            </h6>
          </div>

          <div class="row g-3">
            <div v-for="f in informativaFields" :key="f.key" class="col-12 col-md-6">
              <label class="form-label fw-semibold">
                {{ f.label || formatLabel(f.key) }}
              </label>

              <div v-if="typeof f.value === 'boolean'" class="form-control bg-light d-flex align-items-center">
                <i v-if="f.value" class="fas fa-check text-success"></i>
                <i v-else class="fas fa-times text-danger"></i>
              </div>

              <input
                v-else-if="f.type === 'price'"
                type="text"
                class="form-control bg-light"
                :value="formatPrice(f.value)"
                disabled
              />

              <input
                v-else
                type="text"
                class="form-control bg-light"
                :value="formatValue(f.value)"
                disabled
              />
            </div>
          </div>
        </div>

        <!-- 3.2 CALCULATION -->
        <div class="mb-4">
          <div class="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 text-secondary">
            <h6 class="fw-bold mb-0 d-flex align-items-center">
              <i class="fas fa-calculator me-2"></i>
              Cálculo
            </h6>
          </div>

          <div v-if="safeCalculationProps">
            <CalculationComponent v-bind="safeCalculationProps" />
          </div>

          <div v-else class="alert alert-secondary">
            No hay configuración de cálculo disponible.
          </div>
        </div>

        <!-- 3.3 LINKING -->
        <div class="mb-2">
          <div class="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 text-secondary">
            <h6 class="fw-bold mb-0 d-flex align-items-center">
              <i class="fas fa-link me-2"></i>
              Vinculación
            </h6>
          </div>

          <div class="alert alert-secondary" v-if="!safeLinking">
            No hay datos de vinculación.
          </div>

          <div v-else>
            <!-- CABECERA + TOTALES + ACCIONES -->
            <div class="mb-3">
              <div class="row g-2">
                <div class="col-12 col-md-4" v-if="safeLinking?.header">
                  <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                      <div class="fw-semibold text-muted mb-2">Cabecera</div>

                      <div class="small text-muted">
                        Item Configuration (code):
                        <strong>{{ safeLinking.header.item_configuration_code || '-' }}</strong>
                      </div>
                      <div class="small text-muted">
                        Item Configuration (configuration):
                        <strong>{{ safeLinking.header.item_configuration_name || '-' }}</strong>
                      </div>
                      <div class="small text-muted">
                        Valor Neto Base:
                        <strong>{{ formatPrice(safeLinking.header.base_net_amount) }}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-4" v-if="safeLinking?.totals">
                  <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                      <div class="fw-semibold text-muted mb-2">Totales</div>
                      <div class="small text-muted">
                        Count: <strong>{{ safeLinking.totals.count ?? 0 }}</strong>
                      </div>
                      <div class="small text-muted">
                        Subtotal Neto: <strong>{{ formatPrice(safeLinking.totals.sub_total_net) }}</strong>
                      </div>
                      <div class="small text-muted">
                        IVA: <strong>{{ formatPrice(safeLinking.totals.sub_total_iva) }}</strong>
                      </div>
                      <div class="small text-muted">
                        Subtotal Bruto: <strong>{{ formatPrice(safeLinking.totals.sub_total_gross) }}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-4 d-flex">
                  <div class="card h-100 border-0 shadow-sm w-100">
                    <div class="card-body d-flex flex-column justify-content-between">
                      <div class="fw-semibold text-muted mb-2">Acciones</div>

                      <div class="d-flex justify-content-end gap-2 mt-auto">
                        <button
                          type="button"
                          class="btn btn-outline-secondary btn-sm rounded-pill px-4"
                          @click="resetLinkingEdits"
                          :disabled="saving || !linkDirty"
                        >
                          Cancelar
                        </button>

                        <button
                          type="button"
                          class="btn btn-success btn-sm rounded-pill px-4"
                          @click="saveConfiguration"
                          :disabled="saving || !linkDirty"
                        >
                          <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'" class="me-2"></i>
                          {{ saving ? 'Guardando...' : 'Guardar información' }}
                        </button>
                      </div>
                      <div v-if="linkDirty" class="small text-warning mt-2">
                        <i class="fas fa-exclamation-circle me-1"></i> Cambios pendientes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TABLAS (si vienen vacías, igual se muestran para agregar el primer item) -->
            <ConfigLinkTableComponent
              title="Productos"
              itemType="product"
              lookupEndpoint="/products/lookup/"
              searchBaseUrl=""
              :rows="productLinks"
              :totals="safeLinking?.products?.totals || null"
              @rows-changed="onRowsChanged('product', $event)"
            />

            <ConfigLinkTableComponent
              title="Materiales"
              itemType="material"
              lookupEndpoint="/materials/lookup/"
              searchBaseUrl=""
              :rows="materialLinks"
              :totals="safeLinking?.materials?.totals || null"
              @rows-changed="onRowsChanged('material', $event)"
            />

            <ConfigLinkTableComponent
              title="Servicios"
              itemType="service"
              lookupEndpoint="/services/lookup/"
              searchBaseUrl=""
              :rows="serviceLinks"
              :totals="safeLinking?.services?.totals || null"
              @rows-changed="onRowsChanged('service', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import axios from '../api/axios';
import ConfigLinkTableComponent from './ConfigLinkTableComponent.vue';
import CalculationComponent from './CalculationComponent.vue';

const props = defineProps({
  product: { type: Object, default: null },
  advancedData: { type: Object, default: null },
  configurationData: { type: Object, default: null },
  fields: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'load-advanced']);

const showAdvanced = ref(false);
const advancedLoaded = ref(false);

const configData = ref(null);
const configLoading = ref(false);
const configError = ref(null);

const productLinks = ref([]);
const materialLinks = ref([]);
const serviceLinks = ref([]);

const originalLinkingSnapshot = ref({
  productLinks: [],
  materialLinks: [],
  serviceLinks: [],
});

const saving = ref(false);
const linkDirty = ref(false);

function toggleAdvanced() {
  showAdvanced.value = !showAdvanced.value;

  if (showAdvanced.value && !advancedLoaded.value) {
    advancedLoaded.value = true;
    emit('load-advanced');
  }
}

const safeAdvancedData = computed(() => {
  if (!props.advancedData || typeof props.advancedData !== 'object') return {};
  return props.advancedData;
});

const computedTitle = computed(() => {
  if (!props.product) return '';
  if (props.product?.sku) {
    return props.product.description
      ? `${props.product.sku} - ${props.product.description}`
      : props.product.sku;
  }
  return '';
});

const visibleFields = computed(() => {
  if (!props.fields || !props.product) return [];
  return props.fields.filter(f =>
    props.product.hasOwnProperty(f.key) &&
    props.product[f.key] !== undefined &&
    !f.hideInGrid
  );
});

function resolveLabel(key) {
  const field = props.fields?.find(f => f.key === key);
  if (field?.label) return field.label;
  return formatLabel(key);
}

function formatLabel(key) {
  const k = key === null || key === undefined ? '' : String(key);
  if (!k) return '-';

  return k
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function formatValue(val) {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'boolean') return val ? 'SI' : 'NO';
  if (typeof val === 'number') return val.toLocaleString('es-CL');
  return val;
}

function formatPrice(val) {
  if (val === null || val === undefined || isNaN(val)) return '-';
  return '$' + Number(val).toLocaleString('es-CL');
}

function isCloudinary(val) {
  return typeof val === 'string' && val.startsWith('https://res.cloudinary.com');
}

function getPillClass(field, value) {
  if (!field?.pillMap || !value) return 'bg-secondary';

  const valueStr = String(value).toLowerCase();
  const mappedKey = Object.keys(field.pillMap).find(k => k.toLowerCase() === valueStr);

  return mappedKey ? field.pillMap[mappedKey] : 'bg-dark';
}

async function loadConfiguration() {
  if (!props.product?.sku) return;

  configLoading.value = true;
  configError.value = null;

  try {
    const res = await axios.get(`/catalogs/${props.product.sku}/config/`);
    configData.value = res.data;

    const pl = res.data?.linking?.products?.rows || [];
    const ml = res.data?.linking?.materials?.rows || [];
    const sl = res.data?.linking?.services?.rows || [];

    productLinks.value = Array.isArray(pl) ? pl.map(normalizeRow) : [];
    materialLinks.value = Array.isArray(ml) ? ml.map(normalizeRow) : [];
    serviceLinks.value = Array.isArray(sl) ? sl.map(normalizeRow) : [];

    takeSnapshot();
    linkDirty.value = false;

  } catch (e) {
    configError.value = e.response?.data?.detail || 'Error cargando configuración';
  } finally {
    configLoading.value = false;
  }
}

function normalizeRow(r) {
  return {
    id: r?.id ?? null,
    item_type: r?.item_type ?? null,
    item_sku: r?.item_sku ?? '',
    quantity: r?.quantity ?? 1,
    net_amount: r?.net_amount ?? 0,
    gross_amount: r?.gross_amount ?? 0,
    iva_amount: r?.iva_amount ?? 0,
    description: r?.description ?? null,
    obs: r?.obs ?? null,
    is_deleted: r?.is_deleted ?? false,
  };
}

function takeSnapshot() {
  originalLinkingSnapshot.value = {
    productLinks: productLinks.value.map(r => ({ ...r })),
    materialLinks: materialLinks.value.map(r => ({ ...r })),
    serviceLinks: serviceLinks.value.map(r => ({ ...r })),
  };
}

watch(
  () => props.product?.sku,
  (newSku) => {
    if (newSku) loadConfiguration();
    else configData.value = null;
  },
  { immediate: true }
);

const informativaFields = computed(() => {
  const fields = configData.value?.informativa?.fields;
  if (!Array.isArray(fields)) return [];
  return fields;
});

const safeCalculationProps = computed(() => {
  const p = configData.value?.calculation?.props;
  if (!p || typeof p !== 'object') return null;
  return p;
});

const safeLinking = computed(() => {
  const l = configData.value?.linking;
  if (!l || typeof l !== 'object') return null;
  return l;
});

function onRowsChanged(type, rows) {
  const clean = Array.isArray(rows) ? rows.map(normalizeRow) : [];
  if (type === 'product') productLinks.value = clean;
  if (type === 'material') materialLinks.value = clean;
  if (type === 'service') serviceLinks.value = clean;
  linkDirty.value = true;
}

function resetLinkingEdits() {
  productLinks.value = (originalLinkingSnapshot.value.productLinks || []).map(r => ({ ...r }));
  materialLinks.value = (originalLinkingSnapshot.value.materialLinks || []).map(r => ({ ...r }));
  serviceLinks.value = (originalLinkingSnapshot.value.serviceLinks || []).map(r => ({ ...r }));
  linkDirty.value = false;
}

async function saveConfiguration() {
  if (!props.product?.sku) return;

  saving.value = true;
  try {
    const links = [
      ...productLinks.value,
      ...materialLinks.value,
      ...serviceLinks.value,
    ]
      .filter(r => r?.item_sku && r?.item_type)
      .map(r => ({
        item_type: (r.item_type || '').toString().trim().toLowerCase(),
        item_sku: (r.item_sku || '').toString().trim(),
        quantity: r.quantity ?? 1,
        net_amount: r.net_amount ?? 0,
        gross_amount: r.gross_amount ?? 0,
        iva_amount: r.iva_amount ?? 0,
      }));

    await axios.post(`/catalogs/${props.product.sku}/config/`, { links });

    await loadConfiguration();
    linkDirty.value = false;

  } catch (e) {
    alert(e.response?.data?.detail || 'Error guardando configuración');
  } finally {
    saving.value = false;
  }
}
</script>