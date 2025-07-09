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
    <CRUDGridComponent
      resourceName="franquicias"
      endpoint="franchises/"
      :states="states"
      iconClass="fas fa-cubes me-2 text-secondary"
    />
  </div>
</template>

<script>
import SimpleFormComponent from '../components/SimpleFormComponent.vue';
import CRUDGridComponent from '../components/CRUDGridComponent.vue';
import api from '../api/axios';
import { ref, onMounted } from 'vue';

export default {
  name: 'FranchiseView',
  components: { SimpleFormComponent, CRUDGridComponent },
  setup() {
    const states = ref([]);
    const fields = ref([
      { key: 'franchise', label: 'Nombre', type: 'text', required: true, maxlength: 50 },
      { key: 'code', label: 'Siglas', type: 'text', required: true, maxlength: 36 },
      { key: 'state', label: 'Estado', type: 'select', required: true, optionsKey: 'states' },
    ]);

    const fetchStates = async () => {
      try {
        const response = await api.get('/franchise-states/');
        // Extraer el array results de la respuesta
        states.value = response.data.results || response.data;
      } catch (error) {
        console.error('Error al cargar estados:', error);
        states.value = [];
      }
    };

    const onSave = (data) => {
      alert('Datos enviados: ' + JSON.stringify(data));
    };

    onMounted(() => {
      fetchStates();
    });

    return {
      states,
      fields,
      onSave,
    };
  },
};
</script> 