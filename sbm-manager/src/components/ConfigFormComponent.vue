<template>
  <div class="p-4 mb-4 bg-light border rounded-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="h5 fw-bold text-primary mb-0">
        Configuración {{ configurationName }} - <span class="fw-bold text-uppercase">{{ publicPivotField }}</span> : {{ catalog?.[publicPivotField] || '-' }}
      </h3>
      <button type="button" class="btn btn-link p-0 ms-2" aria-label="Cerrar" @click="$emit('close')" style="font-size:1.5rem; line-height:1; color:#e53935; text-decoration:none;">
        &times;
      </button>
    </div>
    <form @submit.prevent="onSubmit">
      <div class="row">
        <div class="mb-3 col-12 col-md-6 col-lg-4">
          <label for="menu" class="form-label fw-semibold" style="padding-right: 10px;">Menú</label>
          <select id="menu" v-model="menuValue" class="form-select">
            <option v-for="option in menuOptions" :key="option.id" :value="option.id">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="mb-3 col-12 col-md-6 col-lg-4">
          <label for="group" class="form-label fw-semibold" style="padding-right: 10px;">Grupo</label>
          <select id="group" v-model="itemGroupValue" class="form-select">
            <option v-for="option in groupOptions" :key="option.id" :value="option.id">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="mb-3 col-12 col-md-6 col-lg-4">
          <label for="category" class="form-label fw-semibold" style="padding-right: 10px;">Categoría</label>
          <select id="category" v-model="categoryValue" class="form-select">
            <option v-for="option in categoryOptions" :key="option.id" :value="option.id">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="mb-3 col-12 col-md-6 col-lg-4">
          <label for="type" class="form-label fw-semibold" style="padding-right: 10px;">Tipo</label>
          <select id="type" v-model="typeValue" class="form-select">
            <option v-for="option in typeOptions" :key="option.id" :value="option.id">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-12 col-md-4">
          <button type="submit" class="btn btn-primary w-100 fw-bold">Guardar configuración</button>
        </div>
      </div>
    </form>
    <!-- Debug: Lista de menús -->
    <!-- <ul>
      <li v-for="option in fields[0].options" :key="option.id">{{ option.label }}</li>
    </ul> -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue';
import axios from '../api/axios';
const props = defineProps({
  catalog: {
    type: Object,
    required: true
  },
  configurationName: {
    type: String,
    required: true
  },
  publicPivotField: {
    type: String,
    required: true
  }
});

const menuOptions = ref([]);
const groupOptions = ref([]);
const categoryOptions = ref([]);
const typeOptions = ref([]);

const optionsLoaded = ref(false);

const form = reactive({
  menu: '',
  group: '',
  category: '',
  type: '',
  restriction: '',
  usage_instructions: '',
  configuration: '',
});

const expectedSelection = ref({ menu: null, item_group: null, category: null, type: null });

// Computed para sincronizar el valor del select con el catálogo y permitir edición
const menuValue = computed({
  get() {
    // Si expectedSelection.menu tiene valor, úsalo como fuente de la verdad
    if (expectedSelection.value.menu !== null && expectedSelection.value.menu !== undefined) {
      return toNumber(expectedSelection.value.menu);
    }
    // Si no, usa el valor actual del formulario
    return form.menu;
  },
  set(newVal) {
    form.menu = toNumber(newVal);
    expectedSelection.value.menu = toNumber(newVal);
  }
});
const itemGroupValue = computed({
  get() {
    if (expectedSelection.value.item_group !== null && expectedSelection.value.item_group !== undefined) {
      return toNumber(expectedSelection.value.item_group);
    }
    return form.group;
  },
  set(newVal) {
    form.group = toNumber(newVal);
    expectedSelection.value.item_group = toNumber(newVal);
  }
});
const categoryValue = computed({
  get() {
    if (expectedSelection.value.category !== null && expectedSelection.value.category !== undefined) {
      return toNumber(expectedSelection.value.category);
    }
    return form.category;
  },
  set(newVal) {
    form.category = toNumber(newVal);
    expectedSelection.value.category = toNumber(newVal);
  }
});
const typeValue = computed({
  get() {
    if (expectedSelection.value.type !== null && expectedSelection.value.type !== undefined) {
      return toNumber(expectedSelection.value.type);
    }
    return form.type;
  },
  set(newVal) {
    form.type = toNumber(newVal);
    expectedSelection.value.type = toNumber(newVal);
  }
});

