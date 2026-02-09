<template>
  <div class="crud-manager container-fluid py-4">
    <h1 class="crud-title mb-4">
      {{ title }}
    </h1>

    <!-- Título del componente (opcional) -->
    <div v-if="componentTitle" class="row mt-4 mb-5">
      <div class="col-12">
        <h2 class="fw-bold text-black">
          <strong>{{ componentTitle }}</strong>
        </h2>
      </div>
    </div>

    <div class="alert alert-info" v-if="showDateAlert">
      <div class="mb-2">
        <strong>Fecha actual:</strong> {{ currentDate }}
      </div>
    </div>

    <!-- Componente de Estadísticas (opcional) -->
    <StatsGeneralComponent v-if="statsEndpoint && statsEndpoint.trim() !== ''" 
      :endpoint="statsEndpoint" :title="statsTitle" />

    <!-- Componente de Configuración (opcional) -->
    <ConfigListComponent v-if="showConfigList && configListFranchiseId" 
      :franchiseId="configListFranchiseId"
      :endpointType="configListEndpointType" 
      :title="configListTitle" 
      :endpointBase="endpointBase" />

    <br>
    <!-- Botones de acción -->
    <div class="mt-4 mb-4" v-if="!showForm && !showProperties">
      <button @click="showCreateForm" class="btn btn-danger rounded-pill px-4 crud-btn">
        <i class="fa-solid fa-plus me-2"></i> Crear {{ resourceName }}
      </button>
    </div>

    <!-- Componente de Formulario -->
    <SimpleFormComponent v-if="(!showConfigForm || !showConfigFormComponent) && !showProperties" 
      :show="showForm" :is-edit="isEdit" :fields="fields" 
      :values="editingData" :loading="loading" 
      v-bind="states ? { states } : {}"
      @close="onClose" @save="onSave" />

    <!-- Componente de Configuración -->
    <ConfigFormComponent v-if="showConfigForm && showConfigFormComponent && selectedRow" 
      :catalog="selectedRow"
      :configurationName="configFormName" 
      :publicPivotField="configFormPivotField" 
      @close="onConfigFormClose"
      @updated="onConfigFormUpdated" />

    <!-- Componente de Tabla CRUD -->
    <CRUDGridComponent v-if="!showProperties" ref="crudGridRef" 
      :resourceName="resourceName"
      :endpoint="finalGetEndpoint" 
      :iconClass="iconClass" 
      :showPropertiesButton="showPropertiesButton"
      v-bind="states ? { states } : {}" 
      :fields="fields" 
      @configure="onConfigure" 
      @row-selected="onRowSelected"
      @show-properties="onShowProperties" />

    <!-- Componente de Propiedades -->
    <PropertiesComponent v-if="showProperties" 
      :product="selectedRow" 
      :propertiesTitle="propertiesTitle"
      :fields="props.propertiesFields" 
      :verboseNames="props.propertiesVerboseNames" 
      :systemFields="props.systemFields"
      :systemVerboseNames="props.systemVerboseNames" 
      :configComponent="props.configComponent"
      :configProps="props.configProps" 
      :showCalculationComponent="props.showCalculationComponent"
      :calculationCode="props.calculationCode" 
      :baseNetAmount="props.baseNetAmount" 
      :netAmount="props.netAmount"
      :grossAmount="props.grossAmount" 
      :ivaAmount="props.ivaAmount" 
      :additionalTaxAmount="props.additionalTaxAmount"
      :retentionAmount="props.retentionAmount" 
      :selectedProductSku="props.selectedProductSku"
      @close="onPropertiesClose">
      <slot name="properties"></slot>
    </PropertiesComponent>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import CRUDGridComponent from './CRUDGridComponent.vue';
import SimpleFormComponent from './SimpleFormComponent.vue';
import StatsGeneralComponent from './StatsGeneralComponent.vue';
import ConfigFormComponent from './ConfigFormComponent.vue';
import PropertiesComponent from './PropertiesComponent.vue';
import ConfigListComponent from './ConfigListComponent.vue';
import axios from '../api/axios';

