<template>
  <div class="config-list-container">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0">{{ props.title }}</h4>
      <div class="d-flex gap-2">
        <button 
          v-if="hasChanges" 
          @click="saveAllChanges" 
          class="btn btn-success btn-sm rounded-pill px-3"
          :disabled="saving"
          style="margin-right: 10px;"
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
    
    <div class="alert alert-info mb-3">
      <i class="fas fa-info-circle me-2"></i>
      <strong> Nota:</strong> El Índice superior sobreescribe la logica con índice menor
    </div>
    
    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Cargando configuración...</p>
    </div>
    
    <div v-else-if="configDetails.length > 0" class="config-details">
      <div v-for="detail in configDetails" :key="detail.id" class="config-item mb-3 p-3 border rounded">
        <div class="row align-items-center">
          <div class="col-md-2">
            <label class="form-label fw-bold">Nombre:</label>
            <p class="text-primary fw-bold mb-0">{{ detail.detail }}</p>
          </div>
          <div class="col-md-3">
            <label class="form-label fw-bold">{{ detail.field_verbose_names.detail }}:</label>
            <p class="text-muted mb-0">{{ detail.description }}</p>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-bold">{{ detail.field_verbose_names.value }}:</label>
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
            <label class="form-label fw-bold">{{ detail.field_verbose_names.index }}:</label>
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
            <div class="d-flex align-items-center">
              <span class="badge me-2" :class="detail.is_confirmed ? 'bg-success text-white' : 'bg-warning'">
                {{ detail.is_confirmed ? 'Confirmado' : 'Pendiente' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="alert alert-warning">
      <i class="fas fa-exclamation-triangle me-2"></i>
      No se encontraron configuraciones para esta franquicia.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../api/axios';

const props = defineProps({
  franchiseId: {
    type: [String, Number],
    required: true
  },
  franchiseCode: {
    type: String,
    default: ''
  },
  endpointType: {
    type: String,
    default: 'id', // 'id' for Catalogs view, 'code' for Franchise view
    validator: (value) => ['id', 'code'].includes(value)
  },
  title: {
    type: String,
    default: 'Configuración de Precios'
  }
});

const emit = defineEmits(['changes-detected']);

const configDetails = ref([]);
const loading = ref(false);
const saving = ref(false);
const originalValues = ref({});
const hasChanges = ref(false);

const fetchConfigDetails = async () => {
  if (!props.franchiseId && !props.franchiseCode) return;
  
  loading.value = true;
  try {
    let url;
    if (props.endpointType === 'code' && props.franchiseCode) {
      // Para vista Franchise: usar franchise_code
      url = `/franchise-configuration-details/franchise_price_configurations_code/?franchise_code=${props.franchiseCode}`;
    } else {
      // Para vista Catalogs: usar franchise_id
      url = `/franchise-configuration-details/franchise_price_configurations_id/?franchise_id=${props.franchiseId}`;
    }
    
    const response = await api.get(url);
    configDetails.value = response.data;
    
    // Guardar valores originales para comparación
    originalValues.value = {};
    configDetails.value.forEach(item => {
      originalValues.value[item.id] = {
        value: item.value,
        index: item.index
      };
    });
    
    hasChanges.value = false;
    emit('changes-detected', false);
  } catch (error) {
    console.error('Error al cargar configuración:', error);
    configDetails.value = [];
  } finally {
    loading.value = false;
  }
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
    // Encontrar todos los items que han cambiado
    const changedItems = configDetails.value.filter(detail => {
      const original = originalValues.value[detail.id];
      return original?.value !== detail.value || original?.index !== detail.index;
    });
    
    // Guardar cada item modificado usando el endpoint PATCH
    for (const item of changedItems) {
      const updateData = {};
      const original = originalValues.value[item.id];
      
      if (original?.value !== item.value) {
        updateData.value = item.value;
      }
      if (original?.index !== item.index) {
        updateData.index = item.index;
      }
      
      await api.patch(`/franchise-configuration-details/${item.id}/update_value/`, updateData);
    }
    
    // Actualizar valores originales después de guardar
    changedItems.forEach(item => {
      originalValues.value[item.id] = {
        value: item.value,
        index: item.index
      };
    });
    
    hasChanges.value = false;
    emit('changes-detected', false);
    
    console.log('Cambios guardados exitosamente');
    alert('Configuración guardada exitosamente');
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
  configDetails.value.forEach(item => {
    const original = originalValues.value[item.id];
    if (original) {
      item.value = original.value;
      item.index = original.index;
    }
  });
  hasChanges.value = false;
  emit('changes-detected', false);
  console.log('Cambios cancelados');
};

// Exponer la función para que el componente padre pueda usarla
defineExpose({
  saveAllChanges,
  hasChanges
});

watch([() => props.franchiseId, () => props.franchiseCode], ([newId, newCode], [oldId, oldCode]) => {
  if (newId !== oldId || newCode !== oldCode) {
    fetchConfigDetails();
  }
}, { immediate: true });

onMounted(() => {
  fetchConfigDetails();
});
</script>

<style scoped>
.config-list-container {
  margin-top: 20px;
}

.config-details {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.config-item {
  background-color: white;
  transition: all 0.3s ease;
}

.config-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-label {
  color: #495057;
  font-weight: 600;
}

.form-control {
  border: 1px solid #ced4da;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.9rem;
}

.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .config-item {
    padding: 10px !important;
  }
  
  .form-control {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .config-item {
    padding: 8px !important;
  }
  
  .form-control {
    font-size: 0.8rem;
  }
}
</style> 