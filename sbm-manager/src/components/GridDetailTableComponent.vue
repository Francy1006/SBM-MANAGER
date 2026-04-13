<template>
    <div class="grid-detail-table dashboard-table-card">
        <div class="dashboard-table-header">
            <div class="dashboard-table-title-row">
                <div class="dashboard-table-title-wrap">
                    <div class="dashboard-table-icon">
                        <i :class="[icon]"></i>
                    </div>
                    <div>
                        <h6 class="dashboard-table-title">{{ title }}</h6>
                        <p class="dashboard-table-subtitle mb-0">Gestión de detalles de la orden</p>
                    </div>
                </div>
            </div>

            <div class="dashboard-table-toolbar">
                <div class="dashboard-search-block">
                    <div class="dashboard-summary-table mb-3">
                        <table>
                            <tbody>
                                <tr>
                                    <td>{{ calculationConfig?.labels?.subtotal || 'Subtotal' }}</td>
                                    <td class="text-end">{{ formatPrice(subtotalNet) }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <CalculationComponent v-if="calculationCode" :code="calculationCode"
                            :contextKey="calculationConfig?.formulaQueryParam"
                            :formula-endpoint="calculationConfig?.formulaEndpoint"
                            :formula-response-path="calculationConfig?.formulaResponsePath"
                            :variables-endpoint="calculationConfig?.variablesEndpoint"
                            :variables-query-params="calculationConfig?.variablesQueryParams || {}"
                            :extraVariables="calculationVariables" />
                    </div>
                    <div class="dashboard-search-group">
                        <span class="dashboard-search-prefix">
                            <i class="fas fa-search"></i>
                        </span>

                        <input v-model="searchText" type="text" class="dashboard-search-input"
                            :placeholder="searchConfig.placeholder || 'Buscar...'" @input="onSearchInput"
                            @keydown.down.prevent="moveActive(1)" @keydown.up.prevent="moveActive(-1)"
                            @keydown.enter.prevent="addSelected" @keydown.esc.prevent="closeDropdown" @blur="onBlur" />

                        <button class="dashboard-add-button" type="button" :disabled="!selectedItem"
                            @click="addSelected">
                            <i class="fas fa-plus"></i>
                            <span>{{ searchConfig.addButtonText || 'Agregar' }}</span>
                        </button>
                    </div>

                    <div v-if="dropdownOpen" class="dashboard-search-dropdown position-absolute w-100">
                        <button v-for="(it, i) in results" :key="it.__k" type="button" class="dashboard-search-option"
                            :class="{ active: i === activeIndex }" @mousedown.prevent="selectItem(it, i)">
                            <div class="dashboard-search-option-title">
                                {{ getOptionPrimary(it) }}
                            </div>
                            <div class="dashboard-search-option-subtitle">
                                {{ getOptionSecondary(it) }}
                            </div>
                        </button>

                        <div v-if="loading" class="dashboard-search-state">
                            Buscando...
                        </div>

                        <div v-else-if="results.length === 0" class="dashboard-search-state">
                            Sin resultados
                        </div>
                    </div>
                </div>
            </div>
            <div class="dashboard-stats-row">
                <div class="dashboard-stat badge bg-dark">
                    <i class="fas fa-layer-group me-1"></i>
                    Activos: {{ activeCount }}
                </div>

                <div class="dashboard-stat badge bg-secondary">
                    <i class="fas fa-ban me-1"></i>
                    Eliminados: {{ canceledCount }}
                </div>
            </div>


        </div>

        <div class="dashboard-table-body">
            <div v-if="localRows.length === 0" class="dashboard-empty-state">
                <div class="dashboard-empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <div class="dashboard-empty-title">Sin registros</div>
                <div class="dashboard-empty-subtitle">Agrega un nuevo elemento para comenzar</div>
            </div>

            <div v-else class="dashboard-table-wrapper">
                <table class="table mb-0 dashboard-table">
                    <thead>
                        <tr>
                            <th v-for="field in fields" :key="field.key">
                                {{ field.label }}
                            </th>
                            <th class="dashboard-action-col">Acción</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="row in localRows" :key="row.__key"
                            :class="{ 'row-canceled': row.is_canceled === true }">
                            <td v-for="field in fields" :key="field.key" class="dashboard-cell text-center"
                                :class="{ 'text-light': row.is_canceled === true }">
                                <input v-if="field.editable" :type="field.inputType || 'number'" :min="field.min ?? 1"
                                    class="form-control form-control-sm text-center dashboard-inline-input"
                                    :class="{ 'input-disabled-dark': row.is_processed === true }"
                                    v-model.number="row[field.key]" @input="onEditableInput(row, field)"
                                    :disabled="row.is_processed === true" />

                                <div v-else-if="field.type === 'icon_group'"
                                    class="d-flex justify-content-center align-items-center gap-2 flex-nowrap dashboard-icon-group">
                                    <template v-for="iconCfg in (field.icons || [])"
                                        :key="`${row.__key}-${iconCfg.key}`">
                                        <span class="dashboard-icon-chip">
                                            <i :class="[iconCfg.icon, getIconClass(row, iconCfg.key)]"
                                                :title="iconCfg.title || ''"></i>
                                        </span>
                                    </template>
                                </div>

                                <a v-else-if="field.type === 'link'" v-show="!!row[field.key]" :href="row[field.key]"
                                    target="_blank" class="dashboard-link">
                                    {{ field.linkText || 'Ver' }}
                                </a>

                                <span v-else-if="field.type === 'price'" class="dashboard-price">
                                    {{ formatPrice(row[field.key]) }}
                                </span>

                                <span v-else-if="field.type === 'datetime'" class="dashboard-datetime">
                                    {{ formatDate(row[field.key]) }}
                                </span>

                                <span v-else-if="field.type === 'boolean'">
                                    <i v-if="row[field.key]" class="fas fa-check text-success"></i>
                                    <i v-else class="fas fa-times text-danger"></i>
                                </span>

                                <span v-else class="dashboard-text-value fw-bold">
                                    {{ displayValue(row, field) }}
                                </span>
                            </td>

                            <td class="dashboard-cell text-center">
                                <button class="dashboard-cancel-button" @click="softDeleteRow(row)"
                                    :disabled="row.is_canceled === true"
                                    :title="row.is_canceled === true ? 'Ya cancelado' : 'Cancelar registro'">
                                    <i class="fas fa-ban"></i>
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
import CalculationComponent from './CalculationComponent.vue';


export default {
    name: 'GridDetailTableComponent',
    components: { CalculationComponent },
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
                itemTypeId: null,
                payloadBuilder: null
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
        },

        calculationConfig: {
            type: Object,
            default: () => ({})
        },

        detailConfig: {
            type: Object,
            default: () => ({})
        }
    },

    emits: ['update:rows', 'refresh-details'],
    computed: {
        activeCount() {
            return this.localRows.filter(r => r.is_canceled !== true).length
        },
        canceledCount() {
            return this.localRows.filter(r => r.is_canceled === true).length
        },
        subtotalNet() {
            const totalKey = this.recalcConfig.totalKey || 'net_amount'

            return this.localRows
                .filter(r => r.is_canceled !== true)
                .reduce((acc, r) => acc + Number(r?.[totalKey] || 0), 0)
        },
        calculationVariables() {
            return {
                net_amount: {
                    label: 'Subtotal Neto',
                    value: this.subtotalNet
                }
            }
        },
    },
    data() {
        return {
            localRows: [],
            searchText: '',
            results: [],
            loading: false,
            dropdownOpen: false,
            selectedItem: null,
            activeIndex: -1,
            debounceTimer: null,
            calculationCode: null
        }
    },
    watch: {
        rows: {
            immediate: true,
            deep: true,
            handler(val) {
                const quantityKey = this.recalcConfig.quantityKey || 'quantity'
                const unitKey = this.recalcConfig.unitKey || 'unit_net_amount'
                const totalKey = this.recalcConfig.totalKey || 'net_amount'

                this.localRows = Array.isArray(val)
                    ? val.map((r, i) => {
                        const quantity = Number(r?.[quantityKey] || 1)
                        const total = Number(r?.[totalKey] || 0)
                        const unit = Number(r?.[unitKey] ?? (quantity > 0 ? total / quantity : 0)) || 0

                        return {
                            __key: r.__key || `${this.type}-${i}-${Date.now()}`,
                            id: r?.id || null,
                            ...r,
                            [unitKey]: unit,
                            [totalKey]: total
                        }
                    })
                    : []
            }
        },

        calculationConfig: {
            immediate: true,
            deep: true,
            async handler() {
                await this.loadCalculationCode()
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

        getSelectedItemCode(item) {
            if (!item) return ''
            return item?.[this.searchConfig.keyField || 'code'] || item?.code || ''
        },

        getOrderTypeId() {
            return (
                this.order?.order_type_id ||
                this.order?.order_type?.id ||
                this.order?.order_type ||
                null
            )
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

            const unitNet = Number(item?.[unitKey] ?? 0) || 0

            this.fields.forEach(field => {
                if (field.key in item) {
                    row[field.key] = item[field.key]
                    return
                }

                if (field.key === 'id_item') {
                    row[field.key] = this.getSelectedItemCode(item)
                    return
                }

                if (field.key === quantityKey) {
                    row[field.key] = 1
                    return
                }

                if (field.key === unitKey) {
                    row[field.key] = unitNet
                    return
                }

                if (field.key === totalKey) {
                    const quantity = Number(row[quantityKey] || 1)
                    row[field.key] = unitNet * quantity
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
            const existing = this.localRows.find(r =>
                r.id_item === this.getSelectedItemCode(this.selectedItem) &&
                r.item_type === this.createConfig?.itemTypeId &&
                r.is_canceled !== true
            )

            if (existing) {
                alert('Este item ya está agregado')
                return
            }

            if (!this.selectedItem) return

            try {
                if (this.createEndpoint && this.createPayloadBuilder) {
                    const payload = this.createPayloadBuilder({
                        selectedItem: this.selectedItem,
                        order: this.order,
                        type: this.type,
                        fields: this.fields,
                        createConfig: this.createConfig,
                        calculationConfig: this.calculationConfig,
                        recalcConfig: this.recalcConfig
                    })

                    await axios.post(this.createEndpoint, payload)

                    if (this.refreshAfterCreate) {
                        this.$emit('refresh-details', this.type)
                    }
                } else if (this.createConfig?.endpoint && this.createConfig?.payloadBuilder) {
                    const payload = this.createConfig.payloadBuilder({
                        selectedItem: this.selectedItem,
                        order: this.order,
                        type: this.type,
                        fields: this.fields,
                        createConfig: this.createConfig,
                        calculationConfig: this.calculationConfig,
                        recalcConfig: this.recalcConfig,
                        getOrderTypeId: this.getOrderTypeId,
                        getSelectedItemCode: this.getSelectedItemCode
                    })

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
                const responseData = error?.response?.data || {}
                alert(
                    responseData?.id_item?.[0] ||
                    responseData?.item_code?.[0] ||
                    responseData?.detail ||
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

        async softDeleteRow(row) {
            try {
                const cfg = this.detailConfig

                if (!cfg?.deleteBuilder) {
                    row.is_canceled = true
                    this.emitChange()
                    return
                }

                const request = cfg.deleteBuilder({ row, order: this.order, table: this })

                if (!request?.url) {
                    row.is_canceled = true
                    this.emitChange()
                    return
                }

                await axios.patch(request.url, request.payload || {})

                row.is_canceled = true
                this.emitChange()

            } catch (error) {
                console.error('Error cancelando detail:', error)
                alert(
                    error?.response?.data?.detail ||
                    'Error al cancelar detalle'
                )
            }
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

            const unitValue = Number(row[unitKey] || 0)
            row[unitKey] = unitValue
            row[totalKey] = unitValue * row[quantityKey]

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
        },

        getIconClass(row, key) {
            const status = this.getIconStatus(row, key)

            const classMap = {
                secondary: 'text-secondary',
                info: 'text-info',
                primary: 'text-primary',
                success: 'text-success',
                warning: 'text-warning',
                danger: 'text-danger',
            }

            return classMap[status] || 'text-secondary'
        },

        getIconStatus(row, key) {
            const today = new Date()
            const expectedDeliveryDate = this.parseDate(row?.expected_delivery_date)
            const deliveryDate = this.parseDate(row?.delivery_date)
            const closedAt = this.parseDate(row?.closed_at)

            if (key === 'is_processed') {
                if (row?.is_deleted === true) return 'danger'
                if (row?.is_processed === true && row?.is_closed === true) return 'warning'
                if (row?.is_processed === true) return 'info'
                return 'secondary'
            }

            if (key === 'requires_cold_chain') {
                return row?.requires_cold_chain === true ? 'info' : 'secondary'
            }

            if (key === 'dispatch_date') {
                if (!expectedDeliveryDate) return 'secondary'

                const oneDayBefore = new Date(expectedDeliveryDate)
                oneDayBefore.setDate(oneDayBefore.getDate() - 1)

                if (
                    row?.is_closed === true &&
                    deliveryDate &&
                    deliveryDate.getTime() <= expectedDeliveryDate.getTime()
                ) {
                    return 'success'
                }

                if (
                    today.getTime() > expectedDeliveryDate.getTime() ||
                    (deliveryDate && deliveryDate.getTime() > expectedDeliveryDate.getTime())
                ) {
                    return 'danger'
                }

                if (
                    this.isSameDay(today, oneDayBefore) ||
                    this.isSameDay(today, expectedDeliveryDate)
                ) {
                    return 'warning'
                }

                if (today.getTime() < oneDayBefore.getTime()) {
                    return 'secondary'
                }

                return 'secondary'
            }

            if (key === 'is_closed') {
                return row?.is_closed === true ? 'success' : 'secondary'
            }

            if (key === 'fiscal_documentation') {
                if (row?.fiscal_documentation_error === true) return 'danger'
                if (row?.requires_fiscal_documentation !== true) return 'secondary'
                if (row?.requires_fiscal_documentation === true && row?.fiscal_documentation) return 'success'
                return 'warning'
            }

            if (key === 'is_delayed') {
                if (row?.is_closed === true || !deliveryDate || !closedAt) return 'secondary'

                const limitDate = new Date(deliveryDate)
                limitDate.setDate(limitDate.getDate() + 7)

                if (closedAt.getTime() > limitDate.getTime()) return 'warning'
                return 'secondary'
            }

            if (key === 'is_non_conforming') {
                return row?.is_non_conforming === true ? 'warning' : 'secondary'
            }

            if (key === 'is_partial') {
                return row?.is_partial === true ? 'warning' : 'secondary'
            }

            if (key === 'is_canceled') {
                return row?.is_canceled === true ? 'danger' : 'secondary'
            }

            return 'secondary'
        },

        parseDate(value) {
            if (!value) return null
            const d = new Date(value)
            return Number.isNaN(d.getTime()) ? null : d
        },

        isSameDay(a, b) {
            if (!a || !b) return false
            return (
                a.getFullYear() === b.getFullYear() &&
                a.getMonth() === b.getMonth() &&
                a.getDate() === b.getDate()
            )
        },

        async loadCalculationCode() {
            try {
                if (!this.calculationConfig?.endpoint) {
                    this.calculationCode = null
                    return
                }

                const param = this.calculationConfig.queryParam
                const value = this.calculationConfig.queryValue
                const responsePath = this.calculationConfig.codeResponsePath

                if (!param || !value || !responsePath) {
                    this.calculationCode = null
                    return
                }

                const { data } = await axios.get(
                    `${this.calculationConfig.endpoint}?${param}=${encodeURIComponent(value)}`
                )

                const path = String(responsePath).split('.')
                let result = data

                for (const key of path) {
                    if (result == null) break
                    result = result[key]
                }

                this.calculationCode = result || null

            } catch (error) {
                console.error('Error cargando calculation code:', error)
                this.calculationCode = null
            }
        },
    },
    mounted() {
    },
    beforeUnmount() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer)
    }
}
</script>

<style scoped>
.dashboard-table-card {
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    background: #ffffff;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.dashboard-table-header {
    padding: 1.1rem 1.25rem 1rem;
    background: #ffffff;
    border-bottom: 1px solid #eef2f7;
}

.dashboard-table-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.dashboard-table-title-wrap {
    display: flex;
    align-items: center;
    gap: 0.85rem;
}

.dashboard-table-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    color: #334155;
    font-size: 1rem;
}

.dashboard-table-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
}

.dashboard-table-subtitle {
    font-size: 0.79rem;
    color: #94a3b8;
}

.dashboard-table-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
}

.dashboard-search-block {
    position: relative;
    min-width: 380px;
    max-width: 580px;
    width: 100%;
}

.dashboard-search-group {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 48px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    overflow: hidden;
}

.dashboard-search-prefix {
    width: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.dashboard-search-input {
    flex: 1;
    border: 0;
    outline: none;
    background: transparent;
    color: #0f172a;
    font-size: 0.93rem;
    padding: 0.8rem 0.2rem;
}

.dashboard-search-input::placeholder {
    color: #94a3b8;
}

.dashboard-add-button {
    height: 100%;
    min-width: 132px;
    border: 0;
    border-left: 1px solid #e2e8f0;
    background: #ffffff;
    color: #000000;
    font-weight: 700;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0 1rem;
    transition: all 0.18s ease;
}

.dashboard-add-button:hover:not(:disabled) {
    background: #eff6ff;
}

.dashboard-add-button:disabled {
    color: #cbd5e1;
    background: #ffffff;
    cursor: not-allowed;
}

.dashboard-search-dropdown {
    margin-top: 0.45rem;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.12);
    z-index: 30;
    max-height: 260px;
    overflow-y: auto;
}

.dashboard-search-option {
    width: 100%;
    border: 0;
    border-bottom: 1px solid #f1f5f9;
    background: #ffffff;
    text-align: left;
    padding: 0.85rem 1rem;
    transition: background 0.15s ease;
}

.dashboard-search-option:hover,
.dashboard-search-option.active {
    background: #f8fafc;
}

.dashboard-search-option:last-child {
    border-bottom: 0;
}

.dashboard-search-option-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0f172a;
}

.dashboard-search-option-subtitle {
    font-size: 0.78rem;
    color: #94a3b8;
    margin-top: 0.15rem;
}

.dashboard-search-state {
    padding: 0.9rem 1rem;
    font-size: 0.84rem;
    color: #94a3b8;
    background: #ffffff;
}

.dashboard-table-body {
    padding: 1rem 1.15rem 1.15rem;
    background: #ffffff;
}

.dashboard-empty-state {
    min-height: 150px;
    border: 1px dashed #dbe4ee;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    text-align: center;
}

.dashboard-empty-icon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
}

.dashboard-empty-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #475569;
}

