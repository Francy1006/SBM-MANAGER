<template>
    <div class="grid-detail-table card border-0 shadow-sm mb-4">
        <div class="card-header bg-white">
            <div class="mb-2">
                <h6 class="mb-0 text-secondary fw-semibold">
                    <i :class="[icon, 'me-2']"></i>{{ title }}
                </h6>
            </div>

            <div class="d-flex align-items-center gap-2 justify-content-start flex-wrap">
                <div class="position-relative" style="min-width: 340px;">
                    <div class="input-group input-group-sm">
                        <input v-model="searchText" type="text" class="form-control"
                            :placeholder="searchConfig.placeholder || 'Buscar...'" @input="onSearchInput"
                            @keydown.down.prevent="moveActive(1)" @keydown.up.prevent="moveActive(-1)"
                            @keydown.enter.prevent="addSelected" @keydown.esc.prevent="closeDropdown" @blur="onBlur" />
                        <button class="btn btn-outline-primary" type="button" :disabled="!selectedItem"
                            @click="addSelected">
                            {{ searchConfig.addButtonText || 'Agregar' }}
                        </button>
                    </div>

                    <div v-if="dropdownOpen" class="list-group position-absolute w-100 shadow-sm"
                        style="z-index: 30; max-height: 240px; overflow:auto;">
                        <button v-for="(it, i) in results" :key="it.__k" type="button"
                            class="list-group-item list-group-item-action text-start"
                            :class="{ active: i === activeIndex }" @mousedown.prevent="selectItem(it, i)">
                            <div class="fw-semibold">{{ getOptionPrimary(it) }}</div>
                            <div class="small opacity-75">{{ getOptionSecondary(it) }}</div>
                        </button>

                        <div v-if="loading" class="list-group-item small text-muted">
                            Buscando...
                        </div>
                        <div v-else-if="results.length === 0" class="list-group-item small text-muted">
                            Sin resultados
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card-body">
            <div v-if="!localRows.length" class="text-muted small py-2">
                Sin registros
            </div>

            <div v-else class="table-responsive">
                <table class="table table-sm table-bordered align-middle mb-0">
                    <thead class="table-light text-center">
                        <tr>
                            <th v-for="field in fields" :key="field.key">
                                {{ field.label }}
                            </th>
                            <th style="width: 70px;">Acción</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="row in localRows" :key="row.__key">
                            <td v-for="field in fields" :key="field.key" class="small text-center">
                                <input v-if="field.editable" :type="field.inputType || 'number'" :min="field.min ?? 1"
                                    class="form-control form-control-sm text-center" v-model.number="row[field.key]"
                                    @input="onEditableInput(row, field)" />

                                <div v-else-if="field.type === 'icon_group'"
                                    class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                                    <i v-for="iconCfg in (field.icons || [])" :key="iconCfg.key"
                                        v-show="!!row[iconCfg.key]"
                                        :class="[iconCfg.icon, iconCfg.class || 'text-secondary']"
                                        :title="iconCfg.title || ''"></i>
                                </div>

                                <a v-else-if="field.type === 'link'" v-show="!!row[field.key]" :href="row[field.key]"
                                    target="_blank">
                                    {{ field.linkText || 'Ver' }}
                                </a>

                                <span v-else-if="field.type === 'price'">
                                    {{ formatPrice(row[field.key]) }}
                                </span>

                                <span v-else-if="field.type === 'datetime'">
                                    {{ formatDate(row[field.key]) }}
                                </span>

                                <span v-else-if="field.type === 'boolean'">
                                    <i v-if="row[field.key]" class="fas fa-check text-success"></i>
                                    <i v-else class="fas fa-times text-danger"></i>
                                </span>

                                <span v-else>
                                    {{ displayValue(row, field) }}
                                </span>
                            </td>

                            <td class="text-center">
                                <button class="btn btn-outline-danger btn-sm" @click="removeRow(row.__key)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import axios from '../api/axios'

