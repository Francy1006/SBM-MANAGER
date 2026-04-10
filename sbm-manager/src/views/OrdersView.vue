<template>
  <div class="catalog-manager container-fluid py-4">
    <div class="card w-90 mx-4 mb-4">
      <div class="card-body">
        <h1 class="catalog-title ps-4 mb-4">
          <i class="fa-solid fa-clipboard-list"></i>
          Órdenes
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

    <CRUDManagerComponent v-if="selectedFranchise" title="" resourceName="Orden" endpoint="orders/"
      get-endpoint="orders/" post-endpoint="orders/" iconClass="" :componentTitle="componentTitle" :fields="fields"
      :showConfigForm="false" :showPropertiesButton="true" :showConfigList="false" :optionsProps="optionsProps"
      :createDefaults="orderCreateDefaults" :showOpenColumn="true" :showDetailComponent="true" :detailTablesConfig="[
        {
          type: 'catalog',
          title: 'Catálogo',
          icon: 'fa-solid fa-utensils',
          searchConfig: {
            endpoint: 'catalogs/',
            queryParam: 'search',
            resultPath: 'results',
            minChars: 2,
            placeholder: 'Buscar catálogo...',
            addButtonText: 'Agregar',
            keyField: 'code',
            primaryField: 'sku',
            secondaryField: 'description'
          },
          createConfig: {
            endpoint: '/order-details/',
            itemTypeId: 1
          }
        },
        {
          type: 'product',
          title: 'Productos',
          icon: 'fa-solid fa-box',
          searchConfig: {
            endpoint: 'products/',
            queryParam: 'search',
            resultPath: 'results',
            minChars: 2,
            placeholder: 'Buscar producto...',
            addButtonText: 'Agregar',
            keyField: 'code',
            primaryField: 'sku',
            secondaryField: 'description'
          },
          createConfig: {
            endpoint: '/order-details/',
            itemTypeId: 2
          }
        },
        {
          type: 'material',
          title: 'Materiales',
          icon: 'fa-solid fa-cubes',
          searchConfig: {
            endpoint: 'materials/',
            queryParam: 'search',
            resultPath: 'results',
            minChars: 2,
            placeholder: 'Buscar material...',
            addButtonText: 'Agregar',
            keyField: 'code',
            primaryField: 'sku',
            secondaryField: 'description'
          },
          createConfig: {
            endpoint: '/order-details/',
            itemTypeId: 3
          }
        },
        {
          type: 'service',
          title: 'Servicios',
          icon: 'fa-solid fa-concierge-bell',
          searchConfig: {
            endpoint: 'services/',
            queryParam: 'search',
            resultPath: 'results',
            minChars: 2,
            placeholder: 'Buscar servicio...',
            addButtonText: 'Agregar',
            keyField: 'code',
            primaryField: 'sku',
            secondaryField: 'description'
          },
          createConfig: {
            endpoint: '/order-details/',
            itemTypeId: 4
          }
        },
        {
          type: 'ticket',
          title: 'Tickets',
          icon: 'fa-solid fa-receipt',
          searchConfig: {
            endpoint: 'tickets/',
            queryParam: 'search',
            resultPath: 'results',
            minChars: 2,
            placeholder: 'Buscar ticket...',
            addButtonText: 'Agregar',
            keyField: 'code',
            primaryField: 'sku',
            secondaryField: 'description'
          },
          createConfig: {
            endpoint: '/order-details/',
            itemTypeId: 5
          }
        }
      ]" :detail-fields-config="{
    catalog: [
      { key: 'item_sku', label: 'SKU' },
      { key: 'status', label: 'Status' },
      { key: 'order_type', label: 'Tipo' },
      { key: 'menu', label: 'Carta' },
      { key: 'description', label: 'Nombre' },
      { key: 'quantity', label: 'Cantidad', editable: true },
      { key: 'unit_net_amount', label: 'Neto Unit.', type: 'price' },
      { key: 'net_amount', label: 'SubTotal', type: 'price' },
      {
        key: 'hitos',
        label: 'Hitos',
        type: 'icon_group',
        icons: [
          { key: 'is_processing', icon: 'fas fa-sync-alt', class: 'text-info', title: 'Procesado' },
          { key: 'requires_cold_chain', icon: 'fas fa-snowflake', class: 'text-info', title: 'Cadena de frío' },
          { key: 'is_done', icon: 'fas fa-check', class: 'text-success', title: 'Terminado' },
          { key: 'has_fiscal_issue', icon: 'fas fa-file-invoice-dollar', class: 'text-warning', title: 'Documentación fiscal' },
          { key: 'is_delayed', icon: 'fas fa-clock', class: 'text-warning', title: 'Atraso' },
          { key: 'has_problem', icon: 'fas fa-exclamation-triangle', class: 'text-danger', title: 'Problema' },
          { key: 'has_packaging_issue', icon: 'fas fa-box-open', class: 'text-warning', title: 'Embalaje' },
          { key: 'is_deleted', icon: 'fas fa-trash', class: 'text-danger', title: 'Eliminado' }
        ]
      },
      { key: 'created_at', label: 'Creación', type: 'datetime' },
      { key: 'processed_at', label: 'Procesado', type: 'datetime' },
      { key: 'done_at', label: 'Finalizado', type: 'datetime' },
      { key: 'estimated_date', label: 'Estimado', type: 'datetime' },
      { key: 'quote_url', label: 'Cotización', type: 'link', linkText: 'Ver' },
      { key: 'dispatch_url', label: 'Guía', type: 'link', linkText: 'Ver' },
      { key: 'sale_note_url', label: 'Nota', type: 'link', linkText: 'Ver' },
      { key: 'invoice_url', label: 'Factura', type: 'link', linkText: 'Ver' }
    ],
    product: [
      { key: 'item_sku', label: 'SKU' },
      { key: 'status', label: 'Status' },
      { key: 'order_type', label: 'Tipo' },
      { key: 'menu', label: 'Carta' },
      { key: 'description', label: 'Nombre' },
      { key: 'quantity', label: 'Cantidad', editable: true },
      { key: 'unit_net_amount', label: 'Neto Unit.', type: 'price' },
      { key: 'net_amount', label: 'SubTotal', type: 'price' },
      {
        key: 'hitos',
        label: 'Hitos',
        type: 'icon_group',
        icons: [
          { key: 'is_processing', icon: 'fas fa-sync-alt', class: 'text-info', title: 'Procesado' },
          { key: 'requires_cold_chain', icon: 'fas fa-snowflake', class: 'text-info', title: 'Cadena de frío' },
          { key: 'is_done', icon: 'fas fa-check', class: 'text-success', title: 'Terminado' },
          { key: 'has_fiscal_issue', icon: 'fas fa-file-invoice-dollar', class: 'text-warning', title: 'Documentación fiscal' },
          { key: 'is_delayed', icon: 'fas fa-clock', class: 'text-warning', title: 'Atraso' },
          { key: 'has_problem', icon: 'fas fa-exclamation-triangle', class: 'text-danger', title: 'Problema' },
          { key: 'has_packaging_issue', icon: 'fas fa-box-open', class: 'text-warning', title: 'Embalaje' },
          { key: 'is_deleted', icon: 'fas fa-trash', class: 'text-danger', title: 'Eliminado' }
        ]
      },
      { key: 'created_at', label: 'Creación', type: 'datetime' },
      { key: 'processed_at', label: 'Procesado', type: 'datetime' },
      { key: 'done_at', label: 'Finalizado', type: 'datetime' },
      { key: 'estimated_date', label: 'Estimado', type: 'datetime' },
      { key: 'quote_url', label: 'Cotización', type: 'link', linkText: 'Ver' },
      { key: 'dispatch_url', label: 'Guía', type: 'link', linkText: 'Ver' },
      { key: 'sale_note_url', label: 'Nota', type: 'link', linkText: 'Ver' },
      { key: 'invoice_url', label: 'Factura', type: 'link', linkText: 'Ver' }
    ],
    material: [
      { key: 'item_sku', label: 'SKU' },
      { key: 'status', label: 'Status' },
      { key: 'order_type', label: 'Tipo' },
      { key: 'menu', label: 'Carta' },
      { key: 'description', label: 'Nombre' },
      { key: 'quantity', label: 'Cantidad', editable: true },
      { key: 'unit_net_amount', label: 'Neto Unit.', type: 'price' },
      { key: 'net_amount', label: 'SubTotal', type: 'price' },
      {
        key: 'hitos',
        label: 'Hitos',
        type: 'icon_group',
        icons: [
          { key: 'is_processing', icon: 'fas fa-sync-alt', class: 'text-info', title: 'Procesado' },
          { key: 'requires_cold_chain', icon: 'fas fa-snowflake', class: 'text-info', title: 'Cadena de frío' },
          { key: 'is_done', icon: 'fas fa-check', class: 'text-success', title: 'Terminado' },
          { key: 'has_fiscal_issue', icon: 'fas fa-file-invoice-dollar', class: 'text-warning', title: 'Documentación fiscal' },
          { key: 'is_delayed', icon: 'fas fa-clock', class: 'text-warning', title: 'Atraso' },
          { key: 'has_problem', icon: 'fas fa-exclamation-triangle', class: 'text-danger', title: 'Problema' },
          { key: 'has_packaging_issue', icon: 'fas fa-box-open', class: 'text-warning', title: 'Embalaje' },
          { key: 'is_deleted', icon: 'fas fa-trash', class: 'text-danger', title: 'Eliminado' }
        ]
      },
      { key: 'created_at', label: 'Creación', type: 'datetime' },
      { key: 'processed_at', label: 'Procesado', type: 'datetime' },
      { key: 'done_at', label: 'Finalizado', type: 'datetime' },
      { key: 'estimated_date', label: 'Estimado', type: 'datetime' },
      { key: 'quote_url', label: 'Cotización', type: 'link', linkText: 'Ver' },
      { key: 'dispatch_url', label: 'Guía', type: 'link', linkText: 'Ver' },
      { key: 'sale_note_url', label: 'Nota', type: 'link', linkText: 'Ver' },
      { key: 'invoice_url', label: 'Factura', type: 'link', linkText: 'Ver' }
    ],
    service: [
      { key: 'item_sku', label: 'SKU' },
      { key: 'status', label: 'Status' },
      { key: 'order_type', label: 'Tipo' },
      { key: 'menu', label: 'Carta' },
      { key: 'description', label: 'Nombre' },
      { key: 'quantity', label: 'Cantidad', editable: true },
      { key: 'unit_net_amount', label: 'Neto Unit.', type: 'price' },
      { key: 'net_amount', label: 'SubTotal', type: 'price' },
      {
        key: 'hitos',
        label: 'Hitos',
        type: 'icon_group',
        icons: [
          { key: 'is_processing', icon: 'fas fa-sync-alt', class: 'text-info', title: 'Procesado' },
          { key: 'requires_cold_chain', icon: 'fas fa-snowflake', class: 'text-info', title: 'Cadena de frío' },
          { key: 'is_done', icon: 'fas fa-check', class: 'text-success', title: 'Terminado' },
          { key: 'has_fiscal_issue', icon: 'fas fa-file-invoice-dollar', class: 'text-warning', title: 'Documentación fiscal' },
          { key: 'is_delayed', icon: 'fas fa-clock', class: 'text-warning', title: 'Atraso' },
          { key: 'has_problem', icon: 'fas fa-exclamation-triangle', class: 'text-danger', title: 'Problema' },
          { key: 'has_packaging_issue', icon: 'fas fa-box-open', class: 'text-warning', title: 'Embalaje' },
          { key: 'is_deleted', icon: 'fas fa-trash', class: 'text-danger', title: 'Eliminado' }
        ]
      },
      { key: 'created_at', label: 'Creación', type: 'datetime' },
      { key: 'processed_at', label: 'Procesado', type: 'datetime' },
      { key: 'done_at', label: 'Finalizado', type: 'datetime' },
      { key: 'estimated_date', label: 'Estimado', type: 'datetime' },
      { key: 'quote_url', label: 'Cotización', type: 'link', linkText: 'Ver' },
      { key: 'dispatch_url', label: 'Guía', type: 'link', linkText: 'Ver' },
      { key: 'sale_note_url', label: 'Nota', type: 'link', linkText: 'Ver' },
      { key: 'invoice_url', label: 'Factura', type: 'link', linkText: 'Ver' }
    ],
    ticket: [
      { key: 'item_sku', label: 'SKU' },
      { key: 'status', label: 'Status' },
      { key: 'order_type', label: 'Tipo' },
      { key: 'menu', label: 'Carta' },
      { key: 'description', label: 'Nombre' },
      { key: 'quantity', label: 'Cantidad', editable: true },
      { key: 'unit_net_amount', label: 'Neto Unit.', type: 'price' },
      { key: 'net_amount', label: 'SubTotal', type: 'price' },
      {
        key: 'hitos',
        label: 'Hitos',
        type: 'icon_group',
        icons: [
          { key: 'is_processing', icon: 'fas fa-sync-alt', class: 'text-info', title: 'Procesado' },
          { key: 'requires_cold_chain', icon: 'fas fa-snowflake', class: 'text-info', title: 'Cadena de frío' },
          { key: 'is_done', icon: 'fas fa-check', class: 'text-success', title: 'Terminado' },
          { key: 'has_fiscal_issue', icon: 'fas fa-file-invoice-dollar', class: 'text-warning', title: 'Documentación fiscal' },
          { key: 'is_delayed', icon: 'fas fa-clock', class: 'text-warning', title: 'Atraso' },
          { key: 'has_problem', icon: 'fas fa-exclamation-triangle', class: 'text-danger', title: 'Problema' },
          { key: 'has_packaging_issue', icon: 'fas fa-box-open', class: 'text-warning', title: 'Embalaje' },
          { key: 'is_deleted', icon: 'fas fa-trash', class: 'text-danger', title: 'Eliminado' }
        ]
      },
      { key: 'created_at', label: 'Creación', type: 'datetime' },
      { key: 'processed_at', label: 'Procesado', type: 'datetime' },
      { key: 'done_at', label: 'Finalizado', type: 'datetime' },
      { key: 'estimated_date', label: 'Estimado', type: 'datetime' },
      { key: 'quote_url', label: 'Cotización', type: 'link', linkText: 'Ver' },
      { key: 'dispatch_url', label: 'Guía', type: 'link', linkText: 'Ver' },
      { key: 'sale_note_url', label: 'Nota', type: 'link', linkText: 'Ver' },
      { key: 'invoice_url', label: 'Factura', type: 'link', linkText: 'Ver' }
    ]
  }" openColumnLabel="Abrir" configFormResourcePath="orders" configFormLookupField="code" @refresh="handleRefresh"
      @created="handleCreated" @updated="handleUpdated" @row-selected="handleOrderSelected" @import="handleImport"
      @export="handleExport">
      <template #properties>
        <PropertiesComponent :product="selectedOrder" :fields="fields" title="Propiedades de la orden"
          configResource="orders" lookupField="code" :hasItemConfiguration="false" />
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
const selectedOrder = ref(null);

