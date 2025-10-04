// src/CareSeekerUI.jsx
import React, { useEffect, useState } from "react";
import api from "../api/client"; // adjust path if needed

/* ---------- tiny helpers ---------- */
const Badge = ({ children, tone = "blue" }) => {
    const tones = {
        blue:
        "text-blue-900 bg-blue-50 ring-blue-200/70 shadow-[inset_0_0_0_2px_rgba(59,130,246,.35)]",
        gray:
        "text-gray-800 bg-white ring-gray-300/80 shadow-[inset_0_0_0_2px_rgba(0,0,0,.06)]",
    };
    return (
        <span
        className={
            "inline-flex items-center px-4 py-1.5 rounded-full ring-2 font-semibold text-sm " +
            tones[tone]
        }
        >
        {children}
        </span>
    );
    };

    const PillButton = ({ children, onClick }) => (
    <button
        onClick={onClick}
        className="px-5 py-1.5 rounded-full bg-gradient-to-b from-white to-sky-50 text-sky-700 font-semibold shadow ring-2 ring-sky-300 hover:shadow-md active:scale-[.99] transition"
    >
        {children}
    </button>
    );

    const Panel = ({ title, right, children, className = "" }) => (
    <div className={"rounded-xl bg-white shadow-sm ring-1 ring-black/5 " + className}>
        {(title || right) && (
        <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="font-semibold">{title}</h3>
            {right}
        </div>
        )}
        <div className="p-5">{children}</div>
    </div>
    );

    /* ---------- left list card ---------- */
    const CaregiverListCard = ({ cg, onView }) => {
    const tags = Array.isArray(cg.skills) ? [...cg.skills].slice(0, 3) : [];
    return (
        <div className="rounded-xl bg-sky-50/80 ring-1 ring-sky-100 p-5 shadow-sm">
        <div className="flex items-start gap-4">
            <img
            src={cg.avatarUrl || "https://i.pravatar.cc/80?img=12"}
            alt=""
            className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow"
            />
            <div className="flex-1">
            <div className="font-semibold">{cg.username || "Caregiver"}</div>
            <div className="mt-1 text-gray-700 font-medium">
                {cg.tagline || "Description"}
            </div>

            <div className="mt-3 flex flex-col gap-3">
                {tags.map((t) => (
                <div key={t} className="flex justify-end">
                    <Badge tone="blue">{t}</Badge>
                </div>
                ))}
                <div className="flex justify-end">
                <PillButton onClick={() => onView(cg.id)}>view</PillButton>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
    };

    /* ---------- right profile ---------- */
    const ProfileHeaderCard = ({ profile }) => {
    if (!profile) {
        return (
        <Panel>
            <div className="text-sm text-gray-500">Select a caregiver to view details.</div>
        </Panel>
        );
    }
    const langs = Array.isArray(profile.languages) ? profile.languages : [];
    const skills = Array.isArray(profile.skills) ? profile.skills : [];
    return (
        <Panel
        className="overflow-hidden"
        right={
            <a href='/careseeker/feedback'>
                <button className="rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50">
                    Give Feedbacks
                </button>
            </a>
        }
        >
        <div className="flex items-start gap-4">
            <img
            src={profile.avatarUrl || "https://i.pravatar.cc/96?img=66"}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow"
            alt=""
            />
            <div className="flex-1">
            <div className="flex items-center gap-2">
                <div className="font-semibold">{profile.username || "Caregiver"}</div>
                <div className="text-gray-500 text-sm">@{(profile.username || "").toLowerCase().replace(/\s+/g, "_")}</div>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                {/* You can replace these with real ratings/location if you store them */}
                <span>⭐ 4.9 (21)</span>
                <span>•</span>
                <span>{profile.tagline || "—"}</span>
                <span>•</span>
                <span>🇱🇰 Sri Lanka</span>
                <span>•</span>
                <span>{langs.map(l => l.lang).join(", ") || "—"}</span>
            </div>

            <div className="mt-4">
                <div className="text-sm font-semibold mb-1">About me</div>
                <p className="text-sm leading-6 text-gray-700">
                {profile.about || "—"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                {[...skills].slice(0,6).map((s) => (
                    <Badge key={s} tone="gray">
                    {s}
                    </Badge>
                ))}
                </div>
            </div>
            </div>

            {/* small side box */}
            <div className="w-56 shrink-0">
            <div className="rounded-lg border p-3">
                <div className="flex items-center gap-3">
                <img
                    src={profile.avatarUrl || "https://i.pravatar.cc/80?img=66"}
                    className="h-10 w-10 rounded-full object-cover"
                    alt=""
                />
                <div className="text-sm">
                    <div className="font-semibold">{profile.username || "Caregiver"}</div>
                    <div className="text-gray-500">Offline • 09:21 AM local time</div>
                </div>
                </div>
                <button className="mt-3 w-full rounded-md bg-black text-white py-2 text-sm hover:bg-gray-800">
                Contact me
                </button>
                <div className="mt-3 text-center text-xs text-gray-500">
                Average response time: 1 hour
                </div>
            </div>
            </div>
        </div>
        </Panel>
    );
    };

    const LanguagesYearsService = ({ profile }) => {
    const langs = Array.isArray(profile?.languages) ? profile.languages : [];
    const years = profile?.years || "—";
    const radius = profile?.serviceRadius || "—";
    // If you store service types separately, map them here; otherwise use skills/careTypes
    const serviceTypes = Array.isArray(profile?.careTypes) ? profile.careTypes
                        : Array.isArray(profile?.skills) ? profile.skills
                        : [];

    return (
        <Panel className="">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
            <div className="font-semibold mb-3">Languages</div>
            <div className="flex flex-wrap gap-2">
                {langs.length ? langs.map((l, idx) => (
                <Badge key={idx} tone="gray">{l.lang} {l.level ? `(${l.level})` : ""}</Badge>
                )) : <span className="text-gray-500">—</span>}
            </div>
            </div>

            <div>
            <div className="font-semibold mb-3">Year of expertise</div>
            <Badge tone="gray">{years}</Badge>
            </div>

            <div>
            <div className="font-semibold mb-3">Service Radius</div>
            <div className="text-gray-800">{radius}</div>
            </div>

            <div className="lg:col-span-2">
            <div className="font-semibold mb-3">Service Types</div>
            <div className="flex flex-wrap gap-2">
                {serviceTypes.length ? [...serviceTypes].map((t) => (
                <Badge key={t} tone="gray">{t}</Badge>
                )) : <span className="text-gray-500">—</span>}
            </div>
            </div>
        </div>
        </Panel>
    );
    };

    const HistoryCerts = ({ profile }) => {
    const work = Array.isArray(profile?.workHistory) ? profile.workHistory : [];
    const certs = Array.isArray(profile?.certifications) ? profile.certifications : [];
    return (
        <Panel>
        <div className="grid gap-8 md:grid-cols-2">
            <div>
            <div className="font-semibold mb-3">Working History</div>
            {work.length ? (
                <ul className="space-y-3 text-sm">
                {work.map((w, i) => (
                    <li key={i} className="rounded-lg border p-3">
                    <div className="font-medium">
                        {(w.role || "Role")} — {(w.company || "Company")}
                    </div>
                    <div className="text-gray-500">
                        {(w.from || "—")} – {(w.to || "Present")}
                    </div>
                    </li>
                ))}
                </ul>
            ) : <div className="text-sm text-gray-500">—</div>}
            </div>

            <div>
            <div className="font-semibold mb-3">Certifications</div>
            {certs.length ? (
                <ul className="space-y-3 text-sm">
                {certs.map((c, i) => (
                    <li key={i} className="rounded-lg border p-3 flex items-center justify-between">
                    <div>
                        <div className="font-medium">{c.name || "—"}</div>
                        <div className="text-gray-500">
                        {(c.issuer || "—")} • {(c.year || "—")}
                        </div>
                    </div>
                    <Badge tone="gray">Verified</Badge>
                    </li>
                ))}
                </ul>
            ) : <div className="text-sm text-gray-500">—</div>}
            </div>
        </div>
        </Panel>
    );
    };

    /* ---------- master layout ---------- */
    export default function CareSeekerUI() {
    const [list, setList] = useState([]);         // caregivers list for left column
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [profile, setProfile] = useState(null); // right column details
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Load all caregivers
    useEffect(() => {
        let ignore = false;
        (async () => {
        try {
            const { data } = await api.get("/api/caregiver/profile/public");
            if (ignore) return;
            setList(Array.isArray(data) ? data : []);
            // Auto-select the first caregiver (optional)
            if (data?.length) {
            setSelectedId(data[0].id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (!ignore) setLoading(false);
        }
        })();
        return () => { ignore = true; };
    }, []);

    // Load a caregiver when selectedId changes
    useEffect(() => {
        if (!selectedId) { setProfile(null); return; }
        let ignore = false;
        (async () => {
        try {
            setLoadingProfile(true);
            const { data } = await api.get(`/api/caregiver/profile/public/${selectedId}`);
            if (!ignore) setProfile(data);
        } catch (e) {
            console.error(e);
        } finally {
            if (!ignore) setLoadingProfile(false);
        }
        })();
        return () => { ignore = true; };
    }, [selectedId]);

    return (
        <div className="min-h-screen bg-neutral-100 p-4 md:p-8">
        <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-[1fr_1fr]">
            {/* left column list */}
            <div className="space-y-6">
            {loading ? (
                <div className="text-sm text-gray-500">Loading caregivers…</div>
            ) : list.length ? (
                list.map((cg) => (
                <CaregiverListCard key={cg.id} cg={cg} onView={setSelectedId} />
                ))
            ) : (
                <div className="text-sm text-gray-500">No caregivers found.</div>
            )}
            </div>

            {/* right column profile */}
            <div className="space-y-6">
            {loadingProfile && <Panel><div className="text-sm text-gray-500">Loading profile…</div></Panel>}
            <ProfileHeaderCard profile={profile} />
            <LanguagesYearsService profile={profile} />
            <HistoryCerts profile={profile} />
            </div>
        </div>
        </div>
    );
}
