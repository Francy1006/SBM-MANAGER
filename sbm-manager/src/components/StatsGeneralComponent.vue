<template>
  <div class="mb-3 p-3 rounded shadow-sm bg-white">
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
      <h4 class="mb-0 text-primary fw-semibold">
        <i class="fas fa-chart-bar me-2"></i>
        Estadísticas
      </h4>
    </div>

    <div v-if="loading" class="text-center py-2">
      <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      <small class="text-muted ms-2">Cargando estadísticas...</small>
    </div>

    <div v-else-if="error" class="alert alert-warning">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <div v-else class="row">
      <div 
        v-for="(stat, index) in stats" 
        :key="index" 
        class="col-12 col-md-6 col-lg-3 mb-2"
      >
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center p-2">
            <div class="stat-value mb-1">
              <span class="h4 fw-bold" :class="getValueColor(stat)">
                {{ formatValue(stat.value, stat.format) }}
              </span>
            </div>
            <div class="stat-label">
              <small class="text-muted fw-semibold text-uppercase">
                {{ stat.label }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && !error && (!stats || stats.length === 0)" class="text-center py-3">
      <i class="fas fa-info-circle text-muted mb-2" style="font-size: 1.5rem;"></i>
      <p class="text-muted mb-0 small">No hay estadísticas disponibles</p>
    </div>
  </div>
</template>

<script>
import axios from '../api/axios';

export default {
  name: 'StatsGeneralComponent',
  props: {
    endpoint: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Estadísticas Generales'
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      stats: []
    };
  },
  methods: {
    async fetchStats() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(this.endpoint);
        let data = response.data || [];
        
        // Transformar los datos para mostrar estadísticas por tipo
        if (Array.isArray(data)) {
          this.stats = this.transformStatsData(data);
        } else if (typeof data === 'object' && !Array.isArray(data)) {
          // Si es un objeto, convertirlo a array
          data = Object.entries(data).map(([key, value]) => ({
            label: key,
            value: value,
            format: this.detectFormat(value)
          }));
          this.stats = data;
        } else {
          this.stats = [];
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        this.error = 'Error al cargar las estadísticas';
        this.stats = [];
      } finally {
        this.loading = false;
      }
    },
    
    transformStatsData(data) {
      const stats = [];
      
      data.forEach((typeStats, index) => {
        const typeName = typeStats.type_name || `Tipo ${typeStats.type}`;
        
        // Solo mostrar los campos solicitados
        stats.push(
          {
            label: typeName,
            value: typeStats.total_directives,
            format: 'integer',
            color: 'text-primary'
          },
          {
            label: typeStats.type_description,
            value: typeStats.total_directives,
            format: 'integer',
            color: 'text-info'
          }
        );
      });
      
      return stats;
    },
    
    detectFormat(value) {
      if (typeof value === 'number') {
        if (value % 1 === 0) return 'integer';
        return 'decimal';
      }
      if (typeof value === 'string') {
        if (value.includes('%')) return 'percentage';
        if (value.includes('$')) return 'currency';
      }
      return null;
    },
    
    formatValue(value, format) {
      if (value === null || value === undefined) return '-';
      
      // Si no hay formato específico, intentar detectar el tipo
      if (!format) {
        if (typeof value === 'number') {
          // Si es un número decimal, mostrar con 2 decimales
          if (value % 1 !== 0) {
            return value.toFixed(2);
          }
          return value.toString();
        }
        return value.toString();
      }
      
      // Aplicar formato específico
      switch (format.toLowerCase()) {
        case 'integer':
          return Math.round(value).toString();
        case 'double':
          return parseFloat(value).toFixed(2);
        case 'percentage':
          return `${parseFloat(value).toFixed(1)}%`;
        case 'currency':
          return `$${parseFloat(value).toFixed(2)}`;
        case 'decimal':
          return parseFloat(value).toFixed(2);
        case 'text':
          return value.toString();
        default:
          return value.toString();
      }
    },
    
    getValueColor(stat) {
      // Determinar color basado en el valor o tipo de estadística
      if (stat.color) {
        return stat.color;
      }
      
      // Colores por defecto basados en el tipo de valor
      if (stat.format === 'percentage') {
        const value = parseFloat(stat.value);
        if (value >= 80) return 'text-success';
        if (value >= 60) return 'text-warning';
        return 'text-danger';
      }
      
      // Color por defecto
      return 'text-primary';
    }
  },
  
  mounted() {
    this.fetchStats();
  },
  
  watch: {
    endpoint: {
      handler() {
        this.fetchStats();
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.stat-value {
  font-family: 'DINAlternate', sans-serif;
}

.stat-label {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .col-md-6 {
    margin-bottom: 1rem;
  }
  
  .stat-value .h3 {
    font-size: 1.5rem;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .stat-value .h3 {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.65rem;
  }
}
</style> 