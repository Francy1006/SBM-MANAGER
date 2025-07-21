<template>
  <CRUDManagerComponent
    title="Administrador de Servicios"
    resourceName="Servicio"
    endpoint="/api/catalog/services/"
    iconClass="fas fa-cogs me-2 text-secondary"
    :fields="fields"
    :states="states"
    :showPropertiesButton="true"
    @refresh="handleRefresh"
    @created="handleCreated"
    @updated="handleUpdated"
    @row-selected="handleServiceSelected"
  >
    <template #properties>
      <PropertiesComponent
        title="Propiedades del Servicio"
        :total="totalServices"
        :activos="activeServices"
        :inactivos="inactiveServices"
        :lastUpdate="lastUpdate"
        status="Activo"
        :configComponent="ConfigListComponent"
        :configProps="{ franchiseId: selectedService, franchiseCode: selectedServiceCode, endpointType: 'code', title: 'Configuración de Precios' }"
      />
    </template>
  </CRUDManagerComponent>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue';
import ConfigListComponent from '../components/ConfigListComponent.vue';
import PropertiesComponent from '../components/PropertiesComponent.vue';
import api from '../api/axios';

const states = ref([]);
const services = ref([]);
const selectedService = ref('');

// Computed para el título de propiedades
const propertiesTitle = computed(() => {
  if (selectedService.value) {
    const service = services.value.find(s => s.id === selectedService.value);
    return service ? `${service.sku} - ID: ${service.id}` : "Servicio: Sistema de Gestión";
  }
  return "Servicio: Sistema de Gestión";
});

// Computed para estadísticas
const totalServices = computed(() => {
  return services.value.length;
});

const activeServices = computed(() => {
  return services.value.filter(s => s.is_active === true).length;
});

const inactiveServices = computed(() => {
  return services.value.filter(s => s.is_active !== true).length;
});

const lastUpdate = computed(() => {
  return new Date().toLocaleString('es-ES');
});

const selectedServiceCode = computed(() => {
  if (!selectedService.value) return '';
  const service = services.value.find(s => s.id === selectedService.value);
  return service ? service.code : '';
});

const fields = ref([
  { key: 'sku', label: 'SKU', type: 'text', required: true, maxlength: 50 },
  { key: 'description', label: 'Descripción', type: 'textarea', required: true },
  { key: 'obs', label: 'Observaciones', type: 'textarea', required: true },
  { key: 'package_unit', label: 'Unidad de Empaque', type: 'number', required: true, min: 1 },
  { key: 'min_package_purchase', label: 'Mínimo de Compra', type: 'number', required: true, min: 1 },
  { key: 'price', label: 'Precio', type: 'text', required: true, maxlength: 36 },
  { key: 'provider', label: 'Proveedor', type: 'select', required: true, optionsKey: 'providers' },
  { key: 'type', label: 'Tipo', type: 'select', required: true, optionsKey: 'types' },
  { key: 'group', label: 'Grupo', type: 'select', required: true, optionsKey: 'groups' },
  { key: 'category', label: 'Categoría', type: 'select', required: true, optionsKey: 'categories' },
  { key: 'url', label: 'URL', type: 'url', required: false, maxlength: 255 },
  { key: 'is_active', label: 'Activo', type: 'checkbox', required: false },
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox', required: false },
]);

const fetchStates = async () => {
  try {
    const response = await api.get('/service-states/');
    states.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error al cargar estados:', error);
    states.value = [];
  }
};

const fetchServices = async () => {
  try {
    const response = await api.get('/api/catalog/services/');
    services.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error al cargar servicios:', error);
    services.value = [];
  }
};

const handleRefresh = () => {
  window.location.reload();
};

const handleCreated = (data) => {
  console.log('Servicio creado:', data);
};

const handleUpdated = (id) => {
  console.log('Servicio actualizado:', id);
};

const handleServiceSelected = (service) => {
  if (service && service.code) {
    selectedService.value = service.id;
  }
};

const handleConfigChanges = (hasChanges) => {
  console.log('Configuración detectada con cambios:', hasChanges);
};

onMounted(() => {
  fetchStates();
  fetchServices();
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