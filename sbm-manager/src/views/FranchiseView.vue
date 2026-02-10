<template>
  <CRUDManagerComponent
    class="crud-manager"
    title="Administrador de Franquicias"
    resourceName="Franquicia"
    endpoint="/franchises/"
    iconClass="fas fa-cubes me-2 text-secondary"
    :fields="fields"
    :states="states"
    :showPropertiesButton="true"
    :configComponent="ConfigListComponent"
    :configProps="{
      code: selectedFranchiseCode,
      endpointBase: `/franchise-configuration-details/franchise_price_configurations_code/?franchise_code=${selectedFranchiseCode}`,
      endpointType: 'code',
      title: 'Configuración de Precios',
      fields: null,
      infoAlertText: 'El Índice superior sobreescribe la logica con índice menor',
      showInfoAlert: true
    }"
    @refresh="handleRefresh"
    @created="handleCreated"
    @updated="handleUpdated"
    @row-selected="handleFranchiseSelected"
  />
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue';
import ConfigListComponent from '../components/ConfigListComponent.vue';
import PropertiesComponent from '../components/PropertiesComponent.vue';
import api from '../api/axios';

const states = ref([]);
const franchises = ref([]);
const selectedFranchise = ref('');

// Computed para el título de propiedades
const propertiesTitle = computed(() => {
  if (selectedFranchise.value) {
    const franchise = franchises.value.find(f => f.id === selectedFranchise.value);
    return franchise ? `${franchise.franchise} - ID: ${franchise.id}` : "Franquicia: Sistema de Gestión";
  }
  return "Franquicia: Sistema de Gestión";
});

// Computed para estadísticas
const totalFranchises = computed(() => {
  return franchises.value.length;
});

const activeFranchises = computed(() => {
  return franchises.value.filter(f => f.state === 1).length;
});

const inactiveFranchises = computed(() => {
  return franchises.value.filter(f => f.state !== 1).length;
});

const lastUpdate = computed(() => {
  return new Date().toLocaleString('es-ES');
});

const selectedFranchiseCode = computed(() => {
  if (!selectedFranchise.value) return '';
  const franchise = franchises.value.find(f => f.id === selectedFranchise.value);
  return franchise ? franchise.code : '';
});

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

const fetchFranchises = async () => {
  try {
    const response = await api.get('/franchises/');
    franchises.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error al cargar franquicias:', error);
    franchises.value = [];
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

// Escuchar cuando se selecciona una franquicia
const handleFranchiseSelected = (franchise) => {
  if (franchise && franchise.code) {
    selectedFranchise.value = franchise.id;
  }
};

// Manejar cambios en la configuración
const handleConfigChanges = (hasChanges) => {
  console.log('Configuración detectada con cambios:', hasChanges);
};

onMounted(() => {
  fetchStates();
  fetchFranchises();
});
</script>