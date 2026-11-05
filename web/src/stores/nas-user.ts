import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export interface NasUser {
  uid: string
  username: string
  isAdmin: boolean
  viaGateway: boolean
}

/** 当前飞牛用户（由飞牛统一网关通过 X-Trim-* Header 提供） */
export const useNasUserStore = defineStore('nas-user', () => {
  const user = ref<NasUser | null>(null)

  async function fetchUser() {
    try {
      const { data } = await api.get('/api/fnos/me', { skipErrorToast: true } as any)
      if (data?.ok) {
        user.value = data.data
        if (!user.value.username) {
          try {
            const me = await api.get('/api/user/me', { skipErrorToast: true } as any)
            if (me.data?.ok) user.value = { ...user.value, username: me.data.data.username }
          }
          catch {}
        }
      }
    }
    catch {
      user.value = null
    }
  }

  return { user, fetchUser }
})
