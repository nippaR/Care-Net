import React from "react";
import { useAuth } from "../auth/AuthContext";

export default function CaregiverDashboard() {
    const { user } = useAuth();
    return (
        <div className="p-6">
        <h1 className="text-2xl font-bold">Caregiver Dashboard</h1>
        <p>Hello {user.email}, you’re logged in as {user.role}.</p>
        <ul className="list-disc pl-6 mt-4">
            <li>View assigned patients</li>
            <li>Track caregiving schedule</li>
        </ul>
        </div>
    );
}
