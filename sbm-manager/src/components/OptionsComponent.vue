<template>
  <div class="options-bar mb-3 d-flex align-items-center">
    <button class="btn btn-outline-info btn-sm d-flex align-items-center" @click="toggleSecretFields">
      <i :class="showSecret ? 'fas fa-eye-slash' : 'fas fa-eye'" class="me-2"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'OptionsComponent',
  data() {
    return {
      showSecret: false,
    };
  },
  methods: {
    toggleSecretFields() {
      this.showSecret = !this.showSecret;
      this.$emit('toggle-secret-fields', this.showSecret);
    },
  },
};
</script>

<style scoped>
.options-bar {
  display: flex;
  gap: 1rem;
}
</style> 