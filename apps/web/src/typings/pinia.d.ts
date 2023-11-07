import { Store } from 'pinia'

declare module 'pinia' {
  interface Pinia {
    _s: Map<string, Store>
  }
}
