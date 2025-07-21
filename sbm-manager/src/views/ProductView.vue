<template>
  <CRUDManagerComponent
    title="Administrador de Productos"
    resourceName="Producto"
    endpoint="/products/product-list/"
    get-endpoint="/products/product-list/"
    post-endpoint="/products/"
    iconClass="fas fa-box me-2 text-secondary"
    :fields="fields"
    :states="states"
    :showPropertiesButton="true"
    :propertiesProduct="propertiesProduct"
    :propertiesFields="propertiesFields"
    :propertiesVerboseNames="propertiesVerboseNames"
    :systemFields="systemFields"
    :systemVerboseNames="systemVerboseNames"
    :configComponent="ConfigListComponent"
    :configProps="{
      code: selectedPriceConfiguration,
      endpointBase: `/price-configuration-formula/?code=${selectedPriceConfiguration}`,
      endpointType: 'code',
      title: 'Configuración de Precios',
      fields: [
        { key: 'price_configuration', label: 'Configuración', editable: false },
        { key: 'formula_template', label: 'Plantilla', editable: false },
        { key: 'formula_translate', label: 'Fórmula', editable: false }
      ],
      infoAlertText: 'Formula para calculo de producto',
      showInfoAlert: true
    }"
    :showCalculationComponent="true"
    @refresh="handleRefresh"
    @row-selected="handleProductSelected"
    @show-properties="handleShowProperties"
  />
  <template v-if="showConfigList">
    <div class="modal-backdrop fade show"></div>
    <div class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Configuración de Producto</h5>
            <button type="button" class="btn-close" @click="closeConfigList"></button>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue';
import ConfigListComponent from '../components/ConfigListComponent.vue';
import api from '../api/axios';

const states = ref([]);
const products = ref([]);
const selectedProductId = ref(null);
const showConfigList = ref(false);
const configListProduct = ref(null);
const selectedPriceConfiguration = ref(null);
// Computed: producto cuyas propiedades se muestran
const propertiesProduct = computed(() => {
  return products.value.find(p => String(p.id) === String(selectedProductId.value)) || null;
});

// Computed para estadísticas
const totalProducts = computed(() => {
  return products.value.length;
});

const activeProducts = computed(() => {
  return products.value.filter(p => p.is_active === true).length;
});

const inactiveProducts = computed(() => {
  return products.value.filter(p => p.is_active !== true).length;
});

const lastUpdate = computed(() => {
  return new Date().toLocaleString('es-ES');
});

const selectedProductCode = computed(() => {
  if (!selectedProductId.value) return '';
  const product = products.value.find(p => p.id === selectedProductId.value);
  return product ? product.code : '';
});

