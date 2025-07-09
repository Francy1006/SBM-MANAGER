<template>
  <div class="mb-4 p-4 rounded shadow-sm bg-white">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
      <h4 class="mb-0 text-primary fw-semibold">
        <i :class="iconClass"></i>
        Listado de {{ capitalizedResourceName }}
      </h4>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
      </div>
    </div>

    <div v-else>
      <!-- Barra de búsqueda -->
      <div class="mb-4">
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                placeholder="Buscar franquicias..."
                v-model="searchTerm"
                @input="debouncedSearch"
                :disabled="loading"
              />
              <span v-if="loading" class="input-group-text bg-light border-start-0">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Buscando...</span>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mb-4">
        <div v-if="selectedCount > 0" class="row justify-content-end align-items-center">
          <div class="col-auto">
            <span class="badge bg-light">
              {{ selectedCount }} seleccionados
            </span>
          </div>
          <div class="col-auto ms-3">
            <button class="btn btn-outline-primary btn-sm rounded-pill px-3" :disabled="selectedCount !== 1" @click="configureSelected">
              <i class="fas fa-cog me-1"></i> Configurar
            </button>
          </div>
          <div class="col-auto ms-3">
            <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" @click="deleteSelected" :disabled="selectedCount > 1">
              <i class="fas fa-trash me-1"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle table-bordered">
          <thead class="table-dark text-center">
            <tr>
              <th v-if="filteredRows.length > 0" style="width:40px;">
                <input type="checkbox" :checked="allSelected" @change="toggleAllSelection" />
              </th>
              <th v-for="col in visibleColumns" :key="col">
                {{ verboseNames[col] || capitalize(col) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredRows.length === 0">
              <td :colspan="visibleColumns.length" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i> 
                {{ searchTerm ? 'No se encontraron franquicias para "' + searchTerm + '"' : 'No hay franquicias disponibles' }}
              </td>
            </tr>
            <tr v-for="row in filteredRows" :key="row.id" :class="{ 
              'table-primary fw-bold': selected.includes(row.id) || row.id === editingRowId,
              'text-white': row.id === editingRowId
            }">
              <td v-if="rows.length > 0" class="text-center">
                <input type="checkbox" :checked="selected.includes(row.id)" @change="toggleRowSelection(row.id)" />
              </td>
              <td v-for="col in visibleColumns" :key="col">
                <span v-if="col === 'state' && (states && (Array.isArray(states) || states.value))">
                  {{ getStateName(row[col]) }}
                </span>
                <span v-else>
                  {{ formatValue(row[col]) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Controles de paginación -->
      <div v-if="totalItems > 0" class="mt-4">
        <div class="row align-items-center">
          <div class="col-md-6">
            <small class="text-muted">
              Mostrando {{ startItem }} - {{ endItem }} de {{ totalItems }} elementos
            </small>
          </div>
          <div class="col-md-6">
            <nav aria-label="Navegación de páginas">
              <ul class="pagination pagination-sm justify-content-end mb-0">
                <!-- Botón Anterior -->
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button 
                    class="page-link" 
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                </li>
                
                <!-- Números de página -->
                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button 
                    class="page-link" 
                    @click="goToPage(page)"
                  >
                    {{ page }}
                  </button>
                </li>
                
                <!-- Botón Siguiente -->
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button 
                    class="page-link" 
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api/axios';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'CRUDGridComponent',
  props: {
    resourceName: { type: String, required: true },
    endpoint: { type: String, required: true },
    states: { type: [Array, Object], default: null },
    iconClass: { type: String, default: 'fas fa-list-alt me-2 text-secondary' },
  },
  data() {
    return {
      loading: true,
      rows: [],
      columns: [],
      verboseNames: {},
      error: '',
      selected: [],
      editingRowId: null, // Para rastrear qué fila está siendo editada
      searchTerm: '', // Para el término de búsqueda
      filteredRows: [], // Para los datos filtrados
      searchTimeout: null, // Para el debounce de búsqueda
      currentPage: 1, // Página actual
      pageSize: 20, // Elementos por página
      totalItems: 0, // Total de elementos
      totalPages: 0, // Total de páginas
    };
  },
  computed: {
    ...mapGetters([]),
    capitalizedResourceName() {
      if (!this.resourceName) return '';
      return this.resourceName.charAt(0).toUpperCase() + this.resourceName.slice(1);
    },
    visibleColumns() {
      return this.columns.filter(col => col !== 'field_verbose_names' && col !== 'state_name');
    },
    allSelected() {
      return this.filteredRows.length > 0 && this.selected.length === this.filteredRows.length;
    },
    selectedCount() {
      return this.selected.length;
    },
    // Computed properties para paginación
    startItem() {
      return (this.currentPage - 1) * this.pageSize + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.pageSize, this.totalItems);
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5; // Máximo 5 páginas visibles
      
      if (this.totalPages <= maxVisible) {
        // Si hay 5 páginas o menos, mostrar todas
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Si hay más de 5 páginas, mostrar páginas alrededor de la actual
        let start = Math.max(1, this.currentPage - 2);
        let end = Math.min(this.totalPages, start + maxVisible - 1);
        
        // Ajustar si estamos cerca del final
        if (end - start < maxVisible - 1) {
          start = Math.max(1, end - maxVisible + 1);
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    },
  },
  methods: {
    ...mapActions([]),
    toggleAllSelection() {
      if (this.allSelected) {
        this.selected = [];
      } else {
        this.selected = this.filteredRows.map(row => row.id);
      }
    },
    toggleRowSelection(id) {
      if (this.selected.includes(id)) {
        this.selected = this.selected.filter(sid => sid !== id);
      } else {
        this.selected.push(id);
      }
    },
    configureSelected() {
      if (this.selected.length === 1) {
        const selectedRow = this.rows.find(row => row.id === this.selected[0]);
        if (selectedRow) {
          // Marcar esta fila como en edición
          this.editingRowId = selectedRow.id;
          
          // Emitir evento con los datos del item seleccionado
          this.$emit('configure', selectedRow);
          
          // Limpiar selección después de configurar
          this.selected = [];
        }
      }
    },
    
    // Método para resetear el estado de edición
    resetEditingState() {
      this.editingRowId = null;
    },
    
    // Método para búsqueda con debounce
    debouncedSearch() {
      // Limpiar timeout anterior
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      // Establecer nuevo timeout para evitar demasiadas peticiones
      this.searchTimeout = setTimeout(() => {
        this.searchData();
      }, 500); // Esperar 500ms después de que el usuario deje de escribir
    },
    
    // Método para navegar a una página específica
    async goToPage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage) {
        return;
      }
      
      this.currentPage = page;
      await this.fetchData();
    },
    
    // Método para buscar datos usando el endpoint de Django
    async searchData() {
      // Resetear a la primera página cuando se busca
      this.currentPage = 1;
      await this.fetchData();
    },
    
    // Método para eliminar items seleccionados
    async deleteSelected() {
      if (this.selected.length === 0) {
        alert('Por favor selecciona un item para eliminar');
        return;
      }
      
      if (this.selected.length > 1) {
        alert('Solo puedes eliminar un item a la vez');
        return;
      }
      
      // Confirmar eliminación
      const confirmMessage = '¿Estás seguro de que quieres eliminar este item?';
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
      try {
        // Hacer petición POST para soft delete (solo un ID)
        const response = await api.post('/franchises/soft_delete/', {
          ids: [this.selected[0]]
        });
        
        console.log('Respuesta de eliminación:', response.data);
        
        // Mostrar mensaje de éxito
        alert('Item eliminado exitosamente');
        
        // Limpiar selección
        this.selected = [];
        
        // Recargar datos
        await this.fetchData();
        
      } catch (error) {
        console.error('Error al eliminar item:', error);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        
        // Mostrar mensaje de error
        alert('Error al eliminar item: ' + (error.response?.data?.detail || error.message));
      }
    },
    async fetchData() {
      this.loading = true;
      try {
        // Construir URL con parámetros de paginación
        let url = this.endpoint;
        const params = new URLSearchParams();
        
        // Agregar parámetros de paginación
        params.append('page', this.currentPage.toString());
        params.append('page_size', this.pageSize.toString());
        
        // Agregar parámetro de búsqueda si existe
        if (this.searchTerm.trim()) {
          params.append('search', this.searchTerm);
        }
        
        // Agregar parámetros a la URL
        if (params.toString()) {
          url += '?' + params.toString();
        }
        
        const res = await api.get(url);
        
        // Manejar respuesta paginada de Django
        if (res.data.results !== undefined) {
          // Respuesta paginada
          this.rows = res.data.results || [];
          this.totalItems = res.data.count || 0;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        } else {
          // Respuesta no paginada (fallback)
          this.rows = Array.isArray(res.data) ? res.data : [];
          this.totalItems = this.rows.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        }
        
        this.columns = this.rows.length > 0
          ? Object.keys(this.rows[0]).filter(col => col !== 'field_verbose_names')
          : [];

        // extrae verbose names desde primer item
        this.verboseNames = this.rows.length > 0 && this.rows[0].field_verbose_names
          ? this.rows[0].field_verbose_names
          : {};
        
        // Actualizar datos filtrados
        this.filteredRows = [...this.rows];
        
        // Si no hay término de búsqueda, limpiar la búsqueda
        if (!this.searchTerm.trim()) {
          this.searchTerm = '';
        }
        
      } catch (e) {
        this.error = 'Error al cargar los datos';
        this.rows = [];
        this.columns = [];
        this.filteredRows = [];
        this.totalItems = 0;
        this.totalPages = 0;
        console.error('Error al cargar los datos:', e);
      } finally {
        this.loading = false;
      }
    },
    getStateName(stateId) {
      if (!this.states) return stateId;
      // Handle both regular arrays and Vue 3 refs
      const statesArray = Array.isArray(this.states) ? this.states : (this.states?.value || []);
      const state = statesArray.find(s => s.id === stateId);
      return state ? state.state : stateId;
    },
    formatValue(val) {
      if (val === null || val === undefined) return '-';
      if (typeof val === 'string' && val.length > 100) return val.slice(0, 100) + '...';
      return val;
    },
    capitalize(val) {
      if (!val) return '';
      return val.charAt(0).toUpperCase() + val.slice(1);
    },
  },
  watch: {
    endpoint: 'fetchData',
  },
  mounted() {
    this.fetchData();
  },
  beforeUnmount() {
    // Limpiar timeout al destruir el componente
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
};
</script>

<style scoped>
.table td, .table th {
  font-weight: normal !important;
  font-family: Arial, sans-serif !important;
}

/* Estilos para botones deshabilitados */
.btn:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

.btn:disabled:focus {
  box-shadow: none !important;
  outline: none !important;
}

/* Estilos para filas seleccionadas */
.table-primary {
  background-color: #e7f1ff !important;
  color: #000 !important;
  font-weight: bold !important;
  border: 2px solid #000 !important;
}

.table-primary td {
  border-color: #000 !important;
  color: #000 !important;
  font-weight: bold !important;
}

/* Hover effect para filas seleccionadas */
.table-primary:hover {
  background-color: #d1e7ff !important;
  color: #000 !important;
  font-weight: bold !important;
}

/* Estilos para filas en edición (texto blanco) */
.table-primary.text-white {
  background-color: #0d6efd !important;
  color: white !important;
}

.table-primary.text-white td {
  color: white !important;
}

.table-primary.text-white:hover {
  background-color: #0b5ed7 !important;
  color: white !important;
}

/* Estilos para checkboxes en filas seleccionadas */
.table-primary input[type="checkbox"] {
  accent-color: #0d6efd;
}

/* Estilos para checkboxes en filas en edición */
.table-primary.text-white input[type="checkbox"] {
  accent-color: white;
}

/* Estilos para la barra de búsqueda */
.input-group {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.input-group-text {
  border: 1px solid #ced4da;
  background-color: #f8f9fa;
}

.form-control {
  border: 1px solid #ced4da;
  border-left: none;
}

.form-control:focus {
  box-shadow: none;
  border-color: #80bdff;
}

.form-control:focus + .input-group-text {
  border-color: #80bdff;
}

/* Estilos para paginación */
.pagination {
  margin-bottom: 0;
}

.page-link {
  border: 1px solid #dee2e6;
  color: #007bff;
  background-color: #fff;
}

.page-link:hover {
  color: #0056b3;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.page-item.disabled .page-link {
  color: #6c757d;
  background-color: #fff;
  border-color: #dee2e6;
  cursor: not-allowed;
}

.page-item.disabled .page-link:hover {
  color: #6c757d;
  background-color: #fff;
  border-color: #dee2e6;
}
</style>
