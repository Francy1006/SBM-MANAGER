<template>
  <CRUDManagerComponent
    title="Administrador de Franquicias"
    resourceName="Franquicia"
    endpoint="/franchises/"
    iconClass="fas fa-cubes me-2 text-secondary"
    :fields="fields"
    :states="states"
    :showPropertiesButton="true"
    @refresh="handleRefresh"
    @created="handleCreated"
    @updated="handleUpdated"
    @row-selected="handleFranchiseSelected"
  >
    <template #properties>
      <div class="properties-content">
        <div class="row">
          <div class="col-md-6">
            <h4 class="mb-3">Información General</h4>
            <ul class="list-unstyled">
              <li><strong>Total de Franquicias:</strong> {{ totalFranchises }}</li>
              <li><strong>Franquicias Activas:</strong> {{ activeFranchises }}</li>
              <li><strong>Franquicias Inactivas:</strong> {{ inactiveFranchises }}</li>
            </ul>
          </div>
          <div class="col-md-6">
            <h4 class="mb-3">Estadísticas</h4>
            <ul class="list-unstyled">
              <li><strong>Última Actualización:</strong> {{ lastUpdate }}</li>
              <li><strong>Estado del Sistema:</strong> <span class="badge bg-success">Activo</span></li>
            </ul>
          </div>
        </div>
        
        <div class="row mt-4">
          <div class="col-12">
            <h4 class="mb-3">Configuración del Sistema</h4>
          </div>
        </div>
        
        <!-- Configuración de Franquicia -->
        <div class="row mt-4" v-if="selectedFranchise">
          <div class="col-12">
            <ConfigListComponent 
              :franchiseId="selectedFranchise"
              :franchiseCode="selectedFranchiseCode"
              endpointType="code"
              title="Configuración de Precios"
            />
          </div>
        </div>
      </div>
    </template>
  </CRUDManagerComponent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue';
import ConfigListComponent from '../components/ConfigListComponent.vue';
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

<style scoped>
.properties-content {
  color: #6c757d;
}

.properties-content h4 {
  color: #495057;
  font-family: 'DINAlternate', sans-serif;
  font-weight: bold;
}

.properties-content ul li {
  margin-bottom: 8px;
  padding: 5px 0;
  border-bottom: 1px solid #e9ecef;
}

.properties-content ul li:last-child {
  border-bottom: none;
}

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