<template>
    <div class="container-fluid py-4">
        <h1 class="mb-4" style="font-family: 'DINAlternate', sans-serif; color: #e53935;">
            Administrador de Catálogos
        </h1>
        <div class="row mb-4">
            <div class="col-12 col-md-6 col-lg-4">
                <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                    <label for="franchiseSelect" class="form-label fw-bold text-black mb-2 mb-md-0 me-md-3" style="padding-right: 10px; min-width: 250px;">
                        <i class="fas fa-cube text-secondary me-2"></i>
                        Selecciona Franquicia
                    </label>
                    <select
                        id="franchiseSelect"
                        v-model="selectedFranchise"
                        class="form-select form-select-lg rounded-3 shadow-sm border-black"
                        style="max-width: 320px; width: 100%;"
                    >
                        <option v-for="franchise in franchises" :key="franchise.id" :value="franchise.id">
                            {{ franchise.franchise || franchise.name }}
                        </option>
                    </select>
                </div>
            </div>
        </div>
        <br>
        <!-- Título de la franquicia seleccionada -->
        <div v-if="selectedFranchise" class="row mt-4 mb-4">
            <div class="col-12">
                <h2 class="h4 fw-bold text-black">
                    Franquicia: <strong>{{ selectedFranchiseName }}</strong> - {{ selectedFranchiseSigla }}
                </h2>
            </div>
        </div>
        <!-- ConfigFormComponent -->
        <ConfigFormComponent
          :catalog="selectedCatalogRow"
          v-show="selectedCatalogRow"
          @close="selectedCatalogRow = null"
          :configurationName="'Catálogo'"
          :publicPivotField="'sku'"
        />
        <!-- CRUD Grid Component -->
        <CRUDGridComponent
            v-if="selectedFranchise"
            resourceName="Catálogos"
            endpoint="/catalogs/"
            iconClass="fas fa-book me-2 text-secondary"
            @configure="onConfigureCatalog"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '../api/axios';
import CRUDGridComponent from '../components/CRUDGridComponent.vue';
import ConfigFormComponent from '../components/ConfigFormComponent.vue';

const franchises = ref([]);
const selectedFranchise = ref('');
const selectedCatalogRow = ref(null);

// Computed properties para obtener datos de la franquicia seleccionada
const selectedFranchiseName = computed(() => {
  if (!selectedFranchise.value) return '';
  const franchise = franchises.value.find(f => f.id === selectedFranchise.value);
  return franchise ? (franchise.franchise || franchise.name) : '';
});

const selectedFranchiseSigla = computed(() => {
  if (!selectedFranchise.value) return '';
  const franchise = franchises.value.find(f => f.id === selectedFranchise.value);
  return franchise ? franchise.description : '';
});

function onConfigureCatalog(row) {
  selectedCatalogRow.value = row;
}

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

<style scoped>
/* Responsive para móviles */
@media (max-width: 768px) {
    h1 {
        font-size: 1.5rem !important;
        text-align: center;
    }
    
    .form-label {
        font-size: 0.9rem;
    }
    
    .form-select {
        font-size: 0.9rem;
    }
}

@media (max-width: 480px) {
    h1 {
        font-size: 1.25rem !important;
    }
    
    .form-label {
        font-size: 0.85rem;
    }
    
    .form-select {
        font-size: 0.85rem;
    }
}
</style>