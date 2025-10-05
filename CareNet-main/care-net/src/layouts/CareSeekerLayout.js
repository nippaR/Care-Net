import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/header";
import SiteFooter from "../components/Footer";

export default function CareseekerLayout() {
    return (
        <div className="min-h-screen flex flex-col font-poppins">
        <Header
            links={[
            { to: "/careseeker", label: "Home" },
            { to: "/careseeker/caregivers-list", label: "Hire" },
            { to: "/careseeker/feedback-home", label: "Feedbacks" },
            ]}
        />

        <main className="flex-1 p-6 bg-gray-50">
            <Outlet />
        </main>
        {/* Footer */}
        <SiteFooter />
        </div>
    );
}
