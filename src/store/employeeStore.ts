import { create } from "zustand"
import api from "../api/axios"
import type { User } from "../interface/UserInterface"

interface EmployeeMeta {
    total: number
    page: number
    limit: number
    total_pages: number
}

interface EmployeeListState {
    employees: User[]
    meta: EmployeeMeta | null
    loading: boolean
    fetchEmployees: (params?: {
        page?: number
        limit?: number
        order?: "asc" | "desc"
        name?: string
        role?: string
    }) => Promise<void>
    createEmployee: (data: Partial<User> & { password?: string; position_id?: number } | FormData) => Promise<void>
    updateEmployee: (userId: string, data: Partial<User> | FormData) => Promise<void>
    resetEmployees: () => void
}

export const useEmployeeStore = create<EmployeeListState>((set) => ({
    employees: [],
    meta: null,
    loading: false,

    fetchEmployees: async (filters = {}) => {
        set({ loading: true })
        try {
            const params: Record<string, string> = {}
            if (filters.name) params.name = filters.name
            if (filters.page) params.page = String(filters.page)
            if (filters.limit) params.limit = String(filters.limit)
            if (filters.order) params.order = filters.order
            if (filters.role) params.role = filters.role

            const res = await api.get("/users", { params })
            const data: User[] = Array.isArray(res.data)
                ? res.data
                : (res.data?.data ?? [])
            const meta: EmployeeMeta | null = res.data?.meta ?? null

            set(({
                employees: data,
                meta,
                loading: false,
            }))
        } catch {
            set({ loading: false })
        }
    },

    resetEmployees: () => set({ employees: [], meta: null }),

    createEmployee: async (data) => {
        const res = await api.post("/users", data)
        const created: User = res.data?.data ?? res.data
        set((state) => ({ employees: [created, ...state.employees] }))
    },

    updateEmployee: async (userId, data) => {
        const res = await api.patch(`/users/${userId}`, data)
        const updated: User = res.data?.data ?? res.data
        set((state) => ({
            employees: state.employees.map((e) =>
                e.id === userId || e.userId === userId ? { ...e, ...updated } : e
            ),
        }))
    },
}))
