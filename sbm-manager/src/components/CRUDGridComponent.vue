<template>
  <div class="mb-4 p-4 rounded shadow-sm bg-white">
    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
      <h4 class="mb-0 text-primary fw-semibold">
        <i :class="iconClass"></i>
        Listado de {{ capitalizedResourceName }}
      </h4>
      <div>
        <button class="btn btn-outline-primary me-2 rounded-pill px-4">
          <i class="fas fa-plus me-1"></i> Botón 1
        </button>
        <button class="btn btn-outline-secondary rounded-pill px-4">
          <i class="fas fa-cog me-1"></i> Botón 2
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else>
      <div class="table-responsive">
        <table class="table table-hover align-middle table-bordered">
          <thead class="table-dark text-center">
            <tr>
              <th v-for="col in visibleColumns" :key="col">
                {{ verboseNames[col] || capitalize(col) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="rows.length === 0">
              <td :colspan="visibleColumns.length" class="text-center text-muted py-4">
                <i class="fas fa-info-circle me-2"></i> No hay datos disponibles
              </td>
            </tr>
            <tr v-for="row in rows" :key="row.id">
              <td v-for="col in visibleColumns" :key="col">
                <span v-if="col === 'state' && states">
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
    </div>
  </div>
</template>

<script>
import api from '../api/axios';

export default {
  name: 'CRUDGridComponent',
  props: {
    resourceName: { type: String, required: true },
    endpoint: { type: String, required: true },
    states: { type: Array, default: null },
    iconClass: { type: String, default: 'fas fa-list-alt me-2 text-secondary' },
  },
  data() {
    return {
      loading: true,
      rows: [],
      columns: [],
      verboseNames: {},
      error: '',
    };
  },
  computed: {
    capitalizedResourceName() {
      if (!this.resourceName) return '';
      return this.resourceName.charAt(0).toUpperCase() + this.resourceName.slice(1);
    },
    visibleColumns() {
      return this.columns.filter(col => col !== 'field_verbose_names');
    },
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const res = await api.get(this.endpoint);
        this.rows = Array.isArray(res.data) ? res.data : (res.data.results || []);
        this.columns = this.rows.length > 0
          ? Object.keys(this.rows[0]).filter(col => col !== 'field_verbose_names')
          : [];

        // extrae verbose names desde primer item
        this.verboseNames = this.rows.length > 0 && this.rows[0].field_verbose_names
          ? this.rows[0].field_verbose_names
          : {};
      } catch (e) {
        this.error = 'Error al cargar los datos';
        this.rows = [];
        this.columns = [];
        console.error('Error al cargar los datos:', e);
      } finally {
        this.loading = false;
      }
    },
    getStateName(stateId) {
      if (!this.states) return stateId;
      const state = this.states.find(s => s.id === stateId);
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
};
</script>

<style scoped>
.table td, .table th {
  font-weight: normal !important;
  font-family: Arial, sans-serif !important;
}
</style>
