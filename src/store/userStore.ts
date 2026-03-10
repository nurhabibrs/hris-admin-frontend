import { create } from "zustand"
import api from "../api/axios"
import type { User } from "../interface/UserInterface"

interface UserMeta {
    total: number
    page: number
    limit: number
    total_pages: number
}

interface UserListState {
    users: User[]
    meta: UserMeta | null
    loading: boolean
    fetchUsers: (params?: {
        page?: number
        limit?: number
        name?: string
        append?: boolean
    }) => Promise<void>
    resetUsers: () => void
}

export const useUserStore = create<UserListState>((set) => ({
    users: [],
    meta: null,
    loading: false,

    fetchUsers: async ({ page = 1, limit = 10, name, append = false } = {}) => {
        set({ loading: true })
        try {
            const params: Record<string, string> = {
                page: String(page),
                limit: String(limit),
            }
            if (name) params.name = name

            const res = await api.get("/users", { params })
            const data: User[] = Array.isArray(res.data)
                ? res.data
                : (res.data?.data ?? [])
            const meta: UserMeta | null = res.data?.meta ?? null

            set((state) => ({
                users: append ? [...state.users, ...data] : data,
                meta,
                loading: false,
            }))
        } catch {
            set({ loading: false })
        }
    },

    resetUsers: () => set({ users: [], meta: null }),
}))
