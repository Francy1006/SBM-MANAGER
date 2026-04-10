<template>
    <div class="grid-detail-container mt-4 p-4 bg-light rounded shadow-sm" style="max-width: 1200px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-primary mb-0">
                <i class="fas fa-layer-group me-2"></i>
                Detalle - {{ tables?.[0]?.order?.code || '' }}
            </h5>

            <button class="btn btn-sm btn-outline-secondary rounded-pill" @click="$emit('close')">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <div v-if="!tables || tables.length === 0" class="text-center text-muted py-4">
            <i class="fas fa-info-circle me-2"></i>
            Sin información de detalle
        </div>

        <div v-else class="d-flex flex-column gap-3">
            <GridDetailTableComponent v-for="(table, index) in localTables" :key="index" :title="table.title"
                :icon="table.icon" :type="table.type" :order="table.order" :fields="table.fields || []"
                :rows="table.rows" :searchConfig="table.searchConfig || {}" :createConfig="table.createConfig || {}"
                @update:rows="updateRows(index, $event)" @refresh-details="refreshDetails(index)" />
        </div>
    </div>
</template>

<script>
import axios from '../api/axios'
import GridDetailTableComponent from './GridDetailTableComponent.vue'

export default {
    name: 'GridDetailContainerComponent',
    components: { GridDetailTableComponent },

    props: {
        tables: {
            type: Array,
            default: () => []
        }
    },

    data() {
        return {
            localTables: []
        }
    },

    watch: {
        tables: {
            immediate: true,
            deep: true,
            async handler(val) {
                this.localTables = Array.isArray(val)
                    ? val.map(t => ({
                        ...t,
                        rows: Array.isArray(t.rows) ? t.rows : []
                    }))
                    : []

                for (let i = 0; i < this.localTables.length; i++) {
                    await this.refreshDetails(i)
                }
            }
        }
    },

    methods: {
        updateRows(index, rows) {
            this.localTables[index].rows = rows
        },

        async refreshDetails(index) {
            const table = this.localTables[index]
            if (!table?.order?.id || !table?.type) return

            try {
                const { data } = await axios.get(`/orders/${table.order.id}/details/?type=${table.type}`)
                this.localTables[index].rows = Array.isArray(data) ? data : (data?.results || [])
            } catch (error) {
                console.error('Error recargando details:', error)
            }
        }
    }
}
</script>

<style scoped>
.grid-detail-container {
    border: 1px solid #e9ecef;
}
</style>