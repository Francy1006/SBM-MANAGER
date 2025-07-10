<template>
  <div class="p-4 mb-4 bg-light border rounded-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="h5 fw-bold text-primary mb-0">
        Configuración {{ configurationName }} - <span class="fw-bold text-uppercase">{{ publicPivotField }}</span> : {{ catalog?.[publicPivotField] || '-' }}
      </h3>
      <button type="button" class="btn btn-link p-0 ms-2" aria-label="Cerrar" @click="$emit('close')" style="font-size:1.5rem; line-height:1; color:#e53935; text-decoration:none;">
        &times;
      </button>
    </div>
    <form @submit.prevent="onSubmit">
      <div class="row">
        <div class="mb-3 col-12 col-md-6">
          <label for="name" class="form-label fw-semibold">Nombre</label>
          <input 
            type="text" 
            id="name" 
            v-model="form.name" 
            class="form-control"
            placeholder="Nombre del producto"
          >
        </div>
        <div class="mb-3 col-12 col-md-6">
          <label for="description" class="form-label fw-semibold">Descripción</label>
          <textarea 
            id="description" 
            v-model="form.description" 
            class="form-control"
            rows="3"
            placeholder="Descripción del producto"
          ></textarea>
        </div>
        <div class="mb-3 col-12 col-md-6">
          <label for="cover_image" class="form-label fw-semibold">URL de imagen de portada</label>
          <input 
            type="url" 
            id="cover_image" 
            v-model="form.cover_image" 
            class="form-control"
            placeholder="https://ejemplo.com/imagen.jpg"
          >
        </div>
        <div class="mb-3 col-12 col-md-6">
          <div class="form-check">
            <input 
              type="checkbox" 
              id="chef_recommendation" 
              v-model="form.chef_recommendation" 
              class="form-check-input"
            >
            <label class="form-check-label fw-semibold" for="chef_recommendation">
              Recomendación del chef
            </label>
          </div>
        </div>
        <div class="mb-3 col-12 col-md-4">
          <label for="min_quantity_purchase" class="form-label fw-semibold">Cantidad mínima de compra</label>
          <input 
            type="number" 
            id="min_quantity_purchase" 
            v-model.number="form.min_quantity_purchase" 
            class="form-control"
            min="1"
            placeholder="1"
          >
        </div>
        <div class="mb-3 col-12 col-md-4">
          <label for="rations_quantity" class="form-label fw-semibold">Cantidad de raciones</label>
          <input 
            type="number" 
            id="rations_quantity" 
            v-model.number="form.rations_quantity" 
            class="form-control"
            min="1"
            placeholder="1"
          >
        </div>
        <div class="mb-3 col-12 col-md-4">
          <div class="form-check mt-4">
            <input 
              type="checkbox" 
              id="is_visible" 
              v-model="form.is_visible" 
              class="form-check-input"
            >
            <label class="form-check-label fw-semibold" for="is_visible">
              Visible
            </label>
          </div>
          <div class="form-check">
            <input 
              type="checkbox" 
              id="is_confirmed" 
              v-model="form.is_confirmed" 
              class="form-check-input"
            >
            <label class="form-check-label fw-semibold" for="is_confirmed">
              Confirmado
            </label>
          </div>
          <div class="form-check">
            <input 
              type="checkbox" 
              id="is_deleted" 
              v-model="form.is_deleted" 
              class="form-check-input"
            >
            <label class="form-check-label fw-semibold" for="is_deleted">
              Eliminado
            </label>
          </div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-12 col-md-4">
          <button type="submit" class="btn btn-primary w-100 fw-bold">Guardar configuración</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import axios from '../api/axios';

const props = defineProps({
  catalog: {
    type: Object,
    required: true
  },
  configurationName: {
    type: String,
    required: true
  },
  publicPivotField: {
    type: String,
    required: true
  }
});

// Variable para almacenar los valores originales
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

function assignValues() {
  console.log('=== ASSIGN VALUES DEBUG ===');
  console.log('Catalog data:', props.catalog);
  
  form.name = props.catalog.name || '';
  form.description = props.catalog.description || '';
  form.cover_image = props.catalog.cover_image || '';
  form.chef_recommendation = props.catalog.chef_recommendation || false;
  form.min_quantity_purchase = props.catalog.min_quantity_purchase || 1;
  form.rations_quantity = props.catalog.rations_quantity || 1;
  form.is_visible = props.catalog.is_visible || false;
  form.is_deleted = props.catalog.is_deleted || false;
  form.is_confirmed = props.catalog.is_confirmed || false;
  
  console.log('Form values after assignment:', {
    name: form.name,
    description: form.description,
    cover_image: form.cover_image,
    chef_recommendation: form.chef_recommendation,
    min_quantity_purchase: form.min_quantity_purchase,
    rations_quantity: form.rations_quantity,
    is_visible: form.is_visible,
    is_deleted: form.is_deleted,
    is_confirmed: form.is_confirmed
  });
  
  // Guardar los valores originales para comparación
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
  
  console.log('Original values saved:', originalValues.value);
}

