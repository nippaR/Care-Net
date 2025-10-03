import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
    const nav = useNavigate();
    const { login, loading } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [err, setErr] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        try {
        const res = await login(form);
        if (res.role === "ADMIN") nav("/admin");
        else if (res.role === "CAREGIVER") nav("/caregiver");
        else nav("/careseeker");
        } catch (_) {
        setErr("Invalid email or password");
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
        {/* Brand header */}
        <div className="px-6 py-4">
            <div className="text-2xl font-serif italic">CarNet</div>
        </div>

        <div className="flex-1">
            <div className="max-w-xl mx-auto">
            <div className="rounded-2xl border shadow-sm p-8">
                <h1 className="text-3xl font-semibold text-center">Log in to CarNet</h1>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                    <div className="relative">
                    <input
                        required
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Username or Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">👤</span>
                    </div>
                </div>

                <div className="relative">
                    <input
                    required
                    type="password"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">🔒</span>
                </div>

                {err && <div className="bg-red-50 text-red-700 p-2 rounded text-sm">{err}</div>}

                <button
                    disabled={loading}
                    className="w-full rounded-full bg-green-700 text-white py-2 hover:bg-green-800 disabled:opacity-60"
                >
                    {loading ? "Continuing..." : "Continue"}
                </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-500">or</span>
                <div className="h-px bg-gray-200 flex-1" />
                </div>

                {/* Social buttons (UI only) */}
                <div className="grid grid-cols-1 gap-3">
                <button className="rounded-full border py-2 text-sm hover:bg-gray-50">
                    <span className="inline-block mr-1">🟦</span> Continue with Google
                </button>
                <button className="rounded-full border py-2 text-sm hover:bg-gray-50">
                     Continue with Apple
                </button>
                </div>

                <p className="text-center text-sm mt-6">
                Don’t have an account?{" "}
                <Link to="/register" className="underline">
                    Sign Up
                </Link>
                </p>
            </div>

            {/* Footer like your mock */}
            <footer className="text-center text-sm text-gray-600 py-8">
                © 2015 - {new Date().getFullYear()} CarNet® Global Inc. •{" "}
                <span className="underline">Privacy Policy</span> • Your Privacy Choices
            </footer>
            </div>
        </div>
        </div>
    );
}
