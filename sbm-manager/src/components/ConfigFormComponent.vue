<template>
  <div class="p-4 mb-4 bg-light border rounded-3">
    <h3 class="h5 fw-bold text-primary mb-3">
      Configuración de catálogo para la franquicia ID: {{ franchiseId }}
    </h3>
    <form @submit.prevent="onSubmit">
      <div class="row">
        <div v-for="field in fields" :key="field.key" class="mb-3 col-12 col-md-6 col-lg-4">
          <label :for="field.key" class="form-label fw-semibold">{{ field.label }}</label>
          <select :id="field.key" v-model="form[field.key]" class="form-select" :disabled="field.options.length === 0">
            <option value="" disabled>-- Selecciona --</option>
            <option v-for="option in field.options" :key="option.id" :value="option.id">
              {{ option.label }}
            </option>
          </select>
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
import { reactive, toRefs } from 'vue';
const props = defineProps({
  franchiseId: {
    type: [String, Number],
    required: true
  }
});

// Campos dinámicos para las llaves foráneas de catalog
const fields = [
  { key: 'menu', label: 'Menú', options: [] },
  { key: 'group', label: 'Grupo', options: [] },
  { key: 'category', label: 'Categoría', options: [] },
  { key: 'type', label: 'Tipo', options: [] },
  { key: 'restriction', label: 'Restricción', options: [] },
  { key: 'usage_instructions', label: 'Instrucciones de uso', options: [] },
  { key: 'configuration', label: 'Configuración', options: [] },
];

const form = reactive({
  menu: '',
  group: '',
  category: '',
  type: '',
  restriction: '',
  usage_instructions: '',
  configuration: '',
});

function onSubmit() {
  // Aquí irá la lógica de guardado cuando tengas los endpoints
  alert('Configuración guardada (simulado)');
}
</script> 