function toNumber(val) {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

async function loadOptions() {
  optionsLoaded.value = false;
  try {
    const res = await axios.get('/menus/');
    if (Array.isArray(res.data.results)) {
      menuOptions.value = res.data.results.map(item => ({ id: toNumber(item.id), label: item.menu }));
    } else if (Array.isArray(res.data)) {
      menuOptions.value = res.data.map(item => ({ id: toNumber(item.id), label: item.menu }));
    } else {
      menuOptions.value = [];
    }
  } catch (e) { menuOptions.value = []; }
  try {
    const res = await axios.get('/item-groups/');
    if (Array.isArray(res.data.results)) {
      groupOptions.value = res.data.results.map(item => ({ id: toNumber(item.id), label: item.group_name }));
    } else if (Array.isArray(res.data)) {
      groupOptions.value = res.data.map(item => ({ id: toNumber(item.id), label: item.group_name }));
    } else {
      groupOptions.value = [];
    }
  } catch (e) { groupOptions.value = []; }
  try {
    const res = await axios.get('/item-categories/');
    if (Array.isArray(res.data.results)) {
      categoryOptions.value = res.data.results.map(item => ({ id: toNumber(item.id), label: item.category }));
    } else if (Array.isArray(res.data)) {
      categoryOptions.value = res.data.map(item => ({ id: toNumber(item.id), label: item.category }));
    } else {
      categoryOptions.value = [];
    }
  } catch (e) { categoryOptions.value = []; }
  try {
    const res = await axios.get('/item-types/');
    if (Array.isArray(res.data.results)) {
      typeOptions.value = res.data.results.map(item => ({ id: toNumber(item.id), label: item.type }));
    } else if (Array.isArray(res.data)) {
      typeOptions.value = res.data.map(item => ({ id: toNumber(item.id), label: item.type }));
    } else {
      typeOptions.value = [];
    }
  } catch (e) { typeOptions.value = []; }
  optionsLoaded.value = true;
}

onMounted(async () => {
  await loadOptions();
});

watch(() => props.catalog, async (newCatalog) => {
  if (!newCatalog) return;
  if (optionsLoaded.value) {
    await assignValues();
  } else {
    const stop = watch(
      optionsLoaded,
      async (loaded) => {
        if (loaded) {
          await assignValues();
          stop();
        }
      },
      { immediate: true }
    );
  }
}, { immediate: true });

watch(() => expectedSelection.value.menu, (val) => {
  if (val !== null && val !== undefined) {
    form.menu = toNumber(val);
  }
});

function assignValues() {
  const getId = (val, options) => {
    if (val == null) return null;
    if (typeof val === 'object' && val.id !== undefined) return toNumber(val.id);
    if (typeof val === 'number') return val;
    const found = options.find(opt => opt.label === val);
    return found ? toNumber(found.id) : null;
  };
  form.menu = getId(props.catalog.menu, menuOptions.value);
  form.item_group = getId(props.catalog.item_group, groupOptions.value);
  form.category = getId(props.catalog.category, categoryOptions.value);
  form.type = getId(props.catalog.type, typeOptions.value);
  form.restriction = props.catalog.restriction || '';
  form.usage_instructions = props.catalog.usage_instructions || '';
  form.configuration = props.catalog.configuration || '';
  expectedSelection.value = {
    menu: toNumber(form.menu),
    item_group: toNumber(form.item_group),
    category: toNumber(form.category),
    type: toNumber(form.type)
  };
}

function onSubmit() {
  // Aquí irá la lógica de guardado cuando tengas los endpoints
  alert('Configuración guardada (simulado)');
}
</script> 