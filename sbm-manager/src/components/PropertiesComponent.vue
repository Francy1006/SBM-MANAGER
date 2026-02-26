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

          <input v-else-if="field.type === 'price'" type="text" class="form-control bg-light"
            :value="formatPrice(product?.[field.key])" disabled />

          <textarea v-else-if="field.type === 'textarea'" class="form-control bg-light"
            :value="product?.[field.key] || '-'" rows="3" disabled />

          <input v-else type="text" class="form-control bg-light" :value="formatValue(product?.[field.key])" disabled />
        </div>
      </div>
    </div>

    <!-- 2️⃣ AVANZADO -->
    <div class="mb-5">
      <div class="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 text-primary"
        style="cursor:pointer;" @click="toggleAdvanced">
        <h5 class="fw-bold mb-0 d-flex align-items-center">
          <i class="fas fa-sliders me-2"></i>
          Avanzado
        </h5>
        <i class="fas transition-icon" :class="showAdvanced ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </div>

      <transition name="slide-fade">
        <div v-if="showAdvanced" class="border border-1 rounded p-3">
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
    <div class="mb-4">
      <div class="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 text-primary"
        style="cursor:pointer;" @click="toggleConfiguration">
        <h5 class="fw-bold mb-0 d-flex align-items-center">
          <i class="fas fa-cog me-2"></i>
          Configuración
        </h5>
        <i class="fas transition-icon" :class="showConfiguration ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </div>

      <transition name="slide-fade">
        <div v-show="showConfiguration" class="border border-1 rounded p-3">
          <div class="ps-4">

            <div v-if="configLoading" class="text-center py-4">
              <div class="spinner-border text-success"></div>
            </div>

            <div v-else-if="configError" class="alert alert-danger">
              {{ configError }}
            </div>

            <div v-else-if="!configData" class="alert alert-secondary">
              No hay configuración disponible.
            </div>

            <div v-else>

              <!-- INFORMATIVE -->
              <div class="mb-4 border-bottom">
                <h6 class="fw-bold pb-2 mb-3 text-secondary d-flex align-items-center">
                  <i class="fas fa-info-circle me-2 text-secondary"></i>
                  Básico
                </h6>

                <div class="row g-3">

                  <!-- 🔥 BASE NETO SIEMPRE PRESENTE -->
                  <div class="col-12 col-md-6">
                    <label class="form-label fw-semibold">
                      Valor Base Neto
                    </label>
                    <input type="number" class="form-control" v-model.number="baseNetAmount" />
                  </div>

                  <!-- RESTO CAMPOS INFORMATIVOS (EXCLUYE base_net_amount) -->
                  <div v-for="f in informativaFields.filter(x => x.key !== 'base_net_amount')" :key="f.key"
                    class="col-12 col-md-6">
                    <label class="form-label fw-semibold">
                      {{ f.label || formatLabel(f.key) }}
                    </label>
                    <input type="text" class="form-control bg-light" :value="formatValue(f.value)" disabled />
                  </div>

                </div>
              </div>

              <!-- CÁLCULO -->
              <div class="mb-4 border-bottom">
                <h6 class="fw-bold pb-2 mb-3 text-secondary">
                  <i class="fas fa-calculator me-2 text-secondary"></i>
                  Cálculo
                </h6>

                <CalculationComponent v-if="safeCalculationProps" :title="props.calculationTitle"
                  :description="props.calculationDescription" v-bind="safeCalculationProps"
                  :extraVariables="calculationExtraVariables" @calculated="onRecalculate" />
              </div>

              <!-- VINCULACIÓN -->
              <div class="mb-4 border-bottom">
                <h6 class="fw-bold pb-2 mb-3 text-secondary">
                  Vinculación
                </h6>

                <div class="row g-3 mb-4">
                  <div class="col-md-6" v-if="safeLinking?.header">
                    <div class="border rounded p-3 bg-light">
                      <div class="small text-muted">
                        Código:
                        <strong>{{ safeLinking.header.item_configuration_code }}</strong>
                      </div>
                      <div class="small text-muted">
                        Base:
                        <strong>{{ formatPrice(safeLinking.header.base_net_amount) }}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6" v-if="safeLinking?.totals">
                    <div class="border rounded p-3 bg-light">
                      <div class="small text-muted">
                        Subtotal:
                        <strong>{{ formatPrice(safeLinking.totals.sub_total_net) }}</strong>
                      </div>
                      <div class="small text-muted">
                        IVA:
                        <strong>{{ formatPrice(safeLinking.totals.sub_total_iva) }}</strong>
                      </div>
                      <div class="small text-muted">
                        Total:
                        <strong>{{ formatPrice(safeLinking.totals.sub_total_gross) }}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- <ConfigLinkTableComponent title="Productos" icon="fas fa-dolly" itemType="product" searchBaseUrl=""
                  :rows="productLinks" @rows-changed="onRowsChanged('product', $event)" header-bg-class="bg-dark"
                  header-text-class="text-white" /> -->

                <ConfigLinkTableComponent v-model="productLinks" title="Productos" icon="fas fa-dolly text-white"
                  itemType="product" searchBaseUrl="/products/" headerBgClass="bg-dark" headerTextClass="text-white" />

                <ConfigLinkTableComponent v-model="materialLinks" title="Materiales" icon="fas fa-spoon"
                  itemType="material" searchBaseUrl="/materials/" headerBgClass="bg-warning-subtle"
                  headerTextClass="text-dark" />

                <ConfigLinkTableComponent v-model="serviceLinks" title="Servicios" icon="fas fa-people-carry-box"
                  itemType="service" searchBaseUrl="/services/" headerBgClass="bg-success-subtle"
                  headerTextClass="text-dark" />

              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- ✅ BOTONES SUBMIT GENERALES (siempre visibles, fuera de Configuración) -->
    <div v-if="configData" class="mt-4 pt-3">
      <div class="d-flex justify-content-end align-items-center gap-3">

        <div v-if="linkDirty" class="small text-warning me-auto">
          <i class="fas fa-exclamation-circle me-1"></i>
          Cambios pendientes
        </div>

        <button type="button" class="btn btn-outline-secondary btn-lg rounded-pill px-5" @click="resetLinkingEdits"
          :disabled="saving || !linkDirty">
          Cancelar
        </button>

        <button type="button" class="btn btn-success btn-lg rounded-pill px-5" @click="saveConfiguration"
          :disabled="saving || !linkDirty">
          <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-save'" class="me-2"></i>
          {{ saving ? 'Guardando...' : 'Guardar información' }}
        </button>

      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import axios from '../api/axios'
