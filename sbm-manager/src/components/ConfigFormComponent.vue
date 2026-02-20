<template>
  <div class="p-4 mb-4 bg-light border rounded-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="h5 fw-bold text-primary mb-0">
        Configuración {{ configurationName }} -
        <span class="fw-bold text-uppercase">{{ publicPivotField }}</span> :
        {{ catalog?.[publicPivotField] || '-' }}
      </h3>
    </div>

    <form @submit.prevent="onSubmit">
      <div class="row">
        <div class="mb-3 col-12 col-md-6">
          <label for="name" class="form-label fw-semibold">Nombre</label>
          <input type="text" id="name" v-model="form.name" class="form-control" placeholder="Nombre del producto" />
        </div>

        <div class="mb-3 col-12 col-md-6">
          <label for="description" class="form-label fw-semibold">Descripción</label>
          <textarea id="description" v-model="form.description" class="form-control" rows="3"
            placeholder="Descripción del producto" />
        </div>

        <!-- ✅ COVER IMAGE CON PREVIEW -->
        <div class="mb-3 col-12 col-md-6">
          <label for="cover_image" class="form-label fw-semibold">URL de imagen de portada</label>

          <div class="input-group">
            <!-- Preview -->
            <span class="input-group-text p-0 bg-white" style="overflow:hidden;">
              <div class="d-flex align-items-center justify-content-center" style="width:56px;height:56px;">
                <template v-if="shouldShowCoverPreview && !coverPreviewError">
                  <img :src="form.cover_image" alt="Preview" style="width:56px;height:56px;object-fit:cover;"
                    @error="coverPreviewError = true" />
                </template>

                <template v-else>
                  <div class="text-muted small"
                    style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;"
                    title="Sin previsualización">
                    —
                  </div>
                </template>
              </div>
            </span>

            <!-- Input -->
            <input type="url" id="cover_image" v-model.trim="form.cover_image" class="form-control"
              placeholder="https://res.cloudinary.com/.../image.jpg" @input="coverPreviewError = false" />
          </div>

          <!-- Ayuda opcional -->
          <div class="form-text">
            Insertar URL de Cloudinary (imagen) para ver la previsualización.
          </div>
        </div>

        <div class="mb-3 col-12 col-md-6">
          <div class="form-check">
            <input type="checkbox" id="chef_recommendation" v-model="form.chef_recommendation"
              class="form-check-input" />
            <label class="form-check-label fw-semibold" for="chef_recommendation">
              Recomendación del chef
            </label>
          </div>
        </div>

        <div class="mb-3 col-12 col-md-4">
          <label for="min_quantity_purchase" class="form-label fw-semibold">Cantidad mínima de compra</label>
          <input type="number" id="min_quantity_purchase" v-model.number="form.min_quantity_purchase"
            class="form-control" min="1" placeholder="1" />
        </div>

        <div class="mb-3 col-12 col-md-4">
          <label for="rations_quantity" class="form-label fw-semibold">Cantidad de raciones</label>
          <input type="number" id="rations_quantity" v-model.number="form.rations_quantity" class="form-control" min="1"
            placeholder="1" />
        </div>

        <div class="mb-3 col-12 col-md-4">
          <div class="form-check mt-4">
            <input type="checkbox" id="is_visible" v-model="form.is_visible" class="form-check-input" />
            <label class="form-check-label fw-semibold" for="is_visible">Visible</label>
          </div>
          <div class="form-check">
            <input type="checkbox" id="is_confirmed" v-model="form.is_confirmed" class="form-check-input" />
            <label class="form-check-label fw-semibold" for="is_confirmed">Confirmado</label>
          </div>
          <div class="form-check">
            <input type="checkbox" id="is_deleted" v-model="form.is_deleted" class="form-check-input" />
            <label class="form-check-label fw-semibold" for="is_deleted">Eliminado</label>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-12 col-md-6 d-flex gap-3">

          <button type="submit" class="btn btn-primary w-100 fw-bold">
            Guardar configuración
          </button>

          <button type="button" class="btn btn-secondary text-white w-100 fw-semibold" @click="$emit('close')">
            Cancelar
          </button>

        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import axios from '../api/axios';

