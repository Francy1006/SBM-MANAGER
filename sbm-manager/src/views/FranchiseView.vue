<template>
  <div class="container-fluid py-4">
    <h2 class="mb-4" style="font-family: 'DINAlternate', Arial, sans-serif; color: #e53935;">
      Administrador de Franquicias
    </h2>
    <SimpleFormComponent
      :show="true"
      :is-edit="false"
      :fields="fields"
      :values="{}"
      :states="states"
      :loading="false"
      @close="() => {}"
      @save="onSave"
    />
    <CRUDGridComponent resourceName="franquicias" />
  </div>
</template>

<script>
import SimpleFormComponent from '../components/SimpleFormComponent.vue';
import CRUDGridComponent from '../components/CRUDGridComponent.vue';

export default {
  name: 'FranchiseView',
  components: { SimpleFormComponent, CRUDGridComponent },
  data() {
    return {
      states: [
        { id: 1, state: 'Activo' },
        { id: 2, state: 'Inactivo' },
      ],
      fields: [
        { key: 'franchise', label: 'Nombre', type: 'text', required: true, maxlength: 50 },
        { key: 'code', label: 'Siglas', type: 'text', required: true, maxlength: 36 },
        { key: 'state', label: 'Estado', type: 'select', required: true, optionsKey: 'states', disabled: true },
      ],
    };
  },
  methods: {
    onSave(data) {
      alert('Datos enviados: ' + JSON.stringify(data));
    },
  },
};
</script> 