import ConfigLinkTableComponent from './ConfigLinkTableComponent.vue'
import CalculationComponent from './CalculationComponent.vue'

/* =========================
   PROPS / EMITS
========================= */

const props = defineProps({
  product: { type: Object, default: null },
  advancedData: { type: Object, default: null },
  configurationData: { type: Object, default: null },
  calculationTitle: { type: String, default: '' },
  calculationDescription: { type: String, default: '' },
  configResource: { type: String, required: true }, 
  lookupField: { type: String, default: 'code' },       // "sku" o "code"
  fields: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'load-advanced'])

/* =========================
   UI STATE
========================= */

const showAdvanced = ref(false)
const advancedLoaded = ref(false)
const showConfiguration = ref(false)

/* =========================
   CONFIG STATE
========================= */

const configData = ref(null)
const configLoading = ref(false)
const configError = ref(null)

/* 🔥 BASE NETO EDITABLE */
const baseNetAmount = ref(0)
const calculationResults = ref({})


/* =========================
   LINKING STATE
========================= */

const productLinks = ref([])
const materialLinks = ref([])
const serviceLinks = ref([])

const originalLinkingSnapshot = ref(null)

const saving = ref(false)
const linkDirty = ref(false)

/* =========================
   TOGGLES
========================= */

function toggleAdvanced() {
  showAdvanced.value = !showAdvanced.value
  if (showAdvanced.value && !advancedLoaded.value) {
    advancedLoaded.value = true
    emit('load-advanced')
  }
}