const componentTitle = computed(() => {
  if (!selectedFranchise.value) return null;
  return '';
});

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

const orderCreateDefaults = () => ({
  franchise_code: selectedFranchiseCode.value || '',
  parent_order_id: null,
  order_type_id: null,
  status_id: null,
  description: '',
  is_delayed: false,
  is_partial: false,
  is_canceled: false,
  is_non_conforming: false,
  requires_cold_chain: true,
  total_net_amount: 0,
  total_discount: 0,
  total_surcharge: 0,
  operation_date: '',
  is_deleted: false
});

const fields = ref([
  { key: 'id', label: 'ID', type: 'number', omitInForm: true },
  { key: 'code', label: 'Código', type: 'text', maxlength: 36, omitInForm: true, readOnlyOnConfigure: true },

  {
    key: 'franchise_code',
    label: 'Franquicia',
    type: 'text',
    maxlength: 36,
    omitInForm: true,
    hideInGrid: true,
    readOnlyOnConfigure: true
  },
  { key: 'franchise_name', label: 'Franquicia', type: 'text', omitInForm: true },

  { key: 'name', label: 'Nombre', type: 'text', required: true, maxlength: 100 },

  {
    key: 'parent_order_id',
    label: 'Orden padre',
    type: 'number',
    min: 1,
    required: false,
    hideInGrid: true
  },

  {
    key: 'order_type_id',
    label: 'Tipo de orden',
    type: 'dynamic-select',
    required: true,
    endpoint: '/order-types/',
    labelKey: 'type',
    valueKey: 'id',
    hideInGrid: true
  },
  { key: 'order_type_name', label: 'Tipo', type: 'text', omitInForm: true },

  {
    key: 'status_id',
    label: 'Estado',
    type: 'dynamic-select',
    required: true,
    endpoint: '/status/orders/',
    labelKey: 'name',
    valueKey: 'id',
    hideInGrid: true
  },
  { key: 'status_name', label: 'Estado', type: 'text', omitInForm: true },

  { key: 'description', label: 'Descripción', type: 'textarea', required: false },

  { key: 'is_delayed', label: 'Retrasada', type: 'checkbox' },
  { key: 'is_partial', label: 'Parcial', type: 'checkbox' },
  { key: 'is_canceled', label: 'Cancelada', type: 'checkbox' },
  { key: 'is_non_conforming', label: 'No conforme', type: 'checkbox' },
  { key: 'requires_cold_chain', label: 'Cadena de frío', type: 'checkbox' },

  {
    key: 'expected_dispatch_date',
    label: 'Despacho previsto',
    type: 'datetime-local',
    required: false,
    hideInGrid: true
  },
  {
    key: 'expected_delivery_date',
    label: 'Entrega prevista',
    type: 'datetime-local',
    required: false,
    hideInGrid: true
  },
  {
    key: 'actual_dispatch_date',
    label: 'Despacho real',
    type: 'datetime-local',
    required: false,
    hideInGrid: true
  },
  {
    key: 'actual_delivery_date',
    label: 'Entrega real',
    type: 'datetime-local',
    required: false,
    hideInGrid: true
  },

  { key: 'delivery_route', label: 'Ruta de entrega', type: 'text', maxlength: 50, hideInGrid: true },
  { key: 'delivery_window', label: 'Ventana de entrega', type: 'text', maxlength: 50, hideInGrid: true },
  { key: 'delivery_comments', label: 'Comentarios de entrega', type: 'textarea', hideInGrid: true },

  {
    key: 'total_net_amount',
    label: 'Total neto',
    type: 'number',
    step: '0.01',
    sumCount: true
  },
  {
    key: 'total_discount',
    label: 'Descuento total',
    type: 'number',
    step: '0.01',
    hideInGrid: true
  },
  {
    key: 'total_surcharge',
    label: 'Recargo total',
    type: 'number',
    step: '0.01',
    hideInGrid: true
  },

  {
    key: 'operation_date',
    label: 'Fecha operación',
    type: 'datetime-local',
    required: false,
    omitInForm: true,
  },

  { key: 'created_at', label: 'Creado en', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'updated_at', label: 'Actualizado en', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'confirmed_at', label: 'Confirmado en', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'closed_at', label: 'Cerrado en', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'is_deleted', label: 'Eliminado', type: 'checkbox', hideInGrid: true, omitInForm: true },

  { key: 'created_by', label: 'Creado por', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'updated_by', label: 'Actualizado por', type: 'text', hideInGrid: true, omitInForm: true }
]);

const onFranchiseChange = (payload) => {
  selectedFranchiseCode.value = payload.code || '';
  selectedFranchiseName.value = payload.name || '';
  selectedFranchiseSigla.value = payload.sigla || '';
};

const handleRefresh = () => {
  console.log('Refresh órdenes');
};

const handleCreated = (data) => {
  console.log('Orden creada:', data);
};

const handleUpdated = (id) => {
  console.log('Orden actualizada:', id);
};

const handleOrderSelected = (order) => {
  selectedOrder.value = order;
};

const handleImport = () => {
  console.log('Importar órdenes');
};

const handleExport = () => {
  console.log('Exportar órdenes');
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
