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
            <div v-for="(table, index) in localTables" :key="index" class="border rounded bg-white">
                <div class="d-flex justify-content-between align-items-center px-3 py-2">
                    <div class="d-flex align-items-center gap-2">
                        <i :class="table.icon"></i>
                        <strong>{{ table.title }}</strong>
                        <span class="badge bg-light text-dark">
                            {{ Array.isArray(table.rows) ? table.rows.length : 0 }}
                        </span>
                    </div>

                    <button class="btn btn-sm btn-link text-secondary text-decoration-none p-0"
                        @click="toggleTable(index)" :title="collapsedTables[index] ? 'Expandir' : 'Colapsar'">
                        <i :class="collapsedTables[index] ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
                    </button>
                </div>

                <div v-show="!collapsedTables[index]" class="px-2 pb-2">
                    <GridDetailTableComponent :title="table.title" :icon="table.icon" :type="table.type"
                        :order="table.order" :fields="table.fields || []" :rows="table.rows"
                        :searchConfig="table.searchConfig || {}" :createConfig="table.createConfig || {}"
                        :calculationConfig="table.calculationConfig ?? {}" :detailConfig="table.detailConfig || {}"
                        @update:rows="updateRows(index, $event)" @refresh-details="refreshDetails(index)" />
                </div>
            </div>
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
        },
    },

    data() {
        return {
            localTables: [],
            collapsedTables: {},
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
                        order: t.order || null,
                        rows: Array.isArray(t.rows) ? t.rows : [],
                        calculationConfig: t.calculationConfig ?? {}   // FIX
                    }))
                    : []

                const nextCollapsed = {}

                for (let i = 0; i < this.localTables.length; i++) {
                    await this.refreshDetails(i)
                    const table = this.localTables[i]
                    const hasRows = Array.isArray(table?.rows) && table.rows.length > 0
                    nextCollapsed[i] = !hasRows
                }

                this.collapsedTables = nextCollapsed
            }
        }
    },

    methods: {
        updateRows(index, rows) {
            this.localTables[index].rows = rows
        },

        async refreshDetails(index) {
            const table = this.localTables[index]
            if (!table?.order?.id) return

            try {
                const buildUrl = table?.detailConfig?.buildUrl
                if (!buildUrl) return

                const url = buildUrl({
                    order: table.order,
                    table
                })

                if (!url) return

                const { data } = await axios.get(url)

                this.localTables[index].rows = Array.isArray(data)
                    ? data
                    : (data?.results || [])

            } catch (error) {
                console.error('Error recargando details:', error)
            }
        },
        toggleTable(index) {
            this.collapsedTables[index] = !this.collapsedTables[index]
        },
    }
}
</script>

<style scoped>
.grid-detail-container {
    border: 1px solid #e9ecef;
}
</style>