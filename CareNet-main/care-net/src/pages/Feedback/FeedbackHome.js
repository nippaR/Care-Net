// src/admin/AdminFeedbackDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/client";

/* ---------- tiny helpers ---------- */
const Card = ({ children, className = "" }) => (
    <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-md ${className}`}>
        {children}
    </div>
);

const SectionTitle = ({ children, right }) => (
    <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{children}</h2>
        {right}
    </div>
);

const Star = ({ filled }) => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform duration-200 hover:scale-110">
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
            <span className="ml-1 text-xs text-gray-500 animate-pulse">{value?.toFixed?.(1) ?? value}/5</span>
        </div>
    );
};

const Progress = ({ percent }) => (
    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div 
            className="h-full bg-green-600 transition-all duration-1000 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
    </div>
);

/* ---------- Loading Components ---------- */
const LoadingCard = () => (
    <Card>
        <div className="p-6">
            <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    </Card>
);

const LoadingTableRow = () => (
    <tr className="animate-pulse">
        <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
        </td>
        <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="px-4 py-3">
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
        </td>
    </tr>
);

/* ---------- page ---------- */
export default function AdminFeedbackDashboard() {
    // server data
    const [summary, setSummary] = useState({
        total: 0,
        byStars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        averages: { quality: 0, support: 0 },
    });
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTable, setLoadingTable] = useState(true);

    // filters
    const [query, setQuery] = useState("");
    const [ratingFilter, setRatingFilter] = useState("");

    // pagination (client side)
    const [page, setPage] = useState(1);
    const perPage = 10;

    // Animation states
    const [isMounted, setIsMounted] = useState(false);

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
                
                // Add slight delay for smooth animation
                setTimeout(() => {
                    setSummary({
                        total: s?.total ?? 0,
                        byStars: { 5: s?.byStars?.[5] ?? 0, 4: s?.byStars?.[4] ?? 0, 3: s?.byStars?.[3] ?? 0, 2: s?.byStars?.[2] ?? 0, 1: s?.byStars?.[1] ?? 0 },
                        averages: { quality: s?.averages?.quality ?? 0, support: s?.averages?.support ?? 0 },
                    });
                    setRows(Array.isArray(list) ? list : []);
                    setIsMounted(true);
                }, 300);
                
            } catch (e) {
                console.error(e);
            } finally {
                if (!ignore) {
                    setTimeout(() => {
                        setLoading(false);
                        setLoadingTable(false);
                    }, 500);
                }
            }
        })();
        return () => { ignore = true; };
    }, []);

    /* ----- helpers ----- */
    const overall = (r) => {
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

    /* ----- computed for bars ----- */
    const barData = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: summary.byStars?.[star] ?? 0,
        percent: summary.total > 0 ? ((summary.byStars?.[star] ?? 0) / summary.total) * 100 : 0,
    }));

    return (
        <div className="min-h-screen bg-neutral-100 p-5 md:p-8 font-poppins">
            <div className={`mx-auto max-w-7xl space-y-6 transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                
                {/* HEADER */}
                <div className="flex items-center justify-between grid-cols-1 md:grid-cols-2 animate-fade-in">
                    <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Customer Feedbacks
                    </h1>
                    <a href='/careseeker/feedback'>
                        <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                            Add New Feedback
                        </button>
                    </a>
                </div>

                <hr className="my-4 border-gray-300 animate-pulse" />
                
                {/* TOP ROW */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Total Reviews */}
                    {loading ? (
                        <LoadingCard />
                    ) : (
                        <Card className="transform hover:scale-[1.02] transition-all duration-300">
                            <div className="p-6 animate-slide-up">
                                <SectionTitle>Totals</SectionTitle>
                                <div className="flex items-center gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 transform hover:translate-x-1 transition-transform duration-200">
                                            <span className="text-sm text-gray-600 w-28">Quality</span>
                                            <Stars value={summary.averages.quality || 0} />
                                        </div>
                                        <div className="flex items-center gap-2 transform hover:translate-x-1 transition-transform duration-200">
                                            <span className="text-sm text-gray-600 w-28">Support</span>
                                            <Stars value={summary.averages.support || 0} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Star distribution */}
                    {loading ? (
                        <>
                            <LoadingCard />
                            <LoadingCard />
                        </>
                    ) : (
                        <Card className="lg:col-span-2 transform hover:scale-[1.01] transition-all duration-300">
                            <div className="p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <SectionTitle>Ratings breakdown</SectionTitle>
                                <div className="grid gap-3">
                                    {barData.map(({ star, count, percent }, index) => (
                                        <div 
                                            key={star} 
                                            className="grid grid-cols-[56px_1fr_88px] items-center gap-3 transform hover:scale-[1.01] transition-transform duration-200"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <div className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="text-yellow-500">⭐</span>
                                                {star} star
                                            </div>
                                            <Progress percent={percent} />
                                            <div className="text-right text-sm text-blue-700 font-medium">
                                                {count} review{count === 1 ? "" : "s"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* FILTERS */}
                <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="p-4 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[220px]">
                            <input
                                className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 focus:scale-[1.02]"
                                placeholder="Search Feedback"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setPage(1);
                                }}
                            />
                            <svg 
                                viewBox="0 0 24 24" 
                                className="w-4 h-4 text-blue-600 absolute left-3 inset-y-0 my-auto animate-bounce"
                                style={{ animationDuration: '2s' }}
                            >
                                <path
                                    fill="currentColor"
                                    d="M10 18a8 8 0 1 1 5.293-14.05l.257.222A8 8 0 0 1 18 10a7.96 7.96 0 0 1-1.69 4.91l4.39 4.39-1.42 1.41-4.39-4.39A7.96 7.96 0 0 1 10 18Zm0-2a6 6 0 1 0 0-12a6 6 0 0 0 0 12Z"
                                />
                            </svg>
                        </div>
                        <select
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 focus:scale-[1.02]"
                            value={ratingFilter}
                            onChange={(e) => {
                                setRatingFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All ratings</option>
                            {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>
                                    {n} star{n > 1 ? 's' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </Card>

                {/* TABLE (read-only) */}
                <Card className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <div className="p-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr className="text-gray-700">
                                    {["ID NO", "Star Rating", "Other Feedback"].map((h, index) => (
                                        <th 
                                            key={h} 
                                            className="px-4 py-3 text-left font-semibold transition-colors duration-200 hover:text-blue-600"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loadingTable && (
                                    <>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <LoadingTableRow key={index} />
                                        ))}
                                    </>
                                )}

                                {!loadingTable && view.map((r, index) => (
                                    <tr 
                                        key={r.id} 
                                        className="hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.01]"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                                                {r.id}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Stars value={overall(r)} />
                                        </td>
                                        <td className="px-4 py-3 max-w-[640px]">
                                            <div className="whitespace-pre-wrap text-gray-800 transition-colors duration-200 hover:text-gray-900">
                                                {r.notes || "(no text)"}
                                            </div>

                                            {/* meta line: name • role • email • time */}
                                            <div className="mt-1 text-xs text-gray-500 animate-pulse">
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
                                                        className="rounded-full bg-green-50 text-green-700 ring-1 ring-green-200 px-2 py-0.5 text-xs transform hover:scale-105 transition-all duration-200 cursor-default"
                                                    >
                                                        {u}
                                                    </span>
                                                ))}
                                                {(r.missing ?? []).map((m) => (
                                                    <span
                                                        key={`m-${m}`}
                                                        className="rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-2 py-0.5 text-xs transform hover:scale-105 transition-all duration-200 cursor-default"
                                                    >
                                                        {m}
                                                    </span>
                                                ))}
                                            </div>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}

                                {!loadingTable && view.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-10 text-center text-gray-500 animate-pulse">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-4xl">📝</span>
                                                No feedback found.
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* pagination */}
                        {!loadingTable && view.length > 0 && (
                            <div className="mt-4 flex items-center justify-center gap-2 animate-fade-in">
                                <button
                                    className="rounded-full p-2 hover:bg-blue-50 disabled:opacity-40 transition-all duration-200 transform hover:scale-110"
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
                                        className={`h-9 w-9 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-110 ${
                                            page === i + 1 
                                                ? "bg-blue-600 text-white shadow-lg" 
                                                : "text-blue-700 hover:bg-blue-50"
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="rounded-full p-2 hover:bg-blue-50 disabled:opacity-40 transition-all duration-200 transform hover:scale-110"
                                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                                    disabled={page === pages}
                                    aria-label="Next page"
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600">
                                        <path fill="currentColor" d="m10 17l5-5l-5-5v10Z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Add custom CSS for animations */}
            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-up {
                    animation: slideUp 0.6s ease-out forwards;
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
}