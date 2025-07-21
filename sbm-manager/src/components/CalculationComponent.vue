<template>
  <h5><strong>Cálculo</strong></h5>
  <button class="btn btn-danger btn-lg w-100 mt-2 mb-4 ps-3">
    <i class="fas fa-calculator me-2"></i> Calcular
  </button>
  <div class="row mt-4">
    <div class="col-md-3 mb-3" v-for="field in fields" :key="field.key">
      <div :class="['card h-100', field.color === 'primary' ? 'bg-primary border-primary text-white' : '', field.color === 'secondary' ? 'bg-secondary border-secondary text-white' : '']">
        <div class="card-body">
          <label :for="field.key" class="form-label text-white">{{ field.label }}</label>
          <input :id="field.key" type="number" class="form-control" v-model="field.value" />
        </div>
      </div>
    </div>
  </div>
  <h5><strong>Resultado</strong></h5>
  <div class="row mt-4">
    <div class="col-md-2 mb-3" v-for="field in resultFields" :key="field.key">
      <div class="card h-100 bg-danger border-danger text-white">
        <div class="card-body">
          <label :for="field.key" class="form-label text-white">{{ field.label }}</label>
          <input :id="field.key" type="number" class="form-control" v-model="field.value" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
const fields = reactive([
  { key: 'base_neto', label: 'VALOR Base Neto', value: null, color: 'primary' },
  { key: 'iva', label: 'IVA', value: null, color: 'secondary' }
]);
const resultFields = reactive([
  { key: 'neto', label: 'Neto', value: null },
  { key: 'iva', label: 'IVA', value: null },
  { key: 'impuesto_adicional', label: 'Impuesto Adicional', value: null },
  { key: 'retencion', label: 'Retención', value: null },
  { key: 'bruto', label: 'Bruto', value: null },
]);
</script> 