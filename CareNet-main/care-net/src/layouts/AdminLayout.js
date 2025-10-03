import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AdminLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">CarNet – Admin</h1>
            <div className="flex items-center gap-4">
            <span>{user?.email}</span>
            <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">
                Logout
            </button>
            </div>
        </header>

        {/* Nav (optional) */}
        <nav className="bg-gray-100 px-6 py-2 flex gap-4 text-sm">
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/users">Manage Users</Link>
            <Link to="/admin/reports">Reports</Link>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6 bg-gray-50">
            <Outlet />
        </main>
        </div>
    );
}
