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
      :createDefaults="orderCreateDefaults" :showOpenColumn="true" :showDetailComponent="true"
      :detailTablesConfig="detailTablesConfig" :detail-fields-config="detailFieldsConfig"
      :calculationConfig="detailTablesConfig.calculationConfig" :detail-extra-props="{ order: selectedOrder }"
      openColumnLabel="Abrir" configFormResourcePath="orders" configFormLookupField="code" @refresh="handleRefresh"
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
import { RECORD_TYPE } from '@/constants/RecordTypes'
import { buildCalculationParams, buildVariablesParams } from '@/utils/RecordTypeResolver'

const franchises = ref([]);
const selectedFranchise = ref('');
const selectedFranchiseCode = ref('');
const selectedFranchiseName = ref('');
const selectedFranchiseSigla = ref('');
const selectedOrder = ref(null);
const MODULE_ID = 2

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
  client: null,
  parent_order_id: null,
  order_type_id: null,
  status_id: null,
  name: '',
  description: '',
  is_delayed: false,
  is_partial: false,
  is_canceled: false,
  is_non_conforming: false,
  requires_cold_chain: true,
  requires_fiscal_documentation: false,
  has_fiscal_documentation: false,
  fiscal_documentation_error: false,
  is_processed: false,
  is_closed: false,
  expected_dispatch_date: null,
  expected_delivery_date: null,
  dispatch_date: null,
  delivery_date: null,
  delivery_route: '',
  delivery_window: '',
  delivery_comments: '',
  total_net_amount: 0,
  total_discount: 0,
  total_surcharge: 0,
  is_deleted: false
});

const moduleConfig = {
  base: {
    formula: {
      endpoint: '/calculation/module-order-formula/',
      queryParam: 'type',
      codeResponsePath: 'code'
    },
    formulaDetail: {
      endpoint: '/module-order-formula-detail/',
      queryParam: 'code',
      responsePath: 'formula_template'
    },
    variables: {
      endpoint: '/module-order-variables/',
      module_code: 'ORDER'
    },
    create: {
      endpoint: '/order-details/'
    }
  },

  types: [
    {
      type: 'product',
      title: 'Productos',
      icon: 'fa-solid fa-box',
      itemTypeId: 1,
      module_config_id: '1',
      search: {
        endpoint: 'products/',
        placeholder: 'Buscar producto...'
      }
    },
    {
      type: 'material',
      title: 'Materiales',
      icon: 'fa-solid fa-cubes',
      itemTypeId: 2,
      module_config_id: '2',
      search: {
        endpoint: 'materials/',
        placeholder: 'Buscar material...'
      }
    },
    {
      type: 'service',
      title: 'Servicios',
      icon: 'fa-solid fa-concierge-bell',
      itemTypeId: 3,
      module_config_id: '3',
      search: {
        endpoint: 'services/',
        placeholder: 'Buscar servicio...'
      }
    },
    {
      type: 'catalog',
      title: 'Catálogo',
      icon: 'fa-solid fa-utensils',
      itemTypeId: 4,
      module_config_id: '4',
      search: {
        endpoint: 'catalogs/',
        placeholder: 'Buscar catálogo...'
      }
    },
    {
      type: 'ticket',
      title: 'Tickets',
      icon: 'fa-solid fa-receipt',
      itemTypeId: 5,
      module_config_id: '5',
      search: {
        endpoint: 'tickets/',
        placeholder: 'Buscar ticket...'
      }
    },
  ]
}


