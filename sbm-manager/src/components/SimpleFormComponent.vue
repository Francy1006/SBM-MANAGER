<template>
  <div v-if="show" class="p-4 bg-white rounded-4 shadow-sm border mb-4">
    <form @submit.prevent="onSave">
      <div v-for="field in fields" :key="field.key" class="mb-4">
        <label class="form-label fw-semibold">
          {{ field.label }} <span v-if="field.required" class="text-danger">*</span>
        </label>
        <input
          v-if="field.type === 'text'"
          type="text"
          class="form-control form-control-lg rounded-3"
          v-model="form[field.key]"
          :required="field.required"
          :maxlength="field.maxlength"
          :disabled="field.disabled"
        />
        <textarea
          v-else-if="field.type === 'textarea'"
          class="form-control form-control-lg rounded-3"
          v-model="form[field.key]"
          :required="field.required"
          :rows="field.rows || 3"
          :disabled="field.disabled"
        ></textarea>
        <select
          v-else-if="field.type === 'select'"
          class="form-select form-select-lg rounded-3"
          v-model="form[field.key]"
          :required="field.required"
          :disabled="field.disabled"
        >
          <option v-for="option in getOptions(field)" :key="option.id" :value="option.id">
            {{ option.state || option.label || option.name }}
          </option>
        </select>
      </div>
      <div class="row mt-4">
        <div class="col-12">
          <div class="row justify-content-end">
            <div class="col-12 col-md-auto mb-2 mb-md-0">
              <button type="button" class="btn btn-outline-secondary rounded-pill px-4 w-100 w-md-auto" @click="close">
                <i class="fa-solid fa-times me-2"></i> Cancelar
              </button>
            </div>
            <div class="col-12 col-md-auto">
              <button type="submit" class="btn btn-primary rounded-pill px-4 w-100 w-md-auto" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i :class="['fa-solid', isEdit ? 'fa-sync-alt' : 'fa-save', 'me-2']"></i>
                {{ isEdit ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'SimpleFormComponent',
  props: {
    show: Boolean,
    isEdit: Boolean,
    fields: Array,
    values: Object,
    states: { type: [Array, Object], default: null },
    loading: Boolean,
  },
  data() {
    return {
      form: {},
    };
  },
  watch: {
    values: {
      handler(newVal) {
        this.form = { ...newVal } || {};
      },
      immediate: true,
      deep: true,
    },
    show(val) {
      if (!val) this.resetForm();
    },
  },
  methods: {
    resetForm() {
      // Limpiar todos los campos del formulario
      this.form = {};
      
      // Limpiar también los valores de los campos específicos
      this.fields.forEach(field => {
        this.form[field.key] = '';
      });
    },
    onSave() {
      this.$emit('save', { ...this.form });
    },
    close() {
      // Limpiar el formulario completamente
      this.resetForm();
      
      // Emitir evento de cierre
      this.$emit('close');
      
      // Mostrar mensaje de confirmación (opcional)
      console.log('Formulario cancelado y limpiado');
    },
    getOptions(field) {
      let options = [];
      if (field.options) {
        options = field.options;
      } else if (field.optionsKey && this[field.optionsKey]) {
        // Handle both regular arrays and Vue 3 refs
        const optionsData = this[field.optionsKey];
        options = Array.isArray(optionsData) ? optionsData : (optionsData?.value || []);
      }
      // Asegura que options sea un array
      if (!Array.isArray(options)) {
        options = [];
      }
      // Filtra elementos null o sin id
      return options.filter(option => option && option.id !== undefined && option.id !== null);
    },
  },
};
</script>

<style scoped>
/* Responsive para móviles */
@media (max-width: 768px) {
  .form-control,
  .form-select {
    font-size: 0.9rem;
  }
  
  .form-label {
    font-size: 0.9rem;
  }
  
  .btn {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .form-control,
  .form-select {
    font-size: 0.85rem;
  }
  
  .form-label {
    font-size: 0.85rem;
  }
  
  .btn {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
}
</style> 