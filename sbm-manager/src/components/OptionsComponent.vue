<template>
  <div class="options-bar mb-3 d-flex align-items-center gap-2">
    <!-- Botón de mostrar/ocultar campos secretos -->
    <button 
      v-if="showToggleButton"
      :class="toggleButtonClass" 
      class="btn btn-sm d-flex align-items-center" 
      @click="toggleSecretFields"
    >
      <i :class="[eyeIcon, toggleIconClass]"></i>
      <span v-if="toggleButtonText">{{ toggleButtonText }}</span>
    </button>

    <!-- Botón de importar -->
    <button 
      v-if="showImportButton"
      :class="importButtonClass" 
      class="btn btn-sm d-flex align-items-center" 
      @click="handleImport"
    >
      <i :class="[importIcon, 'me-2']"></i>
      <span v-if="importButtonText">{{ importButtonText }}</span>
    </button>

    <!-- Botón de exportar -->
    <button 
      v-if="showExportButton"
      :class="exportButtonClass" 
      class="btn btn-sm d-flex align-items-center" 
      @click="handleExport"
    >
      <i :class="[exportIcon, 'me-2']"></i>
      <span v-if="exportButtonText">{{ exportButtonText }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'OptionsComponent',
  props: {
    // Configuración del botón de toggle (mostrar/ocultar)
    showToggleButton: {
      type: Boolean,
      default: true
    },
    toggleButtonClass: {
      type: String,
      default: 'btn-outline-info'
    },
    toggleButtonText: {
      type: String,
      default: ''
    },
    toggleIconClass: {
      type: String,
      default: ''
    },
    iconShow: {
      type: String,
      default: 'fas fa-eye'
    },
    iconHide: {
      type: String,
      default: 'fas fa-eye-slash'
    },
    // Configuración del botón de importar
    showImportButton: {
      type: Boolean,
      default: false
    },
    importButtonClass: {
      type: String,
      default: 'btn-outline-success'
    },
    importButtonText: {
      type: String,
      default: 'Importar'
    },
    importIcon: {
      type: String,
      default: 'fas fa-file-import'
    },
    // Configuración del botón de exportar
    showExportButton: {
      type: Boolean,
      default: false
    },
    exportButtonClass: {
      type: String,
      default: 'btn-outline-primary'
    },
    exportButtonText: {
      type: String,
      default: 'Exportar'
    },
    exportIcon: {
      type: String,
      default: 'fas fa-file-export'
    }
  },
  data() {
    return {
      showSecret: false,
    };
  },
  computed: {
    eyeIcon() {
      return this.showSecret ? this.iconShow : this.iconHide;
    }
  },
  methods: {
    toggleSecretFields() {
      this.showSecret = !this.showSecret;
      this.$emit('toggle-secret-fields', this.showSecret);
    },
    handleImport() {
      // Método vacío, se implementará después
      this.$emit('import');
    },
    handleExport() {
      // Método vacío, se implementará después
      this.$emit('export');
    },
  },
};
</script>
