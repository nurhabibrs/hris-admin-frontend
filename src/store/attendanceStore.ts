import { create } from "zustand"
import api from "../api/axios"
import type { User } from "../interface/UserInterface"

interface AttendanceFilters {
    startDate?: string  // format: YYYY-MM-DD
    endDate?: string    // format: YYYY-MM-DD
    isLate?: boolean
    page?: number
    limit?: number
    userId?: number
    order?: "asc" | "desc"
}

interface Attendance {
    attendance_date?: string
    check_in?: string
    check_out?: string
    is_late?: boolean
    user?: User
}

interface AttendanceMeta {
    total: number
    page: number
    limit: number
    total_pages: number
}

interface AttendanceState {
    attendances: Attendance[]
    meta: AttendanceMeta | null
    fetchAttendanceSummary: (filters?: AttendanceFilters) => Promise<void>
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
    attendances: [],
    meta: null,

    fetchAttendanceSummary: async (filters) => {
        const params: Record<string, string> = {}
        if (filters?.startDate) params.startDate = filters.startDate
        if (filters?.endDate) params.endDate = filters.endDate
        if (filters?.isLate !== undefined) params.isLate = String(filters.isLate)
        if (filters?.page) params.page = String(filters.page)
        if (filters?.limit) params.limit = String(filters.limit)
        if (filters?.order) params.order = filters.order
        if (filters?.userId) params.userId = String(filters.userId)

        const res = await api.get(`/attendances`, { params })

        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        const meta = res.data?.meta ?? null

        set({ attendances: data, meta })
    },
}))