function toggleConfiguration() {
  showConfiguration.value = !showConfiguration.value
  if (showConfiguration.value) loadConfiguration()
}

/* =========================
   COMPUTEDS
========================= */

const safeAdvancedData = computed(() => {
  if (!props.advancedData || typeof props.advancedData !== 'object') return {}
  return props.advancedData
})

const computedTitle = computed(() => {
  if (!props.product) return ''
  if (props.product?.sku) {
    return props.product.description
      ? `${props.product.sku} - ${props.product.description}`
      : props.product.sku
  }
  return ''
})

const visibleFields = computed(() => {
  if (!props.fields || !props.product) return []
  return props.fields.filter(f =>
    props.product.hasOwnProperty(f.key) &&
    props.product[f.key] !== undefined &&
    !f.hideInGrid
  )
})

const safeCalculationProps = computed(() => {
  return configData.value?.calculation?.props || null
})

const safeLinking = computed(() => {
  return configData.value?.linking || {
    header: null,
    totals: null,
    products: { links: [] },
    materials: { links: [] },
    services: { links: [] }
  }
})

const informativaFields = computed(() => {
  const data = configData.value?.informativa?.data || {}
  const verbose = configData.value?.informativa?.verbose_names || {}

  return Object.keys(data).map(key => ({
    key,
    label: verbose[key] || key,
    value: data[key]
  }))
})

/* =========================
   FORMAT HELPERS
========================= */

function resolveLabel(key) {
  const field = props.fields?.find(f => f.key === key)
  if (field?.label) return field.label
  return formatLabel(key)
}

function formatLabel(key) {
  if (!key) return '-'
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

function formatValue(val) {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'boolean') return val ? 'SI' : 'NO'
  if (typeof val === 'number') return val.toLocaleString('es-CL')
  return val
}

function formatPrice(val) {
  if (val === null || val === undefined || isNaN(val)) return '-'
  return '$' + Number(val).toLocaleString('es-CL')
}

function isCloudinary(val) {
  return typeof val === 'string' &&
    val.startsWith('https://res.cloudinary.com')
}

function getPillClass(field, value) {
  if (!field?.pillMap || !value) return 'bg-secondary'
  const valueStr = String(value).toLowerCase()
  const mappedKey = Object.keys(field.pillMap)
    .find(k => k.toLowerCase() === valueStr)
  return mappedKey ? field.pillMap[mappedKey] : 'bg-dark'
}

/* =========================
   LOAD CONFIG
========================= */

async function loadConfiguration() {
  const lookupValue = props.product?.[props.lookupField]
  if (!lookupValue) return

  configLoading.value = true
  configError.value = null
  linkDirty.value = false
  originalLinkingSnapshot.value = null

  try {
    if (!props.configResource) return

    const res = await axios.get(
      `/${props.configResource}/${lookupValue}/config/`
    )
    configData.value = res.data

    // 🔥 SETEAR BASE NETO ANTES DEL SNAPSHOT
    baseNetAmount.value =
      Number(res.data?.linking?.header?.base_net_amount || 0)

    const pl = res.data?.linking?.products?.links || []
    const ml = res.data?.linking?.materials?.links || []
    const sl = res.data?.linking?.services?.links || []

    productLinks.value = pl.map(normalizeRow)
    materialLinks.value = ml.map(normalizeRow)
    serviceLinks.value = sl.map(normalizeRow)

    // 🔥 SNAPSHOT FINAL YA SINCRONIZADO
    takeSnapshot()
    linkDirty.value = false

  } catch (e) {
    configError.value =
      e.response?.data?.detail || 'Error cargando configuración'
  } finally {
    configLoading.value = false
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
    is_deleted: r?.is_deleted ?? false
  }
}

function takeSnapshot() {
  originalLinkingSnapshot.value = {
    productLinks: JSON.parse(JSON.stringify(productLinks.value)),
    materialLinks: JSON.parse(JSON.stringify(materialLinks.value)),
    serviceLinks: JSON.parse(JSON.stringify(serviceLinks.value)),
    baseNetAmount: baseNetAmount.value
  }
}

