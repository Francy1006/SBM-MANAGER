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

      <div class="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3 text-secondary"
        style="cursor:pointer;" @click="toggleAdvanced">
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

      <div class="alert alert-secondary">
        (Aquí se renderizarán las tablas de productos, materiales y servicios)
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  product: { type: Object, default: null },
  advancedData: { type: Object, default: null },
  configurationData: { type: Object, default: null },
  fields: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'load-advanced']);

const showAdvanced = ref(false);
const advancedLoaded = ref(false);

function toggleAdvanced() {
  showAdvanced.value = !showAdvanced.value;

  if (showAdvanced.value && !advancedLoaded.value) {
    advancedLoaded.value = true;
    emit('load-advanced');
  }
}

const safeAdvancedData = computed(() => {
  if (!props.advancedData || typeof props.advancedData !== 'object') {
    return {};
  }
  return props.advancedData;
});

/* ===========================
   TÍTULO
=========================== */

const computedTitle = computed(() => {
  if (!props.product) return '';
  if (props.product?.sku) {
    return props.product.description
      ? `${props.product.sku} - ${props.product.description}`
      : props.product.sku;
  }
  return '';
});

/* ===========================
   CAMPOS
=========================== */

const visibleFields = computed(() => {
  if (!props.fields || !props.product) return [];
  return props.fields.filter(f =>
    props.product.hasOwnProperty(f.key) &&
    props.product[f.key] !== undefined &&
    !f.hideInGrid
  );
});

/* ===========================
   HELPERS
=========================== */

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
  return typeof val === 'string' &&
    val.startsWith('https://res.cloudinary.com');
}

function getPillClass(field, value) {
  if (!field?.pillMap || !value) return 'bg-secondary';

  const valueStr = String(value).toLowerCase();
  const mappedKey = Object.keys(field.pillMap)
    .find(k => k.toLowerCase() === valueStr);

  return mappedKey ? field.pillMap[mappedKey] : 'bg-dark';
}
</script>