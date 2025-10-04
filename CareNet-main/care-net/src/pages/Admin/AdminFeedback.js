// src/admin/AdminFeedbackDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/client";

/* ---------- tiny helpers ---------- */
const Card = ({ children, className = "" }) => (
    <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-black/5 ${className}`}>{children}</div>
    );

    const SectionTitle = ({ children, right }) => (
    <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{children}</h2>
        {right}
    </div>
    );

    const Star = ({ filled }) => (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
        <path
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z"
        fill={filled ? "#fbbf24" : "#e5e7eb"}
        stroke="#9ca3af"
        strokeWidth="0.6"
        />
    </svg>
    );

    const Stars = ({ value = 0, max = 5 }) => {
    const full = Math.round(value);
    return (
        <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
            <Star key={i} filled={i < full} />
        ))}
        <span className="ml-1 text-xs text-gray-500">{value?.toFixed?.(1) ?? value}/5</span>
        </div>
    );
    };

    const Progress = ({ percent }) => (
    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full bg-green-600" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
    </div>
    );

    /* ---------- page ---------- */
    export default function AdminFeedbackDashboard() {
    // server data
    const [summary, setSummary] = useState({
        total: 0,
        byStars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        averages: { quality: 0, support: 0 },
    });
    const [rows, setRows] = useState([]); // [{id, first,last,role,email,notes,quality,support,useful,missing,createdAt,computedRating}]
    const [loading, setLoading] = useState(true);
    const [loadingTable, setLoadingTable] = useState(true);

    // filters
    const [query, setQuery] = useState("");
    const [ratingFilter, setRatingFilter] = useState(""); // "", "5","4",...

    // pagination (client side)
    const [page, setPage] = useState(1);
    const perPage = 10;

    /* ----- load summary + list ----- */
    useEffect(() => {
        let ignore = false;
        (async () => {
        try {
            const [{ data: s }, { data: list }] = await Promise.all([
            api.get("/api/admin/feedback/summary"),
            api.get("/api/admin/feedback"),
            ]);
            if (ignore) return;
            setSummary({
            total: s?.total ?? 0,
            byStars: { 5: s?.byStars?.[5] ?? 0, 4: s?.byStars?.[4] ?? 0, 3: s?.byStars?.[3] ?? 0, 2: s?.byStars?.[2] ?? 0, 1: s?.byStars?.[1] ?? 0 },
            averages: { quality: s?.averages?.quality ?? 0, support: s?.averages?.support ?? 0 },
            });
            setRows(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error(e);
        } finally {
            if (!ignore) {
            setLoading(false);
            setLoadingTable(false);
            }
        }
        })();
        return () => { ignore = true; };
    }, []);

    /* ----- helpers ----- */
    const overall = (r) => {
        // prefer backend-provided value
        if (typeof r.computedRating === "number") return r.computedRating;
        if (typeof r.rating === "number") return r.rating;
        const q = Number(r.quality ?? 0);
        const s = Number(r.support ?? 0);
        const haveBoth = Number.isFinite(q) && Number.isFinite(s) && (q > 0 || s > 0);
        return haveBoth ? (q + s) / 2 : q || s || 0;
    };

    /* ----- filtered view ----- */
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let data = rows;
        if (q) {
        data = data.filter((r) => {
            const name = `${r.first ?? ""} ${r.last ?? ""}`.trim().toLowerCase();
            return (
            String(r.id ?? "").toLowerCase().includes(q) ||
            (r.notes ?? "").toLowerCase().includes(q) ||
            (r.email ?? "").toLowerCase().includes(q) ||
            name.includes(q) ||
            (r.role ?? "").toLowerCase().includes(q)
            );
        });
        }
        if (ratingFilter) {
        const eq = Number(ratingFilter);
        data = data.filter((r) => Math.round(overall(r)) === eq);
        }
        return data;
    }, [rows, query, ratingFilter]);

    const pages = Math.max(1, Math.ceil(filtered.length / perPage));
    const view = filtered.slice((page - 1) * perPage, page * perPage);

    const deleteRow = async (id) => {
        if (!window.confirm("Delete this feedback?")) return;
        try {
        await api.delete(`/api/admin/feedback/${id}`);
        setRows((rs) => rs.filter((x) => x.id !== id));

        // optimistic summary update
        const r = rows.find((x) => x.id === id);
        if (r) {
            const rounded = Math.round(overall(r));
            setSummary((s) => ({
            ...s,
            total: Math.max(0, (s.total ?? 1) - 1),
            byStars: { ...s.byStars, [rounded]: Math.max(0, (s.byStars?.[rounded] ?? 1) - 1) },
            }));
        }
        } catch (e) {
        console.error(e);
        alert("Failed to delete");
        }
    };

    /* ----- computed for bars ----- */
    const barData = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: summary.byStars?.[star] ?? 0,
        percent: summary.total > 0 ? ((summary.byStars?.[star] ?? 0) / summary.total) * 100 : 0,
    }));

    return (
        <div className="min-h-screen bg-neutral-100 p-5 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Feedback Dashboard</h1>
            <button onClick={() => {window.print();}} className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">
                Print
            </button>
            </div>

            {/* TOP ROW */}
            <div className="grid gap-6 lg:grid-cols-3">
            {/* Total Reviews */}
            <Card>
                <div className="p-6">
                <SectionTitle>Totals</SectionTitle>
                {loading ? (
                    <div className="text-sm text-gray-500">Loading…</div>
                ) : (
                    <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-lime-300 px-5 py-6 text-black shadow-inner">
                        <div className="text-sm font-medium">Total Reviews</div>
                        <div className="mt-1 text-4xl font-bold">{summary.total}</div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-28">Quality</span>
                        <Stars value={summary.averages.quality || 0} />
                        </div>
                        <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-28">Support</span>
                        <Stars value={summary.averages.support || 0} />
                        </div>
                    </div>
                    </div>
                )}
                </div>
            </Card>

            {/* Star distribution */}
            <Card className="lg:col-span-2">
                <div className="p-6">
                <SectionTitle>Ratings breakdown</SectionTitle>
                {loading ? (
                    <div className="text-sm text-gray-500">Loading…</div>
                ) : (
                    <div className="grid gap-3">
                    {barData.map(({ star, count, percent }) => (
                        <div key={star} className="grid grid-cols-[56px_1fr_88px] items-center gap-3">
                        <div className="text-sm text-gray-700">{star} star</div>
                        <Progress percent={percent} />
                        <div className="text-right text-sm text-blue-700">
                            {count} review{count === 1 ? "" : "s"}
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            </Card>
            </div>

            {/* FILTERS */}
            <Card>
            <div className="p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                <input
                    className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Search by ID, name, role, email, or text…"
                    value={query}
                    onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                    }}
                />
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-600 absolute left-3 inset-y-0 my-auto">
                    <path
                    fill="currentColor"
                    d="M10 18a8 8 0 1 1 5.293-14.05l.257.222A8 8 0 0 1 18 10a7.96 7.96 0 0 1-1.69 4.91l4.39 4.39-1.42 1.41-4.39-4.39A7.96 7.96 0 0 1 10 18Zm0-2a6 6 0 1 0 0-12a6 6 0 0 0 0 12Z"
                    />
                </svg>
                </div>
                <select
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                value={ratingFilter}
                onChange={(e) => {
                    setRatingFilter(e.target.value);
                    setPage(1);
                }}
                >
                <option value="">All ratings</option>
                {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                    {n} star
                    </option>
                ))}
                </select>
            </div>
            </Card>

            {/* TABLE */}
            <Card>
            <div className="p-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr className="text-gray-700">
                    {["ID NO", "Star Rating", "Other Feedback", "Delete"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-semibold">
                        {h}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {loadingTable && (
                    <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                        Loading…
                        </td>
                    </tr>
                    )}

                    {!loadingTable &&
                    view.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{r.id}</td>
                        <td className="px-4 py-3">
                            <Stars value={overall(r)} />
                        </td>
                        <td className="px-4 py-3 max-w-[640px]">
                            <div className="whitespace-pre-wrap text-gray-800">{r.notes || "(no text)"}</div>

                            {/* meta line: name • role • email • time */}
                            <div className="mt-1 text-xs text-gray-500">
                            {`${[`${r.first ?? ""} ${r.last ?? ""}`.trim(), r.role, r.email]
                                .filter(Boolean)
                                .join(" • ")}`}
                            {r.createdAt ? ` • ${new Date(r.createdAt).toLocaleString()}` : ""}
                            </div>

                            {/* optional chips */}
                            {(Array.isArray(r.useful) && r.useful.length > 0) ||
                            (Array.isArray(r.missing) && r.missing.length > 0) ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(r.useful ?? []).map((u) => (
                                <span
                                    key={`u-${u}`}
                                    className="rounded-full bg-green-50 text-green-700 ring-1 ring-green-200 px-2 py-0.5 text-xs"
                                >
                                    {u}
                                </span>
                                ))}
                                {(r.missing ?? []).map((m) => (
                                <span
                                    key={`m-${m}`}
                                    className="rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-2 py-0.5 text-xs"
                                >
                                    {m}
                                </span>
                                ))}
                            </div>
                            ) : null}
                        </td>
                        <td className="px-4 py-3">
                            <button
                            onClick={() => deleteRow(r.id)}
                            className="rounded-md bg-red-600 px-4 py-2 text-white shadow hover:bg-red-700"
                            >
                            Delete
                            </button>
                        </td>
                        </tr>
                    ))}

                    {!loadingTable && view.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                        No feedback found.
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>

                {/* pagination */}
                <div className="mt-4 flex items-center justify-center gap-2">
                <button
                    className="rounded-full p-2 hover:bg-blue-50 disabled:opacity-40"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600">
                    <path fill="currentColor" d="m14 7l-5 5l5 5V7Z" />
                    </svg>
                </button>
                {Array.from({ length: pages }).map((_, i) => (
                    <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-9 w-9 rounded-full text-sm font-medium ${
                        page === i + 1 ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50"
                    }`}
                    >
                    {i + 1}
                    </button>
                ))}
                <button
                    className="rounded-full p-2 hover:bg-blue-50 disabled:opacity-40"
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    aria-label="Next page"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600">
                    <path fill="currentColor" d="m10 17l5-5l-5-5v10Z" />
                    </svg>
                </button>
                </div>
            </div>
            </Card>
        </div>
        </div>
    );
}
