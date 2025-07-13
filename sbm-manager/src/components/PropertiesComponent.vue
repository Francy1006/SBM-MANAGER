<template>
  <div class="properties-container">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="properties-title mb-0">{{ title }}</h3>
      <button @click="$emit('close')" class="btn btn-outline-secondary btn-sm rounded-pill px-3">
        <i class="fas fa-arrow-left me-1"></i> Volver
      </button>
    </div>
    <div class="properties-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
});

defineEmits(['close']);
</script>

<style scoped>
.properties-container {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

.properties-title {
  color: #495057;
  font-family: 'DINAlternate', sans-serif;
  font-weight: bold;
  margin-bottom: 20px;
  border-bottom: 2px solid #e53935;
  padding-bottom: 10px;
}

.properties-content {
  color: #6c757d;
  line-height: 1.6;
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .properties-container {
    padding: 15px;
  }
  
  .properties-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .properties-container {
    padding: 10px;
  }
  
  .properties-title {
    font-size: 1.1rem;
  }
}
</style> 