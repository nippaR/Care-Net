import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AdminLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center position-sticky top-0 z-10">
            <h1 className="text-xl font-bold">CarNet</h1>
            <nav className="px-6 py-2 flex gap-4 text-sm print:hidden">
                <Link to="/admin/admin-dashboard">Dashboard</Link>
                <Link to="/admin/admin-feedback-dashboard">Feedback</Link>
                <Link to="/admin/reports">Reports</Link>
            </nav>
            <div className="flex items-center gap-4">
            <span>{user?.email}</span>
            <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">
                Logout
            </button>
            </div>
        </header>

        {/* Nav (optional) */}

        {/* Main content */}
        <main className="flex-1 p-6 bg-gray-50">
            <Outlet />
        </main>
        </div>
    );
}
