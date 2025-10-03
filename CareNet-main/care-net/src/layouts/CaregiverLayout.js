import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/header";

export default function CaregiverLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header
                links={[
                    { to: "/caregiver", label: "Home" },
                    { to: "/caregiver/patients", label: "Patients" },
                    { to: "/caregiver/schedule", label: "Schedule" },
                ]}
            />


        <main className="flex-1 p-6 bg-gray-50">
            <Outlet />
        </main>
        </div>
    );
}
