import type { AxiosError } from 'axios'
import axios from 'axios'
import { Notify as qNotify } from 'quasar'

export const Notify = {
  /** 顯示提示 */
  notify: (
    type: 'error' | 'success' | 'warning',
    msg: AxiosError | string | unknown
  ) => {
    const msg_ = () => {
      if (axios.isAxiosError(msg)) {
        return msg.response?.data.msg
      }
      return msg
    }
    qNotify.create({ type: type, message: msg_() })
  },
}
