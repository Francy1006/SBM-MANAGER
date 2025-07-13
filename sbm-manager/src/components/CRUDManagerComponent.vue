<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4" style="font-family: 'DINAlternate', sans-serif; color: #e53935;">
      {{ title }}
    </h1>
    
    <!-- Título del componente (opcional) -->
    <div v-if="componentTitle" class="row mt-4 mb-4">
      <div class="col-12">
        <h2 class="h4 fw-bold text-black">
          {{ componentTitle }}
        </h2>
      </div>
    </div>
    
    <div class="alert alert-info">
      <div class="mb-2">
        <strong>Fecha actual:</strong> {{ currentDate }}
      </div>
    </div>
    
    <!-- Botón Crear + -->
    <div class="mb-4" v-if="!showForm">
      <button @click="showCreateForm" class="btn btn-danger rounded-pill px-4">
        <i class="fa-solid fa-plus me-2"></i> Crear {{ resourceName }}
      </button>
    </div>
    
    <!-- Componente de Estadísticas (opcional) -->
    <StatsGeneralComponent
      v-if="statsEndpoint && statsEndpoint.trim() !== ''"
      :endpoint="statsEndpoint"
      :title="statsTitle"
    />
    
    <!-- Componente de Formulario (solo para crear si showConfigForm está habilitado) -->
    <SimpleFormComponent
      v-if="!showConfigForm || !showConfigFormComponent"
      :show="showForm"
      :is-edit="isEdit"
      :fields="fields"
      :values="editingData"
      :loading="loading"
      v-bind="states ? { states } : {}"
      @close="onClose"
      @save="onSave"
    />
    
    <!-- Componente de Configuración (opcional) -->
    <ConfigFormComponent
      v-if="showConfigForm && showConfigFormComponent && selectedRow"
      :catalog="selectedRow"
      :configurationName="configFormName"
      :publicPivotField="configFormPivotField"
      @close="onConfigFormClose"
      @updated="onConfigFormUpdated"
    />
    
    <!-- Componente de Tabla CRUD -->
    <CRUDGridComponent
      ref="crudGridRef"
      :resourceName="resourceName"
      :endpoint="endpoint"
      :iconClass="iconClass"
      v-bind="states ? { states } : {}"
      @configure="onConfigure"
      @row-selected="onRowSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CRUDGridComponent from './CRUDGridComponent.vue';
import SimpleFormComponent from './SimpleFormComponent.vue';
import StatsGeneralComponent from './StatsGeneralComponent.vue';
import ConfigFormComponent from './ConfigFormComponent.vue';
import axios from '../api/axios';

// Props
const props = defineProps({
      // Configuración general
    title: {
      type: String,
      required: true
    },
    componentTitle: {
      type: String,
      default: null
    },
    resourceName: {
      type: String,
      required: true
    },
  endpoint: {
    type: String,
    required: true
  },
  iconClass: {
    type: String,
    default: 'fa-solid fa-list-alt text-secondary'
  },
  // Configuración de estadísticas
  statsEndpoint: {
    type: String,
    default: null
  },
  statsTitle: {
    type: String,
    default: 'Estadísticas'
  },
      // Configuración de formulario
    fields: {
      type: Array,
      required: true
    },
    // Configuración adicional para CRUDGrid
    states: {
      type: [Array, Object],
      default: null
    },
    // Configuración de API
    createEndpoint: {
      type: String,
      default: null
    },
    updateEndpoint: {
      type: String,
      default: null
    },
    // Configuración del ConfigFormComponent
    showConfigForm: {
      type: Boolean,
      default: false
    },
    configFormName: {
      type: String,
      default: 'Configuración'
    },
    configFormPivotField: {
      type: String,
      default: 'id'
    }
});

// Emits
const emit = defineEmits(['refresh', 'created', 'updated', 'mounted']);

