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
        // your auth service put "email" in the token claims per earlier code
        return json?.email || "";
    } catch {
        return "";
    }
    };

    /** ---------- Tooltip (pure Tailwind) ---------- */
    const Tooltip = ({ text, children, className = "" }) => (
    <span className={`relative inline-flex group ${className}`}>
        {children}
        <span
        className="
            pointer-events-none absolute -top-2 left-1/2 z-50
            -translate-x-1/2 -translate-y-full whitespace-nowrap
            rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white
            opacity-0 scale-95 transition
            group-hover:opacity-100 group-hover:scale-100
            group-focus-within:opacity-100 group-focus-within:scale-100
            shadow-lg
        "
        role="tooltip"
        >
        {text}
        <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
        </span>
    </span>
    );

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
                disableSave ? "bg-gray-300" : "bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-400 hover:opacity-95"
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
    const [username, setUsername] = useState("Enter UserName");
    const [email, setEmail] = useState(""); // <- email we show
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

            // username / avatar / etc
            setUsername(data?.username || "");
            setAvatarUrl(data?.avatarUrl || "");
            setTagline(data?.tagline || "Always be creative");
            setAbout(data?.about || "");

            // pick a reliable email value
            const em =
            data?.email ||
            data?.user?.email || // in case profile nests user
            emailFromJwt(); // fallback from token claims
            setEmail(em || "");

            // rest
            setLangs(
            Array.isArray(data?.languages)
                ? data.languages.map((x, i) => ({ id: i + 1, lang: x.lang, level: x.level }))
                : []
            );
            setCerts(Array.isArray(data?.certifications) ? data.certifications.map((x, i) => ({ id: i + 1, ...x })) : []);
            setWorks(Array.isArray(data?.workHistory) ? data.workHistory.map((x, i) => ({ id: i + 1, ...x })) : []);
            setRadius(data?.serviceRadius || "");
            setYears(data?.years || "");
            setSkills(Array.isArray(data?.skills) ? data.skills : []);
        } catch (e) {
            console.error(e);
            // last-resort email even if API fails
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
        skills,
        // NOTE: we typically don't allow changing email here; it's identity/credential data
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
        <div className="relative mx-auto max-w-6xl p-6">
        {/* gradient accent blobs */}
        <div className="pointer-events-none absolute -top-12 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 blur-2xl opacity-30"></div>
        <div className="pointer-events-none absolute bottom-0 left-[-4rem] h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-400 to-lime-400 blur-2xl opacity-25"></div>

        <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Profile card */}
            <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
            <div className="flex items-start gap-5">
                {/* avatar */}
                <Tooltip text="Upload new photo">
                <div className="relative">
                    <img
                    src={avatarUrl || "https://i.pravatar.cc/220?img=66"}
                    alt="avatar"
                    className="h-40 w-40 rounded-2xl object-cover shadow-md ring-1 ring-black/5"
                    />
                    <label className="absolute -right-3 -bottom-3 inline-flex cursor-pointer items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs shadow ring-1 ring-black/10">
                    <IconPlus className="w-3 h-3" />
                    Upload
                    <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                    </label>
                </div>
                </Tooltip>

                {/* content */}
                <div className="flex-1">
                {/* username row */}
                <div className="flex flex-wrap items-center gap-2">
                    {isEditingName ? (
                    <input
                        className="rounded-md border px-2 py-1 text-lg font-semibold"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={() => setIsEditingName(false)}
                        autoFocus
                    />
                    ) : (
                    <Tooltip text="Edit username">
                        <button
                        className="group inline-flex items-center gap-1 text-lg font-semibold"
                        onClick={() => setIsEditingName(true)}
                        >
                        {username}
                        <IconPen className="text-gray-400 group-hover:text-gray-700" />
                        </button>
                    </Tooltip>
                    )}
                    {/* THIS shows email, not ID */}
                    <span className="text-sm text-gray-500">{email || "—"}</span>
                </div>

                {/* location + languages */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span>🇱🇰 Sri Lanka</span>
                    <span>•</span>
                    <Tooltip text="Manage languages">
                    <button
                        onClick={() => setShowLangs(true)}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100"
                        title="Edit languages"
                    >
                        {speaksLine}
                        <IconPen className="text-blue-600" />
                    </button>
                    </Tooltip>
                </div>

                {/* actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <Tooltip text="Share profile">
                    <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm shadow ring-1 ring-gray-200 hover:bg-gray-50">
                        <IconShare /> Share
                    </button>
                    </Tooltip>
                    <Tooltip text={aboutPreview ? "Switch to edit" : "Preview about"}>
                    <button
                        onClick={() => setAboutPreview((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm shadow ring-1 ring-gray-200 hover:bg-gray-50"
                    >
                        <IconEye /> {aboutPreview ? "Edit About" : "Preview About"}
                    </button>
                    </Tooltip>
                    <Tooltip text="Save profile">
                    <button
                        onClick={saveProfile}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-400 px-5 py-2 text-sm font-medium text-white shadow hover:opacity-95"
                    >
                        Save
                    </button>
                    </Tooltip>
                </div>
                </div>
            </div>

            {/* divider */}
            <div className="my-6 h-px w-full bg-gray-100" />

            {/* About */}
            <Section title="My profile" actionLabel={!about ? "Edit details" : undefined} onAction={() => setShowAbout(true)} pill>
                {about && (
                <div>
                    {tagline && <h4 className="mb-2 text-base font-semibold tracking-tight">{tagline}</h4>}

                    {aboutPreview ? (
                    <p className="whitespace-pre-wrap leading-7 text-gray-800">{about}</p>
                    ) : (
                    <div className="rounded-xl border bg-gray-50 p-3 ring-1 ring-gray-100">
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
                        <div className="text-xs text-gray-500">Tip: press Enter twice for a new paragraph.</div>
                        <div className="flex gap-2">
                            <Tooltip text="Open in modal">
                            <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100" onClick={() => setShowAbout(true)}>
                                Open in modal
                            </button>
                            </Tooltip>
                            <Tooltip text="Finish editing">
                            <button className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800" onClick={() => setAboutPreview(true)}>
                                Done
                            </button>
                            </Tooltip>
                        </div>
                        </div>
                    </div>
                    )}

                    <div className="mt-3">
                    <Tooltip text="Edit about">
                        <button className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline" onClick={() => setShowAbout(true)}>
                        Edit <IconPen />
                        </button>
                    </Tooltip>
                    </div>
                </div>
                )}
            </Section>
            </div>

            {/* Right: two stacked cards */}
            <div className="grid gap-6">
            {/* Languages */}
            <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5">
                <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">Languages & Access</h3>
                <Tooltip text="Edit languages">
                    <button onClick={() => setShowLangs(true)} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200">
                    Edit
                    </button>
                </Tooltip>
                </div>
                <ul className="space-y-2">
                {langs.map((l) => (
                    <li key={l.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50">
                    <span className="text-gray-800">
                        {l.lang} <span className="text-gray-500">• {l.level}</span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <Tooltip text="Edit language">
                        <button className="text-sm text-blue-600 hover:underline" onClick={() => setShowLangs(true)}>
                            Manage
                        </button>
                        </Tooltip>
                    </span>
                    </li>
                ))}
                {langs.length === 0 && <li className="text-sm text-gray-500">No languages added.</li>}
                </ul>
            </div>

            {/* Certs & Work */}
            <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5">
                <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold">My bills / badges</h3>
                <Tooltip text="Filter / Add">
                    <button className="rounded-full bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200">Filter by</button>
                </Tooltip>
                </div>

                <div className="space-y-4">
                <div>
                    <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">Certifications</span>
                    <Tooltip text="Add certifications">
                        <button
                        className="rounded-full bg-gradient-to-r from-fuchsia-600 to-orange-400 px-3 py-1.5 text-xs font-medium text-white shadow hover:opacity-95"
                        onClick={() => setShowCert(true)}
                        >
                        + Add
                        </button>
                    </Tooltip>
                    </div>
                    {certs.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {certs.map((c) => (
                        <li key={c.id}>
                            <span className="font-medium">{c.name}</span> — {c.issuer} ({c.year})
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p className="text-sm text-gray-500">Add your certificates to build trust.</p>
                    )}
                </div>

                <div className="h-px w-full bg-gray-100" />

                <div>
                    <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">Working History</span>
                    <Tooltip text="Add working history">
                        <button
                        className="rounded-full bg-gradient-to-r from-fuchsia-600 to-orange-400 px-3 py-1.5 text-xs font-medium text-white shadow hover:opacity-95"
                        onClick={() => setShowWork(true)}
                        >
                        + Add
                        </button>
                    </Tooltip>
                    </div>
                    {works.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                        {works.map((w) => (
                        <li key={w.id} className="rounded-lg border px-3 py-2">
                            <div className="font-medium">
                            {w.role} — {w.company}
                            </div>
                            <div className="text-gray-500">
                            {w.from || "—"} — {w.to || "Present"}
                            </div>
                        </li>
                        ))}
                    </ul>
                    ) : (
                    <p className="text-sm text-gray-500">No work history yet.</p>
                    )}
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* Service radius / years / skills */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
            <div className="grid gap-8 md:grid-cols-2">
            <div>
                <div className="flex items-center gap-2">
                <h3 className="font-medium">Service Radius</h3>
                <Tooltip text="Edit service radius">
                    <button
                    className="text-gray-500 hover:text-gray-800"
                    onClick={() => {
                        setSrForm({ radius, years });
                        setShowSR(true);
                    }}
                    >
                    <IconPen />
                    </button>
                </Tooltip>
                </div>
                <p className="mt-2 min-h-[28px]">{radius || <span className="text-gray-400">Not set</span>}</p>
            </div>
            <div>
                <div className="flex items-center gap-2">
                <h3 className="font-medium">Years of expertise</h3>
                <Tooltip text="Edit years of expertise">
                    <button
                    className="text-gray-500 hover:text-gray-800"
                    onClick={() => {
                        setSrForm({ radius, years });
                        setShowSR(true);
                    }}
                    >
                    <IconPen />
                    </button>
                </Tooltip>
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
                <Tooltip text="Add skill">
                <button onClick={addSkill} className="rounded-md border px-4 py-2 hover:bg-gray-50">
                    Add
                </button>
                </Tooltip>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((s) => (
                <span key={s} className="rounded-full border px-3 py-1 text-sm">
                    {s}
                    <button className="ml-2 text-gray-400 hover:text-gray-700" onClick={() => setSkills(skills.filter((x) => x !== s))}>
                    ×
                    </button>
                </span>
                ))}
                {skills.length === 0 && <span className="text-sm text-gray-500">Try: Figma, Webflow, Motion Graphics</span>}
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
                <button onClick={addOrUpdateLang} className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">
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

    /** small section wrapper */
    function Section({ title, children, actionLabel, onAction, pill = false }) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5">
        <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">{title}</h3>
            {actionLabel && (
            <Tooltip text={actionLabel}>
                <button
                onClick={onAction}
                className={`inline-flex items-center gap-1 ${
                    pill
                    ? "rounded-full bg-gradient-to-r from-fuchsia-600 to-orange-400 px-4 py-1.5 text-xs font-medium text-white shadow hover:opacity-95"
                    : "rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                }`}
                >
                <IconPlus /> {actionLabel}
                </button>
            </Tooltip>
            )}
        </div>
        <div className="min-h-[96px]">{children}</div>
        </div>
    );
}