/* =========================
   WATCHERS
========================= */

watch(
  () => props.product?.[props.lookupField],
  (val) => {
    if (val) loadConfiguration()
    else configData.value = null
  },
  { immediate: true }
)

watch(
  [productLinks, materialLinks, serviceLinks, baseNetAmount],
  () => {

    if (!originalLinkingSnapshot.value) {
      linkDirty.value = false
      return
    }

    const changed =
      JSON.stringify(productLinks.value) !== JSON.stringify(originalLinkingSnapshot.value.productLinks) ||
      JSON.stringify(materialLinks.value) !== JSON.stringify(originalLinkingSnapshot.value.materialLinks) ||
      JSON.stringify(serviceLinks.value) !== JSON.stringify(originalLinkingSnapshot.value.serviceLinks) ||
      baseNetAmount.value !== originalLinkingSnapshot.value.baseNetAmount

    linkDirty.value = changed
  },
  { deep: true }
)

/* =========================
   ACTIONS
========================= */

function resetLinkingEdits() {
  productLinks.value =
    JSON.parse(JSON.stringify(originalLinkingSnapshot.value.productLinks))
  materialLinks.value =
    JSON.parse(JSON.stringify(originalLinkingSnapshot.value.materialLinks))
  serviceLinks.value =
    JSON.parse(JSON.stringify(originalLinkingSnapshot.value.serviceLinks))
}

async function saveConfiguration() {
  const lookupValue = props.product?.[props.lookupField]
  if (!lookupValue) return
  const priceConfigCode = configData.value?.calculation?.props?.code
  if (!priceConfigCode) {
    console.error('price_configuration no viene desde config')
    return
  }

  const normalize = (rows, kind) =>
    (rows || []).map(r => ({
      item_kind: kind,
      item_sku: String(r?.item_sku || '').trim(),
      item_code: String(r?.item_code || r?.id || '').trim(),
      detail: String(r?.detail || '').slice(0, 50),
      quantity: Number(r?.quantity || 1)
    }))

  saving.value = true
  try {
    // 1) GUARDAR TABLAS (ItemConfigurationDetail)
    await axios.post(`/${props.configResource}/${lookupValue}/config/`, {
      products: normalize(productLinks.value, 'product'),
      materials: normalize(materialLinks.value, 'material'),
      services: normalize(serviceLinks.value, 'service'),
    })

    // 2) GUARDAR PRECIO (Price versionado)
    await axios.patch(`/${props.configResource}/${lookupValue}/`, {
      price_data: {
        base_net_amount: Number(baseNetAmount.value) || 0,
        price_configuration: priceConfigCode
      }
    })

    await loadConfiguration() // refresca desde backend
    takeSnapshot()
    linkDirty.value = false
  } catch (e) {
    console.error('ERROR GUARDANDO CONFIG + PRECIO', e.response?.data || e)
  } finally {
    saving.value = false
  }
}

function onRecalculate(results) {
  calculationResults.value = results
}

/* =========================
   CALCULATION VARIABLES
========================= */

function sumField(rows, field) {
  let total = 0
  for (const r of (rows || [])) {
    total += Number(r?.[field] || 0)
  }
  return total
}

const calculationExtraVariables = computed(() => {

  const productsNet = sumField(productLinks.value, 'net_amount')
  const materialsNet = sumField(materialLinks.value, 'net_amount')
  const servicesNet = sumField(serviceLinks.value, 'net_amount')

  const productsIva = sumField(productLinks.value, 'iva_amount')
  const materialsIva = sumField(materialLinks.value, 'iva_amount')
  const servicesIva = sumField(serviceLinks.value, 'iva_amount')

  return {
    base_net_amount: baseNetAmount.value,

    total_neto_productos: productsNet,
    total_neto_materiales: materialsNet,
    total_neto_servicios: servicesNet,

    costo_neto: productsNet + materialsNet + servicesNet,
    iva_costo: productsIva + materialsIva + servicesIva
  }
})
</script>