<template>
  <div class="catalog-manager container-fluid py-4">
    <div class="card w-90 mx-4 mb-4">
      <div class="card-body">
        <h1 class="catalog-title ps-4 mb-4">
          <i class="fa-solid fa-book"></i>
          Catálogos
        </h1>
      </div>

      <div class="row">
        <div class="col-1"></div>
        <div class="col-10 w-100 text-center">
          <FranchiseSelector
            v-model="selectedFranchise"
            :franchises="franchises"
            @change="onFranchiseChange"
          />
        </div>
      </div>
      <br>
    </div>

    <CRUDManagerComponent
      v-if="selectedFranchise"
      title=""
      resourceName="item Catálogo"
      endpoint="/catalogs/list/"
      iconClass=""
      :componentTitle="componentTitle"
      :fields="fields"
      :showConfigForm="true"
      configFormName="Catálogo"
      configFormPivotField="sku"
      :showPropertiesButton="true"
      :showConfigList="false"
      :configListFranchiseId="selectedFranchise"
      configListEndpointType="id"
      configListTitle=""
      :endpointBase="`/franchise-configuration-details/franchise_price_configurations_code/?franchise_code=${selectedFranchiseCode}`"
      :optionsProps="optionsProps"
      @refresh="handleRefresh"
      @created="handleCreated"
      @updated="handleUpdated"
      @row-selected="handleCatalogSelected"
      @import="handleImport"
      @export="handleExport"
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
import FranchiseSelector from '../components/FranchiseSelectorComponent.vue';

const franchises = ref([]);
const selectedFranchise = ref('');
const selectedFranchiseCode = ref('');
const selectedFranchiseName = ref('');
const selectedFranchiseSigla = ref('');

const selectedCatalogId = ref(null);
const selectedCatalogName = ref('');
const selectedCatalogSku = ref('');

const componentTitle = computed(() => {
  if (!selectedFranchise.value) return null;
  return ``;
});

const lastUpdate = computed(() => new Date().toLocaleString('es-ES'));

// Configuración de OptionsComponent
const optionsProps = ref({
  // Botón de toggle (mostrar/ocultar campos secretos)
  showToggleButton: true,
  toggleButtonClass: 'btn-outline-info',
  toggleButtonText: '',
  toggleIconClass: '',
  iconShow: 'fas fa-eye',
  iconHide: 'fas fa-eye-slash',
  // Botón de importar
  showImportButton: true,
  importButtonClass: 'btn-outline-success',
  importButtonText: 'Importar',
  importIcon: 'fas fa-file-import',
  // Botón de exportar
  showExportButton: true,
  exportButtonClass: 'btn-outline-primary',
  exportButtonText: 'Exportar',
  exportIcon: 'fas fa-file-export'
});

const fields = ref([
  { key: 'sku', label: 'SKU', type: 'text', required: true, maxlength: 50 },
  { key: 'cover_image', label: 'Imagen de Portada', type: 'url', required: false, maxlength: 500, omitInForm: true },
  { key: 'menu', label: 'Menú', type: 'dynamic-select', required: true, endpoint: '/menus', labelKey: 'menu', valueKey: 'id', hideInGrid: true },
  { key: 'menu_name', label: 'Menú', type: 'pill_name', required: false, omitInForm: true, pillMap: { bellavita: 'bg-primary', raffinata: 'bg-danger' } },
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
  { key: 'net_amount', label: 'Costo NETO', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true, sumCount: true },
  { key: 'gross_amount', label: 'Costo BRUTO', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true },
  { key: 'iva_amount', label: 'IVA', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true, hideInGrid: true },
  { key: 'aditional_tax_amount', label: 'Impuesto adicional', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true, hideInGrid: true },
  { key: 'retention_amount', label: 'Retención', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true, hideInGrid: true },
  { key: 'price_configuration', label: 'Configuración de Precio', type: 'dynamic-select', required: true, endpoint: '/price-configurations/catalog/', labelKey: 'price_configuration', valueKey: 'code', formGroup: 'price_data', hideInGrid: true },
  { key: 'min_quantity_purchase', label: 'Cantidad Mínima de Compra', type: 'number', required: true, min: 1 },
  { key: 'rations_quantity', label: 'Cantidad de Raciones', type: 'number', required: true, min: 1 },
  { key: 'item_configuration', label: 'Configuración de Item', type: 'text', required: false, hideInGrid: true, omitInForm: true },
  { key: 'usage_instructions', label: 'Instrucciones de Uso', type: 'dynamic-select', required: true, endpoint: '/instructions', labelKey: 'instruction', valueKey: 'id', hideInGrid: true },
  { key: 'configuration', label: 'Configuración', type: 'text', required: false, hideInGrid: true },
  { key: 'is_visible', label: 'Visible', type: 'checkbox', required: false },
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox', required: false },
  { key: 'created_at', label: 'Creado en', type: 'text', required: false, hideInGrid: true, omitInForm: true },
]);

const onFranchiseChange = (payload) => {
  selectedFranchiseCode.value = payload.code;
  selectedFranchiseName.value = payload.name;
  selectedFranchiseSigla.value = payload.sigla;
};

const handleRefresh = () => window.location.reload();
const handleCreated = (data) => console.log('Catálogo creado:', data);
const handleUpdated = (id) => console.log('Catálogo actualizado:', id);

const handleCatalogSelected = (catalog) => {
  if (!catalog) {
    // Si se deselecciona, limpiar los valores
    selectedCatalogId.value = null;
    selectedCatalogName.value = '';
    selectedCatalogSku.value = '';
    return;
  }
  selectedCatalogId.value = catalog.id;
  selectedCatalogName.value = catalog.name;
  selectedCatalogSku.value = catalog.sku;
};

const handleImport = () => {
  // Método vacío, se implementará después
  console.log('Importar catálogos');
};

const handleExport = () => {
  // Método vacío, se implementará después
  console.log('Exportar catálogos');
};

onMounted(async () => {
  const token = localStorage.getItem('token');
  const uuid = localStorage.getItem('uuid');

  if (!token || !uuid) {
    window.location.href = '/login';
    return;
  }

  try {
    const res = await axios.get('/franchises/');
    franchises.value = Array.isArray(res.data) ? res.data : (res.data.results || []);
  } catch {
    franchises.value = [];
  }
});
</script>
