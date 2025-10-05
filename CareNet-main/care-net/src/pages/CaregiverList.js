// src/CareSeekerUI.jsx
import React, { useEffect, useState } from "react";
import api from "../api/client"; // adjust path if needed

/* ---------- tiny helpers ---------- */
const Badge = ({ children, tone = "blue" }) => {
    const tones = {
        blue: "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium",
        gray: "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium",
        green: "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium",
    };
    return (
        <span className={tones[tone]}>
            {children}
        </span>
    );
};

const Tooltip = ({ text, children, className = "" }) => (
    <div className={`relative inline-flex group ${className}`}>
        {children}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            {text}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
    </div>
);

/* ---------- left list card ---------- */
const CaregiverListCard = ({ cg, onView, isSelected }) => {
    const [isHovered, setIsHovered] = useState(false);
    const tags = Array.isArray(cg.skills) ? [...cg.skills].slice(0, 2) : [];
    const careTypes = Array.isArray(cg.careTypes) ? cg.careTypes : [];

    return (
        <div 
            className={`relative rounded-lg border-2 transition-all duration-200 p-4 font-poppins cursor-pointer ${
                isSelected 
                    ? "border-blue-500 bg-blue-50 shadow-md" 
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg"
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onView(cg.id)}
        >
            {/* Hover Popup */}
            {isHovered && (
                <div className="absolute left-full top-0 ml-3 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-4">
                    <div className="flex items-start gap-3 mb-3">
                        <img
                            src={cg.avatarUrl || "https://i.pravatar.cc/60?img=12"}
                            alt="Caregiver"
                            className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                            <div className="font-semibold text-gray-900">{cg.username || "Caregiver"}</div>
                            <div className="text-sm text-gray-600 mt-1">{cg.tagline || "Professional caregiver"}</div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-3">
                        {cg.about?.substring(0, 120) || "No description available..."}
                        {cg.about?.length > 120 && "..."}
                    </div>
                    <div className="flex gap-2 mt-3">
                        {careTypes.slice(0, 2).map((type, index) => (
                            <Badge key={index} tone="blue">{type}</Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <img
                            src={cg.avatarUrl || "https://i.pravatar.cc/50?img=12"}
                            alt="Caregiver"
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{cg.username || "Caregiver Name"}</h3>
                            <p className="text-gray-600 text-sm">{cg.tagline || "Description"}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                        {careTypes.slice(0, 3).map((type, index) => (
                            <Badge key={index} tone="green">{type}</Badge>
                        ))}
                    </div>
                </div>
                
                <Tooltip text="View full profile">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(cg.id);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        View
                    </button>
                </Tooltip>
            </div>
        </div>
    );
};

/* ---------- right profile ---------- */
const ProfileHeaderCard = ({ profile }) => {
    if (!profile) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-gray-500 text-center py-8">Select a caregiver to view details</div>
            </div>
        );
    }

    const langs = Array.isArray(profile.languages) ? profile.languages : [];
    const skills = Array.isArray(profile.skills) ? profile.skills : [];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <img
                            src={profile.avatarUrl || "https://i.pravatar.cc/80?img=66"}
                            className="h-16 w-16 rounded-full object-cover border-4 border-white"
                            alt="Caregiver"
                        />
                        <div>
                            <h1 className="text-2xl font-bold">{profile.username || "Caregiver"}</h1>
                            <div className="flex items-center gap-2 mt-1 text-blue-100">
                                <span>⭐ 4.9 (21 reviews)</span>
                                <span>•</span>
                                <span>🇱🇰 Sri Lanka</span>
                            </div>
                            <div className="mt-2 text-blue-100">
                                Speaks: {langs.map(l => l.lang).join(", ") || "English"}
                            </div>
                        </div>
                    </div>
                    <Tooltip text="Provide feedback for this caregiver">
                        <a href='/careseeker/feedback'>
                            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                                Give Feedback
                            </button>
                        </a>
                    </Tooltip>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <h3 className="font-semibold text-lg mb-3">About me</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {profile.about || "No description provided."}
                        </p>

                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {skills.slice(0, 6).map((skill, index) => (
                                    <Badge key={index} tone="gray">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div>
                                <div className="font-semibold">{profile.username || "Caregiver"}</div>
                                <div className="text-sm text-gray-600">Online • 09:21 AM local time</div>
                            </div>
                        </div>
                        <Tooltip text="Send a message to this caregiver">
                            <button className="w-full py-2 px-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium mb-2 text-1xl">
                                Contact me
                            </button>
                        </Tooltip>
                        <div className="text-center text-sm text-gray-500">
                            Average response time: 1 hour
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LanguagesYearsService = ({ profile }) => {
    const langs = Array.isArray(profile?.languages) ? profile.languages : [];
    const years = profile?.years || "Not specified";
    const radius = profile?.serviceRadius || "Not specified";
    const serviceTypes = Array.isArray(profile?.careTypes) ? profile.careTypes
                        : Array.isArray(profile?.skills) ? profile.skills
                        : [];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <Tooltip text="Languages spoken by the caregiver">
                        <h3 className="font-semibold mb-3 text-gray-900">Languages</h3>
                    </Tooltip>
                    <div className="space-y-2">
                        {langs.length ? langs.map((l, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <Badge tone="blue">{l.lang}</Badge>
                                <span className="text-sm text-gray-600">{l.level}</span>
                            </div>
                        )) : <span className="text-gray-500">Not specified</span>}
                    </div>
                </div>

                <div>
                    <Tooltip text="Years of professional experience">
                        <h3 className="font-semibold mb-3 text-gray-900">Years of expertise</h3>
                    </Tooltip>
                    <div className="text-lg font-semibold text-blue-600">{years}</div>
                </div>

                <div>
                    <Tooltip text="Service coverage area">
                        <h3 className="font-semibold mb-3 text-gray-900">Service Radius</h3>
                    </Tooltip>
                    <div className="text-lg font-semibold text-gray-800">{radius}</div>
                </div>

                <div>
                    <Tooltip text="Types of care services provided">
                        <h3 className="font-semibold mb-3 text-gray-900">Service Types</h3>
                    </Tooltip>
                    <div className="flex flex-wrap gap-2">
                        {serviceTypes.length ? serviceTypes.slice(0, 3).map((type, index) => (
                            <Badge key={index} tone="green">{type}</Badge>
                        )) : <span className="text-gray-500">Not specified</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const HistoryCerts = ({ profile }) => {
    const work = Array.isArray(profile?.workHistory) ? profile.workHistory : [];
    const certs = Array.isArray(profile?.certifications) ? profile.certifications : [];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Tooltip text="Professional work experience">
                        <h3 className="font-semibold mb-4 text-gray-900">Working History</h3>
                    </Tooltip>
                    {work.length ? (
                        <div className="space-y-4">
                            {work.map((w, i) => (
                                <div key={i} className="border-l-4 border-blue-500 pl-4 py-1">
                                    <div className="font-semibold text-gray-900">{w.role || "Role"}</div>
                                    <div className="text-gray-600">{w.company || "Company"}</div>
                                    <div className="text-sm text-gray-500">
                                        {w.from || "Start"} – {w.to || "Present"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-4">No work history available</div>
                    )}
                </div>

                <div>
                    <Tooltip text="Professional certifications and qualifications">
                        <h3 className="font-semibold mb-4 text-gray-900">Certifications</h3>
                    </Tooltip>
                    {certs.length ? (
                        <div className="space-y-4">
                            {certs.map((c, i) => (
                                <div key={i} className="border-l-4 border-green-500 pl-4 py-1">
                                    <div className="font-semibold text-gray-900">{c.name || "Certification"}</div>
                                    <div className="text-gray-600">{c.issuer || "Issuer"}</div>
                                    <div className="text-sm text-gray-500">{c.year || "Year"}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-4">No certifications available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ---------- master layout ---------- */
export default function CareSeekerUI() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Load all caregivers
    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const { data } = await api.get("/api/caregiver/profile/public");
                if (ignore) return;
                setList(Array.isArray(data) ? data : []);
                // Auto-select the first caregiver
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Caregivers</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left column - Caregiver list */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="text-gray-500">Loading caregivers...</div>
                            </div>
                        ) : list.length ? (
                            list.map((cg) => (
                                <CaregiverListCard 
                                    key={cg.id} 
                                    cg={cg} 
                                    onView={setSelectedId}
                                    isSelected={selectedId === cg.id}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No caregivers found in your area.
                            </div>
                        )}
                    </div>

                    {/* Right column - Profile details */}
                    <div className="space-y-6">
                        {loadingProfile && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-center items-center py-8">
                                    <div className="text-gray-500">Loading profile...</div>
                                </div>
                            </div>
                        )}
                        <ProfileHeaderCard profile={profile} />
                        <LanguagesYearsService profile={profile} />
                        <HistoryCerts profile={profile} />
                    </div>
                </div>
            </div>
        </div>
    );
}