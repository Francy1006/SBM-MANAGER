<template>
  <div class="catalog-manager container-fluid py-4">
    <div class="card w-90 mx-4 mb-4">
      <div class="card-body">
        <h1 class="catalog-title ps-4 mb-4">
          <i class="fa-solid fa-user-tie"></i>
          Clientes
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

    <CRUDManagerComponent v-if="selectedFranchise" title="" resourceName="Cliente" endpoint="client-brands/"
      get-endpoint="client-brands/" post-endpoint="client-brands/" iconClass="fa-solid fa-user-tie"
      :componentTitle="componentTitle" :fields="fields" :showConfigForm="false" :showPropertiesButton="true"
      :showConfigList="false" :optionsProps="optionsProps" @refresh="handleRefresh" @created="handleCreated"
      @updated="handleUpdated" @row-selected="handleClientSelected" @import="handleImport" @export="handleExport">
      <template #properties>
        <PropertiesComponent title="Propiedades del Cliente" :total="null" :activos="null" :inactivos="null"
          :lastUpdate="lastUpdate" status="Activo" />
      </template>
    </CRUDManagerComponent>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '../api/axios'
import CRUDManagerComponent from '../components/CRUDManagerComponent.vue'
import PropertiesComponent from '../components/PropertiesComponent.vue'
import FranchiseSelector from '../components/FranchiseSelectorComponent.vue'

const franchises = ref([])
const selectedFranchise = ref('')
const selectedFranchiseCode = ref('')
const selectedFranchiseName = ref('')
const selectedFranchiseSigla = ref('')
const selectedClientId = ref(null)

const componentTitle = computed(() => {
  if (!selectedFranchise.value) return null
  return ''
})

const lastUpdate = computed(() =>
  new Date().toLocaleString('es-ES')
)

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
})

const fields = ref([

  // 🔹 ORDEN EXACTO DEL GRID

  { key: 'id', label: 'ID', type: 'number', omitInForm: true },

  { key: 'client_code', label: 'CLIENTE', type: 'text', omitInForm: true, hideInGrid: true},

  { key: 'brand_name', label: 'Marca', type: 'text', required: true, maxlength: 150 },

  {
    key: 'status',
    label: 'Estado',
    type: 'dynamic-select',
    endpoint: '/status/clients/',
    cellManual: {
      model: 'client',          // 🔥 porque vive en client
      endpoint: 'clients',      // 🔥 tabla real
      patchField: 'status',     // 🔥 columna real
      valueKey: 'id',
      labelKey: 'name'
    },
    cellPill: 'clients'
  },

  {
    key: 'progress',
    label: 'Avances',
    type: 'textarea',
    cellManual: {
      type: 'textarea',          // 🔥 activa edición inline
      model: 'client',           // 🔥 el patch va contra client
      endpoint: 'clients',       // 🔥 endpoint real
      patchField: 'progress'     // 🔥 campo en ditaly_pasta.client
    }
  },

  { key: 'exact_address', label: 'Dirección Exacta', type: 'text', required: true },

  { key: 'observations', label: 'Observaciones', type: 'textarea' },

  { key: 'district', label: 'Comuna', type: 'dynamic-select', required: true, endpoint: '/district/', labelKey: 'district', valueKey: 'id' },

  { key: 'region', label: 'Región', type: 'dynamic-select', required: true, endpoint: '/region/', labelKey: 'region', valueKey: 'id' },

  { key: 'same_address_detected', label: 'Misma Dirección Detectada', type: 'checkbox' },

  { key: 'detection_date', label: 'Fecha Detección', type: 'date', required: true },

  { key: 'estimated_type', label: 'Tipo Estimado', type: 'text' },
  { key: 'operation_schedule', label: 'Horario Operación', type: 'text' },
  { key: 'estimated_avg_ticket', label: 'Ticket Promedio Estimado', type: 'number', step: '0.01' },
  { key: 'has_visible_physical_store', label: 'Local Físico Visible', type: 'checkbox' },

  { key: 'company_name', label: 'Razón Social', type: 'text' },
  { key: 'company_rut', label: 'RUT Empresa', type: 'text' },
  { key: 'owner_name', label: 'Nombre Dueño/Socio', type: 'text' },
  { key: 'owner_position', label: 'Cargo', type: 'text' },
  { key: 'linkedin_url', label: 'URL LinkedIn', type: 'url' },

  { key: 'direct_phone', label: 'Teléfono Directo', type: 'text' },
  { key: 'direct_email', label: 'Email Directo', type: 'email' },

  { key: 'contacted', label: 'Contactado', type: 'checkbox' },
  { key: 'contact_date', label: 'Fecha Contacto', type: 'date' },

  { key: 'estimated_potential_volume', label: 'Volumen Potencial Estimado', type: 'number', step: '0.01' },

  {
    key: 'priority',
    label: 'Prioridad',
    type: 'select',
    options: ['Alto', 'Medio', 'Bajo']
  },

  { key: 'is_active', label: 'Activo', type: 'checkbox' },

  { key: 'is_deleted', label: 'Eliminado', type: 'checkbox', omitInForm: true }

])

const onFranchiseChange = payload => {
  selectedFranchiseCode.value = payload.code
  selectedFranchiseName.value = payload.name
  selectedFranchiseSigla.value = payload.sigla
}

const handleRefresh = () => console.log('Refresh solicitado')
const handleCreated = data => console.log('Cliente creado:', data)
const handleUpdated = id => console.log('Cliente actualizado:', id)

const handleClientSelected = client => {
  if (!client) {
    selectedClientId.value = null
    return
  }
  selectedClientId.value = client.id
}

const handleImport = () => console.log('Importar clientes')
const handleExport = () => console.log('Exportar clientes')

onMounted(async () => {
  const token = localStorage.getItem('token')
  const uuid = localStorage.getItem('uuid')
  if (!token || !uuid) {
    window.location.href = '/login'
    return
  }
  try {
    const res = await axios.get('franchises/')
    franchises.value = Array.isArray(res.data)
      ? res.data
      : (res.data.results || [])
  } catch {
    franchises.value = []
  }
})
</script>