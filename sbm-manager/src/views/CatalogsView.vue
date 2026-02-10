<template>
  <div class="catalog-manager container-fluid py-4">
    <h1 class="catalog-title mb-4">
      <i class="fa-solid fa-book"></i>
      Catálogos
    </h1>

    <div class="row mb-4">
      <div class="col-12 col-md-6 col-lg-4">
        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center">
          <label for="franchiseSelect" class="form-label fw-bold text-black mb-2 mb-md-0 me-md-3 label-franchise">
            <i class="fas fa-cube text-secondary me-2"></i>
            Selecciona Marca
          </label>
          <select
            id="franchiseSelect"
            v-model="selectedFranchise"
            class="form-select form-select-lg rounded-3 shadow-sm select-franchise"
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
      endpoint="/catalogs/list/"
      iconClass=""
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
        <PropertiesComponent
          title="Propiedades del Catálogo"
          :total="franchises.length"
          :activos="null"
          :inactivos="null"
          :lastUpdate="lastUpdate"
          status="Activo"
        />
      </template>
    </CRUDManagerComponent>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '../api/axios';
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue';
import PropertiesComponent from '../components/PropertiesComponent.vue';

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
  return `Marca: ${selectedFranchiseName.value} - ${selectedFranchiseSigla.value}`;
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

// Campos del formulario
const fields = ref([
  { key: 'sku', label: 'SKU', type: 'text', required: true, maxlength: 50 },
  { key: 'cover_image', label: 'Imagen de Portada', type: 'url', required: false, maxlength: 500, omitInForm: true },
  { key: 'menu', label: 'Menú', type: 'dynamic-select', required: true, endpoint: '/menus', labelKey: 'menu', valueKey: 'id', hideInGrid: true },
  { key: 'menu_name', label: 'Menú', type: 'text', required: false, omitInForm: true },
  { key: 'category', label: 'Categoría', type: 'dynamic-select', required: true, endpoint: '/item-categories', labelKey: 'category', valueKey: 'id', hideInGrid: true },
  { key: 'category_name', label: 'Categoría', type: 'text', required: false, omitInForm: true },
  { key: 'item_type', label: 'Tipo de Item', type: 'dynamic-select', required: true, endpoint: '/item-types', labelKey: 'type', valueKey: 'id', hideInGrid: true },
  { key: 'type_name', label: 'Tipo de Item', type: 'text', required: false, omitInForm: true },
  { key: 'item_group', label: 'Grupo de Item', type: 'dynamic-select', required: true, endpoint: '/item-groups', labelKey: 'group_name', valueKey: 'id', hideInGrid: true },
  { key: 'group_name', label: 'Grupo de Item', type: 'text', required: false, omitInForm: true },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxlength: 255, uppercase: true },
  { key: 'description', label: 'Descripción', type: 'textarea', required: true, uppercase: true },
  { key: 'obs', label: 'Observaciones', type: 'textarea', required: false },
  { key: 'chef_recommendation', label: 'Recomendación del Chef', type: 'checkbox', required: false },
  { key: 'base_net_amount', label: 'Valor Base NETO', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true },
  { key: 'net_amount', label: 'Costo NETO', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true },
  { key: 'gross_amount', label: 'Costo BRUTO', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true },
  { key: 'iva_amount', label: 'IVA', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true, hideInGrid: true },
  { key: 'aditional_tax_amount', label: 'Impuesto adicional', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true, hideInGrid: true },
  { key: 'retention_amount', label: 'Retención', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true, hideInGrid: true },
  { key: 'price_configuration', label: 'Configuración de Precio', type: 'dynamic-select', required: true, endpoint: '/price-configurations/catalog/', labelKey: 'price_configuration', valueKey: 'code', formGroup: 'price_data', hideInGrid: true },
  { key: 'min_quantity_purchase', label: 'Cantidad Mínima de Compra', type: 'number', required: true, min: 1 },
  { key: 'rations_quantity', label: 'Cantidad de Raciones', type: 'number', required: true, min: 1 },
  { key: 'item_configuration', label: 'Configuración de Item', type: 'text', required: false, hideInGrid: true, omitInForm: true },
  { key: 'usage_instructions', label: 'Instrucciones de Uso', type: 'dynamic-select', required: true, endpoint: '/instructions', labelKey: 'group_name', valueKey: 'id', labelKey: 'instruction', hideInGrid: true },
  { key: 'configuration', label: 'Configuración', type: 'text', required: false, hideInGrid: true, omitInForm: false },
  { key: 'is_visible', label: 'Visible', type: 'checkbox', required: false },
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox', required: false },
  { key: 'created_at', label: 'Creado en', type: 'text', required: false, hideInGrid: true, omitInForm: true },
]);

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