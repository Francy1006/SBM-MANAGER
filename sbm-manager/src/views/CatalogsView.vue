<template>
    <div class="container-fluid py-4">
        <h1 class="mb-4" style="font-family: 'DINAlternate', sans-serif; color: #e53935;">
            Administrador de Catálogos
        </h1>
        <div class="row mb-4">
            <div class="col-12 col-md-6 col-lg-4">
                <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                    <label for="franchiseSelect" class="form-label fw-bold text-black mb-2 mb-md-0 me-md-3" style="padding-right: 10px; min-width: 250px;">
                        <i class="fas fa-cube text-secondary me-2"></i>
                        Selecciona Franquicia
                    </label>
                    <select
                        id="franchiseSelect"
                        v-model="selectedFranchise"
                        class="form-select form-select-lg rounded-3 shadow-sm border-black"
                        style="max-width: 320px; width: 100%;"
                    >
                        <option v-for="franchise in franchises" :key="franchise.id" :value="franchise.id">
                            {{ franchise.franchise || franchise.name }}
                        </option>
                    </select>
                </div>
            </div>
        </div>
        <br>
        
        <!-- CRUDManagerComponent para catálogos -->
        <CRUDManagerComponent
            v-if="selectedFranchise"
            title=""
            resourceName="Catálogo"
            endpoint="/catalogs/"
            iconClass="fas fa-book me-2 text-secondary"
            :componentTitle="componentTitle"
            :fields="fields"
            :showConfigForm="true"
            configFormName="Catálogo"
            configFormPivotField="sku"
            :showPropertiesButton="true"
            :showConfigList="true"
            :configListFranchiseId="selectedFranchise"
            configListEndpointType="id"
            configListTitle="Configuración de Precios"
            :endpointBase="`/franchise-configuration-details/franchise_price_configurations_code/?franchise_code=${selectedFranchiseCode}`"
            @refresh="handleRefresh"
            @created="handleCreated"
            @updated="handleUpdated"
            @row-selected="handleCatalogSelected"
        >
            <template #properties>
                <div class="properties-content">
                    <div class="row">
                        <div class="col-md-6">
                            <h4 class="mb-3">Información General</h4>
                            <ul class="list-unstyled">
                                <li><strong>Franquicia Seleccionada:</strong> {{ selectedFranchiseName }}</li>
                                <li><strong>Siglas:</strong> {{ selectedFranchiseSigla }}</li>
                                <li><strong>ID de Franquicia:</strong> {{ selectedFranchise }}</li>
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
                    
                    <!-- Configuración de Precios -->
                    <!-- Eliminado: ConfigListComponent directo, solo debe estar el de CRUDManagerComponent -->
                </div>
            </template>
        </CRUDManagerComponent>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '../api/axios';
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue';
import ConfigListComponent from '../components/ConfigListComponent.vue';

const franchises = ref([]);
const selectedFranchise = ref('');
const selectedCatalogId = ref(null);
const selectedCatalogName = ref('');
const selectedCatalogSku = ref('');

// Computed properties para obtener datos de la franquicia seleccionada
const selectedFranchiseName = computed(() => {
  if (!selectedFranchise.value) return '';
  const franchise = franchises.value.find(f => f.id === selectedFranchise.value);
  return franchise ? (franchise.franchise || franchise.name) : '';
});

const selectedFranchiseSigla = computed(() => {
  if (!selectedFranchise.value) return '';
  const franchise = franchises.value.find(f => f.id === selectedFranchise.value);
  return franchise ? franchise.description : '';
});

const selectedFranchiseCode = computed(() => {
  if (!selectedFranchise.value) return '';
  const franchise = franchises.value.find(f => f.id === selectedFranchise.value);
  return franchise ? franchise.code : '';
});

// Computed para el título del componente
const componentTitle = computed(() => {
  if (!selectedFranchise.value) return null;
  return `Franquicia: ${selectedFranchiseName.value} - ${selectedFranchiseSigla.value}`;
});

// Computed para el título de propiedades
const propertiesTitle = computed(() => {
  if (selectedCatalogId.value && selectedCatalogName.value && selectedCatalogSku.value) {
    return `${selectedCatalogName.value} - SKU: ${selectedCatalogSku.value}`;
  }
  if (selectedFranchise.value) {
    const franchise = franchises.value.find(f => f.id === selectedFranchise.value);
    return franchise ? `Catálogos: ${franchise.franchise || franchise.name} - ID: ${franchise.id}` : "Catálogos: Sistema de Gestión";
  }
  return "Catálogos: Sistema de Gestión";
});

// Computed para última actualización
const lastUpdate = computed(() => {
  return new Date().toLocaleString('es-ES');
});

// Campos del formulario (si se necesita en el futuro)
const fields = ref([]);

const handleRefresh = () => {
  // Recargar la página o actualizar datos
  window.location.reload();
};

const handleCreated = (data) => {
  console.log('Catálogo creado:', data);
};

const handleUpdated = (id) => {
  console.log('Catálogo actualizado:', id);
};

const handleCatalogSelected = (catalog) => {
  selectedCatalogId.value = catalog.id;
  selectedCatalogName.value = catalog.name;
  selectedCatalogSku.value = catalog.sku;
};

onMounted(async () => {
  // Verificar si el usuario está autenticado
  const token = localStorage.getItem('token');
  const userInfo = {
    uuid: localStorage.getItem('uuid'),
    email: localStorage.getItem('email'),
    name: localStorage.getItem('name')
  };
  
  if (!token || !userInfo.uuid) {
    window.location.href = '/login';
    return;
  }
  
  try {
    const res = await axios.get('/franchises/');
    
    // Soporta respuesta paginada o lista directa
    franchises.value = Array.isArray(res.data)
      ? res.data
      : (res.data.results || []);
  } catch (e) {
    // El interceptor de axios se encargará de manejar errores 401
    franchises.value = [];
  }
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
    
    .form-label {
        font-size: 0.9rem;
    }
    
    .form-select {
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    h1 {
        font-size: 1.25rem !important;
    }
    
    .form-label {
        font-size: 0.85rem;
    }
    
    .form-select {
        font-size: 0.85rem;
    }
}
</style>