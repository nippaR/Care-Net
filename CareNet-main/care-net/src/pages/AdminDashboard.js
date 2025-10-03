import React from "react";
import { useAuth } from "../auth/AuthContext";

export default function AdminDashboard() {
    const { user } = useAuth();
    return (
        <div className="p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p>Welcome {user.email}, you are an {user.role}.</p>
        <ul className="list-disc pl-6 mt-4">
            <li>Manage users</li>
            <li>View system metrics</li>
            <li>Assign caregivers</li>
        </ul>
        </div>
    );
}
