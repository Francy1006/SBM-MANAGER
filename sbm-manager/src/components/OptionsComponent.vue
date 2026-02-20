<template>
  <div class="options-bar mb-3 d-flex align-items-center gap-2 position-relative">
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

    <!-- ✅ IMPORTAR (Dropdown: CSV) -->
    <div v-if="showImportButton" class="position-relative">
      <button
        class="btn btn-sm d-flex align-items-center"
        :class="importButtonClass"
        type="button"
        @click="toggleImportDropdown"
        aria-haspopup="true"
        :aria-expanded="importOpen ? 'true' : 'false'"
      >
        <i :class="[importIcon, 'me-2']"></i>
        <span v-if="importButtonText">{{ importButtonText }}</span>
        <i class="fas fa-chevron-down ms-2" style="font-size:.85em;"></i>
      </button>

      <transition name="dd">
        <div
          v-if="importOpen"
          class="dropdown-menu d-block p-2 shadow-sm"
          :class="dropdownMenuClass(importButtonClass)"
          style="min-width: 180px; position:absolute; top:calc(100% + 6px); left:0; z-index:1050;"
          @click.stop
        >
          <button
            type="button"
            class="dropdown-item rounded-2"
            :class="dropdownItemClass(importButtonClass)"
            @click="selectImport('CSV')"
          >
            <i class="fas fa-file-csv me-2"></i> CSV
          </button>
        </div>
      </transition>
    </div>

    <!-- ✅ EXPORTAR (Dropdown: XLSX, CSV, PDF) -->
    <div v-if="showExportButton" class="position-relative">
      <button
        class="btn btn-sm d-flex align-items-center"
        :class="exportButtonClass"
        type="button"
        @click="toggleExportDropdown"
        aria-haspopup="true"
        :aria-expanded="exportOpen ? 'true' : 'false'"
      >
        <i :class="[exportIcon, 'me-2']"></i>
        <span v-if="exportButtonText">{{ exportButtonText }}</span>
        <i class="fas fa-chevron-down ms-2" style="font-size:.85em;"></i>
      </button>

      <transition name="dd">
        <div
          v-if="exportOpen"
          class="dropdown-menu d-block p-2 shadow-sm"
          :class="dropdownMenuClass(exportButtonClass)"
          style="min-width: 200px; position:absolute; top:calc(100% + 6px); left:0; z-index:1050;"
          @click.stop
        >
          <button
            type="button"
            class="dropdown-item rounded-2"
            :class="dropdownItemClass(exportButtonClass)"
            @click="selectExport('XLSX')"
          >
            <i class="fas fa-file-excel me-2"></i> XLSX
          </button>

          <button
            type="button"
            class="dropdown-item rounded-2 mt-1"
            :class="dropdownItemClass(exportButtonClass)"
            @click="selectExport('CSV')"
          >
            <i class="fas fa-file-csv me-2"></i> CSV
          </button>

          <button
            type="button"
            class="dropdown-item rounded-2 mt-1"
            :class="dropdownItemClass(exportButtonClass)"
            @click="selectExport('PDF')"
          >
            <i class="fas fa-file-pdf me-2"></i> PDF
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OptionsComponent',
  props: {
    // Toggle (mostrar/ocultar)
    showToggleButton: { type: Boolean, default: true },
    toggleButtonClass: { type: String, default: 'btn-outline-info' },
    toggleButtonText: { type: String, default: '' },
    toggleIconClass: { type: String, default: '' },
    iconShow: { type: String, default: 'fas fa-eye' },
    iconHide: { type: String, default: 'fas fa-eye-slash' },
    toggleClassWhenShown: { type: String, default: 'btn-success text-white' },
    toggleClassWhenHidden: { type: String, default: 'btn-warning text-dark' },

    // Importar
    showImportButton: { type: Boolean, default: false },
    importButtonClass: { type: String, default: 'btn-outline-success' },
    importButtonText: { type: String, default: 'Importar' },
    importIcon: { type: String, default: 'fas fa-file-import' },

    // Exportar
    showExportButton: { type: Boolean, default: false },
    exportButtonClass: { type: String, default: 'btn-outline-primary' },
    exportButtonText: { type: String, default: 'Exportar' },
    exportIcon: { type: String, default: 'fas fa-file-export' },
  },

  data() {
    return {
      showSecret: false,
      importOpen: false,
      exportOpen: false,
      _outsideHandler: null,
      _escHandler: null,
    };
  },

  computed: {
    computedEyeIcon() {
      return this.showSecret ? this.iconShow : this.iconHide;
    },
    computedToggleText() {
      if (this.toggleButtonText && this.toggleButtonText.trim().length > 0) return this.toggleButtonText;
      return this.showSecret ? 'Ocultar contenido privado' : 'Mostrar contenido privado';
    },
    computedToggleClass() {
      return this.showSecret ? this.toggleClassWhenShown : this.toggleClassWhenHidden;
    }
  },

  mounted() {
    this._outsideHandler = (e) => {
      if (!this.$el.contains(e.target)) {
        this.importOpen = false;
        this.exportOpen = false;
      }
    };
    document.addEventListener('click', this._outsideHandler);

    this._escHandler = (e) => {
      if (e.key === 'Escape') {
        this.importOpen = false;
        this.exportOpen = false;
      }
    };
    document.addEventListener('keydown', this._escHandler);
  },

  beforeUnmount() {
    document.removeEventListener('click', this._outsideHandler);
    document.removeEventListener('keydown', this._escHandler);
  },

  methods: {
    toggleSecretFields() {
      this.showSecret = !this.showSecret;
      this.$emit('toggle-secret-fields', this.showSecret);
    },

    // ✅ Dropdown toggles
    toggleImportDropdown() {
      this.importOpen = !this.importOpen;
      if (this.importOpen) this.exportOpen = false;
    },
    toggleExportDropdown() {
      this.exportOpen = !this.exportOpen;
      if (this.exportOpen) this.importOpen = false;
    },

    // ✅ Selections (emiten formato elegido)
    selectImport(format) {
      this.importOpen = false;
      this.$emit('import', { format }); // { format: 'CSV' }
    },
    selectExport(format) {
      this.exportOpen = false;
      this.$emit('export', { format }); // { format: 'XLSX'|'CSV'|'PDF' }
    },

    // ✅ Invertir colores según clase del botón padre
    parseVariant(btnClass) {
      const m =
        (btnClass || '').match(/btn-outline-([a-z]+)/i) ||
        (btnClass || '').match(/btn-([a-z]+)/i);
      return m ? m[1].toLowerCase() : 'primary';
    },
    isOutline(btnClass) {
      return /btn-outline-/i.test(btnClass || '');
    },
    dropdownMenuClass(btnClass) {
      const variant = this.parseVariant(btnClass);
      const outline = this.isOutline(btnClass);

      // outline padre => menú sólido
      if (outline) return `bg-${variant} border-0`;
      // sólido padre => menú claro + borde color
      return `bg-white border border-${variant}`;
    },
    dropdownItemClass(btnClass) {
      const variant = this.parseVariant(btnClass);
      const outline = this.isOutline(btnClass);

      // outline padre => items con texto blanco + hover suave
      if (outline) return `text-white dd-item-solid dd-item-solid-${variant}`;
      // sólido padre => items outline-like (texto color)
      return `text-${variant} dd-item-outline dd-item-outline-${variant}`;
    },
  }
};
</script>

<style scoped>
/* ✅ Animación dropdown (slide + fade) */
.dd-enter-active,
.dd-leave-active {
  transition: transform 160ms ease, opacity 160ms ease;
}
.dd-enter-from,
.dd-leave-to {
  transform: translateY(-6px);
  opacity: 0;
}
.dd-enter-to,
.dd-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* Ajuste visual */
.dropdown-item {
  padding: 0.45rem 0.6rem;
  line-height: 1.2;
}

/* Padre outline => dropdown sólido (texto blanco) */
.dd-item-solid {
  background: transparent;
}
.dd-item-solid:hover {
  filter: brightness(0.95);
}

/* Padre sólido => dropdown tipo outline (texto color) */
.dd-item-outline {
  background: transparent;
}
.dd-item-outline:hover {
  background: rgba(0, 0, 0, 0.04);
}

/* Mejoras: evitar azul default */
.dropdown-item:active {
  opacity: 0.85;
}
</style>