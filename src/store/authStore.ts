import { create } from 'zustand'
import api from '../api/axios'
import type { User } from '../interface/UserInterface'

interface AuthState {
    user: User | null
    token: string | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    updateUser: (partial: Partial<User>) => void
    initUser: () => Promise<void>
}

function decodeToken(token: string): User | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return {
            userId: payload.userId,
            email: payload.email,
            name: payload.name,
            role: payload.role,
        }
    } catch {
        return null
    }
}

const storedToken = localStorage.getItem("access_token")

export const useAuthStore = create<AuthState>((set) => ({
    user: storedToken ? decodeToken(storedToken) : null,
    token: storedToken,

    login: async (email, password) => {
        const res = await api.post("/auth/login", {
            email,
            password,
        })

        const token = res.data.access_token
        localStorage.setItem("access_token", token)

        set({
            token,
            user: decodeToken(token),
        })

        await useAuthStore.getState().initUser()
    },

    logout: async () => {
        await api.post("/auth/logout")

        localStorage.removeItem("access_token")

        set({
            user: null,
            token: null,
        })
    },

    updateUser: (partial) => {
        set((state) => ({
            user: state.user ? { ...state.user, ...partial } : state.user,
        }))
    },

    initUser: async () => {
        const userId = useAuthStore.getState().user?.userId
        if (!userId) return
        try {
            const res = await api.get(`/users/${userId}`)
            const data = res.data.data
            set((state) => ({
                user: state.user ? { ...state.user, name: data.name, photo_url: data.photo_url } : state.user,
            }))
        } catch {
            console.log("Failed to fetch user profile, keeping existing token data if any")
        }
    },
}))