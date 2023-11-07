// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { AxiosResponse } from 'axios'
declare module 'axios' {
  export interface AxiosResponse<T> {
    code: number
    msg: string
    data: T
  }
  interface AxiosErrorData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
    code: number
    msg: string
  }
  interface AxiosStatic extends AxiosInstance {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isAxiosError(payload: any): payload is AxiosError<AxiosErrorData>
  }
}