export default {
    name: 'GridDetailTableComponent',

    props: {
        title: { type: String, default: '' },
        icon: { type: String, default: 'fas fa-table' },
        type: { type: String, default: '' },
        order: { type: Object, default: null },
        fields: { type: Array, default: () => [] },
        rows: { type: Array, default: () => [] },

        searchConfig: {
            type: Object,
            default: () => ({
                endpoint: '',
                queryParam: 'search',
                resultPath: 'results',
                minChars: 2,
                placeholder: 'Buscar...',
                addButtonText: 'Agregar',
                keyField: 'code',
                primaryField: 'sku',
                secondaryField: 'description'
            })
        },

        createEndpoint: { type: String, default: '' },
        createPayloadBuilder: { type: Function, default: null },
        createConfig: {
            type: Object,
            default: () => ({
                endpoint: '',
                itemTypeId: null
            })
        },
        refreshAfterCreate: { type: Boolean, default: true },

        recalcConfig: {
            type: Object,
            default: () => ({
                quantityKey: 'quantity',
                unitKey: 'unit_net_amount',
                totalKey: 'net_amount'
            })
        }
    },

    emits: ['update:rows', 'refresh-details'],

    data() {
        return {
            localRows: [],
            searchText: '',
            results: [],
            loading: false,
            dropdownOpen: false,
            selectedItem: null,
            activeIndex: -1,
            debounceTimer: null
        }
    },

    watch: {
        rows: {
            immediate: true,
            deep: true,
            handler(val) {
                this.localRows = Array.isArray(val)
                    ? val.map((r, i) => ({
                        __key: r.__key || `${this.type}-${i}-${Date.now()}`,
                        ...r
                    }))
                    : []
            }
        }
    },

    methods: {
        getOptionPrimary(item) {
            return item?.[this.searchConfig.primaryField] || item?.[this.searchConfig.keyField] || '-'
        },

        getOptionSecondary(item) {
            return item?.[this.searchConfig.secondaryField] || '-'
        },

        buildSearchUrl(query) {
            const endpoint = (this.searchConfig.endpoint || '').replace(/^\//, '')
            const param = this.searchConfig.queryParam || 'search'
            return `/${endpoint}?${param}=${encodeURIComponent(query)}`
        },

        normalizeResults(data) {
            if (Array.isArray(data)) return data
            const path = this.searchConfig.resultPath || 'results'
            return Array.isArray(data?.[path]) ? data[path] : []
        },

        normalizeResultItem(item) {
            const keyField = this.searchConfig.keyField || 'code'
            const primaryField = this.searchConfig.primaryField || 'sku'

            return {
                ...item,
                __k:
                    item?.[keyField] ||
                    item?.[primaryField] ||
                    Math.random().toString(36).slice(2)
            }
        },

        async onSearchInput() {
            this.selectedItem = null
            this.activeIndex = -1

            const minChars = this.searchConfig.minChars ?? 2
            if (!this.searchText || this.searchText.length < minChars) {
                this.results = []
                this.dropdownOpen = false
                return
            }

            clearTimeout(this.debounceTimer)

            this.debounceTimer = setTimeout(async () => {
                this.loading = true
                this.dropdownOpen = true

                try {
                    const { data } = await axios.get(this.buildSearchUrl(this.searchText))
                    this.results = this.normalizeResults(data).map(this.normalizeResultItem)
                } catch (e) {
                    console.error('Error buscando items:', e)
                    this.results = []
                } finally {
                    this.loading = false
                }
            }, 300)
        },

        selectItem(it, i) {
            this.selectedItem = it
            this.activeIndex = i
            this.searchText = `${this.getOptionPrimary(it)} - ${this.getOptionSecondary(it)}`
        },

        buildGenericLocalRow(item) {
            const row = {
                __key: `${this.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            }

            const quantityKey = this.recalcConfig.quantityKey || 'quantity'
            const unitKey = this.recalcConfig.unitKey || 'unit_net_amount'
            const totalKey = this.recalcConfig.totalKey || 'net_amount'

            this.fields.forEach(field => {
                if (field.key in item) {
                    row[field.key] = item[field.key]
                    return
                }

                if (field.key === quantityKey) {
                    row[field.key] = 1
                    return
                }

                if (field.key === unitKey) {
                    row[field.key] = Number(
                        item?.unit_net_amount ??
                        item?.net_amount ??
                        item?.base_net_amount ??
                        0
                    ) || 0
                    return
                }

                if (field.key === totalKey) {
                    row[field.key] = row[unitKey] || 0
                    return
                }

                if (field.type === 'boolean') {
                    row[field.key] = false
                    return
                }

                row[field.key] = ''
            })

            return row
        },

        async addSelected() {
            if (!this.selectedItem) return

            try {
                if (this.createEndpoint && this.createPayloadBuilder) {
                    const payload = this.createPayloadBuilder({
                        selectedItem: this.selectedItem,
                        order: this.order,
                        type: this.type,
                        fields: this.fields
                    })

                    await axios.post(this.createEndpoint, payload)

                    if (this.refreshAfterCreate) {
                        this.$emit('refresh-details', this.type)
                    }
                } else if (this.createConfig?.endpoint && this.createConfig?.itemTypeId && this.order?.id) {
                    const unitNet = Number(
                        this.selectedItem?.unit_net_amount ??
                        this.selectedItem?.net_amount ??
                        this.selectedItem?.base_net_amount ??
                        0
                    ) || 0

                    const payload = {
                        order: this.order.id,
                        order_type: this.order.order_type_id,
                        item_type: this.createConfig.itemTypeId,
                        item_code: this.selectedItem.code || '',
                        description: this.selectedItem.description || this.selectedItem.name || '',
                        quantity: 1,
                        percent: null,
                        net_amount: unitNet,
                        fiscal_documentation: null,
                        obs: this.selectedItem.obs || null,
                        url_evidence: null,
                        operation_date: new Date().toISOString()
                    }

                    await axios.post(this.createConfig.endpoint, payload)

                    if (this.refreshAfterCreate) {
                        this.$emit('refresh-details', this.type)
                    }
                } else {
                    this.localRows.push(this.buildGenericLocalRow(this.selectedItem))
                    this.emitChange()
                }

                this.searchText = ''
                this.results = []
                this.dropdownOpen = false
                this.selectedItem = null
                this.activeIndex = -1
            } catch (error) {
                console.error('Error creando/agregando detail:', error)
                alert(
                    error?.response?.data?.item_code?.[0] ||
                    error?.response?.data?.detail ||
                    'Error al crear detalle'
                )
            }
        },

        closeDropdown() {
            this.dropdownOpen = false
        },

        onBlur() {
            setTimeout(() => {
                this.dropdownOpen = false
            }, 150)
        },

        moveActive(step) {
            if (!this.results.length) return

            let i = this.activeIndex + step
            if (i < 0) i = this.results.length - 1
            if (i >= this.results.length) i = 0

            this.activeIndex = i
            this.selectedItem = this.results[i]
        },

        removeRow(key) {
            this.localRows = this.localRows.filter(r => r.__key !== key)
            this.emitChange()
        },

        onEditableInput(row, field) {
            const quantityKey = this.recalcConfig.quantityKey || 'quantity'
            if (field.key === quantityKey) {
                this.recalculateRow(row)
                return
            }
            this.emitChange()
        },

        recalculateRow(row) {
            const quantityKey = this.recalcConfig.quantityKey || 'quantity'
            const unitKey = this.recalcConfig.unitKey || 'unit_net_amount'
            const totalKey = this.recalcConfig.totalKey || 'net_amount'

            row[quantityKey] = Number(row[quantityKey] || 1)
            if (row[quantityKey] < 1) row[quantityKey] = 1

            row[totalKey] = Number(row[unitKey] || 0) * row[quantityKey]
            this.emitChange()
        },

        emitChange() {
            this.$emit('update:rows', this.localRows)
        },

        displayValue(row, field) {
            const value = row?.[field.key]
            return value === null || value === undefined || value === '' ? '-' : value
        },

        formatPrice(v) {
            const n = Number(v)
            if (!Number.isFinite(n)) return '$0'
            return '$' + n.toLocaleString('es-CL')
        },

        formatDate(v) {
            if (!v) return '-'
            const d = new Date(v)
            if (Number.isNaN(d.getTime())) return v
            return d.toLocaleString('es-CL')
        }
    },

    beforeUnmount() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer)
    }
}
</script>

<style scoped>
.grid-detail-table {
    border-radius: 8px;
}
</style>