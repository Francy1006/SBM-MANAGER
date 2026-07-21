<template>
  <section v-if="show" class="simple-form-card card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
    <header class="form-hero px-4 px-lg-5 py-4">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-3">
          <div class="form-hero-icon" :class="isEdit ? 'is-edit' : 'is-create'">
            <i :class="['fa-solid', isEdit ? 'fa-pen-to-square' : 'fa-plus']"></i>
          </div>
          <div>
            <div class="form-eyebrow mb-1">{{ isEdit ? 'Edición de registro' : 'Nuevo registro' }}</div>
            <h4 class="fw-bold mb-1 text-dark">{{ formTitle }}</h4>
            <p class="text-secondary mb-0 small">{{ formDescription }}</p>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2 flex-wrap">
          <span class="form-meta-badge">
            <i class="fa-solid fa-list-check me-2"></i>
            {{ visibleFields.length }} campos
          </span>
          <span v-if="requiredFieldsCount" class="form-meta-badge required-badge">
            {{ requiredFieldsCount }} obligatorios
          </span>
        </div>
      </div>
    </header>

    <form @submit.prevent="onSave">
      <div class="card-body px-4 px-lg-5 py-4 py-lg-5">
        <div v-if="contextValues.length" class="context-banner d-flex align-items-start gap-3 mb-4">
          <span class="context-icon">
            <i class="fa-solid fa-circle-info"></i>
          </span>
          <div>
            <div class="small text-uppercase fw-bold text-secondary mb-1">Registro seleccionado</div>
            <div class="fw-semibold text-dark">{{ contextValues.join(' · ') }}</div>
          </div>
        </div>

        <div class="section-heading d-flex align-items-center gap-3 mb-4">
          <span class="section-icon"><i class="fa-solid fa-sliders"></i></span>
          <div>
            <h6 class="fw-bold mb-0 text-dark">Información del registro</h6>
            <small class="text-secondary">Completa los datos requeridos para continuar.</small>
          </div>
        </div>

        <div class="row g-4">
          <div v-for="field in visibleFields" :key="field.key" :class="fieldColumnClass(field)">
            <div v-if="field.type === 'checkbox'" class="toggle-field h-100">
              <div class="d-flex align-items-center justify-content-between gap-3">
                <div class="d-flex align-items-center gap-3">
                  <span class="field-type-icon"><i :class="fieldIcon(field)"></i></span>
                  <div>
                    <label :for="fieldId(field)" class="form-label fw-semibold mb-1">
                      {{ field.label }}
                      <span v-if="isFieldRequired(field)" class="required-mark">*</span>
                    </label>
                    <div class="small text-secondary">
                      {{ form[field.key] ? 'Habilitado' : 'Deshabilitado' }}
                    </div>
                  </div>
                </div>
                <div class="form-check form-switch m-0">
                  <input :id="fieldId(field)" v-model="form[field.key]" type="checkbox"
                    class="form-check-input toggle-control" :disabled="isFieldDisabled(field)" />
                </div>
              </div>
            </div>

            <div v-else class="field-panel h-100">
              <label :for="fieldId(field)" class="form-label fw-semibold text-dark mb-2">
                {{ field.label }}
                <span v-if="isFieldRequired(field)" class="required-mark">*</span>
              </label>

              <div v-if="['text', 'email', 'url'].includes(field.type)" class="input-group form-control-group">
                <span class="input-group-text"><i :class="fieldIcon(field)"></i></span>
                <input :id="fieldId(field)" :type="field.type" class="form-control form-control-lg"
                  :value="form[field.key]" @input="handleInputUppercase(field, $event)"
                  :required="isFieldRequired(field)" :maxlength="field.maxlength" :disabled="isFieldDisabled(field)"
                  :placeholder="field.placeholder || `Ingresa ${String(field.label || '').toLowerCase()}`" />
              </div>

              <div v-else-if="field.type === 'number'" class="input-group form-control-group">
                <span class="input-group-text"><i :class="fieldIcon(field)"></i></span>
                <input :id="fieldId(field)" v-model.number="form[field.key]" type="number"
                  class="form-control form-control-lg" :required="isFieldRequired(field)" :min="field.min"
                  :max="field.max" :step="field.step || 'any'" :disabled="isFieldDisabled(field)"
                  :placeholder="field.placeholder || '0'" />
                <span v-if="field.suffix" class="input-group-text field-suffix">{{ field.suffix }}</span>
              </div>

              <div v-else-if="field.type === 'textarea'" class="textarea-control position-relative">
                <span class="textarea-icon"><i :class="fieldIcon(field)"></i></span>
                <textarea :id="fieldId(field)" class="form-control form-control-lg" :value="form[field.key]"
                  @input="handleInputUppercase(field, $event)" :required="isFieldRequired(field)" :rows="field.rows || 4"
                  :disabled="isFieldDisabled(field)"
                  :placeholder="field.placeholder || `Escribe ${String(field.label || '').toLowerCase()}`"></textarea>
              </div>

              <div v-else-if="field.type === 'select'" class="input-group form-control-group">
                <span class="input-group-text"><i :class="fieldIcon(field)"></i></span>
                <select :id="fieldId(field)" v-model="form[field.key]" class="form-select form-select-lg"
                  :required="isFieldRequired(field)" :disabled="isFieldDisabled(field)">
                  <option :value="null" disabled>Selecciona una opción...</option>
                  <option v-for="option in getOptions(field)" :key="option.id" :value="option.id">
                    {{ option.state || option.label || option.name }}
                  </option>
                </select>
              </div>

              <div v-else-if="field.type === 'dynamic-select'" class="input-group form-control-group">
                <span class="input-group-text">
                  <span v-if="isDynamicLoading(field)" class="spinner-border spinner-border-sm"></span>
                  <i v-else :class="fieldIcon(field)"></i>
                </span>
                <select :id="fieldId(field)" v-model="form[field.key]" class="form-select form-select-lg"
                  :required="isFieldRequired(field)" :disabled="isFieldDisabled(field) || isDynamicLoading(field)">
                  <option :value="null" disabled>{{ isDynamicLoading(field) ? 'Cargando opciones...' : 'Selecciona una opción...' }}</option>
                  <option v-for="option in getDynamicOptions(field)"
                    :key="option[field.valueKey || 'id'] ?? option.code ?? option.id"
                    :value="String(option[field.valueKey || 'id'])">
                    {{ getDynamicOptionLabel(field, option) }}
                  </option>
                </select>
              </div>

              <div v-else-if="field.type === 'rating'" class="rating-field d-flex align-items-center flex-wrap gap-2">
                <button v-for="star in 5" :key="star" type="button" class="rating-star"
                  :class="{ filled: (form[`__hover_${field.key}`] || form[field.key]) >= star }"
                  :disabled="isFieldDisabled(field)" @click="form[field.key] = star"
                  @mouseover="form[`__hover_${field.key}`] = star"
                  @mouseleave="form[`__hover_${field.key}`] = null">
                  <i class="fa-star fa-solid"></i>
                </button>
                <span class="rating-value ms-2">
                  {{ form[field.key] > 0 ? `${form[field.key]} / 5` : 'Sin calificación' }}
                </span>
              </div>

              <div v-else-if="field.type === 'price'" class="input-group form-control-group">
                <span class="input-group-text"><i :class="fieldIcon(field)"></i></span>
                <input :id="fieldId(field)" v-model="form[field.key]" type="text"
                  class="form-control form-control-lg" @input="onPriceInput(field)" :required="isFieldRequired(field)"
                  :maxlength="field.maxlength" :disabled="isFieldDisabled(field)" placeholder="$0" />
              </div>

              <small v-if="field.helpText || field.description" class="field-help d-block mt-2">
                <i class="fa-regular fa-circle-question me-1"></i>
                {{ field.helpText || field.description }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <footer class="form-actions px-4 px-lg-5 py-4">
        <div class="d-flex flex-column-reverse flex-md-row align-items-md-center justify-content-between gap-3">
          <small class="text-secondary">
            <span class="required-mark me-1">*</span> Campos obligatorios
          </small>
          <div class="d-flex flex-column flex-sm-row gap-2">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4 action-button" @click="close">
              <i class="fa-solid fa-arrow-left me-2"></i>Cancelar
            </button>
            <button type="submit" class="btn btn-primary rounded-pill px-4 action-button primary-action"
              :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else :class="['fa-solid', isEdit ? 'fa-check' : 'fa-plus', 'me-2']"></i>
              {{ loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear registro') }}
            </button>
          </div>
        </div>
      </footer>
    </form>
  </section>
</template>

<script>
import axios from '../api/axios';

export default {
  name: 'SimpleFormComponent',
  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    configureHeaderFields: { type: Array, default: () => [] },
    isEdit: Boolean,
    fields: Array,
    values: Object,
    states: { type: [Array, Object], default: null },
    loading: Boolean,
    uppercase: { type: Boolean, default: false },
    apiClient: { type: [Object, Function], default: () => axios },
  },
  data() {
    return {
      form: {},
      dynamicOptions: {},
      dynamicLoading: {},
    };
  },
  computed: {
    visibleFields() {
      // Regla: omitInForm manda (y soporte opcional para hideInForm)
      return (this.fields || []).filter(f => !f.omitInForm && !f.hideInForm);
    },
    formTitle() {
      if (this.title) return this.title;
      return this.isEdit ? 'Actualizar información' : 'Crear nuevo registro';
    },
    formDescription() {
      if (this.description) return this.description;
      return this.isEdit
        ? 'Revisa la información y guarda los cambios realizados.'
        : 'Ingresa la información necesaria para crear el registro.';
    },
    contextValues() {
      return (this.configureHeaderFields || [])
        .map(field => this.values?.[field])
        .filter(value => value !== null && value !== undefined && value !== '');
    },
    requiredFieldsCount() {
      return this.visibleFields.filter(field => this.isFieldRequired(field)).length;
    },
  },
  mounted() {
    this.loadDynamicSelects(this.fields);
  },
  watch: {
    values: {
      handler(newVal) {
        this.form = {};

        (this.fields || []).forEach(field => {
          if (field.formGroup) {
            this.form[field.key] = (newVal && newVal[field.formGroup])
              ? (newVal[field.formGroup][field.key] ?? '')
              : '';
          } else {
            this.form[field.key] = (newVal && newVal[field.key] !== undefined)
              ? newVal[field.key]
              : '';
          }

          if (field.type === 'checkbox' && this.form[field.key] === undefined) {
            this.form[field.key] = false;
          }

          if (field.type === 'price' && this.form[field.key] !== '') {
            this.form[field.key] = '$' + Number(this.form[field.key]).toLocaleString('es-CL');
          }

          if (field.type === 'dynamic-select') {
            const raw = this.form[field.key];
            if (raw === '' || raw === undefined || raw === null) this.form[field.key] = null;
            else this.form[field.key] = String(raw);
          }
        });
      },
      immediate: true,
      deep: true,
    },
    show(val) {
      if (val) this.loadDynamicSelects(this.fields);
      else this.resetForm();
    },
    'fields.*.disabled': {
      handler() {
        this.loadDynamicSelects(this.fields);
      },
      deep: true,
    },
  },
  methods: {
    fieldId(field) {
      return `simple-form-${field.key}`;
    },
    fieldColumnClass(field) {
      if (['textarea', 'rating'].includes(field.type) || field.fullWidth) return 'col-12';
      return 'col-12 col-xl-6';
    },
    isFieldDisabled(field) {
      return Boolean(field.disabled || (this.isEdit && field.readOnlyOnConfigure));
    },
    isFieldRequired(field) {
      return Boolean(field.required && !(this.isEdit && field.requiredOnCreate));
    },
    fieldIcon(field) {
      if (field.iconClass) return field.iconClass;

      const icons = {
        email: 'fa-regular fa-envelope',
        url: 'fa-solid fa-link',
        number: 'fa-solid fa-hashtag',
        textarea: 'fa-solid fa-align-left',
        select: 'fa-solid fa-list-ul',
        'dynamic-select': 'fa-solid fa-database',
        rating: 'fa-regular fa-star',
        price: 'fa-solid fa-dollar-sign',
        checkbox: 'fa-solid fa-toggle-on',
      };
      return icons[field.type] || 'fa-regular fa-pen-to-square';
    },
    async loadDynamicSelects(fields) {
      for (const field of (fields || [])) {
        if (field.type === 'dynamic-select' && field.endpoint && !field.disabled) {
          const url = String(field.endpoint).replace(/^\/+/, '');

          this.dynamicLoading = { ...this.dynamicLoading, [field.key]: true };
          try {
            const response = await this.apiClient.get(url);
            const options = Array.isArray(response.data)
              ? response.data
              : (response.data?.results || response.data?.data || []);
            this.dynamicOptions = { ...this.dynamicOptions, [field.key]: options };
            const v = this.form[field.key];
            if (v !== null && v !== undefined && v !== '') this.form[field.key] = String(v);
          } catch (error) {
            console.error('[SimpleForm] Error loading options for', field.key, error);
            this.dynamicOptions = { ...this.dynamicOptions, [field.key]: [] };
          } finally {
            this.dynamicLoading = { ...this.dynamicLoading, [field.key]: false };
          }
        }
      }
    },
    getDynamicOptions(field) {
      return this.dynamicOptions[field.key] || field.options || [];
    },
    isDynamicLoading(field) {
      return Boolean(this.dynamicLoading[field.key]);
    },
    getDynamicOptionLabel(field, option) {
      const configuredLabel = option?.[field.labelKey || 'name'];
      return configuredLabel ?? option?.name ?? option?.description ?? option?.code ?? option?.id ?? '-';
    },
    resetForm() {
      this.form = {};
      (this.fields || []).forEach(field => {
        if (field.formGroup) this.form[field.key] = '';
        else if (field.type === 'checkbox') this.form[field.key] = false;
        else if (field.type === 'dynamic-select') this.form[field.key] = null;
        else this.form[field.key] = '';
      });
    },
    onSave() {
      const payload = {};

      this.visibleFields
        .filter(field => !this.isFieldDisabled(field))
        .forEach(field => {
          let value = this.form[field.key];

          if (field.type === 'price') {
            value = value ? parseInt(value.toString().replace(/\D/g, ''), 10) : null;
          }

          if (field.type === 'dynamic-select') {
            if (value === '' || value === undefined || value === null) value = null;
            else value = String(value);
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
      this.resetForm();
      this.$emit('close');
    },
    getOptions(field) {
      let options = [];
      if (field.options) options = field.options;
      else if (field.optionsKey && this[field.optionsKey]) {
        const optionsData = this[field.optionsKey];
        options = Array.isArray(optionsData) ? optionsData : (optionsData?.value || []);
      }
      if (!Array.isArray(options)) options = [];
      return options.filter(option => option && option.id !== undefined && option.id !== null);
    },
    handleInputUppercase(field, $event) {
      const shouldUppercase = this.uppercase || field.uppercase;
      if (shouldUppercase && ['text', 'email', 'url', 'textarea'].includes(field.type)) {
        this.form[field.key] = $event.target.value.toUpperCase();
      } else {
        this.form[field.key] = $event.target.value;
      }
    },
    onPriceInput(field) {
      let raw = this.form[field.key] ? this.form[field.key].toString().replace(/\D/g, '') : '';
      if (raw) this.form[field.key] = '$' + Number(raw).toLocaleString('es-CL');
      else this.form[field.key] = '';
    },
  },
};
</script>

<style scoped>
.simple-form-card {
  background: #ffffff;
  box-shadow: 0 1rem 3rem rgba(15, 23, 42, 0.08) !important;
}

.form-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 92% 15%, rgba(13, 110, 253, 0.13), transparent 28%),
    linear-gradient(135deg, #f8fbff 0%, #ffffff 58%, #f2f7ff 100%);
  border-bottom: 1px solid #e6edf7;
}

.form-hero::after {
  position: absolute;
  right: -48px;
  bottom: -72px;
  width: 180px;
  height: 180px;
  content: '';
  border: 28px solid rgba(13, 110, 253, 0.04);
  border-radius: 50%;
  pointer-events: none;
}

.form-hero-icon {
  display: grid;
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  place-items: center;
  color: #ffffff;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(13, 110, 253, 0.2);
}

.form-hero-icon.is-create {
  background: linear-gradient(135deg, #0d6efd, #4f8df7);
}

.form-hero-icon.is-edit {
  background: linear-gradient(135deg, #6f42c1, #8b5cf6);
  box-shadow: 0 10px 24px rgba(111, 66, 193, 0.2);
}

.form-eyebrow {
  color: #0d6efd;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.form-meta-badge {
  position: relative;
  z-index: 1;
  padding: 0.55rem 0.85rem;
  color: #495057;
  font-size: 0.78rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #dfe7f2;
  border-radius: 999px;
}

.required-badge {
  color: #8a5a00;
  background: #fff8e6;
  border-color: #ffe3a3;
}

.context-banner {
  padding: 1rem 1.15rem;
  background: #f8faff;
  border: 1px solid #dfe9fb;
  border-left: 4px solid #0d6efd;
  border-radius: 14px;
}

.context-icon,
.section-icon,
.field-type-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  color: #0d6efd;
  background: #eaf2ff;
  border-radius: 12px;
}

.context-icon {
  width: 38px;
  height: 38px;
}

.section-heading {
  padding-bottom: 1rem;
  border-bottom: 1px solid #edf0f4;
}

.section-icon {
  width: 42px;
  height: 42px;
}

.field-panel,
.toggle-field {
  padding: 1.1rem;
  background: #ffffff;
  border: 1px solid #e7ebf0;
  border-radius: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.field-panel:focus-within,
.toggle-field:focus-within {
  border-color: rgba(13, 110, 253, 0.45);
  box-shadow: 0 8px 24px rgba(13, 110, 253, 0.08);
  transform: translateY(-1px);
}

.toggle-field {
  display: flex;
  min-height: 96px;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #fbfcfe, #f6f9fd);
}

.field-type-icon {
  width: 40px;
  height: 40px;
  color: #53657d;
  background: #edf1f6;
}

.required-mark {
  color: #dc3545;
  font-weight: 800;
}

.form-control-group .input-group-text {
  min-width: 48px;
  justify-content: center;
  color: #65758b;
  background: #f7f9fc;
  border-color: #dfe4ea;
  border-radius: 12px 0 0 12px;
}

.form-control-group .form-control,
.form-control-group .form-select {
  min-height: 50px;
  font-size: 0.98rem;
  border-color: #dfe4ea;
  border-radius: 0 12px 12px 0;
}

.form-control-group .field-suffix {
  min-width: auto;
  font-weight: 700;
  border-left: 0;
  border-radius: 0 12px 12px 0;
}

.form-control-group:has(.field-suffix) .form-control {
  border-radius: 0;
}

.form-control:focus,
.form-select:focus {
  border-color: rgba(13, 110, 253, 0.55);
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1);
}

.form-control:disabled,
.form-select:disabled {
  color: #7b8794;
  background-color: #f3f5f7;
}

.textarea-control .form-control {
  min-height: 125px;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 0.98rem;
  border-color: #dfe4ea;
  border-radius: 12px;
  resize: vertical;
}

.textarea-icon {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
  color: #65758b;
}

.toggle-control {
  width: 3rem;
  height: 1.55rem;
  cursor: pointer;
}

.rating-field {
  min-height: 52px;
  padding: 0.65rem 0.85rem;
  background: #f8fafc;
  border-radius: 12px;
}

.rating-star {
  padding: 0.1rem;
  color: #cbd3dd;
  font-size: 1.65rem;
  line-height: 1;
  background: transparent;
  border: 0;
  transition: color 0.15s ease, transform 0.15s ease;
}

.rating-star:not(:disabled):hover,
.rating-star.filled {
  color: #ffc107;
  transform: translateY(-2px);
}

.rating-value,
.field-help {
  color: #728096;
  font-size: 0.82rem;
}

.form-actions {
  background: #f8fafc;
  border-top: 1px solid #e8edf3;
}

.action-button {
  min-width: 150px;
  min-height: 44px;
  font-weight: 700;
}

.primary-action {
  box-shadow: 0 8px 18px rgba(13, 110, 253, 0.2);
}

@media (max-width: 575.98px) {
  .action-button {
    width: 100%;
  }

  .form-hero-icon {
    width: 48px;
    height: 48px;
    flex-basis: 48px;
    border-radius: 15px;
  }
}
</style>
