// src/components/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Header({ links = [] }) {
    const { user } = useAuth();
    const nav = useNavigate();

    const gotoProfile = () => {
        if (!user?.role) return nav("/login");
        if (user.role === "ADMIN") return nav("/admin/profile");
        if (user.role === "CAREGIVER") return nav("/caregiver/profile");
        return nav("/careseeker/profile"); // CARE_SEEKER default
    };

    return (
        <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            {/* Left: Logo */}
            <div className="text-2xl font-serif italic font-bold">
            <Link to="/">CareNet</Link>
            </div>

            {/* Middle: Nav */}
            <nav className="flex gap-8 text-sm font-medium">
            {links.map((l) => (
                <Link key={l.to} to={l.to} className="hover:text-green-700 transition">
                {l.label}
                </Link>
            ))}
            </nav>

            {/* Right: Avatar */}
            <button
            onClick={gotoProfile}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200"
            title="Profile"
            >
            <img
                src={`https://api.dicebear.com/8.0/thumbs/svg?seed=${user?.email || "user"}`}
                alt="avatar"
                className="w-full h-full object-cover"
            />
            </button>
        </div>
        </header>
    );
}
