<template>
  <div class="config-list-container">
    <div class="mb-3">
      <h4 class="mb-2">{{ props.title }}</h4>
      <br>
      <button class="btn btn-outline-secondary btn-sm" @click="toggleVisibility">
        <i :class="isVisible ? 'fas fa-eye-slash' : 'fas fa-eye'" class="me-2"></i>
        {{ isVisible ? 'Ocultar' : 'Mostrar' }}
      </button>
      <div class="d-flex gap-2 mt-2">
        <button 
          v-if="hasChanges" 
          @click="saveAllChanges" 
          class="btn btn-success btn-sm rounded-pill px-3"
          :disabled="saving"
        >
          <i v-if="saving" class="fas fa-spinner fa-spin me-1"></i>
          <i v-else class="fas fa-save me-1"></i>
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
        <button 
          v-if="hasChanges" 
          @click="cancelChanges" 
          class="btn btn-outline-secondary btn-sm rounded-pill px-3"
          :disabled="saving"
        >
          <i class="fas fa-times me-1"></i>
          Cancelar
        </button>
      </div>
    </div>

    <div v-if="!isVisible" class="alert alert-secondary" role="alert">
      <i class="fas fa-eye-slash me-2"></i>
      Contenido oculto
    </div>

    <div v-else>
      <div v-if="showInfoAlert && infoAlertText" class="alert alert-info mb-3">
        <i class="fas fa-info-circle me-2"></i>
        <strong> Nota:</strong> {{ infoAlertText }}
      </div>

      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Cargando configuración...</p>
      </div>

      <div v-else-if="configDetails.length > 0 && props.fields" class="config-details">
        <div v-for="(detail, rowIdx) in configDetails" :key="rowIdx" class="config-item mb-3 p-3 border rounded">
          <div class="row align-items-center">
            <div v-for="field in props.fields" :key="field.key" class="col-md-4">
              <label class="form-label fw-bold">{{ field.label }}:</label>
              <template v-if="field.editable">
                <input
                  type="text"
                  class="form-control"
                  :value="detail[field.key]"
                  @input="updateGenericValue(rowIdx, field.key, $event.target.value)"
                />
              </template>
              <template v-else>
                <p class="text-muted mb-0">{{ detail[field.key] }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="configDetails.length > 0" class="config-details">
        <div v-for="detail in configDetails" :key="detail.id" class="config-item mb-3 p-3 border rounded">
          <div class="row align-items-center">
            <div class="col-md-2">
              <label class="form-label fw-bold">Nombre:</label>
              <p class="text-primary fw-bold mb-0">{{ detail.detail }}</p>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">{{ detail.field_verbose_names?.detail || 'Detalle' }}:</label>
              <p class="text-muted mb-0">{{ detail.description }}</p>
            </div>
            <div class="col-md-2">
              <label class="form-label fw-bold">{{ detail.field_verbose_names?.value || 'Valor' }}:</label>
              <input 
                v-if="detail.type === 2" 
                type="number" 
                class="form-control" 
                :value="detail.value" 
                step="0.01" 
                min="0"
                @input="updateConfigValue(detail.id, $event.target.value)"
              />
              <input 
                v-else 
                type="text" 
                class="form-control" 
                :value="detail.value"
                @input="updateConfigValue(detail.id, $event.target.value)"
              />
            </div>
            <div class="col-md-2">
              <label class="form-label fw-bold">{{ detail.field_verbose_names?.index || 'Índice' }}:</label>
              <input 
                type="number" 
                class="form-control" 
                :value="detail.index" 
                min="1"
                step="1"
                @input="updateConfigIndex(detail.id, $event.target.value)"
              />
            </div>
            <div class="col-md-3">
              <span class="badge me-2" :class="detail.is_confirmed ? 'bg-success text-white' : 'bg-warning'">
                {{ detail.is_confirmed ? 'Confirmado' : 'Pendiente' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="alert alert-warning">
        <i class="fas fa-exclamation-triangle me-2"></i>
        No se encontraron configuraciones.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../api/axios';

const props = defineProps({
  // Legacy para franquicias
  franchiseId: {
    type: [String, Number],
    default: null
  },
  franchiseCode: {
    type: String,
    default: ''
  },
  // Nuevo: identificador genérico para productos o franquicias
  code: {
    type: String,
    default: ''
  },
  id: {
    type: [String, Number],
    default: null
  },
  endpointType: {
    type: String,
    default: 'id',
    validator: (value) => ['id', 'code'].includes(value)
  },
  title: {
    type: String,
    default: 'Configuración'
  },
  endpointBase: {
    type: String,
    default: ''
  },
  // Nuevo: definición de campos genéricos
  fields: {
    type: Array,
    default: null // Si es null, usa legacy
  },
  // NUEVO: control del alert informativo
  infoAlertText: {
    type: String,
    default: ''
  },
  showInfoAlert: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['changes-detected']);

const configDetails = ref([]);
const loading = ref(false);
const saving = ref(false);
const originalValues = ref({});
const hasChanges = ref(false);
const isVisible = ref(false); // Por defecto oculto

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
};

const fetchConfigDetails = async () => {
  // Compatibilidad: usar code, id, franchiseId o franchiseCode
  const hasIdentifier = props.code || props.id || props.franchiseId || props.franchiseCode;
  if (!hasIdentifier) return;
  loading.value = true;
  try {
    if (!props.endpointBase) {
      console.warn('ConfigListComponent: endpointBase no proporcionado');
      configDetails.value = [];
      return;
    }
    const url = props.endpointBase;
    const response = await api.get(url);
    configDetails.value = response.data;
    // Guardar valores originales para comparación solo si hay edición
    if (props.fields && props.fields.some(f => f.editable)) {
      originalValues.value = {};
      configDetails.value.forEach((item, idx) => {
        originalValues.value[idx] = { ...item };
      });
    }
    hasChanges.value = false;
    emit('changes-detected', false);
  } catch (error) {
    console.error('Error al cargar configuración:', error);
    configDetails.value = [];
  } finally {
    loading.value = false;
  }
};

const updateGenericValue = (rowIdx, key, newValue) => {
  configDetails.value[rowIdx][key] = newValue;
  // Verificar si hay cambios
  const original = originalValues.value[rowIdx]?.[key];
  hasChanges.value = configDetails.value.some((item, idx) => {
    return props.fields.some(f => f.editable && item[f.key] !== originalValues.value[idx]?.[f.key]);
  });
  emit('changes-detected', hasChanges.value);
};

const updateConfigValue = async (detailId, newValue) => {
  try {
    // Actualizar el valor en el array local
    const item = configDetails.value.find(detail => detail.id === detailId);
    if (item) {
      item.value = newValue;
      
      // Verificar si hay cambios comparando con el valor original
      const originalValue = originalValues.value[detailId]?.value;
      const hasLocalChanges = originalValue !== newValue;
      
      // Verificar si hay cambios en cualquier item
      const anyChanges = configDetails.value.some(detail => {
        const original = originalValues.value[detail.id];
        return original?.value !== detail.value || original?.index !== detail.index;
      });
      
      hasChanges.value = anyChanges;
      emit('changes-detected', anyChanges);
    }
    
    console.log('Actualizando configuración:', detailId, newValue);
    // await api.put(`/franchise-configuration-details/${detailId}/`, { value: newValue });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
  }
};

const updateConfigIndex = async (detailId, newValue) => {
  try {
    const item = configDetails.value.find(detail => detail.id === detailId);
    if (item) {
      item.index = parseInt(newValue);
      
      // Verificar si hay cambios comparando con el valor original
      const originalIndex = originalValues.value[detailId]?.index;
      const hasLocalChanges = originalIndex !== parseInt(newValue);
      
      // Verificar si hay cambios en cualquier item
      const anyChanges = configDetails.value.some(detail => {
        const original = originalValues.value[detail.id];
        return original?.value !== detail.value || original?.index !== detail.index;
      });
      
      hasChanges.value = anyChanges;
      emit('changes-detected', anyChanges);
    }
    console.log('Actualizando índice:', detailId, newValue);
    // await api.put(`/franchise-configuration-details/${detailId}/`, { index: newValue });
  } catch (error) {
    console.error('Error al actualizar índice:', error);
  }
};

const saveAllChanges = async () => {
  saving.value = true;
  try {
    // Solo soporta edición si hay campos editables y endpoint PATCH definido
    // Aquí deberías implementar la lógica de guardado según tu API
    alert('Funcionalidad de guardado genérico no implementada.');
    hasChanges.value = false;
    emit('changes-detected', false);
    return true;
  } catch (error) {
    console.error('Error al guardar cambios:', error);
    alert('Error al guardar la configuración: ' + error.message);
    throw error;
  } finally {
    saving.value = false;
  }
};

const cancelChanges = () => {
  // Revertir los cambios a los valores originales
  configDetails.value.forEach((item, idx) => {
    if (originalValues.value[idx]) {
      Object.assign(item, originalValues.value[idx]);
    }
  });
  hasChanges.value = false;
  emit('changes-detected', false);
};

// Exponer la función para que el componente padre pueda usarla
defineExpose({
  saveAllChanges,
  hasChanges
});

watch([
  () => props.franchiseId,
  () => props.franchiseCode,
  () => props.code,
  () => props.id,
  () => props.endpointBase
], fetchConfigDetails, { immediate: true });

onMounted(() => {
  fetchConfigDetails();
});
</script>