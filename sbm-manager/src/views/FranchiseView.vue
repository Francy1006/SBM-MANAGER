<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4" style="font-family: 'DINAlternate', sans-serif; color: #e53935;">
      Administrador de Franquicias
    </h1>
    <SimpleFormComponent
      :show="true"
      :is-edit="isEdit"
      :fields="fields"
      :values="editingData"
      :states="states"
      :loading="false"
      @close="onClose"
      @save="onSave"
    />
    <CRUDGridComponent
      ref="crudGridRef"
      resourceName="franquicias"
      endpoint="franchises/"
      :states="states"
      iconClass="fas fa-cubes me-2 text-secondary"
      @configure="onConfigure"
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
    const isEdit = ref(false);
    const editingData = ref({});
    const crudGridRef = ref(null);
    const fields = ref([
      { key: 'franchise', label: 'Nombre de Franquicia', type: 'text', required: true, maxlength: 50 },
      { key: 'description', label: 'Siglas', type: 'text', required: true, maxlength: 36 },
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

    const onSave = async (data) => {
      try {
        console.log('Datos a enviar:', data);
        
        // Preparar los datos en el formato requerido por el backend
        const franchiseData = {
          franchise: data.franchise,
          description: data.description,
          state: parseInt(data.state)
        };
        
        console.log('Datos formateados:', franchiseData);
        
        if (isEdit.value) {
          // Modo edición - hacer PUT
          const response = await api.put(`/franchises/${editingData.value.id}/`, franchiseData);
          console.log('Respuesta del servidor (edición):', response.data);
          alert('Franquicia actualizada exitosamente!');
        } else {
          // Modo creación - hacer POST
          const response = await api.post('/franchises/', franchiseData);
          console.log('Respuesta del servidor (creación):', response.data);
          alert('Franquicia creada exitosamente!');
        }
        
        // Resetear modo de edición
        isEdit.value = false;
        editingData.value = {};
        
        // Resetear el estado de edición en la tabla
        if (crudGridRef.value) {
          crudGridRef.value.resetEditingState();
        }
        
        // Recargar la página para ver los cambios
        window.location.reload();
        
      } catch (error) {
        console.error('Error al guardar franquicia:', error);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        
        // Mostrar mensaje de error
        const action = isEdit.value ? 'actualizar' : 'crear';
        alert(`Error al ${action} la franquicia: ` + (error.response?.data?.detail || error.message));
      }
    };

    const onClose = () => {
      console.log('Formulario cancelado');
      // Resetear modo de edición
      isEdit.value = false;
      editingData.value = {};
      
      // Resetear el estado de edición en la tabla
      if (crudGridRef.value) {
        crudGridRef.value.resetEditingState();
      }
    };

    const onConfigure = (data) => {
      console.log('Configurando item:', data);
      
      // Preparar los datos para el formulario
      editingData.value = {
        id: data.id,
        franchise: data.franchise,
        description: data.description,
        state: data.state
      };
      
      // Cambiar a modo edición
      isEdit.value = true;
      
      console.log('Datos de edición:', editingData.value);
    };

    onMounted(() => {
      fetchStates();
    });

    return {
      states,
      fields,
      isEdit,
      editingData,
      crudGridRef,
      onSave,
      onClose,
      onConfigure,
    };
  },
};
</script>

<style scoped>
/* Responsive para móviles */
@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem !important;
    text-align: center;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.25rem !important;
  }
}
</style> 