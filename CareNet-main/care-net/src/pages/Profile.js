import React from "react";
import { useAuth } from "../auth/AuthContext";

export default function Profile() {
    const { user } = useAuth();

    return (
        <div className="max-w-xl mx-auto bg-white shadow p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="space-y-2">
            <p><span className="font-semibold">Email:</span> {user?.email}</p>
            <p><span className="font-semibold">Role:</span> {user?.role}</p>
            <p><span className="font-semibold">ID:</span> {user?.id}</p>
        </div>
        </div>
    );
}
