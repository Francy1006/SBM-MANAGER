<template>
  <div class="catalog-manager container-fluid py-4">
    <div class="card w-90 mx-4 mb-4">
      <div class="card-body">
        <h1 class="catalog-title ps-4 mb-4">
          <i class="fas fa-industry"></i>
          Proveedores
        </h1>
      </div>

      <div class="row">
        <div class="col-1"></div>
        <div class="col-10 w-100 text-center">
          <FranchiseSelector
            v-model="selectedFranchise"
            :franchises="franchises"
            @change="onFranchiseChange"
          />
        </div>
      </div>
      <br />
    </div>

    <CRUDManagerComponent
      v-if="selectedFranchise"
      title=""
      resourceName="Proveedor"
      endpoint="providers/"
      get-endpoint="providers/"
      post-endpoint="providers/"
      iconClass="fas fa-industry"
      :fields="fields"
      :showPropertiesButton="true"
      @refresh="handleRefresh"
      @row-selected="handleProviderSelected"
    >
      <template #properties>
        <PropertiesComponent
          :product="selectedProvider"
          :fields="fields"
          title="Propiedades del Proveedor"
          configResource="providers"
          lookupField="code"
          :hasItemConfiguration="false"
        />
      </template>
    </CRUDManagerComponent>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '../api/axios'
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue'
import PropertiesComponent from '../components/PropertiesComponent.vue'
import FranchiseSelector from '../components/FranchiseSelectorComponent.vue'

const franchises = ref([])
const selectedFranchise = ref('')
const selectedFranchiseCode = ref('')
const selectedProvider = ref(null)

const onFranchiseChange = payload => {
  selectedFranchiseCode.value = payload.code
}

const fields = ref([
  { key: 'id', hideInGrid: true, omitInForm: true },

  { key: 'provider', label: 'Proveedor', type: 'text', required: true },

  { key: 'type', label: 'Tipo', type: 'dynamic-select', endpoint: '/provider-types/', labelKey: 'type', valueKey: 'id', hideInGrid: true },
  { key: 'type_name', label: 'Tipo', hideInGrid: false, omitInForm: true },

  { key: 'rating', label: 'Rating', type: 'rating', secretField: true },

  { key: 'obs_provider', label: 'Observaciones proveedor', type: 'textarea' },

  { key: 'contact_name', label: 'Nombre contacto', type: 'text' },
  { key: 'contact_mail', label: 'Mail contacto', type: 'text' },
  { key: 'contact_phone', label: 'Teléfono contacto', type: 'number' },
  { key: 'contact_phone2', label: 'Teléfono 2', type: 'number' },

  { key: 'website_url', label: 'Website', type: 'text' },
  { key: 'obs_contact', label: 'Obs contacto', type: 'textarea' },

  { key: 'company_name', label: 'Empresa', type: 'text' },
  { key: 'company_rut', label: 'RUT empresa', type: 'text' },
  { key: 'company_activity', label: 'Actividad', type: 'text' },
  { key: 'legal_representative', label: 'Representante legal', type: 'text' },

  { key: 'billing_address', label: 'Dirección facturación', type: 'textarea' },
  { key: 'billing_mail', label: 'Mail facturación', type: 'text' },
  { key: 'billing_phone', label: 'Teléfono facturación', type: 'number' },

  { key: 'company_bank', label: 'Banco', type: 'dynamic-select', endpoint: '/banks/', labelKey: 'bank', valueKey: 'id', hideInGrid: true },
  { key: 'company_bank_name', label: 'Banco', hideInGrid: false, omitInForm: true },

  { key: 'bank_account_type', label: 'Tipo cuenta', type: 'dynamic-select', endpoint: '/bank-account-types/', labelKey: 'type', valueKey: 'id', hideInGrid: true },
  { key: 'bank_account_type_name', label: 'Tipo cuenta', hideInGrid: false, omitInForm: true },

  { key: 'bank_account_number', label: 'Número cuenta', type: 'text' },
  { key: 'bank_account_mail', label: 'Mail cuenta', type: 'text' },

  { key: 'dispatch_address', label: 'Dirección despacho', type: 'textarea' },
  { key: 'dispatch_maps_location', label: 'Maps', type: 'text' },

  { key: 'dispatch_district', label: 'Comuna', type: 'dynamic-select', endpoint: '/districts/', labelKey: 'district', valueKey: 'id', hideInGrid: true },
  { key: 'dispatch_district_name', label: 'Comuna', hideInGrid: false, omitInForm: true },

  { key: 'dispatch_region', label: 'Región', type: 'dynamic-select', endpoint: '/regions/', labelKey: 'region', valueKey: 'id', hideInGrid: true },
  { key: 'dispatch_region_name', label: 'Región', hideInGrid: false, omitInForm: true },

  { key: 'obs_dispatch', label: 'Obs despacho', type: 'textarea' },

  { key: 'is_active', label: 'Activo', type: 'checkbox' },

  { key: 'is_confirmed', label: 'Confirmado',type: 'checkbox', hideInGrid: false, omitInForm: false },
  { key: 'is_deleted', label: 'Eliminado', hideInGrid: false, omitInForm: true },

  { key: 'created_at', label: 'Fecha creación', hideInGrid: false, omitInForm: true },

  { key: 'updated_at', hideInGrid: true, omitInForm: true },
  { key: 'confirmed_at', hideInGrid: true, omitInForm: true },
  { key: 'deleted_at', hideInGrid: true, omitInForm: true },

  { key: 'created_by', hideInGrid: true, omitInForm: true },
  { key: 'confirmed_by', hideInGrid: true, omitInForm: true },
  { key: 'updated_by', hideInGrid: true, omitInForm: true },
  { key: 'deleted_by', hideInGrid: true, omitInForm: true },

  { key: 'log', hideInGrid: true, omitInForm: true },
  { key: 'version', hideInGrid: true, omitInForm: true }
])

const handleProviderSelected = provider => {
  selectedProvider.value = provider
}

const handleRefresh = () => window.location.reload()

onMounted(async () => {
  const res = await axios.get('franchises/')
  franchises.value = res.data.results || res.data
})
</script>