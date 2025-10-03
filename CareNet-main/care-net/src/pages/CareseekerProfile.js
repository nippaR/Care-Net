// src/pages/CareseekerProfile.jsx
import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";

const CARE_TYPES = ["Elderly Care", "Patient Care", "Child Care", "Pet Care"];

export default function CareseekerProfile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // left card (read-only basics)
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    // right card (editable)
    const [location, setLocation] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState(""); // yyyy-mm-dd
    const [careTypes, setCareTypes] = useState([]);

    const toggleCareType = (label) => {
        setCareTypes((prev) =>
        prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
        );
    };

    useEffect(() => {
        let ignore = false;
        (async () => {
        try {
            const { data } = await api.get("/api/careseeker/profile/me");
            if (ignore) return;
            setFullName(`${data.firstName ?? ""} ${data.lastName ?? ""}`.trim());
            setEmail(data.email ?? user?.email ?? "");
            setPhone(data.phone ?? "");
            setAvatarUrl(data.avatarUrl ?? `https://api.dicebear.com/8.0/thumbs/svg?seed=${email || "user"}`);

            setLocation(data.location ?? data.city ?? "");
            setGender(data.gender ?? "");
            setDob(data.dob ?? "");
            setCareTypes(Array.isArray(data.careTypes) ? data.careTypes : []);
        } catch {
            // first-time user: prefill from login info
            setAvatarUrl(`https://api.dicebear.com/8.0/thumbs/svg?seed=${email || "user"}`);
        } finally {
            if (!ignore) setLoading(false);
        }
        })();
        return () => { ignore = true; };
    }, [user, email]);

    const onSave = async () => {
        setSaving(true);
        try {
        await api.put("/api/careseeker/profile/me", {
            phone,
            avatarUrl,
            location,
            gender,
            dob,
            careTypes,
        });
        alert("Profile saved ✅");
        } catch (e) {
        console.error(e);
        alert("Could not save profile.");
        } finally {
        setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading profile…</div>;

    return (
        <div className="space-y-6">
        {/* Blue banner */}
        <div className="rounded-xl bg-blue-100 px-6 py-4 text-xl font-serif italic">
            Care Seeker profile
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left card */}
            <div className="bg-white rounded-3xl shadow p-8 md:col-span-1">
            <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow">
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                {/* (optional) upload overlay could go here */}
                </div>

                <div className="mt-6 w-full space-y-4">
                <div className="text-center">
                    <div className="text-gray-900 font-semibold">Full Name</div>
                    <div className="text-gray-700">{fullName || "-"}</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-900 font-semibold">Email</div>
                    <div className="text-gray-700 break-all">{email || "-"}</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-900 font-semibold">Phone Number</div>
                    <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+61 4xx xxx xxx"
                    className="mt-1 w-full border rounded-xl px-3 py-2 text-center"
                    />
                </div>
                </div>
            </div>
            </div>

            {/* Right card */}
            <div className="bg-white rounded-3xl shadow p-8 md:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                <label className="font-semibold">Location</label>
                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-2 w-full rounded-2xl px-4 py-3 border bg-blue-600/90 text-white placeholder-white/75"
                    placeholder="City / suburb"
                />
                </div>

                <div className="md:col-span-1">
                <label className="font-semibold">Date of Birthday</label>
                <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="mt-2 w-full rounded-2xl px-4 py-3 border bg-blue-600/90 text-white"
                />
                </div>

                <div className="md:col-span-1">
                <label className="font-semibold">Gender</label>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-2 w-full rounded-2xl px-4 py-3 border bg-blue-600/90 text-white"
                >
                    <option value="" className="text-black">Select…</option>
                    <option className="text-black">Female</option>
                    <option className="text-black">Male</option>
                    <option className="text-black">Non-binary</option>
                    <option className="text-black">Prefer not to say</option>
                </select>
                </div>
            </div>

            <div className="mt-8">
                <div className="font-semibold">Type of Care</div>
                <div className="mt-3 flex flex-wrap gap-3">
                {CARE_TYPES.map((c) => {
                    const active = careTypes.includes(c);
                    return (
                    <button
                        key={c}
                        type="button"
                        onClick={() => toggleCareType(c)}
                        className={`px-4 py-2 rounded-full border ${
                        active
                            ? "bg-blue-600 text-white border-blue-700"
                            : "bg-white text-gray-800 border-blue-400"
                        }`}
                    >
                        {c}
                    </button>
                    );
                })}
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-5 py-2 hover:bg-black disabled:opacity-60"
                title="Save"
                >
                {saving ? "Saving…" : "Save changes"}
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}
