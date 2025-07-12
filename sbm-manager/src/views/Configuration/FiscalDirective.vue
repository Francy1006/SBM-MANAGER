<template>
    <div class="container-fluid py-4">
        <h1 class="mb-4" style="font-family: 'DINAlternate', sans-serif; color: #e53935;">
            Directiva Fiscal
        </h1>
        <div class="alert alert-info">
            <div class="mb-2">
                <strong>Fecha actual:</strong> {{ currentDate }}
            </div>
        </div>
        
        <!-- Botón Crear + -->
        <div class="mb-4" v-if="!showForm">
            <button @click="showCreateForm" class="btn btn-danger rounded-pill px-4">
                <i class="fa-solid fa-plus me-2"></i> Crear Directiva Fiscal
            </button>
        </div>
        
        <StatsGeneralComponent
            endpoint="/fiscal-directives-stats/"
            title="Estadísticas de Directivas Fiscales"
        />
        
        <SimpleFormComponent
            :show="showForm"
            :is-edit="isEdit"
            :fields="fields"
            :values="editingData"
            :loading="loading"
            @close="onClose"
            @save="onSave"
        />
        <CRUDGridComponent
            ref="crudGridRef"
            resourceName="Directivas Fiscales"
            endpoint="/fiscal-directives/"
            iconClass="fa-solid fa-file-invoice text-secondary"
            @configure="onConfigure"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CRUDGridComponent from '../../components/CRUDGridComponent.vue';
import SimpleFormComponent from '../../components/SimpleFormComponent.vue';
import StatsGeneralComponent from '../../components/StatsGeneralComponent.vue';
import axios from '../../api/axios';

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const currentDate = ref(
  capitalizeFirst(
    new Date().toLocaleString('es-ES', {
      weekday: 'long', // día de la semana
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  )
);

const crudGridRef = ref(null);
const isEdit = ref(false);
const editingData = ref({});
const loading = ref(false);
const showForm = ref(false);

const fields = ref([
  { key: 'fiscal_directive', label: 'Nombre Directiva Fiscal', type: 'text', required: true, maxlength: 100 },
  { 
    key: 'type', 
    label: 'Tipo', 
    type: 'dynamic-select', 
    required: true, 
    endpoint: '/fiscal-directive-types/',
    valueKey: 'id',
    labelKey: 'type',
    disabled: false
  },
  { key: 'obs', label: 'Observaciones', type: 'textarea', required: false, maxlength: 255 },
  { key: 'percentage', label: 'Porcentaje', type: 'number', required: true, step: '0.01', min: 0, max: 100, suffix: '%' },
  { key: 'official_source_url', label: 'URL Fuente', type: 'text', required: false, maxlength: 255 },
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox', required: false },
  { key: 'is_deleted', label: 'Eliminado', type: 'checkbox', required: false },
  { key: 'month', label: 'Mes vigencia', type: 'number', required: true, min: 1, max: 12 },
  { key: 'end_month', label: 'Mes fin vigencia', type: 'number', required: true, min: 1, max: 12 },
  { key: 'year', label: 'Año vigencia', type: 'number', required: true, min: 2000, max: 2100 },
  { key: 'end_year', label: 'Año fin vigencia', type: 'number', required: true, min: 2000, max: 2100 },
]);

// Función para actualizar el estado de los campos según el modo
const updateFieldsState = () => {
  const typeField = fields.value.find(field => field.key === 'type');
  if (typeField) {
    typeField.disabled = isEdit.value;
  }
};

const showCreateForm = () => {
  isEdit.value = false;
  editingData.value = {};
  showForm.value = true;
  updateFieldsState();
};

const cleanData = (data) => {
  const cleaned = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
      cleaned[key] = data[key];
    }
  });
  return cleaned;
};

const onSave = async (data) => {
  loading.value = true;
  try {
    const cleanedData = cleanData(data);
    console.log('Datos a enviar:', cleanedData);
    
    if (isEdit.value && editingData.value.id) {
      await axios.put(`/fiscal-directives/${editingData.value.id}/`, cleanedData);
      alert('Directiva Fiscal actualizada exitosamente!');
    } else {
      const response = await axios.post('/fiscal-directives/', cleanedData);
      console.log('Respuesta del servidor:', response.data);
      alert('Directiva Fiscal creada exitosamente!');
    }
    isEdit.value = false;
    editingData.value = {};
    showForm.value = false;
    updateFieldsState();
    if (crudGridRef.value) crudGridRef.value.resetEditingState();
    window.location.reload();
  } catch (error) {
    console.error('Error completo:', error);
    console.error('Datos del error:', error.response?.data);
    alert('Error al guardar la Directiva Fiscal: ' + (error.response?.data?.detail || error.message));
  } finally {
    loading.value = false;
  }
};

const onClose = () => {
  isEdit.value = false;
  editingData.value = {};
  showForm.value = false;
  updateFieldsState();
  if (crudGridRef.value) crudGridRef.value.resetEditingState();
};

const onConfigure = (row) => {
  editingData.value = { ...row };
  isEdit.value = true;
  showForm.value = true;
  updateFieldsState();
};

onMounted(() => {
});
</script>

<style scoped></style>