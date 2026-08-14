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
          <FranchiseSelector v-model="selectedFranchise" :franchises="franchises" @change="onFranchiseChange" />
        </div>
      </div>
      <br />
    </div>

    <CRUDManagerComponent v-if="selectedFranchise" title="" resourceName="item Catálogo" endpoint="catalogs/"
      get-endpoint="catalogs/" post-endpoint="catalogs/" iconClass="" :componentTitle="componentTitle"
      :fields="fields" :apiClient="dpApi" rowKey="id" :includeVisibleFilter="true" :showDeletedFilter="false"
      :allowCreate="false" :allowUpdate="false" :allowDelete="false" :showConfigForm="false"
      :showPropertiesButton="true" :showConfigList="false" :showCalculationComponent="false"
      :enableExtendedProperties="false" :optionsProps="optionsProps" @refresh="handleRefresh"
      @row-selected="handleCatalogSelected" @import="handleImport" @export="handleExport">
      <template #properties>
        <PropertiesComponent :product="selectedCatalog" :fields="fields" title="Propiedades del Catálogo"
          :apiClient="dpApi" :enableExtendedData="false" :editable="false" />
      </template>
    </CRUDManagerComponent>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { dpApi, sbmApi } from '../api/clients';
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue';
import PropertiesComponent from '../components/PropertiesComponent.vue';
import FranchiseSelector from '../components/FranchiseSelectorComponent.vue';

const franchises = ref([]);
const selectedFranchise = ref('');
const selectedFranchiseCode = ref('');
const selectedFranchiseName = ref('');
const selectedFranchiseSigla = ref('');

const selectedCatalogId = ref(null);
const selectedCatalog = ref(null)
const selectedCatalogName = ref('');
const selectedCatalogSku = ref('');

const componentTitle = computed(() => {
  if (!selectedFranchise.value) return null;
  return ``;
});

const lastUpdate = computed(() => new Date().toLocaleString('es-ES'));

const optionsProps = ref({
  showToggleButton: true,
  toggleButtonText: '',
  toggleIconClass: '',
  iconHide: 'fas fa-eye',
  iconShow: 'fas fa-eye-slash',
  toggleClassWhenShown: 'btn-danger text-white',
  toggleClassWhenHidden: 'btn-warning text-dark',

  showImportButton: true,
  importButtonClass: 'btn-outline-success',
  importButtonText: 'Importar',
  importIcon: 'fas fa-file-import',

  showExportButton: true,
  exportButtonClass: 'btn-outline-primary',
  exportButtonText: 'Exportar',
  exportIcon: 'fas fa-file-export'
});

const fields = ref([
  { key: 'id', hideInGrid: true, omitInForm: true },
  { key: 'code', hideInGrid: true, omitInForm: true },
  { key: 'sku', label: 'SKU', type: 'text', omitInForm: true },
  { key: 'cover_image', label: 'Imagen de Portada', type: 'url' },
  { key: 'menu', hideInGrid: true, omitInForm: true },
  { key: 'menu_name', label: 'Menú', type: 'pill_name', omitInForm: true },
  { key: 'group', hideInGrid: true, omitInForm: true },
  { key: 'group_name', label: 'Grupo de Item', omitInForm: true },
  { key: 'category', hideInGrid: true, omitInForm: true },
  { key: 'category_name', label: 'Categoría', omitInForm: true },
  { key: 'type', hideInGrid: true, omitInForm: true },
  { key: 'type_name', label: 'Tipo de Item', omitInForm: true },
  { key: 'restriction', label: 'Restricción', type: 'text' },
  { key: 'name', label: 'Nombre', type: 'text' },
  { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'obs', label: 'Observaciones', type: 'textarea' },
  { key: 'chef_recommendation', label: 'Recomendación del Chef', type: 'checkbox' },
  { key: 'usage_instructions', label: 'Instrucciones de Uso', type: 'text' },
  { key: 'price', label: 'Precio', type: 'text' },
  { key: 'min_quantity_purchase', label: 'Cantidad Mínima de Compra', type: 'number' },
  { key: 'rations_quantity', label: 'Cantidad de Raciones', type: 'number' },
  { key: 'secondary_image', hideInGrid: true, omitInForm: true },
  { key: 'complementary_image', hideInGrid: true, omitInForm: true },
  { key: 'image_gallery', hideInGrid: true, omitInForm: true },
  { key: 'configuration', label: 'Configuración', type: 'text' },
  { key: 'is_visible', label: 'Visible', type: 'checkbox' },
  { key: 'is_deleted', label: 'Eliminado', type: 'checkbox' },
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox' },
  { key: 'created_at', label: 'Creado en', omitInForm: true },
  { key: 'updated_at', hideInGrid: true, omitInForm: true },
  { key: 'confirmed_at', hideInGrid: true, omitInForm: true },
  { key: 'deleted_at', hideInGrid: true, omitInForm: true },
  { key: 'created_by', hideInGrid: true, omitInForm: true },
  { key: 'confirmed_by', hideInGrid: true, omitInForm: true },
  { key: 'updated_by', hideInGrid: true, omitInForm: true },
  { key: 'deleted_by', hideInGrid: true, omitInForm: true },
  { key: 'log', hideInGrid: true, omitInForm: true },
  { key: 'version', hideInGrid: true, omitInForm: true },
]);

const onFranchiseChange = (payload) => {
  selectedFranchiseCode.value = payload.code;
  selectedFranchiseName.value = payload.name;
  selectedFranchiseSigla.value = payload.sigla;
};

const handleRefresh = () => {
  console.log('Refresh solicitado');
};
const handleCreated = (data) => console.log('Catálogo creado:', data);
const handleUpdated = (id) => console.log('Catálogo actualizado:', id);

const handleCatalogSelected = (catalog) => {
  selectedCatalog.value = catalog
}

const handleImport = () => {
  console.log('Importar catálogos');
};

const handleExport = () => {
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
    const res = await sbmApi.get('franchises/');
    franchises.value = Array.isArray(res.data) ? res.data : (res.data.results || []);
  } catch {
    franchises.value = [];
  }
});
</script>