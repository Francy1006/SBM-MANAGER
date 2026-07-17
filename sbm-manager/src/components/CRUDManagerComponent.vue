<template>
  <div class="crud-manager container-fluid py-4">

    <div v-if="title" class="card w-90 mx-4 mb-4">
      <div class="card-body">
        <h1 class="crud-title mb-0 d-flex align-items-center">
          <i :class="iconClass" style="margin-right: 8px;"></i>
          <span>{{ title }}</span>
        </h1>
      </div>
    </div>

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

    <StatsGeneralComponent v-if="statsEndpoint && statsEndpoint.trim() !== ''" :endpoint="statsEndpoint"
      :title="statsTitle" />

    <ConfigListComponent v-if="showConfigList && configListFranchiseId" :franchiseId="configListFranchiseId"
      :endpointType="configListEndpointType" :title="configListTitle" :endpointBase="endpointBase" />

    <br>

    <div class="card shadow-sm mb-4" v-if="!showForm && !showProperties">
      <div class="card-body px-4">
        <div class="d-flex align-items-center justify-content-between">

          <div class="mt-2 mb-2">
            <button v-if="allowCreate" @click="showCreateForm" class="btn btn-success rounded-pill px-4 crud-btn">
              <i class="fa-solid fa-plus me-2"></i> Crear {{ resourceName }}
            </button>
          </div>

          <div class="text-end">
            <div class="fw-semibold text-muted">
              TOTAL lista <span class="text-dark">{{ totalList }}</span>
            </div>
            <div class="fw-semibold text-muted">
              TOTAL Eliminados <span class="text-dark">{{ totalDeleted }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <SimpleFormComponent v-if="showForm && (!showConfigForm || !showConfigFormComponent) && !showProperties"
      :show="showForm" :is-edit="isEdit" :fields="formFields" :values="editingData" :loading="loading"
      :title="isEdit ? `Actualizar ${resourceName}` : `Crear ${resourceName}`"
      :configureHeaderFields="configureHeaderFields" v-bind="states ? { states } : {}" @close="onClose"
      @save="onSave" />

    <ConfigFormComponent v-if="showConfigForm && showConfigFormComponent && selectedRow" :catalog="selectedRow"
      :configurationName="configFormName" :publicPivotField="configFormPivotField"
      :resourcePath="props.configFormResourcePath" :lookupField="props.configFormLookupField" @close="onConfigFormClose"
      @updated="onConfigFormUpdated" />

    <CRUDGridComponent v-if="!showProperties" ref="crudGridRef" :resourceName="resourceName"
      :endpoint="finalGetEndpoint" :iconClass="iconClass" :showPropertiesButton="showPropertiesButton"
      :apiClient="apiClient" :rowKey="rowKey" :includeVisibleFilter="includeVisibleFilter"
      :showDeletedFilter="showDeletedFilter" :allowUpdate="allowUpdate" :allowDelete="allowDelete"
      :showOpenColumn="showOpenColumn" :openColumnLabel="openColumnLabel" :showDetailComponent="showDetailComponent"
      :detailTablesConfig="detailTablesConfig" :detailFieldsConfig="detailFieldsConfig"
      :detailExtraProps="detailExtraProps" v-bind="states ? { states } : {}" :fields="fields"
      :optionsProps="optionsProps" @configure="onConfigure" @row-selected="onRowSelected"
      @open-row="emit('open-row', $event)" @show-properties="onShowProperties" @import="handleImport"
      @export="handleExport" @counts-updated="onCountsUpdated" />

    <PropertiesComponent v-if="showProperties" :product="selectedRow" :fields="fields" :advancedData="advancedData"
      :calculationTitle="calculationTitle" :calculationDescription="calculationDescription"
      :configResource="configFormResourcePath" :lookupField="configFormLookupField"
      :enableExtendedData="enableExtendedProperties"
      :editable="propertiesEditable" :editableFields="propertiesEditableFields"
      :readOnlyFields="propertiesReadOnlyFields" :editLoading="loading" :apiClient="apiClient"
      :hasItemConfiguration="showConfigForm" :extraVariables="buildCalculationVariables"
      :calculationConfig="props.calculationConfig" @close="onPropertiesClose" @load-advanced="loadAdvanced"
      @save-edit="onPropertiesSave" />

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

const props = defineProps({
  title: { type: String, required: true },
  componentTitle: { type: String, default: null },
  resourceName: { type: String, required: true },
  endpoint: { type: String, required: true },
  apiClient: { type: [Object, Function], default: () => axios },
  rowKey: { type: String, default: null },
  includeVisibleFilter: { type: Boolean, default: true },
  showDeletedFilter: { type: Boolean, default: true },
  allowCreate: { type: Boolean, default: true },
  allowUpdate: { type: Boolean, default: true },
  allowDelete: { type: Boolean, default: true },
  enableExtendedProperties: { type: Boolean, default: true },
  propertiesEditable: { type: Boolean, default: false },
  propertiesEditableFields: { type: Array, default: () => [] },
  propertiesReadOnlyFields: { type: Array, default: () => [] },
  propertiesUpdateAuditValue: { type: Function, default: null },
  getEndpoint: { type: String, default: null },
  createEndpoint: { type: String, default: null },
  postEndpoint: { type: String, default: null },
  iconClass: { type: String, default: 'fa-solid fa-list-alt text-secondary' },
  calculationTitle: { type: String, default: '' },
  calculationDescription: { type: String, default: '' },
  statsEndpoint: { type: String, default: null },
  statsTitle: { type: String, default: 'Estadísticas' },

  fields: { type: Array, required: true },
  states: { type: [Array, Object], default: null },

  updateEndpoint: { type: String, default: null },

  showConfigForm: { type: Boolean, default: false },
  configFormName: { type: String, default: 'Configuración' },
  configFormPivotField: { type: String, default: 'id' },
  configFormResourcePath: { type: String, default: 'catalogs' },
  configFormLookupField: { type: String, default: 'sku' },

  showConfigList: { type: Boolean, default: false },
  configListFranchiseId: { type: [String, Number], default: null },
  configListEndpointType: { type: String, default: 'id' },
  configListTitle: { type: String, default: 'Configuración' },

  showPropertiesButton: { type: Boolean, default: false },
  propertiesProduct: { type: Object, default: null },
  propertiesProductTitle: { type: String, default: '' },
  propertiesFields: { type: Array, default: () => [] },
  propertiesVerboseNames: { type: Object, default: () => ({}) },
  systemFields: { type: Array, default: () => [] },
  systemVerboseNames: { type: Object, default: () => ({}) },

  showDateAlert: { type: Boolean, default: false },
  endpointBase: { type: String, default: '' },

  detailExtraProps: { type: Object, default: () => ({}) },
  calculationConfig: { type: Object, default: null },

  configComponent: { type: String, default: null },
  configProps: { type: Object, default: () => ({}) },
  showCalculationComponent: { type: Boolean, default: false },
  calculationCode: { type: String, default: '' },
  baseNetAmount: { type: [Number, String], default: null },
  netAmount: { type: [Number, String], default: null },
  grossAmount: { type: [Number, String], default: null },
  ivaAmount: { type: [Number, String], default: null },
  additionalTaxAmount: { type: [Number, String], default: null },
  retentionAmount: { type: [Number, String], default: null },
  selectedProductSku: { type: String, default: null },
  optionsProps: { type: Object, default: () => ({}) },
  showOpenColumn: { type: Boolean, default: true },
  openColumnLabel: { type: String, default: 'Abrir' },
  showDetailComponent: { type: Boolean, default: false },
  /** Valores iniciales al abrir el formulario de creación (p. ej. franchise_code desde la marca seleccionada). */
  createDefaults: { type: Function, default: null },
  detailTablesConfig: {
    type: Array,
    default: () => null
  },
  detailFieldsConfig: {
    type: Object,
    default: () => null
  },

});

const emit = defineEmits(['refresh', 'created', 'updated', 'mounted', 'row-selected', 'open-row', 'import', 'export']);

const currentDate = ref(getCurrentDate());
const isEdit = ref(false);
const editingData = ref({});
const loading = ref(false);
const showForm = ref(false);
const formFields = ref([]);
const crudGridRef = ref(null);
const selectedRow = ref(null);
const showConfigFormComponent = ref(false);
const showProperties = ref(false);
const advancedData = ref(null);
const advancedVerbose = ref(null);

const totalList = ref(0);
const totalDeleted = ref(0);

watch(() => props.propertiesProduct, () => { });

const finalGetEndpoint = computed(() => props.getEndpoint || props.endpoint);
const finalCreateEndpoint = computed(() => props.postEndpoint || props.createEndpoint || props.endpoint);

const finalUpdateEndpoint = computed(() => props.updateEndpoint || props.endpoint);

const configureHeaderFields = computed(() => {
  return props.fields
    .filter(f => f.readOnlyOnConfigure)
    .map(f => f.key)
})

const buildCalculationVariables = computed(() => {
  const row = selectedRow.value || {}
  const fields = props.fields || []

  const allowedKeys = new Set(
    fields
      .filter(f => f.calculation === true || f.useInCalculation === true)
      .map(f => f.key)
  )

  const filteredRow = Object.fromEntries(
    Object.entries(row).filter(([key]) => allowedKeys.has(key))
  )

  return {
    ...filteredRow,
    ...(props.detailExtraProps || {})
  }
})

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

function onCountsUpdated(payload) {
  totalList.value = payload?.total ?? 0;
  totalDeleted.value = payload?.deleted ?? 0;
}

function updateFieldsState() {
  props.fields.forEach(field => {
    if (field.disabledOnEdit) {
      field.disabled = isEdit.value;
    }
  });
}

function showCreateForm() {
  isEdit.value = false;
  const defaults =
    typeof props.createDefaults === 'function' ? props.createDefaults() : null;
  editingData.value =
    defaults && typeof defaults === 'object' && !Array.isArray(defaults) ? { ...defaults } : {};
  formFields.value = props.fields.map(f => ({ ...f, options: [], loading: false }));
  showForm.value = true;
  updateFieldsState();
}

async function onSave(data) {
  loading.value = true;
  try {
    const cleanedData = cleanData(data);
    if (isEdit.value && editingData.value.sku) {
      await axios.patch(
        `${finalUpdateEndpoint.value}${editingData.value.code ?? editingData.value.id ?? editingData.value.sku}/`,
        cleanedData
      );
      emit('updated', editingData.value.sku);
      alert(`${props.resourceName} actualizado exitosamente!`);
    } else if (isEdit.value && editingData.value.id) {
      await axios.patch(`${finalUpdateEndpoint.value}${editingData.value.id}/`, cleanedData);
      emit('updated', editingData.value.id);
      alert(`${props.resourceName} actualizado exitosamente!`);
    } else {
      console.log('PAYLOAD CREATE JSON:', JSON.stringify(cleanedData, null, 2));
      const response = await axios.post(finalCreateEndpoint.value, cleanedData);
      emit('created', response.data);
      alert(`${props.resourceName} creado exitosamente!`);
    }
    isEdit.value = false;
    editingData.value = {};
    showForm.value = false;
    updateFieldsState();
    refreshGrid();
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
  const omitKeys = [
    'log', 'version', 'created_at', 'updated_at', 'deleted_at', 'confirmed_at',
    'created_by', 'updated_by', 'deleted_by', 'confirmed_by',
    'url',
  ];

  const cleaned = {};
  const grouped = {};

  props.fields.forEach(field => {
    const key = field.key;
    if (omitKeys.includes(key)) return;

    if (field.formGroup) {
      if (!grouped[field.formGroup]) grouped[field.formGroup] = {};
      let value = data[field.formGroup]?.[key];
      if (field.type === 'checkbox') value = value === true;
      if (value !== null && value !== undefined && value !== '') {
        grouped[field.formGroup][key] = value;
      }
    } else {
      let value = data[key];
      if (field.type === 'checkbox') value = value === true;
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    }
  });

  Object.keys(grouped).forEach(group => {
    if (group === 'price_data') {
      const pd = {};
      if ('base_net_amount' in grouped[group]) pd.base_net_amount = grouped[group].base_net_amount ?? null;
      if ('price_configuration' in grouped[group]) pd.price_configuration = grouped[group].price_configuration ?? null;
      if (Object.keys(pd).length > 0) cleaned[group] = pd;
    } else {
      const groupValues = Object.values(grouped[group]);
      const hasValue = groupValues.some(v => v !== null && v !== undefined && v !== '');
      if (hasValue) cleaned[group] = grouped[group];
    }
  });

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
    crudGridRef.value.resetEditingState?.();
  }
}

function onConfigure(row) {
  if (props.showConfigForm) {
    selectedRow.value = row;
    showConfigFormComponent.value = true;
    return;
  }

  const mappedRow = { ...row };
  const priceDataFields = props.fields.filter(f => f.formGroup === 'price_data');
  mappedRow.price_data = {};
  priceDataFields.forEach(f => {
    let val = row[f.key] !== undefined ? row[f.key] : null;
    if (f.key !== 'price_configuration' && val !== null && val !== '' && !isNaN(val)) {
      val = parseInt(val, 10);
    }
    if (f.key === 'price_configuration') {
      val = val ? String(val) : null;
    }
    mappedRow.price_data[f.key] = val;
  });

  editingData.value = mappedRow;
  isEdit.value = true;
  formFields.value = props.fields
    .filter(f => f.quickConfigure !== false)
    .map(f => ({ ...f, options: [], loading: false }));
  showForm.value = true;
  updateFieldsState();
}

function onRowSelected(row) {
  selectedRow.value = row;

  emit('row-selected', row);

  if (!row) return;

  // FIX CLAVE: forzar detalle recalculado limpio
  showProperties.value = false;
  showConfigFormComponent.value = false;
}

function onConfigFormClose() {
  selectedRow.value = null;
  showConfigFormComponent.value = false;

  if (crudGridRef.value) {
    crudGridRef.value.resetEditingState?.();
    crudGridRef.value.selected = [];
  }
}

function onConfigFormUpdated() {
  const grid = crudGridRef.value;
  grid?.resetEditingState?.();
  (grid?.fetchData || grid?.loadData)?.call(grid);
}

function onShowProperties(row) {
  if (!row) return;

  selectedRow.value = row;
  showForm.value = false;
  showConfigFormComponent.value = false;
  showProperties.value = true;
}

async function loadAdvanced() {
  if (!selectedRow.value) return;

  const resource = props.configFormResourcePath || 'catalogs'
  const lookup = props.configFormLookupField || 'sku'
  const value = selectedRow.value[lookup]

  if (!value) return

  try {
    const res = await axios.get(
      `/${resource}/adv/${value}/`
    )

    advancedData.value = res.data.results
    advancedVerbose.value = res.data.verbose_names

  } catch (error) {
    console.error('Error cargando avanzado:', error)
  }
}

function onPropertiesClose() {
  showProperties.value = false;
  selectedRow.value = null;
}

async function onPropertiesSave(data) {
  const row = selectedRow.value
  const identifierKey = props.rowKey || 'id'
  const identifier = row?.[identifierKey]
  if (!row || identifier === null || identifier === undefined || identifier === '') return

  const actor = props.propertiesUpdateAuditValue?.()
  if (!actor) {
    alert(`No fue posible identificar al usuario que actualiza ${props.resourceName}.`)
    return
  }

  const writableKeys = new Set(
    props.propertiesEditableFields.filter(key => !props.propertiesReadOnlyFields.includes(key))
  )
  const payload = Object.fromEntries(
    Object.entries(data || {}).filter(([key]) => writableKeys.has(key))
  )
  payload.updated_by = actor

  loading.value = true
  try {
    const response = await props.apiClient.patch(
      `${finalUpdateEndpoint.value}${identifier}/`,
      payload
    )
    selectedRow.value = response.data
    emit('row-selected', response.data)
    emit('updated', identifier)
    alert(`${props.resourceName} actualizado exitosamente!`)
  } catch (error) {
    const responseData = error.response?.data
    const detail = responseData?.detail || responseData?.message
    const fieldErrors = responseData && typeof responseData === 'object'
      ? Object.entries(responseData)
        .filter(([key]) => !['detail', 'message'].includes(key))
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n')
      : ''
    alert(`Error al guardar ${props.resourceName}: ${detail || fieldErrors || error.message}`)
  } finally {
    loading.value = false
  }
}

function handleImport() {
  emit('import');
}

function handleExport() {
  emit('export');
}

onMounted(() => {
  emit('mounted');
});

function refreshGrid() {
  const grid = crudGridRef.value;
  if (!grid) return;

  // Limpia selección/estado visual y vuelve a pedir data
  grid.resetEditingState?.();
  grid.selected = [];
  grid.currentPage = 1;

  (grid.fetchData || grid.loadData)?.call(grid);
}
</script>
