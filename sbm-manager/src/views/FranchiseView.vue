<template>
  <CRUDManagerComponent
    title="Administrador de Franquicias"
    resourceName="Franquicia"
    endpoint="/franchises/"
    iconClass="fas fa-cubes me-2 text-secondary"
    :fields="fields"
    :states="states"
    @refresh="handleRefresh"
    @created="handleCreated"
    @updated="handleUpdated"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue';
import api from '../api/axios';

const states = ref([]);

const fields = ref([
  { key: 'franchise', label: 'Nombre de Franquicia', type: 'text', required: true, maxlength: 50 },
  { key: 'description', label: 'Siglas', type: 'text', required: true, maxlength: 36 },
  { key: 'state', label: 'Estado', type: 'select', required: true, optionsKey: 'states' },
]);

const fetchStates = async () => {
  try {
    const response = await api.get('/franchise-states/');
    // Extraer el array results de la respuesta
    states.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error al cargar estados:', error);
    states.value = [];
  }
};

const handleRefresh = () => {
  // Recargar la página o actualizar datos
  window.location.reload();
};

const handleCreated = (data) => {
  console.log('Franquicia creada:', data);
};

const handleUpdated = (id) => {
  console.log('Franquicia actualizada:', id);
};

onMounted(() => {
  fetchStates();
});
</script>

<style scoped>
/* Responsive para móviles */
@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem !important;
    text-align: center;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.25rem !important;
  }
}
</style> 