.dashboard-empty-subtitle {
    font-size: 0.8rem;
    color: #94a3b8;
    margin-top: 0.15rem;
}

.dashboard-table-wrapper {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    overflow-x: auto;
    overflow-y: hidden;
    background: #ffffff;
    -webkit-overflow-scrolling: touch;
}

.dashboard-table {
    width: max-content;
    min-width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.dashboard-table thead th {
    background: #f8fafc;
    color: #64748b;
    font-size: 0.76rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border: 0;
    border-bottom: 1px solid #e5e7eb;
    padding: 0.95rem 1rem;
    white-space: nowrap;
    text-align: center;
    min-width: 140px;
}

.dashboard-table tbody td {
    border: 0;
    border-bottom: 1px solid #f1f5f9;
    background: #ffffff;
}

.dashboard-table tbody tr:last-child td {
    border-bottom: 0;
}

.dashboard-table tbody tr:hover td {
    background: #fafcff;
}

.dashboard-cell {
    padding: 0.85rem 1rem;
    font-size: 0.83rem;
    color: #334155;
    vertical-align: middle;
    white-space: nowrap;
    min-width: 140px;
}

.dashboard-inline-input {
    max-width: 92px;
    margin: 0 auto;
    border-radius: 10px;
    border: 1px solid #dbe4ee;
    font-size: 0.85rem;
    font-weight: 600;
    color: #0f172a;
    background: #ffffff;
}

.dashboard-inline-input:focus {
    border-color: #cbd5e1;
    box-shadow: none;
}

.dashboard-icon-group {
    min-height: 36px;
}

.dashboard-icon-chip {
    width: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.dashboard-icon-chip i {
    font-size: 0.95rem;
}

.dashboard-link {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
}

.dashboard-link:hover {
    text-decoration: underline;
}

.dashboard-price {
    font-weight: 700;
    color: #0f172a;
}

.dashboard-datetime {
    color: #475569;
    font-size: 0.8rem;
}

.dashboard-text-value {
    color: inherit;
}

.dashboard-action-col {
    width: 84px;
}

.dashboard-cancel-button {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid #fecaca;
    background: #fff5f5;
    color: #dc2626;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.18s ease;
}

.dashboard-cancel-button:hover:not(:disabled) {
    background: #fee2e2;
}

.dashboard-cancel-button:disabled {
    background: #f1f5f9;
    border-color: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;
}

.row-canceled {
    background-color: #6b7280 !important;
}

.row-canceled td {
    background-color: #6b7280 !important;
    color: #e5e7eb !important;
}

.row-canceled .dashboard-price,
.row-canceled .dashboard-datetime,
.row-canceled .dashboard-text-value,
.row-canceled span,
.row-canceled a {
    color: #f8fafc !important;
}

.row-canceled .dashboard-inline-input {
    color: #f8fafc !important;
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: rgba(255, 255, 255, 0.18) !important;
}

@media (max-width: 768px) {
    .dashboard-table-header {
        padding: 1rem;
    }

    .dashboard-search-block {
        min-width: 100%;
    }

    .dashboard-search-group {
        min-height: 46px;
    }

    .dashboard-add-button {
        min-width: 116px;
        padding: 0 0.85rem;
    }

    .dashboard-table-body {
        padding: 0.9rem;
    }

    .dashboard-cell {
        padding: 0.75rem 0.5rem;
    }
}

.dashboard-table th:nth-child(1),
.dashboard-table td:nth-child(1) {
    min-width: 190px;
}

.dashboard-table th:nth-child(2),
.dashboard-table td:nth-child(2) {
    min-width: 320px;
}

.dashboard-table th:nth-child(6),
.dashboard-table td:nth-child(6),
.dashboard-table th:nth-child(7),
.dashboard-table td:nth-child(7),
.dashboard-table th:nth-child(8),
.dashboard-table td:nth-child(8),
.dashboard-table th:nth-child(9),
.dashboard-table td:nth-child(9),
.dashboard-table th:nth-child(10),
.dashboard-table td:nth-child(10) {
    min-width: 180px;
}

.input-disabled-dark {
    background: #1e293b !important;
    color: #ffffff !important;
    border-color: #1e293b !important;
    opacity: 1 !important;
}

.dashboard-stats-row {
    display: flex;
    gap: 0.9rem;
    margin-top: 0.8rem;
    margin-bottom: 0.6rem;
}

.dashboard-summary-table {
    margin-top: 0.6rem;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    max-width: 320px;
}

.dashboard-summary-table table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
}

.dashboard-summary-table td {
    padding: 0.55rem 0.7rem;
}

.dashboard-summary-table tr:nth-child(odd) {
    background: #ffffff;
}

.dashboard-summary-table tr:nth-child(even) {
    background: #f8fafc;
}
</style>