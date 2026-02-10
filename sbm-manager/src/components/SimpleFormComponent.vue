<template>
  <div v-if="show" class="p-4 bg-white rounded-4 shadow-sm border mb-4">
    <form @submit.prevent="onSave">
      <div
        v-for="field in fields.filter(f => !f.omitInForm)"
        :key="field.key"
        class="mb-4"
      >
        <label
          class="form-label fw-semibold"
          :class="{ 'checkbox-label': field.type === 'checkbox' }"
        >
          {{ field.label }}
          <span v-if="field.required" class="text-danger">*</span>
        </label>

        <!-- Text / Email / URL -->
        <input
          v-if="['text','email','url'].includes(field.type)"
          :type="field.type"
          class="form-control form-control-lg rounded-3"
          :value="form[field.key]"
          @input="handleInputUppercase(field, $event)"
          :required="field.required"
          :maxlength="field.maxlength"
          :disabled="field.disabled"
        />

        <!-- Number with suffix -->
        <div v-else-if="field.type === 'number' && field.suffix" class="input-group input-group-lg">
          <input
            type="number"
            class="form-control rounded-3"
            v-model.number="form[field.key]"
            :required="field.required"
            :min="field.min"
            :max="field.max"
            :step="field.step || 'any'"
            :disabled="field.disabled"
          />
          <span class="input-group-text">{{ field.suffix }}</span>
        </div>

        <!-- Number -->
        <input
          v-else-if="field.type === 'number'"
          type="number"
          class="form-control form-control-lg rounded-3"
          v-model.number="form[field.key]"
          :required="field.required"
          :min="field.min"
          :max="field.max"
          :step="field.step || 'any'"
          :disabled="field.disabled"
        />

        <!-- Textarea -->
        <textarea
          v-else-if="field.type === 'textarea'"
          class="form-control form-control-lg rounded-3"
          :value="form[field.key]"
          @input="handleInputUppercase(field, $event)"
          :required="field.required"
          :rows="field.rows || 3"
          :disabled="field.disabled"
        />

        <!-- Select -->
        <select
          v-else-if="field.type === 'select'"
          class="form-select form-select-lg rounded-3"
          v-model="form[field.key]"
          :required="field.required"
          :disabled="field.disabled"
        >
          <option
            v-for="option in getOptions(field)"
            :key="option.id"
            :value="option.id"
          >
            {{ option.state || option.label || option.name }}
          </option>
        </select>

        <!-- Dynamic Select -->
        <select
          v-else-if="field.type === 'dynamic-select' && !field.disabled"
          class="form-select form-select-lg rounded-3"
          v-model="form[field.key]"
          :required="field.required"
          :disabled="field.loading"
        >
          <option
            v-for="option in field.options"
            :key="option[field.valueKey || 'id']"
            :value="option[field.valueKey || 'id']"
          >
            {{ option[field.labelKey || 'name'] }}
          </option>
        </select>

        <div
          v-else-if="field.type === 'dynamic-select' && field.disabled"
          class="form-control form-control-lg rounded-3 bg-light"
        >
          <span class="text-muted">
            {{ form[field.key] || 'No seleccionado' }}
          </span>
        </div>

        <!-- Checkbox -->
        <input
          v-else-if="field.type === 'checkbox'"
          type="checkbox"
          class="form-check-input ms-2"
          v-model="form[field.key]"
          :disabled="field.disabled"
          style="transform: scale(1.3); margin-top: 0.4em;"
        />

        <!-- Rating -->
        <div v-else-if="field.type === 'rating'" class="rating-input">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ filled: (form[`__hover_${field.key}`] || form[field.key]) >= star }"
            @click="form[field.key] = star"
            @mouseover="form[`__hover_${field.key}`] = star"
            @mouseleave="form[`__hover_${field.key}`] = null"
            style="cursor:pointer; font-size:2rem;"
          >
            <i class="fa-star fa-solid"></i>
          </span>
          <span v-if="form[field.key] > 0" class="ms-2 text-secondary">
            {{ form[field.key] }} / 5
          </span>
          <span v-else class="ms-2 text-secondary">Sin calificación</span>
        </div>

        <!-- Price -->
        <input
          v-else-if="field.type === 'price'"
          type="text"
          class="form-control form-control-lg rounded-3"
          v-model="form[field.key]"
          @input="onPriceInput(field)"
          :required="field.required"
          :maxlength="field.maxlength"
          :disabled="field.disabled"
          placeholder="$0"
        />
      </div>

      <!-- Actions -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="row justify-content-end">
            <div class="col-12 col-md-auto mb-2 mb-md-0">
              <button
                type="button"
                class="btn btn-outline-secondary rounded-pill px-4 w-100 w-md-auto"
                @click="close"
              >
                <i class="fa-solid fa-times me-2"></i> Cancelar
              </button>
            </div>
            <div class="col-12 col-md-auto">
              <button
                type="submit"
                class="btn btn-primary rounded-pill px-4 w-100 w-md-auto"
                :disabled="loading"
              >
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
import axios from '../api/axios';

