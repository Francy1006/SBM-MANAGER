<template>
  <div class="mb-4 p-4 rounded shadow-sm bg-white">
    
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
      <h4 class="mb-0 text-primary fw-semibold">
        <i :class="iconClass"></i>
        Listado de {{ capitalizedResourceName }}
      </h4>
    </div>

    <!-- OPTIONS -->
    <OptionsComponent 
      v-bind="optionsProps"
      @toggle-secret-fields="showSecretFields = $event"
      @import="handleImport"
      @export="handleExport"
    />

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- CONTENT -->
    <div v-else>
      
      <!-- SEARCH -->
      <div class="mb-4">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-start-0" 
                :placeholder="`Buscar ${resourceName.toLowerCase()}...`"
                v-model="searchTerm"
                @input="debouncedSearch"
                :disabled="loading"
              />
              <span v-if="loading" class="input-group-text bg-light border-start-0">
                <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="mb-4" v-if="selectedCount > 0">
        <div class="row justify-content-between align-items-center g-2">
          
          <div class="col-auto d-flex align-items-center gap-2">
            <span class="badge text-secondary">{{ selectedCount }} seleccionados</span>
            <span v-if="sumFieldKey && selectedCount > 0 && showSecretFields" class="badge bg-danger text-white">
              TOTAL Suma: {{ formatSumValue(calculatedSum) }}
            </span>
          </div>
          
          <div class="col-auto d-flex gap-2">
            <div v-if="showPropertiesButton">
              <button class="btn btn-warning btn-sm rounded-pill px-3"
                      @click="showProperties"
                      :disabled="selectedCount !== 1">
                <i class="fas fa-cog me-1"></i> Propiedades
              </button>
            </div>

            <div>
              <button class="btn btn-outline-primary btn-sm rounded-pill px-3"
                      @click="configureSelected"
                      :disabled="selectedCount !== 1">
                <i class="fas fa-cog me-1"></i> Configurar
              </button>
            </div>

            <div>
              <button class="btn btn-outline-secondary btn-sm rounded-pill px-3"
                      @click="deleteSelected"
                      :disabled="selectedCount > 1">
                <i class="fas fa-trash me-1"></i> Eliminar
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- TABLE -->
      <div class="table-responsive" style="overflow-x: auto; width: calc(100vw - 250px - 1rem); margin-right: 1rem;">
        <table class="table table-hover align-middle table-bordered" :key="tableKey">
          
          <!-- HEAD -->
          <thead class="table-dark text-center">
            <tr>
              <th v-if="filteredRows.length > 0" style="width:60px!important;" class="align-middle">
                <input type="checkbox" :checked="allSelected" @change.stop="toggleAllSelection" />
              </th>
              <th v-for="col in visibleColumns" :key="col" style="min-width:200px!important;" class="align-middle">
                {{ verboseNames[col] }}
              </th>
            </tr>
          </thead>

          <!-- BODY -->
          <tbody>
            <!-- EMPTY STATE -->
            <tr v-if="filteredRows.length === 0">
              <td :colspan="visibleColumns.length" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i> 
                {{ searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay elementos disponibles' }}
              </td>
            </tr>

            <!-- ROWS -->
            <tr v-for="row in filteredRows" :key="'row-' + row.code" 
                :class="{
                  'table-primary fw-bold': selected.includes(String(row.code)) || row.code === editingRowId,
                  'text-white': row.code === editingRowId
                }">

              <!-- SELECTION CHECKBOX -->
              <td v-if="rows.length > 0" class="text-center">
                <input type="checkbox"
                       :key="'checkbox-' + row.code"
                       :value="String(row.code)"
                       v-model="selected"
                       @change.stop="toggleRowSelection(row.code)" />
              </td>

              <!-- CELLS -->
              <td v-for="col in visibleColumns" :key="col">

                <!-- STATE -->
                <span v-if="col === 'state' && states">
                  {{ getStateName(row[col]) }}
                </span>

                <!-- BOOLEAN -->
                <span v-else-if="typeof row[col] === 'boolean'">
                  <i v-if="row[col]" class="fas fa-check text-success" style="font-size: x-large;"></i>
                  <i v-else class="fas fa-times text-danger" style="font-size: x-large;"></i>
                </span>

                <!-- CLOUDINARY IMAGE -->
                <span v-else-if="typeof row[col] === 'string' && row[col] && row[col].startsWith('https://res.cloudinary.com')">
                  <img :src="row[col]" alt="Imagen Cloudinary"
                       style="max-height: 80px; max-width: 100px; object-fit: contain; border-radius: 6px; box-shadow: 0 2px 8px #0001;" />
                </span>

                <!-- URL (solo si no es Cloudinary) -->
                <span v-else-if="col.toLowerCase().includes('url') && row[col] && !(typeof row[col] === 'string' && row[col].startsWith('https://res.cloudinary.com'))">
                  <a :href="row[col]" target="_blank" rel="noopener noreferrer">{{ row[col] }}</a>
                </span>

                <!-- RATING -->
                <span v-else-if="col === 'rating'">
                  <span class="crudgrid-rating">
                    <span v-for="star in 5" :key="star">
                      <i class="fa-star fa-solid" 
                         :style="{ color: row[col] >= star ? '#ffd700' : '#ccc', fontSize: '1.3em', marginRight: '2px' }">
                      </i>
                    </span>
                  </span>
                </span>

                <!-- PILL NAME (badge con clases dinámicas) -->
                <span v-else-if="fields.find(f => f.key === col && f.type === 'pill_name') && row[col]">
                  <span class="badge rounded-pill text-white" :class="getPillClass(col, row[col])">
                    {{ String(row[col]).toUpperCase() }}
                  </span>
                </span>

                <!-- DEFAULT / SECRET FIELDS (solo si no es Cloudinary ni URL) -->
                <span v-else
                      :class="{'price-bold': fields.find(f => f.key === col && f.type === 'price')}">
                  {{
                    fields.find(f => f.key === col && f.secretField) && !showSecretFields
                      ? (typeof row[col] === 'string' || typeof row[col] === 'number'
                          ? '●'.repeat(String(row[col]).length)
                          : '●●●●●')
                      : formatValue(row[col], col)
                  }}
                </span>

              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div v-if="totalItems > 0" class="mt-4">
        <div class="d-flex justify-content-start align-items-center">
          <small class="text-muted me-3">
            Mostrando {{ startItem }} - {{ endItem }} de {{ totalItems }} elementos
          </small>
          <nav aria-label="Navegación de páginas" style="padding-left: 30px;">
            <ul class="pagination pagination-sm mb-0">
              
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>

              <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <button class="page-link" @click="goToPage(page)">{{ page }}</button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>

            </ul>
          </nav>
        </div>
      </div>

    </div>
  </div>
</template>


<script>
import api from '../api/axios';
import { mapGetters, mapActions } from 'vuex';
import OptionsComponent from './OptionsComponent.vue';

export default {
  name: 'CRUDGridComponent',
  components: { OptionsComponent },
  props: {
    resourceName: { type: String, required: true },
    endpoint: { type: String, required: true },
    states: { type: [Array, Object], default: null },
    iconClass: { type: String, default: 'fas fa-list-alt me-2 text-secondary' },
    showPropertiesButton: { type: Boolean, default: true },
    fields: { type: Array, default: () => [] }, // NUEVO
    optionsProps: { type: Object, default: () => ({}) }, // Props para OptionsComponent
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
      tableKey: '', // Key dinámica para forzar re-render
      showSecretFields: false, // Nuevo: controla visibilidad de campos secretos
    };
  },
  computed: {
    ...mapGetters([]),
    capitalizedResourceName() {
      if (!this.resourceName) return '';
      return this.resourceName.charAt(0).toUpperCase() + this.resourceName.slice(1);
    },
    visibleColumns() {
      // Filtrar columnas ocultas por hideInGrid en fields
      const hidden = this.fields.filter(f => f.hideInGrid).map(f => f.key);
      return this.columns.filter(col => col !== 'field_verbose_names' && col !== 'state_name' && !hidden.includes(col));
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
    // Computed para encontrar el campo con sumCount: true
    sumFieldKey() {
      const sumFields = this.fields.filter(f => f.sumCount === true);
      if (sumFields.length === 0) {
        return null;
      }
      if (sumFields.length > 1) {
        console.warn('Advertencia: Múltiples campos con sumCount: true encontrados. Solo se usará el primero.');
      }
      return sumFields[0].key;
    },
    // Computed para calcular la suma de los valores seleccionados
    calculatedSum() {
      if (!this.sumFieldKey || this.selected.length === 0) {
        return 0;
      }
      
      let sum = 0;
      for (const selectedCode of this.selected) {
        const row = this.filteredRows.find(r => String(r.code) === selectedCode);
        if (row && row[this.sumFieldKey] !== undefined && row[this.sumFieldKey] !== null) {
          const value = parseFloat(row[this.sumFieldKey]);
          if (!isNaN(value)) {
            sum += value;
          }
        }
      }
      
      return sum;
    },
  },
  methods: {
    ...mapActions([]),
    toggleAllSelection() {
      if (this.allSelected) {
        this.selected = [];
        this.$emit('row-selected', null);
      } else {
        this.selected = this.filteredRows.map(row => String(row.code));
        // Si solo hay una fila seleccionada, emitir evento
        if (this.selected.length === 1) {
          const selectedRow = this.rows.find(row => String(row.code) === this.selected[0]);
          if (selectedRow) {
            this.$emit('row-selected', selectedRow);
          }
        } else {
          this.$emit('row-selected', null);
        }
      }
    },
    toggleRowSelection(code) {
      // Solo emitir el evento, v-model ya actualizó selected
      if (this.selected.length === 1) {
        const selectedRow = this.rows.find(row => String(row.code) === this.selected[0]);
        if (selectedRow) {
          this.$emit('row-selected', selectedRow);
        }
      } else {
        this.$emit('row-selected', null);
      }
    },
    configureSelected() {
      if (this.selected.length === 1) {
        const selectedRow = this.rows.find(row => String(row.code) === this.selected[0]);
        if (selectedRow) {
          // Marcar esta fila como en edición
          this.editingRowId = selectedRow.code;
          
          // Emitir evento con los datos del item seleccionado
          this.$emit('configure', selectedRow);
          
          // Limpiar selección después de configurar
          this.selected = [];
        }
      }
    },
    showProperties() {
      if (this.selected.length === 1) {
        const selectedRow = this.rows.find(row => String(row.code) === this.selected[0]);
        if (selectedRow) {
          this.$emit('show-properties', selectedRow);
          this.selected = [];
        }
      } else {
        this.$emit('show-properties', null);
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
        // Agregar is_visible=true siempre
        params.append('is_visible', 'true');
        
        // Agregar parámetros a la URL
        if (params.toString()) {
          url += '?' + params.toString();
        }
        
        const res = await api.get(url);

        // --- NUEVO: Soporte para verbose_names global ---
        if (
          res.data.results &&
          typeof res.data.results === 'object' &&
          res.data.results.results &&
          res.data.results.verbose_names
        ) {
          // Caso /products/list
          this.rows = res.data.results.results;
          this.totalItems = this.rows.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.verboseNames = res.data.results.verbose_names;
        } else if (res.data.results !== undefined) {
          // Respuesta paginada estándar
          this.rows = res.data.results || [];
          this.totalItems = res.data.count || 0;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          // extrae verbose names desde primer item
          this.verboseNames = this.rows.length > 0 && this.rows[0].field_verbose_names
            ? this.rows[0].field_verbose_names
            : {};
        } else {
          // Respuesta no paginada (fallback)
          this.rows = Array.isArray(res.data) ? res.data : [];
          this.totalItems = this.rows.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.verboseNames = {};
        }
        
        // Filtrar columnas específicas que no deben mostrarse
        this.columns = this.rows.length > 0
          ? Object.keys(this.rows[0]).filter(col => {
              // Excluir columnas específicas
              if (col === 'field_verbose_names' || col === 'code' || col === 'type_id') {
                return false;
              }
              return true;
            })
          : [];
        
        // Actualizar datos filtrados
        this.filteredRows = [...this.rows];
        // Limpiar selected para que solo contenga IDs presentes y como string
        this.selected = this.selected
          .map(code => String(code))
          .filter(code => this.filteredRows.some(row => String(row.code) === code));
        // Forzar re-render de la tabla
        this.tableKey = this.getTableKey();
        
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
    formatValue(val, col) {
      const field = this.fields.find(f => f.key === col);
      if (field && field.type === 'price') {
        if (val === null || val === undefined || isNaN(val)) return '-';
        return '$' + Number(val).toLocaleString('es-CL');
      }
      if (val === null || val === undefined) return '-';
      if (typeof val === 'string' && val.length > 100) return val.slice(0, 100) + '...';
      return val;
    },
    capitalize(val) {
      if (!val) return '';
      return val.charAt(0).toUpperCase() + val.slice(1);
    },
    getTableKey() {
      return this.filteredRows.map(r => String(r.code)).join('-');
    },
    getPillClass(col, value) {
      const field = this.fields.find(f => f.key === col && f.type === 'pill_name');
      if (!field || !field.pillMap || !value) {
        return 'bg-secondary';
      }
      // Buscar en pillMap de forma case-insensitive
      const valueStr = String(value).toLowerCase();
      const mappedKey = Object.keys(field.pillMap).find(key => key.toLowerCase() === valueStr);
      if (mappedKey) {
        return field.pillMap[mappedKey];
      }
      // Clase por defecto si no hay mapeo
      return 'bg-dark';
    },
    formatSumValue(value) {
      if (value === null || value === undefined || isNaN(value)) {
        return '$0';
      }
      // Formatear como precio
      return '$' + Number(value).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },
    handleImport() {
      // Emitir evento para que la vista maneje la importación
      this.$emit('import');
    },
    handleExport() {
      // Emitir evento para que la vista maneje la exportación
      this.$emit('export');
    },
  },
  watch: {
    endpoint: 'fetchData',
  },
  mounted() {
    // Validar que solo hay un campo con sumCount: true
    const sumFields = this.fields.filter(f => f.sumCount === true);
    if (sumFields.length > 1) {
      console.error('Error: Solo puede haber un campo con sumCount: true. Se encontraron:', sumFields.map(f => f.key));
    }
    // Validar que el campo con sumCount es de tipo numérico (price o number)
    if (sumFields.length > 0) {
      const sumField = sumFields[0];
      if (sumField.type !== 'price' && sumField.type !== 'number') {
        console.warn(`Advertencia: El campo "${sumField.key}" con sumCount: true debería ser de tipo "price" o "number" para realizar sumas correctamente.`);
      }
    }
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
