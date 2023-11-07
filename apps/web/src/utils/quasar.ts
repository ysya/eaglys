import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import {
  QInput,
  type ComponentConstructor,
  QBtn,
  QTable,
  Notify,
  Dialog,
} from 'quasar'
import enUs from 'quasar/lang/en-US'

type ExtractComponentProps<T> = T extends ComponentConstructor<infer X>
  ? X['$props']
  : never
export const setComponentDefaultPropValues = <T extends ComponentConstructor>(
  component: T,
  propDefaults: {
    [K in keyof Partial<ExtractComponentProps<T>>]: ExtractComponentProps<T>[K]
  }
) => {
  for (const key in propDefaults) {
    const prop = component.props[key]
    switch (typeof prop) {
      case 'object':
        prop.default = propDefaults[key]
        break
      case 'function':
        component.props[key] = {
          type: prop,
          default: propDefaults[key],
        }
        break
      case 'undefined':
        throw new Error('unknown prop: ' + key)
      default:
        throw new Error('unhandled type: ' + typeof prop)
    }
  }
}

setComponentDefaultPropValues(QInput, {
  outlined: true,
  noErrorIcon: true,
  hideBottomSpace: true,
})

setComponentDefaultPropValues(QBtn, {
  unelevated: true,
  noCaps: true,
})

setComponentDefaultPropValues(QTable, {
  flat: true,
})

export const quasarConfig = {
  plugins: { Notify, Dialog },
  lang: enUs,
}

Notify.registerType('success', {
  color: 'positive',
  position: 'top',
})

Notify.registerType('error', {
  color: 'negative',
  position: 'top',
})

Notify.registerType('warning', {
  color: 'warning',
  textColor: 'grey-9',
  position: 'top',
})
