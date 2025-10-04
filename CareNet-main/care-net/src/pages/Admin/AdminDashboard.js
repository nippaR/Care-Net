// src/AdminPatients.jsx  (now shows *Careseeker* users)
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/client"; // <-- adjust path if needed

/* --- tiny blue icons (inline SVG so no deps) --- */
const Icon = {
    search: (cls="w-4 h-4") => (
        <svg viewBox="0 0 24 24" className={`${cls} text-blue-600`}>
        <path fill="currentColor" d="M10 18a8 8 0 1 1 5.293-14.05l.257.222A8 8 0 0 1 18 10a7.96 7.96 0 0 1-1.69 4.91l4.39 4.39-1.42 1.41-4.39-4.39A7.96 7.96 0  0 1 10 18Zm0-2a6 6 0 1 0 0-12a6 6 0 0 0 0 12Z"/>
        </svg>
    ),
    edit: (cls="w-5 h-5") => (
        <svg viewBox="0 0 24 24" className={`${cls} text-blue-600`}>
        <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm14.71-9.21a1.003 1.003 0 0 0 0-1.42l-1.59-1.59a1.003 1.003 0 0 0-1.42 0l-1.34 1.34l3.75 3.75l1.6-1.08Z"/>
        </svg>
    ),
    save: (cls="w-5 h-5") => (
        <svg viewBox="0 0 24 24" className={`${cls} text-blue-600`}>
        <path fill="currentColor" d="M5 3h11l4 4v14H5V3Zm2 2v14h11V8.83L15.17 5H7Zm1 9h9v2H8v-2Zm0-4h9v2H8V8Z"/>
        </svg>
    ),
    left: (cls="w-5 h-5") => (
        <svg viewBox="0 0 24 24" className={`${cls} text-blue-600`}><path fill="currentColor" d="m14 7l-5 5l5 5V7Z"/></svg>
    ),
    right: (cls="w-5 h-5") => (
        <svg viewBox="0 0 24 24" className={`${cls} text-blue-600`}><path fill="currentColor" d="m10 17l5-5l-5-5v10Z"/></svg>
    ),
    };

    /* --- status pill --- */
    const StatusPill = ({ value }) => {
    const v = (value || "").toUpperCase();
    const map = {
        "ACTIVE": "bg-green-50 text-green-700 ring-green-200",
        "DEACTIVATED": "bg-rose-50 text-rose-700 ring-rose-200",
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${map[v] || "bg-gray-50 text-gray-700 ring-gray-200"}`}>
        {v || "—"}
        </span>
    );
    };

    export default function AdminPatients() {
    // careseeker rows from backend
    const [rows, setRows] = useState([]);               // [{id, firstName, email, phone, status}]
    const [loading, setLoading] = useState(true);

    // ui state
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState({ status: "ACTIVE" });

    // pagination
    const perPage = 10;

    // load from API
    useEffect(() => {
        let ignore = false;
        (async () => {
        try {
            const { data } = await api.get("/api/careseekers/profile"); // <--- backend list endpoint
            if (!ignore) setRows(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            if (!ignore) setLoading(false);
        }
        })();
        return () => { ignore = true; };
    }, []);

    // filtering
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(r =>
        String(r.id).includes(q) ||
        (r.firstName || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        (r.phone || "").toLowerCase().includes(q) ||
        (r.status || "").toLowerCase().includes(q)
        );
    }, [rows, query]);

    const pages = Math.max(1, Math.ceil(filtered.length / perPage));
    const view = filtered.slice((page - 1) * perPage, page * perPage);

    const startEdit = (r) => {
        setEditingId(r.id);
        setEditDraft({ status: r.status || "ACTIVE" });
    };

    const saveEdit = async () => {
        try {
        const id = editingId;
        const payload = { status: editDraft.status }; // ACTIVE / DEACTIVATED
        await api.put(`/api/admin/careseekers/${id}/status`, payload);
        setRows(rs => rs.map(r => r.id === id ? { ...r, status: payload.status } : r));
        setEditingId(null);
        } catch (e) {
        console.error(e);
        alert("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-white px-5 py-6">
        <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Careseekers</h2>
            <a href="/admin/caregivers/admin-dashboard" className="text-sm font-medium text-blue-700 hover:underline print:hidden">Caregivers Details</a>
            <button onClick={() => window.location.reload()} className="text-sm font-medium text-blue-700 hover:underline print:hidden">Refresh</button>
            <button onClick={window.print} className="text-sm font-medium text-blue-700 hover:underline print:hidden">Print</button>
            </div>

            {/* search */}
            <div className="relative mb-4">
            <input
                type="text"
                value={query}
                onChange={(e)=>{ setQuery(e.target.value); setPage(1); }}
                placeholder="Search by ID, name, email, phone"
                className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">{Icon.search()}</div>
            </div>

            {/* table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                <tr className="text-gray-600">
                    {["ID No", "First Name", "Email", "Phone No", "Status", "Edit"].map(h=>(
                    <th key={h} className="px-3 py-3 text-left font-semibold">{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                {loading && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading…</td></tr>
                )}
                {!loading && view.map((r)=>(
                    <tr key={r.id} className="hover:bg-blue-50/30">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.id}</td>
                    <td className="px-4 py-3">{r.firstName || "—"}</td>
                    <td className="px-4 py-3">{r.email || "—"}</td>
                    <td className="px-4 py-3">{r.phone || "—"}</td>
                    <td className="px-4 py-3">
                        {editingId === r.id ? (
                        <select
                            className="rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-300"
                            value={editDraft.status}
                            onChange={(e)=>setEditDraft({ status: e.target.value })}
                        >
                            {["ACTIVE","DEACTIVATED"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        ) : (
                        <StatusPill value={r.status}/>
                        )}
                    </td>
                    <td className="px-4 py-3">
                        {editingId === r.id ? (
                        <button onClick={saveEdit} className="rounded-md p-1.5 hover:bg-blue-50" title="Save">
                            {Icon.save()}
                        </button>
                        ) : (
                        <button onClick={()=>startEdit(r)} className="rounded-md p-1.5 hover:bg-blue-50" title="Edit">
                            {Icon.edit()}
                        </button>
                        )}
                    </td>
                    </tr>
                ))}
                {!loading && view.length === 0 && (
                    <tr>
                    <td className="px-4 py-10 text-center text-gray-500" colSpan={6}>
                        No records found.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>

            {/* pagination */}
            <div className="mt-4 flex items-center justify-center gap-2">
            <button
                className="rounded-full p-2 hover:bg-blue-50 disabled:opacity-40"
                onClick={()=>setPage(p=>Math.max(1,p-1))}
                disabled={page===1}
                aria-label="Previous page"
            >
                {Icon.left()}
            </button>
            {Array.from({length: pages}).map((_,i)=>(
                <button
                key={i}
                onClick={()=>setPage(i+1)}
                className={`h-9 w-9 rounded-full text-sm font-medium ${page===i+1 ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50"}`}
                >
                {i+1}
                </button>
            ))}
            <button
                className="rounded-full p-2 hover:bg-blue-50 disabled:opacity-40"
                onClick={()=>setPage(p=>Math.min(pages,p+1))}
                disabled={page===pages}
                aria-label="Next page"
            >
                {Icon.right()}
            </button>
            </div>
        </div>
        </div>
    );
}