// Reactive data
const currentDate = ref(getCurrentDate());
const isEdit = ref(false);
const editingData = ref({});
const loading = ref(false);
const showForm = ref(false);
const crudGridRef = ref(null);
const selectedRow = ref(null);
const showConfigFormComponent = ref(false);

// Computed
const finalCreateEndpoint = computed(() => {
  return props.createEndpoint || props.endpoint;
});

const finalUpdateEndpoint = computed(() => {
  return props.updateEndpoint || props.endpoint;
});

// Methods
function getCurrentDate() {
  return capitalizeFirst(
    new Date().toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  );
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Función para actualizar el estado de los campos según el modo
function updateFieldsState() {
  // Buscar campos que deben deshabilitarse en modo edición
  props.fields.forEach(field => {
    if (field.disabledOnEdit) {
      field.disabled = isEdit.value;
    }
  });
}

function showCreateForm() {
  isEdit.value = false;
  editingData.value = {};
  showForm.value = true;
  updateFieldsState();
}

async function onSave(data) {
  loading.value = true;
  try {
    const cleanedData = cleanData(data);
    
    if (isEdit.value && editingData.value.id) {
      await axios.put(`${finalUpdateEndpoint.value}${editingData.value.id}/`, cleanedData);
      emit('updated', editingData.value.id);
      alert(`${props.resourceName} actualizado exitosamente!`);
    } else {
      const response = await axios.post(finalCreateEndpoint.value, cleanedData);
      emit('created', response.data);
      alert(`${props.resourceName} creado exitosamente!`);
    }
    
    isEdit.value = false;
    editingData.value = {};
    showForm.value = false;
    updateFieldsState();
    
    if (crudGridRef.value) {
      crudGridRef.value.resetEditingState();
    }
    
    // Recargar datos
    emit('refresh');
    
  } catch (error) {
    let errorMessage = `Error al guardar ${props.resourceName}: `;
    if (error.response?.data?.detail) {
      errorMessage += error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMessage += error.response.data.message;
    } else {
      errorMessage += error.message;
    }
    
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
}

function cleanData(data) {
  const cleaned = {};
  Object.keys(data).forEach(key => {
    // Incluir checkboxes aunque sean false, excluir otros campos vacíos
    if (data[key] !== null && data[key] !== undefined && 
        (data[key] !== '' || typeof data[key] === 'boolean')) {
      cleaned[key] = data[key];
    }
  });
  return cleaned;
}

function onClose() {
  isEdit.value = false;
  editingData.value = {};
  showForm.value = false;
  updateFieldsState();
  
  if (crudGridRef.value) {
    crudGridRef.value.resetEditingState();
  }
}

function onConfigure(row) {
  // Si showConfigForm está habilitado, mostrar ConfigFormComponent
  if (props.showConfigForm) {
    selectedRow.value = row;
    showConfigFormComponent.value = true;
    return;
  }
  
  // Comportamiento normal para otras vistas
  editingData.value = { ...row };
  isEdit.value = true;
  showForm.value = true;
  updateFieldsState();
}

function onRowSelected(row) {
  selectedRow.value = row;
  
  // Si se deselecciona y showConfigForm está habilitado, cerrar el formulario
  if (!row && props.showConfigForm) {
    showForm.value = false;
    isEdit.value = false;
    editingData.value = {};
    showConfigFormComponent.value = false;
  }
}

function onConfigFormClose() {
  selectedRow.value = null;
  showConfigFormComponent.value = false;
  // Limpiar selección en la tabla
  if (crudGridRef.value) {
    crudGridRef.value.selected = [];
  }
}

function onConfigFormUpdated() {
  // Recargar datos después de actualizar configuración
  emit('refresh');
  if (crudGridRef.value) {
    crudGridRef.value.loadData();
  }
}

onMounted(() => {
  // Emitir evento de montaje
  emit('mounted');
});
</script>

<style scoped>
/* Estilos específicos del componente manager */
.container-fluid {
  max-width: 100%;
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .btn {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .btn {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
  
  h1 {
    font-size: 1.25rem;
  }
}
</style> 