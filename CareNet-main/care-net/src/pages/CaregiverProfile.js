// ProfileEditorEnhanced.jsx
import React, { useState, useMemo, useEffect } from "react";
import api from "../api/client"; // adjust the path if your file is elsewhere

/** ---------- tiny helpers ---------- */
const getToken = () =>
    (typeof localStorage !== "undefined" && localStorage.getItem("token")) ||
    (typeof sessionStorage !== "undefined" && sessionStorage.getItem("token")) ||
    null;

const emailFromJwt = () => {
    try {
        const t = getToken();
        if (!t) return "";
        const [, payload] = t.split(".");
        const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return json?.email || "";
    } catch {
        return "";
    }
};

/** ---------- icons ---------- */
const IconPen = (props) => (
    <svg viewBox="0 0 24 24" className={props.className || "w-4 h-4"}>
        <path
            fill="currentColor"
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm14.71-9.21a1.003 1.003 0 0 0 0-1.42l-1.59-1.59a1.003 1.003 0 0 0-1.42 0l-1.34 1.34 3.75 3.75 1.6-1.08Z"
        />
    </svg>
);

const IconPlus = (props) => (
    <svg viewBox="0 0 24 24" className={props.className || "w-4 h-4"}>
        <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6Z" />
    </svg>
);

