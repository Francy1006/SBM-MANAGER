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
    <OptionsComponent v-bind="optionsProps" @toggle-secret-fields="showSecretFields = $event" @import="handleImport"
      @export="handleExport" />

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
              <input type="text" class="form-control border-start-0"
                :placeholder="`Buscar ${resourceName.toLowerCase()}...`" v-model="searchTerm" @input="debouncedSearch"
                :disabled="loading" />
              <span v-if="loading" class="input-group-text bg-light border-start-0">
                <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- GRID OPTIONS (checkboxes debajo de la búsqueda) -->
      <div class="mb-4 p-4">
        <div class="d-flex flex-column gap-2">

          <!-- Ocultar eliminados -->
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="hideDeleted" v-model="hideDeleted"
              @change="fetchData" />
            <label class="form-check-label" for="hideDeleted">
              Ocultar eliminados
            </label>
          </div>

          <!-- Bloquear eliminar en grupo -->
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="blockGroupDelete" v-model="blockGroupDelete" />
            <label class="form-check-label" for="blockGroupDelete">
              Bloquear eliminar en grupo
            </label>
          </div>

        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="mb-4" v-if="selectedCount > 0">
        <div class="row justify-content-between align-items-center g-2">

          <div class="col-auto d-flex align-items-center gap-2">
            <span class="text-small text-secondary">{{ selectedCount }} seleccionados</span>
            <span v-if="sumFieldKey && selectedCount > 0 && showSecretFields" class="badge bg-danger text-white">
              TOTAL SUMA ({{ sumFieldVerboseName }}): {{ formatSumValue(calculatedSum) }}
            </span>
          </div>

          <div class="col-auto d-flex gap-2">
            <div v-if="showPropertiesButton">
              <button class="btn btn-warning btn-sm rounded-pill px-3" @click="showProperties"
                :disabled="selectedCount !== 1">
                <i class="fas fa-cog me-1"></i> Propiedades
              </button>
            </div>

            <div>
              <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="configureSelected"
                :disabled="selectedCount !== 1">
                <i class="fas fa-cog me-1"></i> Configurar
              </button>
            </div>

            <div>
              <button class="btn btn-outline-secondary btn-sm rounded-pill px-3" @click="deleteSelected"
                :disabled="blockGroupDelete ? selectedCount > 1 : false">
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
            <tr v-for="row in filteredRows" :key="'row-' + row.code" :class="{
              'table-primary fw-bold': selected.includes(String(row.code)) || row.code === editingRowId,
              'text-white': row.code === editingRowId
            }">

              <!-- SELECTION CHECKBOX -->
              <td v-if="rows.length > 0" class="text-center">
                <input type="checkbox" :key="'checkbox-' + row.code" :value="String(row.code)" v-model="selected"
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
                <span
                  v-else-if="typeof row[col] === 'string' && row[col] && row[col].startsWith('https://res.cloudinary.com')">
                  <img :src="row[col]" alt="Imagen Cloudinary"
                    style="max-height: 80px; max-width: 100px; object-fit: contain; border-radius: 6px; box-shadow: 0 2px 8px #0001;" />
                </span>

                <!-- URL (solo si no es Cloudinary) -->
                <span
                  v-else-if="col.toLowerCase().includes('url') && row[col] && !(typeof row[col] === 'string' && row[col].startsWith('https://res.cloudinary.com'))">
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

                <!-- PILL NAME -->
                <span v-else-if="fields.find(f => f.key === col && f.type === 'pill_name') && row[col]">
                  <span class="badge rounded-pill text-white" :class="getPillClass(col, row[col])">
                    {{ String(row[col]).toUpperCase() }}
                  </span>
                </span>

                <!-- DEFAULT / SECRET FIELDS -->
                <span v-else :class="{ 'price-bold': fields.find(f => f.key === col && f.type === 'price') }">
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
import * as XLSX from 'xlsx';

