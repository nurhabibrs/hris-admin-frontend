import { useEffect, useRef, useState } from "react"
import { useUserStore } from "../store/userStore"

interface UserSelectProps {
    value: string
    onChange: (value: string) => void
}

const LIMIT = 10

export default function UserSelect({ value, onChange }: UserSelectProps) {
    const { users, meta, loading, fetchUsers, resetUsers } = useUserStore()
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [debouncedName, setDebouncedName] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Debounce search input
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setDebouncedName(search)
            setPage(1)
        }, 300)
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [search])

    // Fetch when dropdown opens or search/page changes
    useEffect(() => {
        if (!open) return
        fetchUsers({
            page,
            limit: LIMIT,
            name: debouncedName || undefined,
            append: page > 1,
        })
    }, [open, debouncedName, page, fetchUsers])

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleOpen = () => {
        if (!open) {
            resetUsers()
            setSearch("")
            setDebouncedName("")
            setPage(1)
        }
        setOpen((prev) => !prev)
        setTimeout(() => searchRef.current?.focus(), 50)
    }

    const handleSelect = (userId: string) => {
        onChange(userId)
        setOpen(false)
    }

    const selectedUser = users.find((u) => String(u.userId) === value)
    const displayLabel =
        value === ""
            ? "Semua User"
            : selectedUser
            ? selectedUser.name ?? `User #${value}`
            : `User #${value}`

    const hasMore = meta ? page < meta.total_pages : false

    return (
        <div ref={containerRef} className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <button
                type="button"
                onClick={handleOpen}
                className="w-full text-left text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
            >
                <span className="truncate">{displayLabel}</span>
                <svg
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[220px] bg-white border border-slate-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-slate-100">
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau email..."
                            className="w-full text-sm border border-slate-200 rounded-md px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <ul className="max-h-52 overflow-y-auto">
                        <li>
                            <button
                                type="button"
                                onClick={() => handleSelect("")}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${value === "" ? "font-semibold text-blue-600" : "text-slate-700"}`}
                            >
                                Semua User
                            </button>
                        </li>
                        {users.map((user) => (
                            <li key={user.userId}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(String(user.userId))}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${String(user.userId) === value ? "font-semibold text-blue-600" : "text-slate-700"}`}
                                >
                                    <span className="block truncate">{user.name ?? user.email ?? `User #${user.userId}`}</span>
                                    {user.email && user.name && (
                                        <span className="block text-xs text-slate-400 truncate">{user.email}</span>
                                    )}
                                </button>
                            </li>
                        ))}
                        {loading && (
                            <li className="px-4 py-2 text-sm text-slate-400 text-center">Memuat...</li>
                        )}
                        {!loading && users.length === 0 && (
                            <li className="px-4 py-2 text-sm text-slate-400 text-center">Tidak ada user</li>
                        )}
                    </ul>

                    {hasMore && !loading && (
                        <div className="p-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setPage((p) => p + 1)}
                                className="w-full text-xs text-center text-blue-600 hover:text-blue-800 py-1 transition-colors"
                            >
                                Muat lebih banyak
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
