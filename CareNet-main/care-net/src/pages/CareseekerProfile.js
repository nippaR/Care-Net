// src/pages/CareseekerProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import MyFeedback from "./Feedback/FeedbackMy";

const CARE_TYPES = ["Elderly Care", "Patient Care", "Child Care", "Pet Care"];

export default function CareseekerProfile() {
    const { user, updateUserProfile } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    // Get user details from auth context
    const emailFromAuth = user?.email ?? "";
    const firstNameFromAuth = user?.firstName ?? "";
    const lastNameFromAuth = user?.lastName ?? "";

    // Form states
    const [firstName, setFirstName] = useState(firstNameFromAuth);
    const [lastName, setLastName] = useState(lastNameFromAuth);
    const [email, setEmail] = useState(emailFromAuth);
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [location, setLocation] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [careTypes, setCareTypes] = useState([]);

    // snapshot for Reset + dirty check
    const [initialSnapshot, setInitialSnapshot] = useState(null);

    const sorted = (arr) => [...arr].sort();
    const isDirty = useMemo(() => {
        if (!initialSnapshot) return false;
        const now = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            avatarUrl,
            location: location.trim(),
            gender,
            dob,
            careTypes: sorted(careTypes),
        };
        const base = {
            firstName: (initialSnapshot.firstName || "").trim(),
            lastName: (initialSnapshot.lastName || "").trim(),
            phone: (initialSnapshot.phone || "").trim(),
            avatarUrl: initialSnapshot.avatarUrl,
            location: (initialSnapshot.location || "").trim(),
            gender: initialSnapshot.gender || "",
            dob: initialSnapshot.dob || "",
            careTypes: sorted(initialSnapshot.careTypes || []),
        };
        return JSON.stringify(now) !== JSON.stringify(base);
    }, [firstName, lastName, phone, avatarUrl, location, gender, dob, careTypes, initialSnapshot]);

    const toggleCareType = (label) => {
        setCareTypes((prev) =>
            prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
        );
    };

    // Validation helpers
    const NAME_REGEX = /^[A-Za-z ]*$/;

    // ISO yyyy-mm-dd for "today - 18 years"
    const adultCutoffISO = useMemo(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 18);
        return d.toISOString().slice(0, 10);
    }, []);

    useEffect(() => {
        let ignore = false;

        (async () => {
            setLoading(true);
            setError("");
            setInfo("");
            try {
                const { data } = await api.get("/api/careseeker/profile/me");

                // Get first name and last name with proper fallbacks
                const fn = data.firstName ?? user?.firstName ?? firstNameFromAuth;
                const ln = data.lastName ?? user?.lastName ?? lastNameFromAuth;
                const em = data.email ?? emailFromAuth;

                // dicebear as safe fallback if no avatar
                const avatarFallback = `https://api.dicebear.com/8.0/thumbs/svg?seed=${encodeURIComponent(
                    em || "user"
                )}`;
                const ava = data.avatarUrl || avatarFallback;

                if (ignore) return;

                setFirstName(fn);
                setLastName(ln);
                setEmail(em);
                setPhone(data.phone ?? "");
                setAvatarUrl(ava);
                setLocation(data.location ?? data.city ?? "");
                setGender(data.gender ?? "");
                setDob(data.dob ?? "");
                setCareTypes(Array.isArray(data.careTypes) ? data.careTypes : []);

                setInitialSnapshot({
                    firstName: fn,
                    lastName: ln,
                    phone: data.phone ?? "",
                    avatarUrl: ava,
                    location: data.location ?? data.city ?? "",
                    gender: data.gender ?? "",
                    dob: data.dob ?? "",
                    careTypes: Array.isArray(data.careTypes) ? data.careTypes : [],
                });
            } catch (e) {
                // Still give a sane, editable default profile
                const fallback = `https://api.dicebear.com/8.0/thumbs/svg?seed=${encodeURIComponent(
                    emailFromAuth || "user"
                )}`;
                if (!ignore) {
                    setFirstName(firstNameFromAuth);
                    setLastName(lastNameFromAuth);
                    setAvatarUrl(fallback);
                    setInitialSnapshot({
                        firstName: firstNameFromAuth,
                        lastName: lastNameFromAuth,
                        phone: "",
                        avatarUrl: fallback,
                        location: "",
                        gender: "",
                        dob: "",
                        careTypes: [],
                    });
                    setError(
                        "Couldn't load your profile — using defaults. Fill in your details and save."
                    );
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [emailFromAuth, firstNameFromAuth, lastNameFromAuth, user?.firstName, user?.lastName]);

    // Input handlers
    const onFirstNameChange = (e) => {
        const v = e.target.value;
        if (NAME_REGEX.test(v)) setFirstName(v);
    };

    const onLastNameChange = (e) => {
        const v = e.target.value;
        if (NAME_REGEX.test(v)) setLastName(v);
    };

    const onPhoneChange = (e) => {
        const digits = (e.target.value || "").replace(/\D/g, "").slice(0, 10);
        setPhone(digits);
    };

    const onlyDigitsKeydown = (e) => {
        const always =
            ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Home", "End", "Tab"].includes(
                e.key
            ) || e.ctrlKey || e.metaKey;
        if (always) return;
        if (!/^[0-9]$/.test(e.key) || phone.length >= 10) e.preventDefault();
    };

    const validate = () => {
        if (firstName && !NAME_REGEX.test(firstName)) {
            return "First name can contain letters and spaces only.";
        }

        if (lastName && !NAME_REGEX.test(lastName)) {
            return "Last name can contain letters and spaces only.";
        }

        const digitsOnly = (phone || "").replace(/\D/g, "");
        if (digitsOnly.length !== 10) {
            return "Phone number must be exactly 10 digits.";
        }

        if (!dob) {
            return "Please enter your date of birth.";
        }
        const dobDate = new Date(dob);
        const todayDate = new Date();
        if (dobDate > todayDate) {
            return "Date of birth cannot be in the future.";
        }
        const adultCutoff = new Date(adultCutoffISO);
        if (dobDate > adultCutoff) {
            return "You must be at least 18 years old.";
        }

        return "";
    };

    const onSave = async () => {
        const v = validate();
        if (v) {
            setInfo("");
            setError(v);
            return;
        }

        setSaving(true);
        setError("");
        setInfo("");
        try {
            await api.put("/api/careseeker/profile/me", {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.trim(),
                avatarUrl,
                location: location.trim(),
                gender,
                dob,
                careTypes,
            });
            
            // Update auth context with new name data
            updateUserProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim()
            });
            
            // refresh snapshot so dirty state resets
            const snap = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.trim(),
                avatarUrl,
                location: location.trim(),
                gender,
                dob,
                careTypes: [...careTypes],
            };
            setInitialSnapshot(snap);
            setInfo("Profile saved.");
        } catch (e) {
            if (e?.response?.status === 401) {
                setError("Your session expired. Please sign in again.");
            } else {
                setError("Could not save profile. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const onAvatarPick = async (file) => {
        if (!file) return;

        if (!/^image\//.test(file.type)) {
            setError("Please choose an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image is too large. Max 5 MB.");
            return;
        }

        const previous = avatarUrl;
        const localPreview = URL.createObjectURL(file);
        setAvatarUrl(localPreview);

        try {
            const form = new FormData();
            form.append("file", file);
            const { data } = await api.post("/api/files/upload", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (data?.url) {
                setAvatarUrl(data.url);
                setInfo("Avatar updated.");
            } else {
                setAvatarUrl(previous);
                setError("Upload response didn't include a URL.");
            }
        } catch (e) {
            setAvatarUrl(previous);
            setError("Failed to upload avatar.");
        } finally {
            URL.revokeObjectURL(localPreview);
        }
    };

    const onReset = () => {
        if (!initialSnapshot) return;
        setFirstName(initialSnapshot.firstName || "");
        setLastName(initialSnapshot.lastName || "");
        setPhone(initialSnapshot.phone || "");
        setAvatarUrl(initialSnapshot.avatarUrl || "");
        setLocation(initialSnapshot.location || "");
        setGender(initialSnapshot.gender || "");
        setDob(initialSnapshot.dob || "");
        setCareTypes(initialSnapshot.careTypes || []);
        setError("");
        setInfo("Changes reverted.");
    };

    if (loading) {
        return (
            <div className="p-6 text-gray-700">
                <div className="max-w-3xl mx-auto animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-40 bg-gray-200 rounded" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-24 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center font-poppins">
            {/* ... rest of your JSX remains the same ... */}
            <div className="max-w-6xl w-full bg-white rounded-3xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-3">
                {/* Left column */}
                <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white p-8 flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img src={avatarUrl} alt="Profile avatar" className="w-full h-full object-cover" />
                        <label
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer text-xs"
                            aria-label="Change profile photo"
                            title="Change profile photo"
                        >
                            Change
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onAvatarPick(e.target.files?.[0])}
                            />
                        </label>
                    </div>

                    <h2 className="mt-6 text-2xl font-semibold text-center">
                        {firstName || "Unnamed User"}
                    </h2>
                    <p className="text-sm opacity-90 text-center break-words">{email}</p>

                    <div className="mt-6 w-full space-y-3 text-sm">
                        <div>
                            <label className="font-medium">Phone</label>
                            <input
                                value={phone}
                                onChange={onPhoneChange}
                                onKeyDown={onlyDigitsKeydown}
                                placeholder="0123456789"
                                className="mt-1 w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/60"
                                inputMode="numeric"
                                maxLength={10}
                                pattern="\d{10}"
                                title="Exactly 10 digits"
                            />
                            <p className="text-[11px] mt-1 opacity-80">Exactly 10 digits.</p>
                        </div>
                        <div>
                            <label className="font-medium">Location</label>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="City / Suburb"
                                className="mt-1 w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/60"
                            />
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="col-span-2 p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">Care Seeker Profile</h1>
                    </div>
                    <hr />

                    {(error || info) && (
                        <div
                            className={`p-3 rounded-xl border ${
                                error
                                    ? "bg-red-100 border-red-300 text-red-700"
                                    : "bg-green-50 border-green-200 text-green-700"
                            }`}
                            role="status"
                            aria-live="polite"
                        >
                            {error || info}
                        </div>
                    )}

                    <div className="pt-4 grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="font-semibold text-gray-700">First Name</label>
                            <input
                                value={firstName}
                                onChange={onFirstNameChange}
                                className="mt-2 w-full rounded-lg border px-4 py-3 bg-gray-100 text-gray-600"
                                inputMode="text"
                                pattern="[A-Za-z ]*"
                                title="Letters and spaces only"
                            />
                            <p className="text-xs text-gray-500 mt-1">Managed by your account details.</p>
                        </div>
                        <div>
                            <label className="font-semibold text-gray-700">Last Name</label>
                            <input
                                value={lastName}
                                onChange={onLastNameChange}
                                className="mt-2 w-full rounded-lg border px-4 py-3 bg-gray-100 text-gray-600"
                                inputMode="text"
                                pattern="[A-Za-z ]*"
                                title="Letters and spaces only"
                            />
                            <p className="text-xs text-gray-500 mt-1">Managed by your account details.</p>
                        </div>
                    </div>

                    <div className="pt-4 grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="font-semibold text-gray-700">Email</label>
                            <input
                                value={email || emailFromAuth}
                                readOnly
                                className="mt-2 w-full rounded-lg border px-4 py-3 bg-gray-100 text-gray-600"
                            />
                            <p className="text-xs text-gray-500 mt-1">Used for notifications and login.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="font-semibold text-gray-700" htmlFor="dob">
                                Date of Birth
                            </label>
                            <input
                                id="dob"
                                type="date"
                                value={dob}
                                max={adultCutoffISO}
                                onChange={(e) => setDob(e.target.value)}
                                className="mt-2 w-full rounded-lg border px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">You must be 18 or older.</p>
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700" htmlFor="gender">
                                Gender
                            </label>
                            <select
                                id="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="mt-2 w-full rounded-lg border px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select…</option>
                                <option>Female</option>
                                <option>Male</option>
                                <option>Non-binary</option>
                                <option>Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="font-semibold text-gray-700">Type of Care</label>
                        <div className="mt-3 flex flex-wrap gap-3">
                            {CARE_TYPES.map((c) => {
                                const active = careTypes.includes(c);
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => toggleCareType(c)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                toggleCareType(c);
                                            }
                                        }}
                                        aria-pressed={active}
                                        className={`px-4 py-2 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                            active
                                                ? "bg-blue-600 text-white border-blue-700"
                                                : "bg-white text-gray-800 border-gray-300 hover:bg-blue-50"
                                        }`}
                                    >
                                        {c}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onReset}
                            disabled={!isDirty || saving}
                            className="px-5 py-2 rounded-lg border text-gray-700 disabled:opacity-60 hover:bg-gray-100"
                            title="Revert all unsaved changes"
                        >
                            Reset
                        </button>

                        <button
                            onClick={onSave}
                            disabled={!isDirty || saving}
                            className="px-5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-60"
                        >
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </div>
                <hr />
            </div>
            <div className="max-w-6xl w-full mt-6">
                <MyFeedback />
            </div>
        </div>
    );
}