const fields = ref([
  { key: 'sku', label: 'SKU', type: 'text', required: true, maxlength: 50 },
  { key: 'description', label: 'Descripción', type: 'textarea', required: true, uppercase: true },
  { key: 'obs', label: 'Observaciones', type: 'textarea', required: true },
  { key: 'package_unit', label: 'Unidad de Empaque', type: 'number', required: true, min: 1 },
  { key: 'min_package_purchase', label: 'Mínimo de Compra', type: 'number', required: true, min: 1 },
  { key: 'base_net_amount', label: 'Valor Base NETO', type: 'price', required: true, formGroup: 'price_data', secretField: true },
  { key: 'net_amount', label: 'Costo NETO', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true },
  { key: 'gross_amount', label: 'Costo BRUTO', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true },
  { key: 'iva_amount', label: 'IVA', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true, hideInGrid: true },
  { key: 'aditional_tax_amount', label: 'Impuesto adicional', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true, hideInGrid: true },
  { key: 'retention_amount', label: 'Retención', type: 'price', required: true, formGroup: 'price_data', secretField: true, omitInForm: true, hideInGrid: true },
  { key: 'price_configuration', label: 'Configuración de Precio', type: 'dynamic-select', required: true, endpoint: '/price-configurations/', labelKey: 'price_configuration', valueKey: 'code', formGroup: 'price_data' , hideInGrid: true},
  { key: 'price_configuration_label', label: 'Configuración de Precio', type: 'text', labelKey: 'price_configuration_label', omitInForm: true },
  { key: 'provider', label: 'Proveedor', type: 'dynamic-select', required: true, endpoint: '/providers', labelKey: 'provider', hideInGrid: true },
  { key: 'type', label: 'Tipo', type: 'dynamic-select', required: true, endpoint: '/item-types', labelKey: 'type', hideInGrid: true},
  { key: 'item_group', label: 'Grupo', type: 'dynamic-select', required: true, endpoint: '/item-groups', labelKey: 'group_name', hideInGrid: true },
  { key: 'category', label: 'Categoría', type: 'dynamic-select', required: true, endpoint: '/item-categories', labelKey: 'category', hideInGrid: true},
  { key: 'url', label: 'URL', type: 'url', required: false, maxlength: 255, omitInForm: true },
  { key: 'package', label: 'Empaque', type: 'dynamic-select', required: true, endpoint: '/packages', labelKey: 'description', valueKey: 'id', hideInGrid: true},
  { key: 'is_active', label: 'Activo', type: 'checkbox', required: false},  
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox', required: false},
  { key: 'updated_by', label: 'Actualizado por', type: 'text', required: false, hideInGrid: true, omitInForm: true },
  { key: 'created_by', label: 'Creado por', type: 'text', required: false, hideInGrid: true, omitInForm: true },
  { key: 'confirmed_by', label: 'Confirmado por', type: 'text', required: false, hideInGrid: true, omitInForm: true },
  { key: 'deleted_by', label: 'Eliminado por', type: 'text', required: false, hideInGrid: true, omitInForm: true },
  { key: 'confirmed_at', label: 'Confirmado en', type: 'text', required: false, hideInGrid: true, omitInForm: true },
  { key: 'updated_at', label: 'Actualizado en', type: 'text', required: false, hideInGrid: true, omitInForm: true },
  { key: 'deleted_at', label: 'Eliminado en', type: 'text', required: false, hideInGrid: true, omitInForm: true },
  { key: 'log', label: 'Log', type: 'textarea', required: false, hideInGrid: true, omitInForm: true },
  { key: 'version', label: 'Versión', type: 'text', required: false, hideInGrid: true, omitInForm: true },
  { key: 'price', label: 'Precio CODE', type: 'text', required: false, hideInGrid: true, omitInForm: true },
]);

const propertiesFields = ['obs', 'package_unit', 'min_package_purchase'];
const propertiesVerboseNames = {
  obs: 'Observaciones',
  package_unit: 'Unidad de Empaque',
  min_package_purchase: 'Mínimo de Compra'
};

const systemFields = ['is_confirmed', 'is_active', 'is_deleted', 'version'];
const systemVerboseNames = {
  is_confirmed: 'Confirmado',
  is_active: 'Activo',
  is_deleted: 'Eliminado',
  version: 'Versión'
};


const fetchStates = async () => {
  try {
    const response = await api.get('/product-states/');
    // Extraer el array results de la respuesta
    states.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error al cargar estados:', error);
    states.value = [];
  }
};

const fetchProducts = async () => {
  try {
    const response = await api.get('api/catalog/products/');
    products.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error al cargar productos:', error);
    products.value = [];
  }
};

const handleRefresh = () => {
  // Recargar la página o actualizar datos
  window.location.reload();
};

// Escuchar cuando se selecciona un producto
const handleProductSelected = (product) => {
  if (product) {
    //selectedProductId.value = product.id;
    selectedPriceConfiguration.value = product.price_configuration
  } else {
    selectedProductId.value = null;
    selectedProductId.value = null;
  }
};

// Manejar apertura de propiedades
function handleShowProperties(product) {
  if (product && product.id) {
    selectedProductId.value = product.id;
  } else {
    selectedProductId.value = null;
  }
}
function closeConfigList() {
  showConfigList.value = false;
  configListProduct.value = null;
}

onMounted(() => {
  fetchStates();
  fetchProducts();
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