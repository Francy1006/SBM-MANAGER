<template>
  <CRUDManagerComponent
    title="Administrador de Proveedores"
    resourceName="Proveedor"
    endpoint="/providers/"
    iconClass="fas fa-truck me-2 text-secondary"
    :fields="fields"
    :states="states"
    :showPropertiesButton="false"
    @refresh="handleRefresh"
    @created="handleCreated"
    @updated="handleUpdated"
    @row-selected="handleProviderSelected"
  >
    <template #properties>
      <div class="properties-content">
        <div class="row">
          <div class="col-md-6">
            <h4 class="mb-3">Información General</h4>
            <ul class="list-unstyled">
              <li><strong>Total de Proveedores:</strong> {{ totalProviders }}</li>
              <li><strong>Proveedores Activos:</strong> {{ activeProviders }}</li>
              <li><strong>Proveedores Inactivos:</strong> {{ inactiveProviders }}</li>
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
        
        <!-- Configuración de Proveedor -->
        <div class="row mt-4" v-if="selectedProvider">
          <div class="col-12">
            <ConfigListComponent 
              :franchiseId="selectedProvider"
              :franchiseCode="selectedProviderCode"
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
const providers = ref([]);
const selectedProvider = ref('');

// Computed para el título de propiedades
const propertiesTitle = computed(() => {
  if (selectedProvider.value) {
    const provider = providers.value.find(p => p.id === selectedProvider.value);
    return provider ? `${provider.provider} - ID: ${provider.id}` : "Proveedor: Sistema de Gestión";
  }
  return "Proveedor: Sistema de Gestión";
});

// Computed para estadísticas
const totalProviders = computed(() => {
  return providers.value.length;
});

const activeProviders = computed(() => {
  return providers.value.filter(p => p.is_active === true).length;
});

const inactiveProviders = computed(() => {
  return providers.value.filter(p => p.is_active !== true).length;
});

const lastUpdate = computed(() => {
  return new Date().toLocaleString('es-ES');
});

const selectedProviderCode = computed(() => {
  if (!selectedProvider.value) return '';
  const provider = providers.value.find(p => p.id === selectedProvider.value);
  return provider ? provider.code : '';
});

const fields = ref([
  { key: 'provider', label: 'Proveedor', type: 'text', required: true, maxlength: 50, uppercase: true },
  { key: 'type', label: 'Tipo', type: 'dynamic-select', required: true, endpoint: 'http://localhost:8082/api/provider-types/', labelKey: 'type', hideInGrid: true },
  { key: 'rating', label: 'Calificación', type: 'rating', required: true, min: 0, max: 5 },
  { key: 'obs_provider', label: 'Observaciones del Proveedor', type: 'textarea', required: true },
  { key: 'contact_name', label: 'Nombre de Contacto', type: 'text', required: false, uppercase: true, maxlength: 100 },
  { key: 'contact_mail', label: 'Email de Contacto', type: 'email', required: false, maxlength: 255 },
  { key: 'contact_phone', label: 'Teléfono de Contacto', type: 'number', required: false },
  { key: 'contact_phone2', label: 'Teléfono Secundario', type: 'number', required: false },
  { key: 'website_url', label: 'Sitio Web', type: 'url', required: false },
  { key: 'obs_contact', label: 'Observaciones de Contacto', type: 'textarea', required: false, maxlength: 255 },
  { key: 'company_name', label: 'Nombre de la Empresa', type: 'text', required: false, maxlength: 255 },
  { key: 'company_rut', label: 'RUT de la Empresa', type: 'text', required: false, maxlength: 12 },
  { key: 'company_activity', label: 'Actividad de la Empresa', type: 'text', required: false, maxlength: 255 },
  { key: 'legal_representative', label: 'Representante Legal', type: 'text', required: false, maxlength: 255 },
  { key: 'billing_address', label: 'Dirección de Facturación', type: 'textarea', required: false },
  { key: 'billing_mail', label: 'Email de Facturación', type: 'email', required: false, maxlength: 255 },
  { key: 'billing_phone', label: 'Teléfono de Facturación', type: 'number', required: false },
  { key: 'company_bank', label: 'Banco de la Empresa', type: 'dynamic-select', required: false, endpoint: 'http://localhost:8082/api/banks/', labelKey: 'bank' },
  { key: 'bank_account_type', label: 'Tipo de Cuenta Bancaria', type: 'dynamic-select', required: false, endpoint: 'http://localhost:8082/api/bank-account-types/', labelKey: 'type' },
  { key: 'bank_account_number', label: 'Número de Cuenta Bancaria', type: 'text', required: false, maxlength: 255 },
  { key: 'bank_account_mail', label: 'Email de Cuenta Bancaria', type: 'email', required: false, maxlength: 255 },
  { key: 'dispatch_address', label: 'Dirección de Despacho', type: 'text', required: false, maxlength: 255 },
  { key: 'dispatch_maps_location', label: 'Ubicación en Maps', type: 'text', required: false, maxlength: 255 },
  { key: 'obs_dispatch', label: 'Observaciones de Despacho', type: 'textarea', required: false },
  { key: 'dispatch_district', label: 'Comuna Despacho', type: 'dynamic-select', required: false, endpoint: 'http://localhost:8082/api/districts/', labelKey: 'district' },
  { key: 'dispatch_region', label: 'Región de Despacho', type: 'dynamic-select', required: false, endpoint: 'http://localhost:8082/api/regions/', labelKey: 'region' },
  { key: 'is_active', label: 'Activo', type: 'checkbox', required: false },
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox', required: false },
]);

const fetchStates = async () => {
  try {
    const response = await api.get('/provider-states/');
    states.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error al cargar estados:', error);
    states.value = [];
  }
};

const fetchProviders = async () => {
  try {
    const response = await api.get('/api/catalog/providers/');
    providers.value = response.data.results || response.data;
  } catch (error) {
    console.error('Error al cargar proveedores:', error);
    providers.value = [];
  }
};

const handleRefresh = () => {
  window.location.reload();
};

const handleCreated = (data) => {
  console.log('Proveedor creado:', data);
};

const handleUpdated = (id) => {
  console.log('Proveedor actualizado:', id);
};

const handleProviderSelected = (provider) => {
  if (provider && provider.code) {
    selectedProvider.value = provider.id;
  }
};

const handleConfigChanges = (hasChanges) => {
  console.log('Configuración detectada con cambios:', hasChanges);
};

onMounted(() => {
  fetchStates();
  fetchProviders();
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