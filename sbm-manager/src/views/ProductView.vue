<template>
  <CRUDManagerComponent
    title="Administrador de Productos"
    resourceName="Producto"
    endpoint="/api/catalog/products/"
    iconClass="fas fa-box me-2 text-secondary"
    :fields="fields"
    :states="states"
    :showPropertiesButton="true"
    @refresh="handleRefresh"
    @created="handleCreated"
    @updated="handleUpdated"
    @row-selected="handleProductSelected"
  >
    <template #properties>
      <div class="properties-content">
        <div class="row">
          <div class="col-md-6">
            <h4 class="mb-3">Información General</h4>
            <ul class="list-unstyled">
              <li><strong>Total de Productos:</strong> {{ totalProducts }}</li>
              <li><strong>Productos Activos:</strong> {{ activeProducts }}</li>
              <li><strong>Productos Inactivos:</strong> {{ inactiveProducts }}</li>
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
        
        <!-- Configuración de Producto -->
        <div class="row mt-4" v-if="selectedProduct">
          <div class="col-12">
            <ConfigListComponent 
              :franchiseId="selectedProduct"
              :franchiseCode="selectedProductCode"
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
const products = ref([]);
const selectedProduct = ref('');

// Computed para el título de propiedades
const propertiesTitle = computed(() => {
  if (selectedProduct.value) {
    const product = products.value.find(p => p.id === selectedProduct.value);
    return product ? `${product.sku} - ID: ${product.id}` : "Producto: Sistema de Gestión";
  }
  return "Producto: Sistema de Gestión";
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
  if (!selectedProduct.value) return '';
  const product = products.value.find(p => p.id === selectedProduct.value);
  return product ? product.code : '';
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
    const response = await api.get('/api/catalog/products/');
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

const handleCreated = (data) => {
  console.log('Producto creado:', data);
};

const handleUpdated = (id) => {
  console.log('Producto actualizado:', id);
};

// Escuchar cuando se selecciona un producto
const handleProductSelected = (product) => {
  if (product && product.code) {
    selectedProduct.value = product.id;
  }
};

// Manejar cambios en la configuración
const handleConfigChanges = (hasChanges) => {
  console.log('Configuración detectada con cambios:', hasChanges);
};

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