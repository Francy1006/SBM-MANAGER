import { RECORD_TYPE } from '@/constants/RecordTypes'

/**
 * Convierte type de UI (string) -> record_type (int backend)
 * Ej: "catalog" -> 4
 */
export function getRecordType(type) {
  if (!type) return null

  const key = String(type).toUpperCase()
  return RECORD_TYPE[key] ?? null
}

/**
 * Convierte record_type (int backend) -> type UI (string)
 * Ej: 4 -> "catalog"
 */
export function getRecordTypeKey(value) {
  if (value == null) return null

  const entry = Object.entries(RECORD_TYPE)
    .find(([_, v]) => v === Number(value))

  return entry ? entry[0].toLowerCase() : null
}

/**
 * Construye params seguros para API de cálculo
 */
export function buildCalculationParams({ orderId, type }) {
  return {
    order_id: orderId,
    record_type: getRecordType(type)
  }
}

/**
 * Construye params para variables endpoint
 */
export function buildVariablesParams({ orderId, type }) {
  return {
    order_id: orderId,
    record_type: getRecordType(type)
  }
}