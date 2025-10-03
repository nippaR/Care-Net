import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
    const nav = useNavigate();
    const { register, loading } = useAuth();

    const [showPwd, setShowPwd] = useState(false);
    const [agree, setAgree] = useState(false);
    const [marketing, setMarketing] = useState(true);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        city: "",
        // The UI says “Location”; backend expects "address"
        address: "",
        role: "CARE_SEEKER", // ADMIN | CAREGIVER | CARE_SEEKER
    });

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!agree) return alert("Please accept the Terms to continue.");
        if (form.password.length < 8) return alert("Password must be 8+ characters.");
        try {
        const res = await register(form);
        // redirect by role
        if (res.role === "ADMIN") nav("/admin");
        else if (res.role === "CAREGIVER") nav("/caregiver");
        else nav("/careseeker");
        } catch (_) {
        alert("Registration failed (email may already exist).");
        }
    };

    return (
        <div className="min-h-screen bg-white">
        {/* Simple brand header (left aligned) */}
        <div className="px-6 py-4">
            <div className="text-2xl font-serif italic">CarNet</div>
        </div>

        <div className="max-w-xl mx-auto mt-4">
            <div className="rounded-2xl border shadow-sm">
            <div className="p-8">
                <h1 className="text-3xl font-semibold text-center">Sign up to find work you love</h1>

                {/* Social buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    className="rounded-full border py-2 text-sm font-medium hover:bg-gray-50"
                    title="Continue with Apple"
                >
                     Continue with Apple
                </button>
                <button
                    type="button"
                    className="rounded-full border py-2 text-sm font-medium hover:bg-gray-50"
                    title="Continue with Google"
                >
                    <span className="inline-block mr-1">🟦</span> Continue with Google
                </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-500">or</span>
                <div className="h-px bg-gray-200 flex-1" />
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <input
                    required
                    className="border rounded-lg px-3 py-2"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={set("firstName")}
                    />
                    <input
                    required
                    className="border rounded-lg px-3 py-2"
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={set("lastName")}
                    />
                </div>

                <input
                    required
                    type="email"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Email"
                    value={form.email}
                    onChange={set("email")}
                />

                <div className="relative">
                    <input
                    required
                    type={showPwd ? "text" : "password"}
                    className="w-full border rounded-lg px-3 py-2 pr-10"
                    placeholder="Password (8 or more characters)"
                    value={form.password}
                    onChange={set("password")}
                    />
                    <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
                    title={showPwd ? "Hide" : "Show"}
                    >
                    {showPwd ? "🙈" : "👁️"}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <input
                    className="border rounded-lg px-3 py-2"
                    placeholder="City"
                    value={form.city}
                    onChange={set("city")}
                    />
                    <input
                    className="border rounded-lg px-3 py-2"
                    placeholder="Location"
                    value={form.address}
                    onChange={set("address")}
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-600">SignUp As a</label>
                    <select
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={form.role}
                    onChange={set("role")}
                    >
                    <option value="CARE_SEEKER">Careseeker</option>
                    <option value="CAREGIVER">Caregiver</option>
                    <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <label className="flex items-start gap-2 text-sm">
                    <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-1"
                    />
                    <span>Send me helpful emails to find rewarding work and job leads.</span>
                </label>

                <label className="flex items-start gap-2 text-sm">
                    <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1"
                    />
                    <span>
                    Yes, I understand and agree to the <span className="underline">Terms of Service</span>, including the{" "}
                    <span className="underline">User Agreement</span> and <span className="underline">Privacy Policy</span>.
                    </span>
                </label>

                <button
                    disabled={loading}
                    className="w-full rounded-full bg-green-700 text-white py-2 mt-2 hover:bg-green-800 disabled:opacity-60"
                >
                    {loading ? "Creating..." : "Create my account"}
                </button>
                </form>

                <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <Link to="/login" className="underline">
                    Log In
                </Link>
                </p>
            </div>
            </div>
        </div>
        </div>
    );
}
