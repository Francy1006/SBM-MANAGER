<template>
  <CRUDManagerComponent
    title="Directiva Fiscal"
    resourceName="Directiva Fiscal"
    endpoint="/fiscal-directives/"
    iconClass="fa-solid fa-file-invoice text-secondary"
    statsEndpoint="/fiscal-directives-stats/"
    statsTitle="Estadísticas"
    :fields="fields"
    :showDateAlert="true"
    @refresh="handleRefresh"
    @created="handleCreated"
    @updated="handleUpdated"
  />
</template>

<script setup>
import { ref } from 'vue';
import CRUDManagerComponent from '../../components/CRUDManagerComponent.vue';

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
    disabledOnEdit: true
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

const handleRefresh = () => {
  // Recargar la página o actualizar datos
  window.location.reload();
};

const handleCreated = (data) => {
  console.log('Directiva Fiscal creada:', data);
};

const handleUpdated = (id) => {
  console.log('Directiva Fiscal actualizada:', id);
};
</script>