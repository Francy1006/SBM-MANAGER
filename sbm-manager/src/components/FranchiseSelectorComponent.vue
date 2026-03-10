<template>
    <div class="row mb-4 align-items-center">
      <!-- Col label -->
      <div class="col-12 col-md-3 col-lg-2 text-end">
        <label class="form-label fw-bold text-black mb-2 mb-md-0">
          <i class="fas fa-cube text-secondary me-2"></i>
          Marca
        </label>
      </div>
  
      <!-- Col select -->
      <div class="col-12 col-md-9 col-lg-5">
        <select
          class="form-select form-select-lg rounded-3 shadow-sm w-100 text-center"
          :value="modelValue"
          @change="onChange"
        >
          <option disabled value="">Selecciona una marca</option>
          <option
            v-for="franchise in franchises"
            :key="franchise.id"
            :value="franchise.id"
          >
            {{ franchise.franchise || franchise.name }}
          </option>
        </select>
      </div>
  
      <!-- Col info -->
      <div class="col-3 col-lg-5">
        <div class="row align-items-center">
          <div class="col-2 text-start">
            <span class="text-primary">Editar</span>
          </div>
  
          <div class="col-3 d-flex justify-content-center">
            <div class="form-check form-switch">
              <label class="form-check-label fw-semibold" for="activeSwitch">
                Activo
              </label>
              <input class="form-check-input" type="checkbox" role="switch" id="activeSwitch" checked>
            </div>
          </div>
  
          <div class="col-6 text-end">
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    franchises: { type: Array, required: true },
    modelValue: { type: [String, Number], default: '' }
  });
  
  const emit = defineEmits(['update:modelValue', 'change']);
  
  // Franquicia seleccionada (objeto completo)
  const selectedFranchise = computed(() => {
    return props.franchises.find(f => String(f.id) === String(props.modelValue)) || null;
  });
  
  const onChange = (e) => {
    const id = e.target.value;
    const franchise = props.franchises.find(f => String(f.id) === String(id)) || null;
  
    // Mantiene compatibilidad con v-model
    emit('update:modelValue', id);
  
    // Emite payload lógico para que la vista no calcule nada
    emit('change', {
      id,
      franchise,
      name: franchise?.franchise || franchise?.name || '',
      sigla: franchise?.description || '',
      code: franchise?.code || ''
    });
  };
  </script>
  