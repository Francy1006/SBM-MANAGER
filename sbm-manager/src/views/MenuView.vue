<template>
    <div class="catalog-manager container-fluid py-4">
        <div class="card w-90 mx-4 mb-4">
            <div class="card-body">
                <h1 class="catalog-title ps-4 mb-4">
                    <i class="fas fa-atlas"></i>
                    Menús
                </h1>
            </div>

            <div class="row">
                <div class="col-1"></div>
                <div class="col-10 w-100 text-center">
                    <FranchiseSelector v-model="selectedFranchise" :franchises="franchises"
                        @change="onFranchiseChange" />
                </div>
            </div>
            <br />
        </div>

        <CRUDManagerComponent v-if="selectedFranchise" title="" resourceName="Menú" endpoint="menus/"
            get-endpoint="menus/" post-endpoint="menus/" iconClass="fas fa-utensils" :fields="fields"
            :showPropertiesButton="true" @refresh="handleRefresh" @row-selected="handleMenuSelected">
            <template #properties>
                <PropertiesComponent :product="selectedMenu" :fields="fields" title="Propiedades del Menú"
                    configResource="menus" lookupField="id" :hasItemConfiguration="false" />
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
const selectedMenu = ref(null)

const onFranchiseChange = payload => {
    selectedFranchiseCode.value = payload.code
}

const fields = ref([
    { key: 'id', hideInGrid: true, omitInForm: true },

    { key: 'menu', label: 'Menú', type: 'text', required: true },

    { key: 'description', label: 'Descripción', type: 'textarea' },

    { key: 'franchise_only', label: 'Solo franquicia', type: 'checkbox' },

    { key: 'background_color', label: 'Color de fondo', type: 'text', maxlength: 6 },

    { key: 'text_color', label: 'Color de texto', type: 'text', maxlength: 6 }
])

const handleMenuSelected = menu => {
    selectedMenu.value = menu
}

const handleRefresh = () => window.location.reload()

onMounted(async () => {
    const res = await axios.get('franchises/')
    franchises.value = res.data.results || res.data
})
</script>