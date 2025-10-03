// ProfileEditorEnhanced.jsx
import React, { useState, useMemo, useEffect } from "react";
import api from "../api/client"; // adjust the path if your file is elsewhere

/** ---------- tiny utils ---------- */
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
    const IconEye = (props) => (
    <svg viewBox="0 0 24 24" className={props.className || "w-4 h-4"}>
        <path
        fill="currentColor"
        d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
        />
    </svg>
    );
    const IconShare = (props) => (
    <svg viewBox="0 0 24 24" className={props.className || "w-4 h-4"}>
        <path
        fill="currentColor"
        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.02-4.11A2.99 2.99 0 1 0 15 4c0 .24.04.47.09.7L8.07 8.81A3 3 0 1 0 9 12c0-.24-.04-.47-.09-.7l7.12 4.17c.5-.46 1.16-.75 1.9-.75a3 3 0 1 0 0-6 3 3 0 0 0-2.83 2h-2.06A5 5 0 1 1 18 16.08Z"
        />
    </svg>
    );

    /** ---------- generic modal ---------- */
    const Modal = ({ title, children, onClose, onSave, saveLabel = "Save", disableSave }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-[640px] max-w-[92vw] rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose} className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50">✕</button>
        </div>
        <div className="p-6">{children}</div>
        <div className="flex items-center justify-end gap-2 px-6 pb-6">
            <button onClick={onClose} className="px-4 py-2 rounded-md border hover:bg-gray-50">Cancel</button>
            <button
            onClick={onSave}
            disabled={disableSave}
            className={`px-4 py-2 rounded-md text-white ${disableSave ? "bg-gray-300" : "bg-black hover:bg-gray-800"}`}
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
    const [username, setUsername] = useState("Thanuj");
    const [isEditingName, setIsEditingName] = useState(false);

    // languages
    const [langs, setLangs] = useState([
        { id: 1, lang: "English", level: "Fluent" },
        { id: 2, lang: "Spanish", level: "Basic" },
    ]);
    const [showLangs, setShowLangs] = useState(false);
    const [langForm, setLangForm] = useState({ lang: "", level: "Basic", editId: null });

    // about — prefilled to match the provided UI
    const [about, setAbout] = useState(
        "Hello,\nI'm a professional graphic designer and website developer, committed to providing top-notch creative solutions! With expertise in industry-leading software such as Adobe After Effects, Illustrator, Premiere Pro, XD, Figma, Framer, Webflow, and Wix, I ensure visually appealing and functional designs tailored to your needs.\n\nAs a full-time freelancer on Fiverr, my focus is on delivering high-quality results that exceed client expectations. Whether it's crafting stunning graphics, designing user-friendly websites, or creating engaging motion content, I strive to bring your vision to life."
    );
    const [tagline, setTagline] = useState("Always be creative");
    const [showAbout, setShowAbout] = useState(false);
    const [aboutPreview, setAboutPreview] = useState(true);

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

    // skills
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState("");

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
            setUsername(data.username || ""); 
            setAvatarUrl(data.avatarUrl || "");
            setTagline(data.tagline || "Always be creative");
            setAbout(data.about || "");
            setLangs(Array.isArray(data.languages) ? data.languages.map((x, i) => ({ id: i + 1, lang: x.lang, level: x.level })) : []);
            setCerts(Array.isArray(data.certifications) ? data.certifications.map((x, i) => ({ id: i + 1, ...x })) : []);
            setWorks(Array.isArray(data.workHistory) ? data.workHistory.map((x, i) => ({ id: i + 1, ...x })) : []);
            setRadius(data.serviceRadius || "");
            setYears(data.years || "");
            setSkills(Array.isArray(data.skills) ? data.skills : []);
        } catch (e) {
            console.error(e);
        }
        })();
        return () => { ignore = true; };
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
        skills,
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

    const addSkill = () => {
        const v = skillInput.trim();
        if (!v) return;
        if (!skills.includes(v)) setSkills([...skills, v]);
        setSkillInput("");
    };

    /** ---------- UI ---------- */
    return (
        <div className="mx-auto max-w-5xl p-6 space-y-6">
        {/* top banner (visual only) */}
        <div className="h-28 w-full rounded-xl bg-gradient-to-r from-[#2f77ff] to-[#6cc3ff]"></div>

        {/* profile card */}
        <div className="-mt-14 rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
            {/* avatar */}
            <div className="relative">
                <img
                src={avatarUrl || "https://i.pravatar.cc/140?img=66"}
                alt="avatar"
                className="h-24 w-24 rounded-full object-cover ring-2 ring-white shadow"
                />
                <label className="absolute -right-2 -bottom-2 inline-flex cursor-pointer items-center gap-1 rounded-full bg-white px-2 py-1 text-xs shadow">
                <IconPlus className="w-3 h-3" />
                Upload
                <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                </label>
            </div>

            {/* name + langs */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                {isEditingName ? (
                    <input
                    className="rounded-md border px-2 py-1 text-lg font-semibold"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    autoFocus
                    />
                ) : (
                    <button
                    className="group inline-flex items-center gap-1 text-lg font-semibold"
                    onClick={() => setIsEditingName(true)}
                    >
                    {username}
                    <IconPen className="text-gray-400 group-hover:text-gray-700" />
                    </button>
                )}
                <span className="text-sm text-gray-500">@thanuj_motion</span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span>🇱🇰 Sri Lanka</span>
                <span>•</span>
                <button
                    onClick={() => setShowLangs(true)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                    title="Edit languages"
                >
                    {speaksLine}
                    <IconPen className="text-gray-400" />
                </button>
                </div>
            </div>

            {/* share / preview / save buttons */}
            <div className="hidden sm:flex items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
                <IconShare /> Share
                </button>
                <button
                onClick={() => setAboutPreview((v) => !v)}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                <IconEye /> {aboutPreview ? "Edit About" : "Preview About"}
                </button>
                <button
                onClick={saveProfile}
                className="inline-flex items-center gap-2 rounded-md bg-black text-white px-3 py-2 text-sm hover:bg-gray-800"
                >
                Save Profile
                </button>
            </div>
            </div>
        </div>

        {/* about */}
        <Section
            title="About"
            actionLabel={!about ? "Edit details" : undefined}
            onAction={() => setShowAbout(true)}
        >
            {about && (
            <div>
                {tagline && (
                <h4 className="mb-2 text-base font-semibold tracking-tight">{tagline}</h4>
                )}

                {aboutPreview ? (
                <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap leading-7">{about}</p>
                </div>
                ) : (
                <div className="rounded-lg border bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
                    <span>
                        {aboutWordCount} words • {about.length}/{aboutCharLimit} chars
                    </span>
                    <span>Max {aboutCharLimit}</span>
                    </div>
                    <textarea
                    className="h-48 w-full rounded-md border bg-white px-3 py-2"
                    maxLength={aboutCharLimit}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    />
                    <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        Tip: press Enter twice for a new paragraph.
                    </div>
                    <div className="flex gap-2">
                        <button
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100"
                        onClick={() => setShowAbout(true)}
                        >
                        Open in modal
                        </button>
                        <button
                        className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800"
                        onClick={() => setAboutPreview(true)}
                        >
                        Done
                        </button>
                    </div>
                    </div>
                </div>
                )}

                <div className="mt-3">
                <button
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    onClick={() => setShowAbout(true)}
                >
                    Edit <IconPen />
                </button>
                </div>
            </div>
            )}
        </Section>

        {/* certifications */}
        <Section title="Certifications" actionLabel="+ Add certifications" onAction={() => setShowCert(true)}>
            {certs.length > 0 && (
            <ul className="list-disc pl-5 space-y-1">
                {certs.map((c) => (
                <li key={c.id}>
                    <span className="font-medium">{c.name}</span> — {c.issuer} ({c.year})
                </li>
                ))}
            </ul>
            )}
            {certs.length === 0 && (
            <p className="text-sm text-gray-500">Add your certificates and awards to build trust.</p>
            )}
        </Section>

        {/* work history */}
        <Section title="Working History" actionLabel="+ Add Working History" onAction={() => setShowWork(true)}>
            {works.length > 0 && (
            <ul className="space-y-2">
                {works.map((w) => (
                <li key={w.id} className="rounded border p-3">
                    <div className="font-medium">
                    {w.role} — {w.company}
                    </div>
                    <div className="text-sm text-gray-500">{w.from || "—"} — {w.to || "Present"}</div>
                </li>
                ))}
            </ul>
            )}
            {works.length === 0 && <p className="text-sm text-gray-500">No work history yet.</p>}
        </Section>

        {/* service radius & years & skills */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="grid gap-8 md:grid-cols-2">
            <div>
                <div className="flex items-center gap-2">
                <h3 className="font-medium">Service Radius</h3>
                <button
                    className="text-gray-500 hover:text-gray-800"
                    onClick={() => {
                    setSrForm({ radius, years });
                    setShowSR(true);
                    }}
                >
                    <IconPen />
                </button>
                </div>
                <p className="mt-2 min-h-[28px]">{radius || <span className="text-gray-400">Not set</span>}</p>
            </div>
            <div>
                <div className="flex items-center gap-2">
                <h3 className="font-medium">Years of expertise</h3>
                <button
                    className="text-gray-500 hover:text-gray-800"
                    onClick={() => {
                    setSrForm({ radius, years });
                    setShowSR(true);
                    }}
                >
                    <IconPen />
                </button>
                </div>
                <p className="mt-2 min-h-[28px]">{years || <span className="text-gray-400">Not set</span>}</p>
            </div>
            </div>

            <div className="mt-8">
            <h3 className="font-medium">Skills</h3>
            <div className="mt-2 flex gap-2">
                <input
                className="w-full rounded-md border px-3 py-2"
                placeholder="Add a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <button onClick={addSkill} className="rounded-md border px-4 py-2 hover:bg-gray-50">
                Add
                </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((s) => (
                <span key={s} className="rounded-full border px-3 py-1 text-sm">
                    {s}
                    <button
                    className="ml-2 text-gray-400 hover:text-gray-700"
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                    >
                    ×
                    </button>
                </span>
                ))}
                {skills.length === 0 && (
                <span className="text-sm text-gray-500">Try: Figma, Webflow, Motion Graphics</span>
                )}
            </div>
            </div>
        </div>

        {/* --------- MODALS --------- */}

        {/* Languages modal */}
        {showLangs && (
            <Modal
            title="Languages"
            onClose={() => {
                setShowLangs(false);
                setLangForm({ lang: "", level: "Basic", editId: null });
            }}
            onSave={() => setShowLangs(false)}
            >
            {/* add form */}
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
                <button onClick={addOrUpdateLang} className="rounded-md bg-black px-4 py-2 text-white">
                {langForm.editId ? "Update" : "Add"}
                </button>
            </div>

            {/* list */}
            <div className="mt-6 divide-y rounded-md border">
                {langs.map((l) => (
                <div key={l.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                    <div className="font-medium">{l.lang}</div>
                    <div className="text-sm text-gray-500">{l.level}</div>
                    </div>
                    <div className="flex items-center gap-2">
                    <button
                        className="text-sm text-blue-600 hover:underline"
                        onClick={() => setLangForm({ lang: l.lang, level: l.level, editId: l.id })}
                    >
                        Edit
                    </button>
                    <button
                        className="text-sm text-red-600 hover:underline"
                        onClick={() => setLangs(langs.filter((x) => x.id !== l.id))}
                    >
                        Remove
                    </button>
                    </div>
                </div>
                ))}
                {langs.length === 0 && (
                <div className="px-4 py-6 text-sm text-gray-500">No languages added.</div>
                )}
            </div>
            </Modal>
        )}

        {/* About modal */}
        {showAbout && (
            <Modal
            title="About"
            onClose={() => setShowAbout(false)}
            onSave={saveAbout}
            disableSave={!about.trim()}
            >
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
                <span>{about.length}/{aboutCharLimit} characters</span>
            </div>
            </Modal>
        )}

        {/* Certification modal */}
        {showCert && (
            <Modal title="Certifications" onClose={() => setShowCert(false)} onSave={addCert} saveLabel="Add" disableSave={!certForm.name || !certForm.issuer || !certForm.year}>
            <div className="grid gap-4">
                <input
                className="rounded-md border px-3 py-2"
                placeholder="Certificate or award name"
                value={certForm.name}
                onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                />
                <input
                className="rounded-md border px-3 py-2"
                placeholder="Certified or awarded by (Ex. Adobe)"
                value={certForm.issuer}
                onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                />
                <select
                className="rounded-md border px-3 py-2"
                value={certForm.year}
                onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                >
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

        {/* Work modal */}
        {showWork && (
            <Modal title="Add Working History" onClose={() => setShowWork(false)} onSave={addWork} saveLabel="Add" disableSave={!workForm.role || !workForm.company}>
            <div className="grid gap-4 md:grid-cols-2">
                <input
                className="rounded-md border px-3 py-2"
                placeholder="Role / Title"
                value={workForm.role}
                onChange={(e) => setWorkForm({ ...workForm, role: e.target.value })}
                />
                <input
                className="rounded-md border px-3 py-2"
                placeholder="Company / Client"
                value={workForm.company}
                onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })}
                />
                <input
                className="rounded-md border px-3 py-2"
                placeholder="From (e.g., 2022)"
                value={workForm.from}
                onChange={(e) => setWorkForm({ ...workForm, from: e.target.value })}
                />
                <input
                className="rounded-md border px-3 py-2"
                placeholder="To (e.g., 2024 / Present)"
                value={workForm.to}
                onChange={(e) => setWorkForm({ ...workForm, to: e.target.value })}
                />
            </div>
            </Modal>
        )}

        {/* Service radius & years modal */}
        {showSR && (
            <Modal title="Service Radius & Years of Expertise" onClose={() => setShowSR(false)} onSave={saveSR} disableSave={!srForm.radius && !srForm.years}>
            <div className="grid gap-4">
                <input
                className="rounded-md border px-3 py-2"
                placeholder="e.g., 25 km within Colombo"
                value={srForm.radius}
                onChange={(e) => setSrForm({ ...srForm, radius: e.target.value })}
                />
                <input
                className="rounded-md border px-3 py-2"
                placeholder="e.g., 5 years"
                value={srForm.years}
                onChange={(e) => setSrForm({ ...srForm, years: e.target.value })}
                />
            </div>
            </Modal>
        )}
        </div>
    );
    }

    /** small section wrapper */
    function Section({ title, children, actionLabel, onAction }) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium">{title}</h3>
            {actionLabel && (
            <button
                onClick={onAction}
                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
                <IconPlus /> {actionLabel}
            </button>
            )}
        </div>
        <div className="min-h-[96px]">{children}</div>
        </div>
    );
}