const props = defineProps({
  catalog: { type: Object, required: true },
  configurationName: { type: String, required: true },
  publicPivotField: { type: String, required: true }
});

const emits = defineEmits(['close', 'updated']);

const originalValues = ref({});

const form = reactive({
  name: '',
  description: '',
  cover_image: '',
  chef_recommendation: false,
  min_quantity_purchase: 1,
  rations_quantity: 1,
  is_visible: false,
  is_deleted: false,
  is_confirmed: false,
});

/** ✅ Preview state */
const coverPreviewError = ref(false);

/** ✅ Detectar Cloudinary + imagen */
const shouldShowCoverPreview = computed(() => {
  const url = (form.cover_image || '').trim();
  if (!url) return false;

  // Cloudinary típico: res.cloudinary.com/.../image/upload/.../file.ext
  const isCloudinary = /(^https?:\/\/)?res\.cloudinary\.com\//i.test(url);

  // Extensiones comunes (si usas URLs sin extensión, puedo ajustarlo a tu patrón)
  const looksLikeImage =
    /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(url) ||
    /\/image\/upload\//i.test(url);

  return isCloudinary && looksLikeImage;
});

function assignValues() {
  form.name = props.catalog.name || '';
  form.description = props.catalog.description || '';
  form.cover_image = props.catalog.cover_image || '';
  form.chef_recommendation = props.catalog.chef_recommendation || false;
  form.min_quantity_purchase = props.catalog.min_quantity_purchase || 1;
  form.rations_quantity = props.catalog.rations_quantity || 1;
  form.is_visible = props.catalog.is_visible || false;
  form.is_deleted = props.catalog.is_deleted || false;
  form.is_confirmed = props.catalog.is_confirmed || false;

  coverPreviewError.value = false;

  originalValues.value = {
    name: form.name,
    description: form.description,
    cover_image: form.cover_image,
    chef_recommendation: form.chef_recommendation,
    min_quantity_purchase: form.min_quantity_purchase,
    rations_quantity: form.rations_quantity,
    is_visible: form.is_visible,
    is_deleted: form.is_deleted,
    is_confirmed: form.is_confirmed
  };
}

watch(() => props.catalog, (newCatalog) => {
  if (!newCatalog) return;
  assignValues();
}, { immediate: true });

async function onSubmit() {
  if (!props.catalog || !props.catalog.code) {
    alert('No se encontró el código del catálogo.');
    return;
  }

  const changes = {};

  if (form.name !== originalValues.value.name) changes.name = form.name;
  if (form.description !== originalValues.value.description) changes.description = form.description;
  if (form.cover_image !== originalValues.value.cover_image) changes.cover_image = form.cover_image;
  if (form.chef_recommendation !== originalValues.value.chef_recommendation) changes.chef_recommendation = form.chef_recommendation;
  if (form.min_quantity_purchase !== originalValues.value.min_quantity_purchase) changes.min_quantity_purchase = form.min_quantity_purchase;
  if (form.rations_quantity !== originalValues.value.rations_quantity) changes.rations_quantity = form.rations_quantity;
  if (form.is_visible !== originalValues.value.is_visible) changes.is_visible = form.is_visible;
  if (form.is_deleted !== originalValues.value.is_deleted) changes.is_deleted = form.is_deleted;
  if (form.is_confirmed !== originalValues.value.is_confirmed) changes.is_confirmed = form.is_confirmed;

  if (Object.keys(changes).length === 0) {
    alert('No hay cambios para guardar.');
    return;
  }

  try {
    const response = await axios.patch(`/catalogs/${props.catalog.code}/`, changes, {
      headers: { 'Content-Type': 'application/json' }
    });

    Object.keys(changes).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(originalValues.value, key)) {
        originalValues.value[key] = form[key];
      }
      if (Object.prototype.hasOwnProperty.call(props.catalog, key)) {
        props.catalog[key] = form[key];
      }
    });

    alert('Configuración actualizada correctamente');
    emits('updated', response.data);
    emits('close');
  } catch (e) {
    console.error('Error updating catalog:', e);
    alert('Error al actualizar el catálogo.');
  }
}
</script>