watch(() => props.catalog, async (newCatalog) => {
  if (!newCatalog) return;
  assignValues();
}, { immediate: true });

const emits = defineEmits(['close', 'updated']);

async function onSubmit() {
  if (!props.catalog || !props.catalog.code) {
    alert('No se encontró el código del catálogo.');
    return;
  }
  
  console.log('=== SUBMIT DEBUG ===');
  console.log('Form current values:', {
    name: form.name,
    description: form.description,
    cover_image: form.cover_image,
    chef_recommendation: form.chef_recommendation,
    min_quantity_purchase: form.min_quantity_purchase,
    rations_quantity: form.rations_quantity,
    is_visible: form.is_visible,
    is_deleted: form.is_deleted,
    is_confirmed: form.is_confirmed
  });
  
  console.log('Original values:', originalValues.value);
  
  // Crear objeto con solo los cambios
  const changes = {};
  
  // Comparar cada campo con los valores originales
  if (form.name !== originalValues.value.name) {
    changes.name = form.name;
    console.log('Name changed:', form.name, 'vs', originalValues.value.name);
  }
  if (form.description !== originalValues.value.description) {
    changes.description = form.description;
    console.log('Description changed:', form.description, 'vs', originalValues.value.description);
  }
  if (form.cover_image !== originalValues.value.cover_image) {
    changes.cover_image = form.cover_image;
    console.log('Cover image changed:', form.cover_image, 'vs', originalValues.value.cover_image);
  }
  if (form.chef_recommendation !== originalValues.value.chef_recommendation) {
    changes.chef_recommendation = form.chef_recommendation;
    console.log('Chef recommendation changed:', form.chef_recommendation, 'vs', originalValues.value.chef_recommendation);
  }
  if (form.min_quantity_purchase !== originalValues.value.min_quantity_purchase) {
    changes.min_quantity_purchase = form.min_quantity_purchase;
    console.log('Min quantity purchase changed:', form.min_quantity_purchase, 'vs', originalValues.value.min_quantity_purchase);
  }
  if (form.rations_quantity !== originalValues.value.rations_quantity) {
    changes.rations_quantity = form.rations_quantity;
    console.log('Rations quantity changed:', form.rations_quantity, 'vs', originalValues.value.rations_quantity);
  }
  if (form.is_visible !== originalValues.value.is_visible) {
    changes.is_visible = form.is_visible;
    console.log('Is visible changed:', form.is_visible, 'vs', originalValues.value.is_visible);
  }
  if (form.is_deleted !== originalValues.value.is_deleted) {
    changes.is_deleted = form.is_deleted;
    console.log('Is deleted changed:', form.is_deleted, 'vs', originalValues.value.is_deleted);
  }
  if (form.is_confirmed !== originalValues.value.is_confirmed) {
    changes.is_confirmed = form.is_confirmed;
    console.log('Is confirmed changed:', form.is_confirmed, 'vs', originalValues.value.is_confirmed);
  }
  
  console.log('Changes detected:', changes);
  
  // Si no hay cambios, no hacer nada
  if (Object.keys(changes).length === 0) {
    alert('No hay cambios para guardar.');
    return;
  }
  
  console.log('=== SENDING CHANGES TO API ===');
  console.log('Changes object:', changes);
  console.log('Changes JSON:', JSON.stringify(changes));
  console.log('Changes keys:', Object.keys(changes));
  console.log('Changes values:', Object.values(changes));
  
  try {
    const response = await axios.patch(`/catalogs/${props.catalog.code}/`, changes, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Actualizar los valores originales con los nuevos valores
    Object.keys(changes).forEach(key => {
      if (originalValues.value.hasOwnProperty(key)) {
        originalValues.value[key] = form[key];
      }
    });
    
    // Actualizar el objeto catalog con los nuevos valores
    Object.keys(changes).forEach(key => {
      if (props.catalog.hasOwnProperty(key)) {
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