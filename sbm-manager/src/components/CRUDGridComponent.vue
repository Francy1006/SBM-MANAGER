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

      <!-- GRID OPTIONS -->
      <div class="mb-4 p-4">
        <div class="d-flex flex-column gap-2">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="hideDeleted" v-model="hideDeleted"
              @change="fetchData" />
            <label class="form-check-label" for="hideDeleted">
              Ocultar eliminados
            </label>
          </div>

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

              <th v-if="showOpenColumn" style="width:90px!important;" class="align-middle text-center">
                {{ openColumnLabel }}
              </th>

              <th v-for="col in visibleColumns" :key="col" style="min-width:200px!important; cursor:pointer;"
                class="align-middle" @click="toggleSort(col)">
                <div class="d-flex justify-content-between align-items-center">
                  <span>{{ getColumnLabel(col) }}</span>

                  <span>
                    <i v-if="sortKey === col && sortDirection === 'asc'" class="fas fa-arrow-up text-warning"></i>
                    <i v-else-if="sortKey === col && sortDirection === 'desc'"
                      class="fas fa-arrow-down text-warning"></i>
                    <i v-else class="fas fa-arrow-up text-secondary opacity-50"></i>
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          <!-- BODY -->
          <tbody>
            <tr v-if="filteredRows.length === 0">
              <td :colspan="visibleColumns.length + (filteredRows.length > 0 ? 1 : 0) + (showOpenColumn ? 1 : 0)"
                class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i>
                {{ searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay elementos disponibles' }}
              </td>
            </tr>

            <template v-for="row in filteredRows" :key="rowId(row)">
              <tr :class="{
                'table-primary fw-bold': selected.includes(String(row.code ?? row.id ?? row.sku)) || rowId(row) === editingRowId,
                'text-white': rowId(row) === editingRowId
              }">

                <!-- SELECTION CHECKBOX -->
                <td v-if="rows.length > 0" class="text-center">
                  <input type="checkbox" :key="'checkbox-' + (row.code ?? row.id ?? row.sku)"
                    :value="String(row.code ?? row.id ?? row.sku)" v-model="selected"
                    @change.stop="toggleRowSelection" />
                </td>

                <!-- OPEN -->
                <td v-if="showOpenColumn" class="text-center">
                  <button class="btn btn-sm btn-outline-primary rounded-pill" @click.stop="openRow(row)"
                    title="Abrir registro">
                    <i class="fas fa-arrow-turn-down"></i>
                  </button>
                </td>

                <!-- CELLS -->
                <td v-for="col in visibleColumns" :key="col">

                  <template v-if="
                    (() => {
                      const field = fields.find(f => f.key === col)
                      return field && field.cellManual
                    })()
                  ">

                    <span v-if="
                      editingCellKey !== rowId(row) + '-' + col &&
                      fields.find(f => f.key === col)?.cellPill
                    " :class="getCellPillClass(col, row)" class="pill-status" style="cursor:pointer;"
                      @click.stop="editingCellKey = rowId(row) + '-' + col">
                      {{
                        fields.find(f => f.key === col)?._manualOptions
                          ?.find(o => String(o.id) === String(row[col]))
                          ?.name || '-'
                      }}
                    </span>

                    <select v-else-if="fields.find(f => f.key === col)?.type === 'dynamic-select'"
                      class="form-select form-select-sm" v-model="row[col]"
                      @change="handleManualChange(row, col); editingCellKey = null" @blur="editingCellKey = null"
                      @click.stop>
                      <option v-for="opt in fields.find(f => f.key === col)._manualOptions || []"
                        :key="opt[fields.find(f => f.key === col).cellManual.valueKey]"
                        :value="opt[fields.find(f => f.key === col).cellManual.valueKey]">
                        {{opt[fields.find(f => f.key === col).cellManual.labelKey]}}
                      </option>
                    </select>

                    <textarea v-else-if="fields.find(f => f.key === col)?.type === 'textarea'"
                      class="form-control form-control-sm" rows="2" v-model="row[col]"
                      @blur="handleManualTextarea(row, col)" @click.stop></textarea>

                  </template>

                  <span v-else-if="
                    (() => {
                      const field = fields.find(f => f.key === col)
                      return field && field.cellLabel && row[`${col}_detail`]
                    })()
                  ">
                    {{
                      row[`${col}_detail`][
                      fields.find(f => f.key === col).cellLabel
                      ]
                    }}
                  </span>

                  <span v-else-if="col === 'state' && states">
                    {{ getStateName(row[col]) }}
                  </span>

                  <span v-else-if="fields.find(f => f.key === col)?.type === 'rating'">
                    <span v-if="isSecretHidden(col)">●●●●●</span>

                    <span v-else>
                      <span v-for="star in 5" :key="star" class="me-1"
                        :class="star <= Number(row[col]) ? 'text-warning' : 'text-secondary opacity-25'"
                        style="font-size:1.2rem;">
                        <i class="fa-solid fa-star"></i>
                      </span>
                    </span>
                  </span>

                  <span v-else-if="typeof row[col] === 'boolean'">
                    <i v-if="row[col]" class="fas fa-check text-success" style="font-size: x-large;"></i>
                    <i v-else class="fas fa-times text-danger" style="font-size: x-large;"></i>
                  </span>

                  <span v-else-if="
                    typeof row[col] === 'string' &&
                    row[col] &&
                    row[col].startsWith('https://res.cloudinary.com')
                  ">
                    <img :src="row[col]" alt="Imagen"
                      style="max-height: 80px; max-width: 100px; object-fit: contain; border-radius: 6px;" />
                  </span>

                  <span v-else-if="col.toLowerCase().includes('url') && row[col]">
                    <a :href="row[col]" target="_blank">{{ row[col] }}</a>
                  </span>

                  <span v-else-if="fields.find(f => f.key === col)?.type === 'pill_name'" class="pill-status" :style="{
                    background: '#' + (row.menu_background_color || '6c757d'),
                    color: '#' + (row.menu_text_color || 'ffffff')
                  }">
                    {{ row[col] }}
                  </span>

                  <span v-else>
                    <span v-if="isSecretHidden(col)">●●●●●</span>
                    <span v-else>{{ formatValue(row[col], col) }}</span>
                  </span>

                </td>
              </tr>

              <tr v-if="showDetailComponent && isRowExpanded(row)">
                <td :colspan="visibleColumns.length + (rows.length > 0 ? 1 : 0) + (showOpenColumn ? 1 : 0)"
                  class="p-3 bg-light">
                  <GridDetailContainerComponent :tables="buildDetailTables(row)" @close="toggleDetailRow(row)" />
                </td>
              </tr>
            </template>
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
import GridDetailContainerComponent from './GridDetailContainerComponent.vue'
import * as XLSX from 'xlsx';

