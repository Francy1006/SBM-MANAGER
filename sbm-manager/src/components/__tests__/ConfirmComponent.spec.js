import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ConfirmComponent from '../ConfirmComponent.vue'

describe('ConfirmComponent', () => {
  it('emite confirmación y cancelación explícitas', async () => {
    const wrapper = mount(ConfirmComponent, {
      props: { message: '¿Eliminar producto?' },
    })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('bloquea ambas acciones durante la solicitud', () => {
    const wrapper = mount(ConfirmComponent, {
      props: { message: '¿Eliminar producto?', loading: true },
    })

    expect(wrapper.text()).toContain('Procesando...')
    expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
  })
})
