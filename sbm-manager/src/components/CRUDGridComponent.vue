<template>
  <div class="mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0">Listado de {{ capitalizedResourceName }}</h4>
      <div>
        <button class="btn btn-outline-primary me-2">Botón 1</button>
        <button class="btn btn-outline-secondary">Botón 2</button>
      </div>
    </div>
    <table class="table table-hover align-middle">
      <thead class="table-light">
        <tr>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center text-muted">No hay datos disponibles</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'CRUDGridComponent',
  props: {
    resourceName: { type: String, required: true },
  },
  computed: {
    capitalizedResourceName() {
      if (!this.resourceName) return '';
      return this.resourceName.charAt(0).toUpperCase() + this.resourceName.slice(1);
    },
  },
};
</script> 