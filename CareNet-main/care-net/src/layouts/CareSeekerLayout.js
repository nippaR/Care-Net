import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/header";

export default function CareseekerLayout() {
    return (
        <div className="min-h-screen flex flex-col">
        <Header
            links={[
            { to: "/careseeker", label: "Home" },
            { to: "/careseeker/caregivers", label: "Caregivers" },
            { to: "/careseeker/feedbacks", label: "Feedbacks" },
            ]}
        />

        <main className="flex-1 p-6 bg-gray-50">
            <Outlet />
        </main>
        </div>
    );
}
