<template>
  <div class="catalog-manager container-fluid py-4">
    <div class="card w-90 mx-4 mb-4">
      <div class="card-body">
        <h1 class="catalog-title ps-4 mb-4">
          <i class="fas fa-people-carry"></i>
          Servicios
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

    <CRUDManagerComponent v-if="selectedFranchise" title="" resourceName="Service" endpoint="services/"
      get-endpoint="services/" post-endpoint="services/" iconClass="fas fa-people-carry" :fields="fields"
      :apiClient="dpApi" rowKey="id" :includeVisibleFilter="false" :showDeletedFilter="false"
      :allowCreate="false" :allowUpdate="false" :allowDelete="false" :showPropertiesButton="true"
      :showCalculationComponent="false" :enableExtendedProperties="false"
      @row-selected="handleServiceSelected" @refresh="handleRefresh">
      <template #properties>
        <PropertiesComponent :product="selectedService" :fields="fields" title="Propiedades del Servicio"
          :apiClient="dpApi" :enableExtendedData="false" :editable="false" />
      </template>
    </CRUDManagerComponent>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { dpApi, sbmApi } from "../api/clients";
import CRUDManagerComponent from "../components/CRUDManagerComponent.vue";
import FranchiseSelector from "../components/FranchiseSelectorComponent.vue";
import PropertiesComponent from "../components/PropertiesComponent.vue";

const franchises = ref([]);
const selectedFranchise = ref("");
const selectedFranchiseCode = ref("");

const selectedPriceConfiguration = ref(null);
const selectedBaseNetAmount = ref(null);
const selectedNetAmount = ref(null);
const selectedGrossAmount = ref(null);
const selectedIVAAmount = ref(null);
const selectedAditionalTaxAmount = ref(null);
const selectedRetentionAmount = ref(null);
const selectedService = ref(null);

const fields = ref([
  { key: 'id', hideInGrid: true, omitInForm: true },
  { key: 'code', hideInGrid: true, omitInForm: true },
  { key: 'sku', label: 'SKU', type: 'text', omitInForm: true },
  { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'obs', label: 'Observaciones', type: 'textarea' },
  { key: 'package_unit', label: 'Unidades Empaque', type: 'number' },
  { key: 'min_package_purchase', label: 'Mínimo Compra', type: 'number' },
  { key: 'price', label: 'Precio', type: 'text' },
  { key: 'provider', hideInGrid: true, omitInForm: true },
  { key: 'provider_name', label: 'Proveedor', omitInForm: true },
  { key: 'type', hideInGrid: true, omitInForm: true },
  { key: 'type_name', label: 'Tipo', omitInForm: true },
  { key: 'group', hideInGrid: true, omitInForm: true },
  { key: 'group_name', label: 'Grupo', omitInForm: true },
  { key: 'category', hideInGrid: true, omitInForm: true },
  { key: 'category_name', label: 'Categoría', omitInForm: true },
  { key: 'url', label: 'URL', type: 'text' },
  { key: 'is_active', label: 'Activo', type: 'checkbox' },
  { key: 'is_confirmed', label: 'Confirmado', type: 'checkbox' },
  { key: 'is_deleted', label: 'Eliminado', type: 'checkbox' },
  { key: 'created_at', label: 'Fecha creación', omitInForm: true },
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

const onFranchiseChange = payload => {
  selectedFranchiseCode.value = payload.code;
};

const handleServiceSelected = service => {
  selectedService.value = service || null;
};

const handleRefresh = () => window.location.reload();

onMounted(async () => {
  const res = await sbmApi.get("franchises/");
  franchises.value = res.data.results || res.data;
});
</script>