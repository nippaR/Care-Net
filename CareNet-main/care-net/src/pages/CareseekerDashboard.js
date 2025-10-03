import React from "react";
import { useAuth } from "../auth/AuthContext";

export default function CareseekerDashboard() {
    const { user } = useAuth();
    return (
        <div className="p-6">
        <h1 className="text-2xl font-bold">Careseeker Dashboard</h1>
        <p>Hi {user.email}, you are a {user.role}.</p>
        <ul className="list-disc pl-6 mt-4">
            <li>Request care services</li>
            <li>View caregiver availability</li>
        </ul>
        </div>
    );
}