// Props
const props = defineProps({
  // Configuración general
  title: {
    type: String,
    required: true
  },
  componentTitle: {
    type: String,
    default: null
  },
  resourceName: {
    type: String,
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  getEndpoint: {
    type: String,
    default: null
  },
  createEndpoint: {
    type: String,
    default: null
  },
  postEndpoint: {
    type: String,
    default: null
  },
  iconClass: {
    type: String,
    default: 'fa-solid fa-list-alt text-secondary'
  },
  // Configuración de estadísticas
  statsEndpoint: {
    type: String,
    default: null
  },
  statsTitle: {
    type: String,
    default: 'Estadísticas'
  },
  // Configuración de formulario
  fields: {
    type: Array,
    required: true
  },
  // Configuración adicional para CRUDGrid
  states: {
    type: [Array, Object],
    default: null
  },
  // Configuración de API
  createEndpoint: {
    type: String,
    default: null
  },
  updateEndpoint: {
    type: String,
    default: null
  },
  // Configuración del ConfigFormComponent
  showConfigForm: {
    type: Boolean,
    default: false
  },
  configFormName: {
    type: String,
    default: 'Configuración'
  },
  configFormPivotField: {
    type: String,
    default: 'id'
  },
  // Configuración del ConfigListComponent
  showConfigList: {
    type: Boolean,
    default: false
  },
  configListFranchiseId: {
    type: [String, Number],
    default: null
  },
  configListEndpointType: {
    type: String,
    default: 'id'
  },
  configListTitle: {
    type: String,
    default: 'Configuración'
  },
  // Configuración de Propiedades
  showPropertiesButton: {
    type: Boolean,
    default: false
  },
  propertiesProduct: {
    type: Object,
    default: null
  },
  propertiesProductTitle: {
    type: String,
    default: ''
  },
  propertiesFields: {
    type: Array,
    default: () => []
  },
  propertiesVerboseNames: {
    type: Object,
    default: () => ({})
  },
  systemFields: {
    type: Array,
    default: () => []
  },
  systemVerboseNames: {
    type: Object,
    default: () => ({})
  },
  // Configuración de alerta de fecha
  showDateAlert: {
    type: Boolean,
    default: false
  },
  endpointBase: {
    type: String,
    default: ''
  },
  // Configuración para el componente PropertiesComponent
  configComponent: {
    type: String,
    default: null
  },
  configProps: {
    type: Object,
    default: () => ({})
  },
  showCalculationComponent: {
    type: Boolean,
    default: false
  },
  calculationCode: {
    type: String,
    default: ''
  },
  baseNetAmount: {
    type: [Number, String],
    default: null
  },
  netAmount: {
    type: [Number, String],
    default: null
  },
  grossAmount: {
    type: [Number, String],
    default: null
  },
  ivaAmount: {
    type: [Number, String],
    default: null
  },
  additionalTaxAmount: {
    type: [Number, String],
    default: null
  },
  retentionAmount: {
    type: [Number, String],
    default: null
  },
  selectedProductSku: {
    type: String,
    default: null
  }
});

// Emits
const emit = defineEmits(['refresh', 'created', 'updated', 'mounted', 'row-selected']);

// Reactive data
const currentDate = ref(getCurrentDate());
const isEdit = ref(false);
const editingData = ref({});
const loading = ref(false);
const showForm = ref(false);
const crudGridRef = ref(null);
const selectedRow = ref(null);
const showConfigFormComponent = ref(false);
const showProperties = ref(false); // Nuevo estado para mostrar/ocultar propiedades

// Depuración: watcher para ver si cambia el título
watch(() => props.propertiesProduct, (newVal) => {
});

// Computed properties
const finalGetEndpoint = computed(() => props.getEndpoint || props.endpoint);
const finalCreateEndpoint = computed(() => props.createEndpoint || props.endpoint);

const finalUpdateEndpoint = computed(() => {
  return props.endpoint;
});

const propertiesTitle = computed(() => {
  if (selectedRow.value && selectedRow.value.sku) {
    return selectedRow.value.description
      ? `${selectedRow.value.sku} - ${selectedRow.value.description}`
      : selectedRow.value.sku;
  }
  return "Producto: Sistema de Gestión";
});

// Methods
function getCurrentDate() {
  return capitalizeFirst(
    new Date().toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  );
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Función para actualizar el estado de los campos según el modo
function updateFieldsState() {
  // Buscar campos que deben deshabilitarse en modo edición
  props.fields.forEach(field => {
    if (field.disabledOnEdit) {
      field.disabled = isEdit.value;
    }
  });
}

function showCreateForm() {
  isEdit.value = false;
  editingData.value = {};
  showForm.value = true;
  updateFieldsState();
}

async function onSave(data) {
  loading.value = true;
  try {
    const cleanedData = cleanData(data);
    if (isEdit.value && editingData.value.sku) {
      // Usar PATCH y el SKU como identificador
      await axios.patch(`/products/${editingData.value.sku}/`, cleanedData);
      emit('updated', editingData.value.sku);
      alert(`${props.resourceName} actualizado exitosamente!`);
    } else if (isEdit.value && editingData.value.id) {
      // Fallback por si hay id, pero preferir SKU
      await axios.patch(`${finalUpdateEndpoint.value}${editingData.value.id}/`, cleanedData);
      emit('updated', editingData.value.id);
      alert(`${props.resourceName} actualizado exitosamente!`);
    } else {
      const response = await axios.post(finalCreateEndpoint.value, cleanedData);
      emit('created', response.data);
      alert(`${props.resourceName} creado exitosamente!`);
    }
    isEdit.value = false;
    editingData.value = {};
    showForm.value = false;
    updateFieldsState();
    if (crudGridRef.value) {
      crudGridRef.value.resetEditingState();
    }
    // Recargar datos
    emit('refresh');
  } catch (error) {
    let errorMessage = `Error al guardar ${props.resourceName}: `;
    if (error.response?.data?.detail) {
      errorMessage += error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMessage += error.response.data.message;
    } else {
      errorMessage += error.message;
    }
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
}

function cleanData(data) {
  // Lista de campos a omitir
  const omitKeys = [
    'log', 'version', 'created_at', 'updated_at', 'deleted_at', 'confirmed_at',
    'created_by', 'updated_by', 'deleted_by', 'confirmed_by',
    'url', // si tampoco lo quieres enviar
  ];

  const cleaned = {};
  const grouped = {};
  props.fields.forEach(field => {
    const key = field.key;
    if (omitKeys.includes(key)) return;
    if (field.formGroup) {
      if (!grouped[field.formGroup]) grouped[field.formGroup] = {};
      let value = data[field.formGroup]?.[key];
      // Si es checkbox, asegúrate de que sea booleano
      if (field.type === 'checkbox') {
        value = value === true;
      }
      // Omitir si el valor es vacío
      if (value !== null && value !== undefined && value !== '') {
        grouped[field.formGroup][key] = value;
      }
    } else {
      let value = data[key];
      // Si es checkbox, asegúrate de que sea booleano
      if (field.type === 'checkbox') {
        value = value === true;
      }
      // Omitir si el valor es vacío
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    }
  });

  // Solo agrega los grupos si tienen al menos un valor no vacío
  Object.keys(grouped).forEach(group => {
    if (group === 'price_data') {
      // Solo incluye los keys base_net_amount y price_configuration
      const pd = {};
      if ('base_net_amount' in grouped[group]) pd.base_net_amount = grouped[group].base_net_amount ?? null;
      if ('price_configuration' in grouped[group]) pd.price_configuration = grouped[group].price_configuration ?? null;
      // Solo agrega si existen los keys
      if (Object.keys(pd).length > 0) {
        cleaned[group] = pd;
      }
    } else {
      // Para otros grupos, solo si tienen algún valor no vacío
      const groupValues = Object.values(grouped[group]);
      const hasValue = groupValues.some(v => v !== null && v !== undefined && v !== '');
      if (hasValue) {
        cleaned[group] = grouped[group];
      }
    }
  });
  // Elimina del nivel raíz los campos que pertenecen a un formGroup
  props.fields.forEach(field => {
    if (field.formGroup && cleaned.hasOwnProperty(field.key)) {
      delete cleaned[field.key];
    }
  });
  return cleaned;
}

function onClose() {
  isEdit.value = false;
  editingData.value = {};
  showForm.value = false;
  updateFieldsState();

  if (crudGridRef.value) {
    crudGridRef.value.resetEditingState();
  }
}

function onConfigure(row) {
  // Si showConfigForm está habilitado, mostrar ConfigFormComponent
  if (props.showConfigForm) {
    selectedRow.value = row;
    showConfigFormComponent.value = true;
    return;
  }

  // Agrupar campos con formGroup 'price_data' desde el nivel raíz
  const mappedRow = { ...row };
  const priceDataFields = props.fields.filter(f => f.formGroup === 'price_data');
  mappedRow.price_data = {};
  priceDataFields.forEach(f => {
    let val = row[f.key] !== undefined ? row[f.key] : null;
    if (f.key !== 'price_configuration' && val !== null && val !== '' && !isNaN(val)) {
      val = parseInt(val, 10);
    }
    // Para price_configuration, forzar string o null
    if (f.key === 'price_configuration') {
      val = val ? String(val) : null;
    }
    mappedRow.price_data[f.key] = val;
  });

  editingData.value = mappedRow;
  isEdit.value = true;
  showForm.value = true;
  updateFieldsState();
}

function onRowSelected(row) {
  selectedRow.value = row;

  // Si se deselecciona y showConfigForm está habilitado, cerrar el formulario
  if (!row && props.showConfigForm) {
    showForm.value = false;
    isEdit.value = false;
    editingData.value = {};
    showConfigFormComponent.value = false;
  }

  // Emitir evento de fila seleccionada
  emit('row-selected', row);
}

function onConfigFormClose() {
  selectedRow.value = null;
  showConfigFormComponent.value = false;
  // Limpiar selección en la tabla
  if (crudGridRef.value) {
    crudGridRef.value.selected = [];
  }
}

function onConfigFormUpdated() {
  // Recargar datos después de actualizar configuración
  emit('refresh');
  if (crudGridRef.value) {
    crudGridRef.value.loadData();
  }
}

function onShowProperties(row) {
  showProperties.value = true;
  selectedRow.value = row;
}

function onPropertiesClose() {
  showProperties.value = false;
  selectedRow.value = null;
}

onMounted(() => {
  // Emitir evento de montaje
  emit('mounted');
});
</script>