const baseDetailFields = [
  { key: 'id', label: 'ID Detail' },
  {
    key: 'hitos',
    label: 'Hitos',
    type: 'icon_group',
    icons: [
      { key: 'is_processed', icon: 'fa-solid fa-rotate-right', title: 'Procesado' },
      { key: 'requires_cold_chain', icon: 'fa-solid fa-snowflake', title: 'Cadena de frío' },
      { key: 'dispatch_date', icon: 'fa-solid fa-truck', title: 'Despacho' },
      { key: 'is_closed', icon: 'fa-solid fa-check-circle', title: 'Finalizado' },
      { key: 'fiscal_documentation', icon: 'fa-solid fa-file-invoice-dollar', title: 'Documento fiscal' },
      { key: 'is_delayed', icon: 'fa-solid fa-clock', title: 'Atraso' },
      { key: 'is_non_conforming', icon: 'fa-solid fa-triangle-exclamation', title: 'Error pedido' },
      { key: 'is_partial', icon: 'fa-solid fa-box-open', title: 'Embalaje' },
      { key: 'is_canceled', icon: 'fa-solid fa-ban', title: 'Cancelado' }
    ]
  },
  { key: 'sku', label: 'SKU' },
  { key: 'description', label: 'Nombre' },
  { key: 'quantity', label: 'Cantidad', editable: true },
  { key: 'unit_net_amount', label: 'Valor Neto Unitario', type: 'price' },
  { key: 'net_amount', label: 'Valor Neto', type: 'price' },
  { key: 'created_at', label: 'Creación', type: 'datetime' },
  { key: 'processed_at', label: 'Procesado', type: 'datetime' },
  { key: 'closed_at', label: 'Cerrado', type: 'datetime' },
  { key: 'expected_delivery_date', label: 'Entrega estimada', type: 'datetime' },
  { key: 'delivery_date', label: 'Entrega', type: 'datetime' }
];

const detailFieldsConfig = {
  catalog: baseDetailFields,
  product: baseDetailFields,
  service: baseDetailFields,
  ticket: baseDetailFields,
  material: baseDetailFields
};

const detailTablesConfig = moduleConfig.types
  .map(t => ({
    type: t.type,
    title: t.title,
    icon: t.icon,
    fields: detailFieldsConfig[t.type] || [],

    detailConfig: {
      buildUrl: ({ order, table }) =>
        `/orders/${order.id}/details/?type=${table.type}`,

      deleteBuilder: ({ row }) => ({
        url: `/order-details/${row.id}/`,
        payload: { is_canceled: true }
      })
    },

    calculationConfig: {
      endpoint: '/calculation/module-order-calculation/',

      context: ({ order, type }) =>
        buildCalculationParams({
          orderId: order?.id,
          type: type // "catalog"
        }),

      variablesQuery: ({ order, type }) =>
        buildVariablesParams({
          orderId: order?.id,
          type
        })
    },

    searchConfig: {
      endpoint: t.search.endpoint,
      queryParam: 'search',
      resultPath: 'results',
      minChars: 2,
      placeholder: t.search.placeholder,
      addButtonText: 'Agregar',
      keyField: 'code',
      primaryField: 'sku',
      secondaryField: 'description'
    },

    createConfig: {
      endpoint: moduleConfig.base.create.endpoint,
      itemTypeId: t.itemTypeId,

      payloadBuilder: ({
        selectedItem,
        order,
        createConfig,
        getOrderTypeId,
        getSelectedItemCode
      }) => {
        const unitNet = Number(
          selectedItem?.unit_net_amount ??
          selectedItem?.base_net_amount ??
          selectedItem?.net_amount ??
          0
        ) || 0

        return {
          order: order.id,
          order_type: getOrderTypeId(),
          record_type: createConfig.itemTypeId,
          id_item: getSelectedItemCode(selectedItem),
          description: selectedItem.description || selectedItem.name || '',
          quantity: 1,
          percent: null,
          net_amount: unitNet,
          fiscal_documentation: null,
          obs: selectedItem.obs || null,
          url_evidence: null
        }
      }
    }
  }))
  .sort((a, b) =>
    RECORD_TYPE[a.type.toUpperCase()] - RECORD_TYPE[b.type.toUpperCase()]
  )

