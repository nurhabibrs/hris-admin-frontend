import { useEffect, useState, useRef } from "react";
import { useEmployeeStore } from "../store/employeeStore";
import type { User } from "../interface/UserInterface";
import type { Position } from "../interface/PositionInterface";
import api from "../api/axios";

type ModalMode = "view" | "edit" | null;

export default function EmployeeManagement() {
    const { employees, meta, fetchEmployees, updateEmployee } = useEmployeeStore();
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [name, setName] = useState("");
    const [debouncedName, setDebouncedName] = useState("");
    const [role, setRole] = useState("");
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const photoPreviewUrlRef = useRef<string | null>(null);
    const [positions, setPositions] = useState<Position[]>([]);
    const [positionId, setPositionId] = useState<number | null>(null);;

    const handleNameChange = (value: string) => {
        setName(value);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setDebouncedName(value);
            setPage(1);
        }, 400);
    };

    useEffect(() => {
        const filters: { page: number; limit?: number; order?: "asc" | "desc"; name?: string, role?: string } = { page }
        if (order) filters.order = order
        if (limit) filters.limit = limit
        if (role) filters.role = role
        if (debouncedName) filters.name = debouncedName
        fetchEmployees(filters);
    }, [fetchEmployees, order, limit, page, debouncedName, role]);

    const handleReset = () => {
        setPage(1);
        setOrder("desc");
        setLimit(10);
        setName("");
        setDebouncedName("");
        setRole("");
    };

    const openView = (employee: User) => {
        setSelectedEmployee(employee);
        setModalMode("view");
    };

    const openEdit = (employee: User) => {
        setSelectedEmployee(employee);
        setEditForm({
            name: employee.name ?? "",
            email: employee.email ?? "",
            phone_number: employee.phone_number ?? "",
            role: employee.role ?? "employee",
        });
        setPositionId(employee.position?.id ?? null);
        setSaveError(null);
        setPhotoFile(null);
        api.get<Position[]>("/positions").then((res) => {
            const data = Array.isArray(res.data) ? res.data : (res.data as { data?: Position[] })?.data ?? [];
            setPositions(data);
        }).catch(() => setPositions([]));
        if (photoPreviewUrlRef.current) {
            URL.revokeObjectURL(photoPreviewUrlRef.current);
            photoPreviewUrlRef.current = null;
        }
        setPhotoPreview(null);
        setModalMode("edit");
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedEmployee(null);
        setSaveError(null);
        setPhotoFile(null);
        if (photoPreviewUrlRef.current) {
            URL.revokeObjectURL(photoPreviewUrlRef.current);
            photoPreviewUrlRef.current = null;
        }
        setPhotoPreview(null);
    };

    const handleSave = async () => {
        if (!selectedEmployee?.id) return;
        if (positionId === null) {
            setSaveError("Posisi wajib dipilih.");
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            if (photoFile) {
                const formData = new FormData();
                Object.entries(editForm).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) formData.append(key, value as string);
                });
                if (positionId !== null) formData.append("position_id", String(positionId));
                formData.append("profile_photo", photoFile);
                await updateEmployee(selectedEmployee.id, formData);
            } else {
                const payload = { ...editForm, ...(positionId !== null ? { position_id: positionId } : {}) };
                await updateEmployee(selectedEmployee.id, payload as Partial<User>);
            }
            closeModal();
        } catch {
            setSaveError("Gagal menyimpan perubahan. Coba lagi.");
        } finally {
            setSaving(false);
        }
    };

    const filtered = employees;

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Daftar Karyawan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Cari nama karyawan..."
                        className="col-span-1 sm:col-span-2 lg:col-span-1 text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={role}
                        onChange={(e) => { setRole(e.target.value); setPage(1); }}
                        className="col-span-1 sm:col-span-2 lg:col-span-1 text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Semua Role</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Karyawan</option>
                    </select>
                    <select
                        value={order}
                        onChange={(e) => { setOrder(e.target.value as "asc" | "desc"); setPage(1); }}
                        className="col-span-1 sm:col-span-2 lg:col-span-1 text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="desc">Tanggal Terbaru</option>
                        <option value="asc">Tanggal Terlama</option>
                    </select>
                    <button
                        onClick={handleReset}
                        className="col-span-1 sm:col-span-2 lg:col-span-1 text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <p className="text-sm">Tidak ada data karyawan</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">No</th>
                                <th className="px-6 py-3">Nama Karyawan</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Posisi</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                                    <td className="px-6 py-4 text-slate-700">{String(item.name ?? "-")}</td>
                                    <td className="px-6 py-4 text-slate-700">{String(item.email ?? "-")}</td>
                                    <td className="px-6 py-4 text-slate-700">{String(item?.position?.name ?? "-")}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.role === "admin"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-green-100 text-green-700"
                                            }`}>
                                            {item.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openView(item)}
                                                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                Lihat
                                            </button>
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="text-xs px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {meta && (
                <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-500">
                            Menampilkan {employees.length} dari {meta.total} data
                        </p>
                        <select
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            &laquo;
                        </button>
                        {Array.from({ length: meta.total_pages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === meta.total_pages || Math.abs(p - page) <= 1)
                            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, idx) =>
                                p === "..." ? (
                                    <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-slate-400 text-sm">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p as number)}
                                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${p === page
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                        <button
                            onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                            disabled={page === meta.total_pages}
                            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            &raquo;
                        </button>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {modalMode === "view" && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-base font-semibold text-slate-800">Detail Karyawan</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none">&times;</button>
                        </div>
                        <div className="px-6 py-5 space-y-3 text-sm">
                            <div>
                                <label className="text-slate-500">Photo</label>
                                <div className="px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                    {selectedEmployee.photo_url ? (
                                        <img src={selectedEmployee.photo_url} alt="Profile" className="h-50 w-50 object-cover" />
                                    ) : (
                                        <span className="text-slate-400 text-sm">No photo uploaded</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Nama</span>
                                <span className="text-slate-800 font-medium">{selectedEmployee.name ?? "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Email</span>
                                <span className="text-slate-800">{selectedEmployee.email ?? "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">No. Telepon</span>
                                <span className="text-slate-800">{selectedEmployee.phone_number ?? "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Posisi</span>
                                <span className="text-slate-800">{selectedEmployee.position?.name ?? "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Role</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedEmployee.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                                    }`}>{selectedEmployee.role ?? "-"}</span>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {modalMode === "edit" && selectedEmployee && (
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-base font-semibold text-slate-800">Edit Karyawan</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none">&times;</button>
                        </div>
                        <div className="px-6 py-5 space-y-4 text-sm">
                            <div className="flex flex-col gap-1">
                                <label className="text-slate-500">Photo</label>
                                <div className="flex items-center gap-3">
                                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                        ) : selectedEmployee?.photo_url ? (
                                            <img src={selectedEmployee.photo_url} alt="Photo" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-slate-400 text-xs text-center px-1">No photo</span>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] ?? null;
                                            setPhotoFile(file);
                                            if (photoPreviewUrlRef.current) {
                                                URL.revokeObjectURL(photoPreviewUrlRef.current);
                                                photoPreviewUrlRef.current = null;
                                            }
                                            if (file) {
                                                const url = URL.createObjectURL(file);
                                                photoPreviewUrlRef.current = url;
                                                setPhotoPreview(url);
                                            } else {
                                                setPhotoPreview(null);
                                            }
                                        }}
                                        className="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-medium file:text-slate-600 file:bg-white hover:file:bg-slate-50 file:cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-slate-500">Nama</label>
                                <input
                                    type="text"
                                    value={editForm.name ?? ""}
                                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-slate-500">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email ?? ""}
                                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-slate-500">No. Telepon</label>
                                <input
                                    type="text"
                                    value={editForm.phone_number ?? ""}
                                    onChange={(e) => setEditForm((f) => ({ ...f, phone_number: e.target.value }))}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-slate-500">Role</label>
                                <select
                                    value={editForm.role ?? "employee"}
                                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-slate-500">Posisi</label>
                                <select
                                    value={positionId ?? ""}
                                    onChange={(e) => setPositionId(e.target.value === "" ? null : Number(e.target.value))}
                                    className="border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Pilih Posisi --</option>
                                    {positions.map((pos) => (
                                        <option key={pos.id} value={pos.id}>{pos.name}</option>
                                    ))}
                                </select>
                            </div>
                            {saveError && <p className="text-red-500 text-xs">{saveError}</p>}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={closeModal}
                                disabled={saving}
                                className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40"
                            >
                                {saving ? "Menyimpan..." : "Simpan"}
                            </button>
                        </div>
                    </div>
                </div>
                </form>
            )}
        </div>
    );
}