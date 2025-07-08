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
          <option value="">Seleccionar {{ field.label.toLowerCase() }}</option>
          <option v-for="option in getOptions(field)" :key="option.id" :value="option.id">
            {{ option.state || option.label || option.name }}
          </option>
        </select>
      </div>
      <div class="d-flex gap-2 justify-content-end mt-4">
        <button type="button" class="btn btn-outline-secondary rounded-pill px-4" @click="close">
          <i class="fa-solid fa-times me-2"></i> Cancelar
        </button>
        <button type="submit" class="btn btn-primary rounded-pill px-4" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <i :class="['fa-solid', isEdit ? 'fa-sync-alt' : 'fa-save', 'me-2']"></i>
          {{ isEdit ? 'Actualizar' : 'Crear' }}
        </button>
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
    states: Array,
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
      this.form = {};
    },
    onSave() {
      this.$emit('save', { ...this.form });
    },
    close() {
      this.$emit('close');
      this.resetForm();
    },
    getOptions(field) {
      if (field.options) return field.options;
      if (field.optionsKey && this[field.optionsKey]) return this[field.optionsKey];
      return [];
    },
  },
};
</script> 