/** ---------- generic modal ---------- */
const Modal = ({ title, children, onClose, onSave, saveLabel = "Save", disableSave }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-[640px] max-w-[92vw] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button onClick={onClose} className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50">
                    ✕
                </button>
            </div>
            <div className="p-6">{children}</div>
            <div className="flex items-center justify-end gap-2 px-6 pb-6">
                <button onClick={onClose} className="px-4 py-2 rounded-md border hover:bg-gray-50">
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={disableSave}
                    className={`px-4 py-2 rounded-md text-white ${
                        disableSave ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {saveLabel}
                </button>
            </div>
        </div>
    </div>
);

/** ---------- main page ---------- */
export default function ProfileEditor() {
    // header info
    const [avatarUrl, setAvatarUrl] = useState("");
    const [username, setUsername] = useState("thanuj_motion");
    const [email, setEmail] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);

    // languages
    const [langs, setLangs] = useState([
        { id: 1, lang: "English", level: "Fluent" },
        { id: 2, lang: "Spanish", level: "Basic" },
    ]);
    const [showLangs, setShowLangs] = useState(false);
    const [langForm, setLangForm] = useState({ lang: "", level: "Basic", editId: null });

    // about
    const [about, setAbout] = useState(
        "Hello,\nI'm a professional graphic designer and website developer, committed to providing top-notch creative solutions! With expertise in industry-leading software such as Adobe After Effects, Illustrator, Premiere Pro, XD, Figma, Framer, Webflow, and Wix, I ensure visually appealing and functional designs tailored to your needs.\n\nAs a full-time freelancer on Fiverr, my focus is on delivering high-quality results that exceed client expectations. Whether it's crafting stunning graphics, designing user-friendly websites, or creating engaging motion content, I strive to bring your vision to life."
    );
    const [tagline, setTagline] = useState("Always be creative");
    const [showAbout, setShowAbout] = useState(false);

    // certifications
    const [certs, setCerts] = useState([]);
    const [showCert, setShowCert] = useState(false);
    const [certForm, setCertForm] = useState({ name: "", issuer: "", year: "" });

    // work history
    const [works, setWorks] = useState([]);
    const [showWork, setShowWork] = useState(false);
    const [workForm, setWorkForm] = useState({ role: "", company: "", from: "", to: "" });

    // service radius / years
    const [showSR, setShowSR] = useState(false);
    const [srForm, setSrForm] = useState({ radius: "", years: "" });
    const [radius, setRadius] = useState("");
    const [years, setYears] = useState("");

    const speaksLine = useMemo(
        () => (langs.length ? `Speaks ${langs.map((l) => l.lang).join(", ")}` : "Add languages"),
        [langs]
    );

    const aboutCharLimit = 600;
    const aboutWordCount = useMemo(() => (about?.trim() ? about.trim().split(/\s+/).length : 0), [about]);

    /** ---------- LOAD from API ---------- */
    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const { data } = await api.get("/api/caregiver/profile/me");
                if (ignore) return;

                setUsername(data?.username || "");
                setAvatarUrl(data?.avatarUrl || "");
                setTagline(data?.tagline || "Always be creative");
                setAbout(data?.about || "");

                const em = data?.email || data?.user?.email || emailFromJwt();
                setEmail(em || "");

                setLangs(
                    Array.isArray(data?.languages)
                        ? data.languages.map((x, i) => ({ id: i + 1, lang: x.lang, level: x.level }))
                        : []
                );
                setCerts(Array.isArray(data?.certifications) ? data.certifications.map((x, i) => ({ id: i + 1, ...x })) : []);
                setWorks(Array.isArray(data?.workHistory) ? data.workHistory.map((x, i) => ({ id: i + 1, ...x })) : []);
                setRadius(data?.serviceRadius || "");
                setYears(data?.years || "");
            } catch (e) {
                console.error(e);
                const em = emailFromJwt();
                if (em) setEmail(em);
            }
        })();
        return () => {
            ignore = true;
        };
    }, []);

    /** ---------- SAVE to API ---------- */
    const saveProfile = async () => {
        const payload = {
            username,
            avatarUrl,
            tagline,
            about,
            languages: langs.map(({ lang, level }) => ({ lang, level })),
            certifications: certs.map(({ name, issuer, year }) => ({ name, issuer, year })),
            workHistory: works.map(({ role, company, from, to }) => ({ role, company, from, to })),
            serviceRadius: radius,
            years,
        };
        try {
            await api.put("/api/caregiver/profile/me", payload);
            alert("Profile saved ✅");
        } catch (e) {
            console.error(e);
            alert("Save failed");
        }
    };

    /** ---------- handlers ---------- */
    const handleAvatar = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        setAvatarUrl(url);
    };

    const addOrUpdateLang = () => {
        if (!langForm.lang.trim()) return;
        if (langForm.editId) {
            setLangs(langs.map((l) => (l.id === langForm.editId ? { ...l, ...langForm } : l)));
        } else {
            setLangs([...langs, { id: Date.now(), lang: langForm.lang.trim(), level: langForm.level }]);
        }
        setLangForm({ lang: "", level: "Basic", editId: null });
    };

    const addCert = () => {
        if (!certForm.name || !certForm.issuer || !certForm.year) return;
        setCerts([...certs, { id: Date.now(), ...certForm }]);
        setCertForm({ name: "", issuer: "", year: "" });
        setShowCert(false);
    };

    const addWork = () => {
        if (!workForm.role || !workForm.company) return;
        setWorks([...works, { id: Date.now(), ...workForm }]);
        setWorkForm({ role: "", company: "", from: "", to: "" });
        setShowWork(false);
    };

    const saveAbout = () => setShowAbout(false);

    const saveSR = () => {
        setRadius(srForm.radius);
        setYears(srForm.years);
        setShowSR(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">CareNet</h1>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
                        <a href="#" className="text-gray-700 hover:text-blue-600">Feedbacks</a>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={avatarUrl || "https://i.pravatar.cc/220?img=66"}
                                alt="avatar"
                                className="h-24 w-24 rounded-2xl object-cover shadow-md ring-1 ring-black/5"
                            />
                            <label className="absolute -bottom-2 -right-2 inline-flex cursor-pointer items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs shadow ring-1 ring-black/10">
                                <IconPlus className="w-3 h-3" />
                                <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                            </label>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                {isEditingName ? (
                                    <input
                                        className="rounded-md border px-3 py-1 text-xl font-semibold"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onBlur={() => setIsEditingName(false)}
                                        autoFocus
                                    />
                                ) : (
                                    <button
                                        className="group inline-flex items-center gap-2 text-xl font-semibold hover:bg-gray-50 px-2 py-1 rounded"
                                        onClick={() => setIsEditingName(true)}
                                    >
                                        {username}
                                        <IconPen className="text-gray-400 group-hover:text-gray-700" />
                                    </button>
                                )}
                                <span className="text-gray-500">@{username}</span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-gray-600 mb-4">
                                <span>🇱🇰 Sri Lanka</span>
                                <span>•</span>
                                <span>{speaksLine}</span>
                            </div>

                            <div className="flex gap-3">
                                <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Share Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* About Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">About</h3>
                                <button 
                                    onClick={() => setShowAbout(true)}
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    <IconPlus className="w-4 h-4" />
                                    Edit details
                                </button>
                            </div>
                            <div className="text-gray-700 leading-relaxed">
                                {about ? (
                                    <p className="whitespace-pre-wrap">{about}</p>
                                ) : (
                                    <p className="text-gray-500">No about information added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Certifications Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Certifications</h3>
                                <button 
                                    onClick={() => setShowCert(true)}
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    <IconPlus className="w-4 h-4" />
                                    Add certifications
                                </button>
                            </div>
                            {certs.length > 0 ? (
                                <ul className="space-y-3">
                                    {certs.map((cert) => (
                                        <li key={cert.id} className="border-l-4 border-blue-500 pl-4 py-1">
                                            <div className="font-medium">{cert.name}</div>
                                            <div className="text-sm text-gray-600">{cert.issuer} • {cert.year}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No certifications added yet.</p>
                            )}
                        </div>

                        {/* Working History Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Working History</h3>
                                <button 
                                    onClick={() => setShowWork(true)}
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    <IconPlus className="w-4 h-4" />
                                    Add Working History
                                </button>
                            </div>
                            {works.length > 0 ? (
                                <ul className="space-y-4">
                                    {works.map((work) => (
                                        <li key={work.id} className="border rounded-lg p-4">
                                            <div className="font-medium text-lg">{work.role}</div>
                                            <div className="text-gray-600 mb-2">{work.company}</div>
                                            <div className="text-sm text-gray-500">
                                                {work.from} - {work.to || 'Present'}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">No work history added yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Service Radius & Years */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-3">Service Radius</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-700">{radius || "Not set"}</span>
                                        <button 
                                            onClick={() => {
                                                setSrForm({ radius, years });
                                                setShowSR(true);
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <IconPen className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-3">Years of expertise</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-700">{years || "Not set"}</span>
                                        <button 
                                            onClick={() => {
                                                setSrForm({ radius, years });
                                                setShowSR(true);
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <IconPen className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Languages Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Languages</h3>
                                <button 
                                    onClick={() => setShowLangs(true)}
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                >
                                    <IconPen className="w-4 h-4" />
                                    Edit
                                </button>
                            </div>
                            {langs.length > 0 ? (
                                <div className="space-y-2">
                                    {langs.map((lang) => (
                                        <div key={lang.id} className="flex items-center justify-between py-2">
                                            <span className="text-gray-700">
                                                {lang.lang} <span className="text-gray-500">({lang.level})</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No languages added yet.</p>
                            )}
                        </div>

                        {/* Save Button */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button
                                onClick={saveProfile}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Save Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --------- MODALS --------- */}
            {showLangs && (
                <Modal
                    title="Languages"
                    onClose={() => {
                        setShowLangs(false);
                        setLangForm({ lang: "", level: "Basic", editId: null });
                    }}
                    onSave={() => setShowLangs(false)}
                >
                    <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium">Add language</label>
                            <input
                                className="mt-1 w-full rounded-md border px-3 py-2"
                                placeholder="e.g., English"
                                value={langForm.lang}
                                onChange={(e) => setLangForm({ ...langForm, lang: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Proficiency level</label>
                            <select
                                className="mt-1 w-full rounded-md border px-3 py-2"
                                value={langForm.level}
                                onChange={(e) => setLangForm({ ...langForm, level: e.target.value })}
                            >
                                {["Basic", "Conversational", "Fluent", "Native"].map((v) => (
                                    <option key={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button onClick={addOrUpdateLang} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            {langForm.editId ? "Update" : "Add"}
                        </button>
                    </div>

                    <div className="mt-6 divide-y rounded-md border">
                        {langs.map((l) => (
                            <div key={l.id} className="flex items-center justify-between px-4 py-3">
                                <div>
                                    <div className="font-medium">{l.lang}</div>
                                    <div className="text-sm text-gray-500">{l.level}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="text-sm text-blue-600 hover:underline" onClick={() => setLangForm({ lang: l.lang, level: l.level, editId: l.id })}>
                                        Edit
                                    </button>
                                    <button className="text-sm text-red-600 hover:underline" onClick={() => setLangs(langs.filter((x) => x.id !== l.id))}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        {langs.length === 0 && <div className="px-4 py-6 text-sm text-gray-500">No languages added.</div>}
                    </div>
                </Modal>
            )}

            {showAbout && (
                <Modal title="About" onClose={() => setShowAbout(false)} onSave={saveAbout} disableSave={!about.trim()}>
                    <label className="text-sm font-medium">Tagline</label>
                    <input
                        className="mt-1 mb-4 w-full rounded-md border px-3 py-2"
                        maxLength={70}
                        placeholder="Always be creative"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                    />
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        className="mt-1 h-48 w-full rounded-md border px-3 py-2"
                        maxLength={aboutCharLimit}
                        placeholder="Write about yourself (max 600 chars)..."
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                    />
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                        <span>{aboutWordCount} words</span>
                        <span>
                            {about.length}/{aboutCharLimit} characters
                        </span>
                    </div>
                </Modal>
            )}

            {showCert && (
                <Modal title="Certifications" onClose={() => setShowCert(false)} onSave={addCert} saveLabel="Add" disableSave={!certForm.name || !certForm.issuer || !certForm.year}>
                    <div className="grid gap-4">
                        <input className="rounded-md border px-3 py-2" placeholder="Certificate or award name" value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} />
                        <input className="rounded-md border px-3 py-2" placeholder="Certified or awarded by (Ex. Adobe)" value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} />
                        <select className="rounded-md border px-3 py-2" value={certForm.year} onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}>
                            <option value="">Year</option>
                            {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </Modal>
            )}

            {showWork && (
                <Modal title="Add Working History" onClose={() => setShowWork(false)} onSave={addWork} saveLabel="Add" disableSave={!workForm.role || !workForm.company}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <input className="rounded-md border px-3 py-2" placeholder="Role / Title" value={workForm.role} onChange={(e) => setWorkForm({ ...workForm, role: e.target.value })} />
                        <input className="rounded-md border px-3 py-2" placeholder="Company / Client" value={workForm.company} onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })} />
                        <input className="rounded-md border px-3 py-2" placeholder="From (e.g., 2022)" value={workForm.from} onChange={(e) => setWorkForm({ ...workForm, from: e.target.value })} />
                        <input className="rounded-md border px-3 py-2" placeholder="To (e.g., 2024 / Present)" value={workForm.to} onChange={(e) => setWorkForm({ ...workForm, to: e.target.value })} />
                    </div>
                </Modal>
            )}

            {showSR && (
                <Modal title="Service Radius & Years of Expertise" onClose={() => setShowSR(false)} onSave={saveSR} disableSave={!srForm.radius && !srForm.years}>
                    <div className="grid gap-4">
                        <input className="rounded-md border px-3 py-2" placeholder="e.g., 25 km within Colombo" value={srForm.radius} onChange={(e) => setSrForm({ ...srForm, radius: e.target.value })} />
                        <input className="rounded-md border px-3 py-2" placeholder="e.g., 5 years" value={srForm.years} onChange={(e) => setSrForm({ ...srForm, years: e.target.value })} />
                    </div>
                </Modal>
            )}
        </div>
    );
}