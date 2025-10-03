import React from "react";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <button className="bg-gray-900 text-white" onClick={logout}>Logout</button>
            </div>
            <div className="mt-6 space-y-2">
            <div><span className="font-medium">Email:</span> {user?.email}</div>
            <div><span className="font-medium">Role:</span> {user?.role}</div>
            <div><span className="font-medium">User ID:</span> {user?.id}</div>
            </div>

            {/* Example of calling a protected endpoint later
            useEffect(() => { api.get('/api/secure').then(r => setData(r.data)) }, [])
            */}
        </div>
        </div>
    );
}
