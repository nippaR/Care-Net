// FeedbackForm.jsx
import React, { useState } from "react";
import api from "../../api/client"; // adjust path if needed

/* ---------- Star Rating ---------- */
function Star({ filled, half, onClick, onMouseEnter, onMouseLeave, label }) {
    return (
        <button
        type="button"
        aria-label={label}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="p-1"
        >
        {/* single SVG handles empty/half/full via gradients */}
        <svg viewBox="0 0 24 24" className="w-7 h-7">
            <defs>
            <linearGradient id="half">
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
            </defs>
            <path
            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z"
            fill={filled ? "#fbbf24" : half ? "url(#half)" : "#e5e7eb"}
            stroke="#9ca3af"
            strokeWidth="0.6"
            />
        </svg>
        </button>
    );
    }

    function StarRating({ value, onChange, max = 5, allowHalf = false, label }) {
    const [hover, setHover] = useState(null); // number (ex: 3 or 3.5)
    const display = hover ?? value;

    return (
        <div className="flex items-center gap-2" role="radiogroup" aria-label={label}>
        {Array.from({ length: max }).map((_, i) => {
            const base = i + 1;
            const isHalf = allowHalf && display + 0.5 === base;
            const isFull = display >= base;
            return (
            <div key={i} className="relative flex">
                {allowHalf && (
                <Star
                    half
                    filled={false}
                    label={`${base - 0.5} stars`}
                    onClick={() => onChange(base - 0.5)}
                    onMouseEnter={() => setHover(base - 0.5)}
                    onMouseLeave={() => setHover(null)}
                />
                )}
                <Star
                filled={isFull}
                label={`${base} stars`}
                onClick={() => onChange(base)}
                onMouseEnter={() => setHover(base)}
                onMouseLeave={() => setHover(null)}
                />
            </div>
            );
        })}
        <span className="ml-1 text-sm text-gray-500">{display || 0}/5</span>
        </div>
    );
    }

    /* ---------- Main Form ---------- */
    export default function FeedbackForm() {
    const [form, setForm] = useState({
        first: "",
        last: "",
        email: "",
        role: "",
        notes: "",
        quality: 4,
        support: 4,
        useful: ["Customizable dashboards", "Real-time analytics"],
        missing: ["More detailed reporting options"],
    });
    const [loading, setLoading] = useState(false);

    const FEATURES_USEFUL = [
        "Customizable dashboards",
        "Real-time analytics",
        "Integration with existing systems",
    ];
    const FEATURES_MISSING = [
        "An offline mode for remote usage",
        "More detailed reporting options",
        "Enhanced mobile app functionality",
    ];

    const toggle = (key, val) =>
        setForm((f) => ({
        ...f,
        [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
        }));

    // 🔗 Connect to backend: POST /api/feedback
    const submit = async (e) => {
        e.preventDefault();
        if (!form.first || !form.last || !form.email) {
        alert("Please fill first name, last name, and email.");
        return;
        }

        try {
        setLoading(true);
        const payload = {
            first: form.first,
            last: form.last,
            email: form.email,
            role: form.role,
            notes: form.notes,
            quality: form.quality,
            support: form.support,
            useful: form.useful,
            missing: form.missing,
        };
        await api.post("/api/feedback", payload);
        alert("Thanks for your feedback!");

        // reset form
        setForm({
            first: "",
            last: "",
            email: "",
            role: "",
            notes: "",
            quality: 4,
            support: 4,
            useful: [],
            missing: [],
        });
        } catch (err) {
        console.error(err);
        alert("Sorry, we couldn't send your feedback. Please try again.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8 *:font-poppins">
        <form
            onSubmit={submit}
            className="mx-auto max-w-3xl rounded-2xl bg-white/80 backdrop-blur ring-1 ring-black/5 shadow-lg"
        >
            {/* heading */}
            <div className="px-6 pt-6 text-center">
            <h1 className="text-2xl font-semibold">Feedback</h1>
            <p className="mt-1 text-sm text-gray-600">
                We value your feedback to help us improve our product and services. Please take a
                moment to share your thoughts and suggestions.
            </p>
            <p className="mt-2 text-sm">
                Are you experiencing problems?{" "}
                <a href="#" className="text-sky-700 underline underline-offset-2">
                Status page
                </a>
            </p>
            </div>

            {/* inputs */}
            <div className="grid gap-4 px-6 pt-6 md:grid-cols-2">
            <input
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="First Name"
                value={form.first}
                onChange={(e) => setForm({ ...form, first: e.target.value })}
            />
            <input
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Last Name"
                value={form.last}
                onChange={(e) => setForm({ ...form, last: e.target.value })}
            />
            <input
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Business Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <select
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
                <option value="">Your Role</option>
                <option>Client</option>
                {/* <option>Manager</option>
                <option>Engineer</option>
                <option>Analyst</option> */}
                <option>Other</option>
            </select>
            </div>

            {/* textarea */}
            <div className="px-6 pt-4">
            <textarea
                rows={6}
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Other Feedback?"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
                Please share any additional comments, suggestions, or feedback to help us improve our
                product and service.
            </p>
            </div>

            {/* ratings */}
            <div className="grid gap-6 px-6 pt-6 md:grid-cols-2">
            <div>
                <p className="font-medium mb-2">How satisfied are you with the overall quality?</p>
                <StarRating
                label="Overall quality"
                value={form.quality}
                onChange={(v) => setForm({ ...form, quality: v })}
                allowHalf={false}
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Very dissatisfied</span>
                <span>Very satisfied</span>
                </div>
            </div>
            <div>
                <p className="font-medium mb-2">How is the quality of our customer support?</p>
                <StarRating
                label="Customer support"
                value={form.support}
                onChange={(v) => setForm({ ...form, support: v })}
                allowHalf={false}
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Very poor</span>
                <span>Excellent</span>
                </div>
            </div>
            </div>

            {/* checkboxes */}
            <div className="grid gap-6 px-6 pt-6 md:grid-cols-2">
            <div>
                <p className="font-medium mb-3">What features do you find most useful?</p>
                <ul className="space-y-2">
                {FEATURES_USEFUL.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                    <input
                        id={`u-${f}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-300"
                        checked={form.useful.includes(f)}
                        onChange={() => toggle("useful", f)}
                    />
                    <label htmlFor={`u-${f}`} className="text-sm">
                        {f}
                    </label>
                    </li>
                ))}
                </ul>
            </div>

            <div>
                <p className="font-medium mb-3">
                Features you feel are missing or could be improved?
                </p>
                <ul className="space-y-2">
                {FEATURES_MISSING.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                    <input
                        id={`m-${f}`}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-300"
                        checked={form.missing.includes(f)}
                        onChange={() => toggle("missing", f)}
                    />
                    <label htmlFor={`m-${f}`} className="text-sm">
                        {f}
                    </label>
                    </li>
                ))}
                </ul>
            </div>
            </div>

            {/* submit */}
            <div className="px-6 py-6">
            <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-lg py-3 text-white font-medium shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading
                    ? "bg-slate-500 cursor-not-allowed"
                    : "bg-slate-800 hover:bg-slate-900 focus:ring-slate-400"
                }`}
            >
                {loading ? "Sending…" : "Send Feedback"}
            </button>
            </div>
        </form>
        </div>
    );
}
