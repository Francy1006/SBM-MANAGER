<template>
  <section class="confirm-card card border-danger shadow-sm rounded-4 mb-4">
    <div class="card-body p-4 p-lg-5 text-center">
      <div class="confirm-icon mx-auto mb-3">
        <i class="fas fa-triangle-exclamation"></i>
      </div>

      <h4 class="fw-bold text-danger mb-3">{{ title }}</h4>
      <p class="text-secondary mb-4">{{ message }}</p>

      <div class="d-flex justify-content-center gap-3 flex-wrap">
        <button type="button" class="btn btn-outline-secondary rounded-pill px-4"
          :disabled="loading" @click="emit('cancel')">
          <i class="fas fa-xmark me-2"></i>{{ cancelText }}
        </button>

        <button type="button" class="btn btn-danger rounded-pill px-4"
          :disabled="loading" @click="emit('confirm')">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="fas fa-check me-2"></i>
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  message: { type: String, required: true },
  title: { type: String, default: 'Confirmar acción' },
  confirmText: { type: String, default: 'Confirmar' },
  cancelText: { type: String, default: 'Cancelar' },
  loadingText: { type: String, default: 'Procesando...' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.confirm-card {
  background: #fff;
}

.confirm-icon {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  color: var(--bs-danger);
  background: rgba(220, 53, 69, 0.12);
  border-radius: 50%;
  font-size: 1.75rem;
}
</style>