export default {
  name: 'SimpleFormComponent',
  props: {
    show: { type: Boolean, default: false },
    isEdit: Boolean,
    fields: Array,
    values: Object,
    states: { type: [Array, Object], default: null },
    loading: Boolean,
    uppercase: { type: Boolean, default: false }, // NUEVO PROP
  },
  data() {
    return {
      form: {},
    };
  },
  watch: {
    values: {
      handler(newVal) {
        // Inicializa el form vacío
        this.form = {};
        // Primero, descompón los campos agrupados
        this.fields.forEach(field => {
          if (field.formGroup) {
            this.form[field.key] = (newVal && newVal[field.formGroup]) ? newVal[field.formGroup][field.key] ?? '' : '';
          } else {
            this.form[field.key] = newVal && newVal[field.key] !== undefined ? newVal[field.key] : '';
          }
          if (field.type === 'checkbox' && this.form[field.key] === undefined) {
            this.form[field.key] = false;
          }
          // Formatear visualmente los campos de tipo price
          if (field.type === 'price' && this.form[field.key] !== '') {
            this.form[field.key] = '$' + Number(this.form[field.key]).toLocaleString('es-CL');
          }
          // Asegurar que los dynamic-select tengan valor string o null
          if (field.type === 'dynamic-select') {
            if (this.form[field.key] === '' || this.form[field.key] === undefined) {
              this.form[field.key] = null;
            } else if (this.form[field.key] !== null) {
              this.form[field.key] = String(this.form[field.key]);
            }
          }
        });
      },
      immediate: true,
      deep: true,
    },
    show(val) {
      if (val) {
        this.loadDynamicSelects(this.fields);
      } else {
        this.resetForm();
      }
    },
    // Eliminar watcher profundo sobre fields
    // fields: {
    //   handler(newFields) {
    //     this.loadDynamicSelects(newFields);
    //   },
    //   immediate: true,
    //   deep: true,
    // },
    'fields.*.disabled': {
      handler() {
        this.loadDynamicSelects(this.fields);
      },
      deep: true,
    },
  },
  methods: {
    async loadDynamicSelects(fields) {
      for (const field of fields) {
        if (field.type === 'dynamic-select' && field.endpoint && !field.disabled) {
          field.loading = true;
          try {
            const response = await axios.get(field.endpoint);
            field.options = response.data.results || response.data;
            // Forzar la actualización del valor si ya existe en el form
            if (this.form[field.key]) {
              this.form[field.key] = String(this.form[field.key]);
            }
          } catch (error) {
            console.error(`Error loading options for ${field.key}:`, error);
            field.options = [];
          } finally {
            field.loading = false;
          }
        }
      }
    },
    resetForm() {
      // Limpiar todos los campos del formulario
      this.form = {};
      this.fields.forEach(field => {
        if (field.formGroup) {
          this.form[field.key] = '';
        } else if (field.type === 'checkbox') {
          this.form[field.key] = false;
        } else {
          this.form[field.key] = '';
        }
      });
    },
    onSave() {
      // Agrupar campos por formGroup
      const payload = {};
      this.fields.forEach(field => {
        let value = this.form[field.key];
        // Si es price, limpiar el formato y guardar como int plain text
        if (field.type === 'price') {
          value = value ? parseInt(value.toString().replace(/\D/g, ''), 10) : null;
        }
        if (field.formGroup) {
          if (!payload[field.formGroup]) payload[field.formGroup] = {};
          payload[field.formGroup][field.key] = value;
        } else {
          payload[field.key] = value;
        }
      });
      this.$emit('save', payload);
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
    handleInputUppercase(field, $event) {
      // Si el prop global uppercase está activo o el campo tiene uppercase: true
      const shouldUppercase = this.uppercase || field.uppercase;
      if (shouldUppercase && ['text', 'email', 'url', 'textarea'].includes(field.type)) {
        this.form[field.key] = $event.target.value.toUpperCase();
      } else {
        this.form[field.key] = $event.target.value;
      }
    },
    onPriceInput(field) {
      // Obtener solo los dígitos
      let raw = this.form[field.key] ? this.form[field.key].toString().replace(/\D/g, '') : '';
      if (raw) {
        // Formatear con separador de miles y anteponer $
        const formatted = '$' + Number(raw).toLocaleString('es-CL');
        this.form[field.key] = formatted;
      } else {
        this.form[field.key] = '';
      }
    },
  },
};
</script>