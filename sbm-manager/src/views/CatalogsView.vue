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

    <CRUDManagerComponent v-if="selectedFranchise" title="" resourceName="item Catálogo" endpoint="catalogs/list/"
      get-endpoint="catalogs/list/" post-endpoint="catalogs/" iconClass="" :componentTitle="componentTitle"
      :fields="fields" :showConfigForm="true" configFormName="Catálogo" configFormResourcePath="catalogs"
      configFormPivotField="sku" configFormLookupField="sku" :showPropertiesButton="true" :showConfigList="false"
      calculationTitle="Precio de venta" :configListFranchiseId="selectedFranchise" configListEndpointType="id"
      configListTitle=""
      calculationDescription="Permite calcular el precio de venta del ítem a partir del valor base neto y las variables contables asociadas (IVA, impuestos adicionales y retenciones), aplicando la fórmula fiscal configurada."
      :endpointBase="`franchise-configuration-details/franchise_price_configurations_code/?franchise_code=${selectedFranchiseCode}`"
      :optionsProps="optionsProps" @refresh="handleRefresh" @created="handleCreated" @updated="handleUpdated"
      @row-selected="handleCatalogSelected" @import="handleImport" @export="handleExport">
      <template #properties>
        <PropertiesComponent :product="selectedCatalog" :fields="fields" title="Propiedades del Catálogo"
          configResource="catalogs" lookupField="sku" />
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
  { key: 'sku', label: 'SKU', type: 'text', required: true, maxlength: 50 },
  { key: 'cover_image', label: 'Imagen de Portada', type: 'url', required: false, maxlength: 500, omitInForm: true },

  { key: 'menu', label: 'Menú', type: 'dynamic-select', required: true, endpoint: '/menus/', labelKey: 'menu', valueKey: 'id', hideInGrid: true },
  { key: 'menu_name', label: 'Menú', type: 'pill_name', omitInForm: true },

  { key: 'category', label: 'Categoría', type: 'dynamic-select', required: true, endpoint: '/item-categories/', labelKey: 'category', valueKey: 'id', hideInGrid: true },
  { key: 'category_name', label: 'Categoría', type: 'text', omitInForm: true },

  { key: 'type', label: 'Tipo de Item', type: 'dynamic-select', required: true, endpoint: '/item-types/', labelKey: 'type', valueKey: 'id', hideInGrid: true },
  { key: 'type_name', label: 'Tipo de Item', type: 'text', omitInForm: true },

  { key: 'restriction', label: 'Restricción', type: 'dynamic-select', required: true, endpoint: '/restrictions/', labelKey: 'restriction', valueKey: 'id', hideInGrid: true },

  { key: 'item_group', label: 'Grupo de Item', type: 'dynamic-select', required: true, endpoint: '/item-groups/', labelKey: 'group_name', valueKey: 'id', hideInGrid: true },
  { key: 'group_name', label: 'Grupo de Item', type: 'text', omitInForm: true },

  { key: 'name', label: 'Nombre', type: 'text', required: true, maxlength: 255 },
  { key: 'description', label: 'Descripción', type: 'textarea', required: true },
  { key: 'obs', label: 'Observaciones', type: 'textarea' },
  { key: 'chef_recommendation', label: 'Recomendación del Chef', type: 'checkbox' },

  // ==========================
  // 🔵 VENTA (VISIBLE EN GRID PERO ENMASCARADA)
  // ==========================

  {
    key: 'base_net_amount',
    label: 'Venta Base NETO',
    type: 'price',
    secretField: false,
    omitInForm: false,
    formGroup: 'price_data'   // 🔥 FALTA ESTO
  },
  { key: 'net_amount', label: 'Venta NETO', type: 'price', secretField: false, omitInForm: true },
  { key: 'iva_amount', label: 'IVA Venta', type: 'price', secretField: false, omitInForm: true },
  { key: 'gross_amount', label: 'Venta BRUTO', type: 'price', secretField: false, omitInForm: true },

  // ==========================
  // 🔴 COSTOS (OCULTOS EN GRID)
  // ==========================

  { key: 'cost_net_amount', label: 'Costo NETO', type: 'price', secretField: true, omitInForm: true, hideInGrid: false },
  { key: 'cost_iva_amount', label: 'IVA Costo', type: 'price', secretField: true, omitInForm: true, hideInGrid: false },
  { key: 'cost_gross_amount', label: 'Costo BRUTO', type: 'price', secretField: true, omitInForm: true, hideInGrid: false },
  { key: 'utility_net_amount', label: 'Utilidad NETA', type: 'price', secretField: true, omitInForm: true },
  { key: 'utility_net_pct', label: '% Utilidad NETA', type: 'percent', secretField: true, omitInForm: true },
  // ==========================
  // 🟢 UTILIDAD (OCULTA EN GRID)
  // ==========================



  // ==========================

  {
    key: 'price_configuration',
    label: 'Configuración de Precio',
    type: 'dynamic-select',
    endpoint: '/price-configurations/',
    labelKey: 'price_configuration',
    valueKey: 'code',
    formGroup: 'price_data',   // 🔥 ESTO ES LA CLAVE
    hideInGrid: true
  },

  { key: 'min_quantity_purchase', label: 'Cantidad Mínima de Compra', type: 'number', min: 1 },
  { key: 'rations_quantity', label: 'Cantidad de Raciones', type: 'number', min: 1 },

  { key: 'package', label: 'Empaque', type: 'dynamic-select', endpoint: '/packages/', labelKey: 'description', valueKey: 'id', hideInGrid: true },

  { key: 'item_configuration', label: 'Configuración de Item', type: 'text', omitInForm: true, hideInGrid: true },

  { key: 'usage_instructions', label: 'Instrucciones de Uso', type: 'dynamic-select', endpoint: '/instructions/', labelKey: 'instruction', valueKey: 'code', hideInGrid: true },

  { key: 'configuration', label: 'Configuración', type: 'dynamic-select', endpoint: '/item-configurations/', labelKey: 'configuration', valueKey: 'code', hideInGrid: true, omitInForm: true },

  { key: 'is_visible', label: 'Visible', type: 'checkbox' },
  { key: 'is_deleted', label: 'Eliminado', type: 'checkbox' },
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox' },

  { key: 'created_at', label: 'Creado en', type: 'text', hideInGrid: true, omitInForm: true }
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
    const res = await axios.get('franchises/');
    franchises.value = Array.isArray(res.data) ? res.data : (res.data.results || []);
  } catch {
    franchises.value = [];
  }
});
</script>