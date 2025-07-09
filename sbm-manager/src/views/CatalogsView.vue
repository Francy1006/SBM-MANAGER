<template>
    <div class="container-fluid py-4">
        <h1 class="mb-4" style="font-family: 'DINAlternate', sans-serif; color: #e53935;">
            Administrador de Catálogos
        </h1>
        <div class="row mb-4">
            <div class="col-md-6 col-sm-8">
                <div class="d-flex align-items-center">
                    <label for="franchiseSelect" class="form-label fw-bold text-black mb-0 me-4" style="padding-right: 10px;">
                        <i class="fas fa-cube text-secondary me-2"></i>
                        Selecciona una franquicia
                    </label>
                    <select
                        id="franchiseSelect"
                        v-model="selectedFranchise"
                        class="form-select form-select-lg rounded-3 shadow-sm border-black"
                        style="max-width: 320px;"
                    >
                        <option v-for="franchise in franchises" :key="franchise.id" :value="franchise.id">
                            {{ franchise.franchise || franchise.name }}
                        </option>
                    </select>
                </div>
            </div>
        </div>
        
        <!-- CRUD Grid Component -->
        <CRUDGridComponent
            resourceName="Catálogos"
            endpoint="/catalogs/"
            iconClass="fas fa-book me-2 text-secondary"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../api/axios';
import CRUDGridComponent from '../components/CRUDGridComponent.vue';

const franchises = ref([]);
const selectedFranchise = ref('');

onMounted(async () => {
    try {
        const res = await axios.get('/franchises/');
        // Soporta respuesta paginada o lista directa
        franchises.value = Array.isArray(res.data)
            ? res.data
            : (res.data.results || []);
    } catch (e) {
        franchises.value = [];
    }
});
</script>