export default {
  name: 'CRUDGridComponent',
  components: { OptionsComponent },
  props: {
    resourceName: { type: String, required: true },
    endpoint: { type: String, required: true },
    states: { type: [Array, Object], default: null },
    iconClass: { type: String, default: 'fas fa-list-alt me-2 text-secondary' },
    showPropertiesButton: { type: Boolean, default: true },
    fields: { type: Array, default: () => [] },
    optionsProps: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      loading: true,
      rows: [],
      columns: [],
      verboseNames: {},
      error: '',
      selected: [],
      editingRowId: null,
      searchTerm: '',
      filteredRows: [],
      searchTimeout: null,
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
      tableKey: '',
      showSecretFields: false,

      // ✅ NUEVO: checkboxes debajo de búsqueda
      hideDeleted: true,
      blockGroupDelete: true,
    };
  },
  computed: {
    ...mapGetters([]),
    capitalizedResourceName() {
      if (!this.resourceName) return '';
      return this.resourceName.charAt(0).toUpperCase() + this.resourceName.slice(1);
    },
    visibleColumns() {
      const hidden = this.fields.filter(f => f.hideInGrid).map(f => f.key);
      return this.columns.filter(col => col !== 'field_verbose_names' && col !== 'state_name' && !hidden.includes(col));
    },
    allSelected() {
      return this.filteredRows.length > 0 && this.selected.length === this.filteredRows.length;
    },
    selectedCount() {
      return this.selected.length;
    },
    startItem() {
      return (this.currentPage - 1) * this.pageSize + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.pageSize, this.totalItems);
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;

      if (this.totalPages <= maxVisible) {
        for (let i = 1; i <= this.totalPages; i++) pages.push(i);
      } else {
        let start = Math.max(1, this.currentPage - 2);
        let end = Math.min(this.totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
          start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) pages.push(i);
      }

      return pages;
    },
    sumFieldKey() {
      const sumFields = this.fields.filter(f => f.sumCount === true);
      if (sumFields.length === 0) return null;
      if (sumFields.length > 1) {
        console.warn('Advertencia: Múltiples campos con sumCount: true encontrados. Solo se usará el primero.');
      }
      return sumFields[0].key;
    },
    sumFieldVerboseName() {
      if (!this.sumFieldKey) return '';
      const vn = this.verboseNames?.[this.sumFieldKey];
      if (vn) return vn;
      const field = this.fields.find(f => f.key === this.sumFieldKey);
      if (field?.label) return field.label;
      return this.sumFieldKey;
    },
    calculatedSum() {
      if (!this.sumFieldKey || this.selected.length === 0) return 0;

      let sum = 0;
      for (const selectedCode of this.selected) {
        const row = this.filteredRows.find(r => String(r.code) === selectedCode);
        if (row && row[this.sumFieldKey] !== undefined && row[this.sumFieldKey] !== null) {
          const value = parseFloat(row[this.sumFieldKey]);
          if (!isNaN(value)) sum += value;
        }
      }
      return sum;
    },
    deletedCount() {
      if (!Array.isArray(this.rows)) return 0;
      return this.rows.filter(r => r && r.is_deleted === true).length;
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
        if (this.selected.length === 1) {
          const selectedRow = this.rows.find(row => String(row.code) === this.selected[0]);
          this.$emit('row-selected', selectedRow || null);
        } else {
          this.$emit('row-selected', null);
        }
      }
    },
    toggleRowSelection() {
      if (this.selected.length === 1) {
        const selectedRow = this.rows.find(row => String(row.code) === this.selected[0]);
        this.$emit('row-selected', selectedRow || null);
      } else {
        this.$emit('row-selected', null);
      }
    },
    configureSelected() {
      if (this.selected.length === 1) {
        const selectedRow = this.rows.find(row => String(row.code) === this.selected[0]);
        if (selectedRow) {
          this.editingRowId = selectedRow.code;
          this.$emit('configure', selectedRow);
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
    resetEditingState() {
      this.editingRowId = null;
    },
    debouncedSearch() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.searchData();
      }, 500);
    },
    async goToPage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage) return;
      this.currentPage = page;
      await this.fetchData();
    },
    async searchData() {
      this.currentPage = 1;
      await this.fetchData();
    },

    async deleteSelected() {
      if (this.selected.length === 0) {
        alert('Por favor selecciona al menos un item para eliminar');
        return;
      }

      if (this.blockGroupDelete && this.selected.length > 1) {
        alert('La eliminación en grupo está bloqueada');
        return;
      }

      const confirmMessage =
        this.selected.length === 1
          ? '¿Estás seguro de que quieres eliminar este item?'
          : `¿Estás seguro de que quieres eliminar estos ${this.selected.length} items?`;

      if (!confirm(confirmMessage)) return;

      try {
        // Soporta 1 o múltiples (si blockGroupDelete está en false)
        await api.post('/franchises/soft_delete/', {
          ids: [...this.selected]
        });

        alert('Item(s) eliminado(s) exitosamente');
        this.selected = [];
        await this.fetchData();

      } catch (error) {
        console.error('Error al eliminar item:', error);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        alert('Error al eliminar item: ' + (error.response?.data?.detail || error.message));
      }
    },

    async fetchData() {
      this.loading = true;
      try {
        let url = this.endpoint;
        const params = new URLSearchParams();

        params.append('page', this.currentPage.toString());
        params.append('page_size', this.pageSize.toString());

        if (this.searchTerm.trim()) {
          params.append('search', this.searchTerm);
        }

        // ✅ Solo filtra por visibles si hideDeleted está activo
        if (this.hideDeleted) {
          params.append('is_visible', 'true');
        }

        if (params.toString()) url += '?' + params.toString();

        const res = await api.get(url);

        if (
          res.data.results &&
          typeof res.data.results === 'object' &&
          res.data.results.results &&
          res.data.results.verbose_names
        ) {
          this.rows = res.data.results.results;
          this.totalItems = this.rows.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.verboseNames = res.data.results.verbose_names;
        } else if (res.data.results !== undefined) {
          this.rows = res.data.results || [];
          this.totalItems = res.data.count || 0;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.verboseNames = this.rows.length > 0 && this.rows[0].field_verbose_names
            ? this.rows[0].field_verbose_names
            : {};
        } else {
          this.rows = Array.isArray(res.data) ? res.data : [];
          this.totalItems = this.rows.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.verboseNames = {};
        }

        this.columns = this.rows.length > 0
          ? Object.keys(this.rows[0]).filter(col => {
            if (col === 'field_verbose_names' || col === 'code' || col === 'type_id') return false;
            return true;
          })
          : [];

        this.filteredRows = [...this.rows];
        this.$emit('counts-updated', {
          total: Number(this.totalItems || 0),
          deleted: Number(this.deletedCount || 0),
        });

        this.selected = this.selected
          .map(code => String(code))
          .filter(code => this.filteredRows.some(row => String(row.code) === code));

        this.tableKey = this.getTableKey();

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
      if (!field || !field.pillMap || !value) return 'bg-secondary';

      const valueStr = String(value).toLowerCase();
      const mappedKey = Object.keys(field.pillMap).find(key => key.toLowerCase() === valueStr);
      if (mappedKey) return field.pillMap[mappedKey];

      return 'bg-dark';
    },
    formatSumValue(value) {
      if (value === null || value === undefined || isNaN(value)) return '$0';
      return '$' + Number(value).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },
    handleImport() {
      this.$emit('import');
    },
    handleExport(payload) {
      const format = (payload?.format || 'XLSX').toUpperCase();

      if (format === 'XLSX') {
        this.exportToXlsx();
        return;
      }

      if (format === 'CSV') {
        this.exportToCsv?.();
        return;
      }

      if (format === 'PDF') {
        alert('Export PDF pendiente');
        return;
      }
    },
    exportToXlsx() {
      if (!this.filteredRows.length) {
        alert('No hay datos para exportar.');
        return;
      }

      const headers = this.visibleColumns.map(
        col => this.verboseNames?.[col] || col
      );

      const data = this.filteredRows.map(row =>
        this.visibleColumns.map(col => {
          const value = row[col];

          if (value === null || value === undefined) return '';

          if (typeof value === 'boolean') {
            return value ? 'SI' : 'NO';
          }

          const field = this.fields.find(f => f.key === col);

          // Si es campo secreto y está oculto
          if (field?.secretField && !this.showSecretFields) {
            return '●●●●●';
          }

          if (field?.type === 'price') {
            const n = Number(value);
            return isNaN(n) ? '' : n;
          }

          return value;
        })
      );

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        this.resourceName.substring(0, 31)
      );

      const fileName = `${this.resourceName.replace(/\s+/g, '_')}_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, '-')}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    },
  },
  watch: {
    endpoint: 'fetchData',
  },
  mounted() {
    const sumFields = this.fields.filter(f => f.sumCount === true);
    if (sumFields.length > 1) {
      console.error('Error: Solo puede haber un campo con sumCount: true. Se encontraron:', sumFields.map(f => f.key));
    }
    if (sumFields.length > 0) {
      const sumField = sumFields[0];
      if (sumField.type !== 'price' && sumField.type !== 'number') {
        console.warn(`Advertencia: El campo "${sumField.key}" con sumCount: true debería ser de tipo "price" o "number".`);
      }
    }
    this.fetchData();
  },
  beforeUnmount() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
  },
};
</script>