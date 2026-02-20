<template>
  <div class="options-bar mb-3 d-flex align-items-center gap-2">
    <!-- Botón de mostrar/ocultar campos secretos -->
    <button
      v-if="showToggleButton"
      class="btn btn-sm d-flex align-items-center"
      :class="computedToggleClass"
      @click="toggleSecretFields"
      type="button"
    >
      <i :class="[computedEyeIcon, toggleIconClass, (computedToggleText ? 'me-2' : '')]"></i>
      <span v-if="computedToggleText">{{ computedToggleText }}</span>
    </button>

    <!-- Botón de importar -->
    <button
      v-if="showImportButton"
      :class="importButtonClass"
      class="btn btn-sm d-flex align-items-center"
      @click="handleImport"
      type="button"
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
      type="button"
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

    // 👇 (sigue existiendo para compatibilidad, pero ahora usamos computedToggleClass)
    toggleButtonClass: {
      type: String,
      default: 'btn-outline-info'
    },

    // Texto opcional: si lo envías vacío, autogeneramos Mostrar/Ocultar
    toggleButtonText: {
      type: String,
      default: ''
    },

    toggleIconClass: {
      type: String,
      default: ''
    },

    // Íconos configurables
    iconShow: {
      type: String,
      default: 'fas fa-eye'        // cuando ESTÁ mostrando
    },
    iconHide: {
      type: String,
      default: 'fas fa-eye-slash'  // cuando ESTÁ ocultando
    },

    // ✅ NUEVO (opcional): clases por estado (si no las pasas, usa defaults)
    toggleClassWhenShown: {
      type: String,
      default: 'btn-success text-white' // mostrando secretos
    },
    toggleClassWhenHidden: {
      type: String,
      default: 'btn-warning text-dark'  // ocultando secretos
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
      // showSecret = true => mostrando campos secretos
      showSecret: false,
    };
  },

  computed: {
    // ✅ Ícono correcto: si muestra => iconShow, si oculta => iconHide
    computedEyeIcon() {
      return this.showSecret ? this.iconShow : this.iconHide;
    },

    // ✅ Texto correcto
    computedToggleText() {
      // Si el usuario define un texto fijo, respétalo
      if (this.toggleButtonText && this.toggleButtonText.trim().length > 0) {
        return this.toggleButtonText;
      }
      // Si no, autogenera según estado
      return this.showSecret ? 'Ocultar contenido privado' : 'Mostrar contenido privado';
    },

    // ✅ Clase/color por estado
    computedToggleClass() {
      // Si quieres seguir controlando desde fuera con toggleButtonClass (legacy),
      // puedes combinarlo, pero aquí priorizamos los estados.
      const stateClass = this.showSecret ? this.toggleClassWhenShown : this.toggleClassWhenHidden;
      return `${stateClass}`;
    }
  },

  methods: {
    toggleSecretFields() {
      this.showSecret = !this.showSecret;
      this.$emit('toggle-secret-fields', this.showSecret);
    },
    handleImport() {
      this.$emit('import');
    },
    handleExport() {
      this.$emit('export');
    },
  },
};
</script>