export default {
  name: 'CRUDGridComponent',
  components: { OptionsComponent, GridDetailContainerComponent },
  props: {
    resourceName: { type: String, required: true },
    endpoint: { type: String, required: true },
    states: { type: [Array, Object], default: null },
    iconClass: { type: String, default: 'fas fa-list-alt me-2 text-secondary' },
    showPropertiesButton: { type: Boolean, default: true },
    fields: { type: Array, default: () => [] },
    optionsProps: { type: Object, default: () => ({}) },
    refreshKey: { type: [Number, String], default: 0 },

    showOpenColumn: { type: Boolean, default: false },
    openColumnLabel: { type: String, default: 'Abrir' },
    showDetailComponent: { type: Boolean, default: false },
    detailExtraProps: {
      type: Object,
      default: () => ({})
    },

    percentColorThresholds: {
      type: Array,
      default: () => [20, 40, 60, 80, 100]
    },
    percentColorClasses: {
      type: Array,
      default: () => [
        'text-danger',
        'text-warning',
        'text-orange',
        'text-info',
        'text-primary',
        'text-primary fw-bold'
      ]
    },
    detailTablesConfig: {
      type: Array,
      default: null
    },
    detailFieldsConfig: {
      type: Object,
      default: null
    },
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
      editingCellKey: null,
      searchTerm: '',
      filteredRows: [],
      searchTimeout: null,
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
      tableKey: '',
      showSecretFields: false,
      hideDeleted: true,
      detailRow: null,
      showDetail: false,
      expandedRows: {},
      blockGroupDelete: true,
      sortKey: 'created_at',
      sortDirection: 'desc',
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
      if (!this.filteredRows.length) return false;
      const rowValues = this.filteredRows.map(r => this.rowId(r));
      return rowValues.every(val => this.selected.includes(val));
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
      for (const selectedId of this.selected) {
        const row = this.filteredRows.find(r => this.rowId(r) === selectedId);
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

    rowId(row) {
      return String(row?.code ?? row?.id ?? row?.sku ?? '');
    },

    toggleAllSelection() {
      if (this.allSelected) {
        this.selected = [];
        this.$emit('row-selected', null);
      } else {
        this.selected = this.filteredRows.map(r => this.rowId(r));

        if (this.selected.length === 1) {
          const selectedRow = this.rows.find(r => this.rowId(r) === this.selected[0]);
          this.$emit('row-selected', selectedRow || null);
        } else {
          this.$emit('row-selected', null);
        }
      }
    },

    toggleDetailRow(row) {
      const id = this.rowId(row)
      this.expandedRows[id] = !this.expandedRows[id]
    },

    isRowExpanded(row) {
      return !!this.expandedRows[this.rowId(row)]
    },

    toggleRowSelection() {
      if (this.selected.length === 1) {
        const selectedRow = this.rows.find(r => this.rowId(r) === this.selected[0]);
        this.$emit('row-selected', selectedRow || null);
      } else {
        this.$emit('row-selected', null);
      }
    },

    configureSelected() {
      if (this.selected.length !== 1) return;

      const selectedRow = this.rows.find(r => this.rowId(r) === this.selected[0]);
      if (!selectedRow) return;

      this.editingRowId = this.rowId(selectedRow);
      this.$emit('configure', selectedRow);
      this.selected = [];
    },

    async showProperties() {
      if (this.selected.length !== 1) return;

      const selectedId = this.selected[0];

      try {
        const base = this.endpoint.split('?')[0].split('/').filter(Boolean)[0];
        const res = await api.get(`/${base}/${selectedId}/`);
        this.$emit('show-properties', res.data);
        this.selected = [];
      } catch (error) {
        console.error('Error cargando detalle:', error);
        alert('Error cargando propiedades');
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
        const base = this.endpoint.split('?')[0].split('/').filter(Boolean)[0];

        await api.post(`/${base}/soft_delete/`, {
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

        const orderingValue =
          this.sortDirection === 'desc'
            ? `-${this.sortKey}`
            : this.sortKey;

        params.append('ordering', orderingValue);

        if (this.searchTerm.trim()) {
          params.append('search', this.searchTerm);
        }

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
            if (
              col === 'field_verbose_names' ||
              col === 'code' ||
              col === 'type_id'
            ) return false;

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
          .filter(code => this.filteredRows.some(row => this.rowId(row) === code));

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

      // 💰 PRICE
      if (field && field.type === 'price') {
        if (val === null || val === undefined || isNaN(val)) return '-';
        return '$' + Number(val).toLocaleString('es-CL');
      }

      // 📊 PERCENT
      if (field && field.type === 'percent') {
        if (val === null || val === undefined || isNaN(val)) return '0 %';
        return Number(val).toLocaleString('es-CL', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' %';
      }

      if (val === null || val === undefined) return '-';

      if (typeof val === 'string' && val.length > 100) {
        return val.slice(0, 100) + '...';
      }

      return val;
    },

    capitalize(val) {
      if (!val) return '';
      return val.charAt(0).toUpperCase() + val.slice(1);
    },

    getTableKey() {
      return this.filteredRows.map(r => this.rowId(r)).join('-');
    },

    getCellPillClass(col, row) {

      const field = this.fields.find(f => f.key === col)
      if (!field?.cellPill) return ''

      const option = field._manualOptions?.find(
        o => String(o[field.cellManual.valueKey]) === String(row[col])
      )

      if (!option?.code) return ''

      const module = field.cellPill.toLowerCase()
      const code = option.code.toLowerCase().replace(/_/g, '-')

      return `pill-status pill-${module}-${code}`
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

      const headers = this.visibleColumns.map(col => this.verboseNames?.[col] || col);

      const data = this.filteredRows.map(row =>
        this.visibleColumns.map(col => {
          const value = row[col];

          if (value === null || value === undefined) return '';

          if (typeof value === 'boolean') return value ? 'SI' : 'NO';

          const field = this.fields.find(f => f.key === col);

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

      XLSX.utils.book_append_sheet(workbook, worksheet, this.resourceName.substring(0, 31));

      const fileName = `${this.resourceName.replace(/\s+/g, '_')}_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, '-')}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    },

    async toggleSort(col) {
      if (this.sortKey === col) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = col;
        this.sortDirection = 'asc';
      }

      this.currentPage = 1;
      await this.fetchData();
    },

    getColumnLabel(col) {
      const field = this.fields.find(f => f.key === col);
      if (field && field.label) return field.label;
      if (this.verboseNames && this.verboseNames[col]) return this.verboseNames[col];
      return col;
    },

    getCellClass(col, value) {
      const field = this.fields.find(f => f.key === col);

      if (!field) return '';

      // 🔒 Si es secreto y oculto → negro siempre
      if (field.secretField && !this.showSecretFields) {
        return '';
      }

      // 💰 Price
      if (field.type === 'price') {
        return 'price-bold';
      }

      // 📊 Percent con escala fija
      if (field.type === 'percent') {
        const val = Number(value);

        if (isNaN(val)) return '';

        if (val <= 20) return 'text-danger';      // rojo
        if (val <= 40) return 'text-warning';     // naranja (bootstrap approx)
        if (val <= 60) return 'text-warning fw-bold'; // amarillo fuerte
        if (val <= 100) return 'text-success';    // verde
        return 'text-primary fw-bold';            // azul
      }

      return '';
    },
    isPercentField(col) {
      const field = this.fields.find(f => f.key === col);
      return field?.type === 'percent';
    },

    isSecretHidden(col) {
      const field = this.fields.find(f => f.key === col);
      return field?.secretField && !this.showSecretFields;
    },

    getPercentColorClass(value) {
      const val = Number(value);
      if (isNaN(val)) return '';

      if (val <= 20) return 'text-danger';
      if (val <= 40) return 'text-warning';
      if (val <= 60) return 'text-warning fw-bold';
      if (val <= 100) return 'text-success';
      return 'text-primary fw-bold';
    },

    getPercentIconClass(value) {
      const val = Number(value);
      if (isNaN(val)) return '';

      if (val <= 20) return 'fas fa-arrow-down';
      if (val <= 40) return 'fas fa-arrow-trend-down';
      if (val <= 60) return 'fas fa-minus';
      if (val <= 100) return 'fas fa-arrow-up';
      return 'fas fa-crown';
    },
    async handleManualChange(row, col) {

      const field = this.fields.find(f => f.key === col)
      if (!field?.cellManual) return

      try {

        const endpoint = field.cellManual.endpoint
        const patchField = field.cellManual.patchField

        let id = row.id

        // 🔥 si el campo pertenece a client
        if (field.cellManual.model === 'client') {
          id = row.client_code
          if (!id) return
        }

        await api.patch(`/${endpoint}/${id}/`, {
          [patchField]: row[col]
        })

      } catch (error) {
        console.error('Error PATCH manual:', error)
      }
    },
    async loadManualFieldOptions() {

      for (const field of this.fields) {

        if (!field.cellManual || !field.endpoint) continue

        try {
          const res = await api.get(field.endpoint)

          field._manualOptions = Array.isArray(res.data)
            ? res.data
            : (res.data.results || [])

        } catch (e) {
          console.error('Error cargando opciones manual:', e)
          field._manualOptions = []
        }
      }
    },
    activateManualCell(row, col) {
      // Aquí luego puedes abrir dropdown o modal
      console.log('Editar manual:', row.id, col)
    },
    async handleManualTextarea(row, col) {

      const field = this.fields.find(f => f.key === col)
      if (!field?.cellManual) return

      try {

        // 🔥 PATCH siempre contra CLIENT (no client-brand)
        const clientCode = row.client_code || row.client?.code

        if (!clientCode) {
          console.warn('No se encontró client_code en la fila')
          return
        }

        await api.patch(`/clients/${clientCode}/`, {
          [field.cellManual.patchField]: row[col]
        })

      } catch (error) {
        console.error('Error PATCH textarea manual:', error)
      }
    },
    openRow(row) {
      if (this.showDetailComponent) {
        this.toggleDetailRow(row)
      } else {
        this.$emit('open-row', row)
      }
    },
    buildDetailTables(row) {
      return this.detailTablesConfig.map(t => ({
        title: t.title,
        icon: t.icon,
        type: t.type,

        order: this.detailExtraProps?.order || row,

        rows: [],
        fields: this.detailFieldsConfig?.[t.type] || [],

        searchConfig: t.searchConfig || {},
        createConfig: t.createConfig || {},

        // 🔥 FIX CLAVE: NO MERGE
        calculationConfig: t.calculationConfig || null,

        detailConfig: t.detailConfig || {},
      }))
    },
  },
  watch: {
    endpoint: 'fetchData',
    refreshKey: {
      handler() {
        this.currentPage = 1;
        this.selected = [];
        this.fetchData();
      },
      immediate: false,
    },
  },
  mounted() {

    this.loadManualFieldOptions()  // 🔥 carga opciones dinámicas

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