const fields = ref([
  { key: 'id', label: 'ID', type: 'number', omitInForm: true },
  { key: 'code', label: 'Código', type: 'text', maxlength: 20, omitInForm: true, readOnlyOnConfigure: true },
  { key: 'franchise_code', label: 'Franquicia', type: 'text', maxlength: 36, omitInForm: true, hideInGrid: true, },
  { key: 'franchise_name', label: 'Franquicia', type: 'text', omitInForm: true },
  { key: 'name', label: 'Nombre', type: 'text', required: true, maxlength: 100 },
  { key: 'client', label: 'Cliente', type: 'dynamic-select', required: false, endpoint: '/clients/', labelKey: 'company_name', valueKey: 'code', hideInGrid: true },
  { key: 'client_name', label: 'Cliente', type: 'text', omitInForm: true },
  { key: 'parent_order_id', label: 'Orden padre', type: 'number', min: 1, required: false, hideInGrid: true },
  { key: 'order_type_id', label: 'Tipo de orden', type: 'dynamic-select', required: true, endpoint: '/order-types/', labelKey: 'type', valueKey: 'id', hideInGrid: true },
  { key: 'order_type_name', label: 'Tipo', type: 'text', omitInForm: true },
  { key: 'status_id', label: 'Estado', type: 'dynamic-select', required: true, endpoint: '/status/order/', labelKey: 'name', valueKey: 'id', hideInGrid: true },
  { key: 'status_name', label: 'Estado', type: 'text', omitInForm: true },
  { key: 'description', label: 'Descripción', type: 'textarea', required: false },
  { key: 'is_delayed', label: 'Retrasada', type: 'checkbox' },
  { key: 'is_partial', label: 'Parcial', type: 'checkbox' },
  { key: 'is_canceled', label: 'Cancelada', type: 'checkbox' },
  { key: 'is_non_conforming', label: 'No conforme', type: 'checkbox' },
  { key: 'requires_cold_chain', label: 'Cadena de frío', type: 'checkbox' },
  { key: 'requires_fiscal_documentation', label: 'Requiere doc. fiscal', type: 'checkbox' },
  { key: 'has_fiscal_documentation', label: 'Tiene doc. fiscal', type: 'checkbox', hideInGrid: true },
  { key: 'fiscal_documentation_error', label: 'Error doc. fiscal', type: 'checkbox', hideInGrid: true },
  { key: 'is_processed', label: 'Procesada', type: 'checkbox' },
  { key: 'is_closed', label: 'Cerrada', type: 'checkbox' },
  { key: 'expected_dispatch_date', label: 'Despacho previsto', type: 'datetime-local', required: false, hideInGrid: true },
  { key: 'expected_delivery_date', label: 'Entrega prevista', type: 'datetime-local', required: false, hideInGrid: true },
  { key: 'dispatch_date', label: 'Despacho', type: 'datetime-local', required: false, hideInGrid: true },
  { key: 'delivery_date', label: 'Entrega', type: 'datetime-local', required: false, hideInGrid: true },
  { key: 'delivery_route', label: 'Ruta de entrega', type: 'text', maxlength: 50, hideInGrid: true },
  { key: 'delivery_window', label: 'Ventana de entrega', type: 'text', maxlength: 50, hideInGrid: true },
  { key: 'delivery_comments', label: 'Comentarios de entrega', type: 'textarea', hideInGrid: true },
  { key: 'total_net_amount', label: 'Total neto', type: 'number', step: '0.01', sumCount: true },
  { key: 'total_discount', label: 'Descuento total', type: 'number', step: '0.01', hideInGrid: true },
  { key: 'total_surcharge', label: 'Recargo total', type: 'number', step: '0.01', hideInGrid: true },
  { key: 'processed_at', label: 'Procesada en', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'closed_at', label: 'Cerrada en', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'created_at', label: 'Creado en', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'updated_at', label: 'Actualizado en', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'deleted_at', label: 'Eliminado en', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'is_deleted', label: 'Eliminado', type: 'checkbox', hideInGrid: true, omitInForm: true },
  { key: 'created_by', label: 'Creado por', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'updated_by', label: 'Actualizado por', type: 'text', hideInGrid: true, omitInForm: true },
  { key: 'log', label: 'Log', type: 'textarea', hideInGrid: true, omitInForm: true, secretField: true },
  { key: 'version', label: 'Versión', type: 'number', hideInGrid: true, omitInForm: true }
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