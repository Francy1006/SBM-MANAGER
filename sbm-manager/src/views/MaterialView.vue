<template>
  <CRUDManagerComponent
    title="Administrador de Materiales"
    resourceName="Material"
    endpoint="/api/catalog/materials/"
    iconClass="fas fa-tools me-2 text-secondary"
    :fields="fields"
    :states="states"
    :showPropertiesButton="true"
    @refresh="handleRefresh"
    @created="handleCreated"
    @updated="handleUpdated"
    @row-selected="handleMaterialSelected"
  >
    <template #properties>
      <PropertiesComponent
        class="properties-content"
        title="Propiedades del Material"
        :total="totalMaterials"
        :activos="activeMaterials"
        :inactivos="inactiveMaterials"
        :lastUpdate="lastUpdate"
        status="Activo"
        :configComponent="ConfigListComponent"
        :configProps="{ franchiseId: selectedMaterial, franchiseCode: selectedMaterialCode, endpointType: 'code', title: 'Configuración de Precios' }"
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
const materials = ref([]);
const selectedMaterial = ref('');

// Computed para el título de propiedades
const propertiesTitle = computed(() => {
  if (selectedMaterial.value) {
    const material = materials.value.find(m => m.id === selectedMaterial.value);
    return material ? `${material.sku} - ID: ${material.id}` : "Material: Sistema de Gestión";
  }
  return "Material: Sistema de Gestión";
});

// Computed para estadísticas
const totalMaterials = computed(() => {
  return materials.value.length;
});

const activeMaterials = computed(() => {
  return materials.value.filter(m => m.is_active === true).length;
});

const inactiveMaterials = computed(() => {
  return materials.value.filter(m => m.is_active !== true).length;
});

const lastUpdate = computed(() => {
  return new Date().toLocaleString('es-ES');
});

const selectedMaterialCode = computed(() => {
  if (!selectedMaterial.value) return '';
  const material = materials.value.find(m => m.id === selectedMaterial.value);
  return material ? material.code : '';
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
  { key: 'package', label: 'Empaque', type: 'select', required: true, optionsKey: 'packages' },
  { key: 'is_active', label: 'Activo', type: 'checkbox', required: false },
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox', required: false },
]);

const fetchStates = async () => {
  try {
    const response = await api.get('/material-states/');
    states.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error al cargar estados:', error);
    states.value = [];
  }
};

const fetchMaterials = async () => {
  try {
    const response = await api.get('/api/catalog/materials/');
    materials.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error al cargar materiales:', error);
    materials.value = [];
  }
};

const handleRefresh = () => {
  window.location.reload();
};

const handleCreated = (data) => {
  console.log('Material creado:', data);
};

const handleUpdated = (id) => {
  console.log('Material actualizado:', id);
};

const handleMaterialSelected = (material) => {
  if (material && material.code) {
    selectedMaterial.value = material.id;
  }
};

const handleConfigChanges = (hasChanges) => {
  console.log('Configuración detectada con cambios:', hasChanges);
};

onMounted(() => {
  fetchStates();
  fetchMaterials();
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