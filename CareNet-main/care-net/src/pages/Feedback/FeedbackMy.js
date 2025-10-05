// [file name]: MyFeedback.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

export default function MyFeedback() {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        notes: "",
        quality: 0,
        support: 0,
        useful: [],
        missing: []
    });

    const FEATURES_USEFUL = [
        "Customizable dashboards",
        "Real-time analytics",
        "Integration with existing systems",
    ];
    
    const FEATURES_MISSING = [
        "An offline mode for remote usage",
        "More detailed reporting options",
        "Enhanced mobile app functionality",
    ];

    useEffect(() => {
        fetchMyFeedback();
    }, [user?.email]);

    const fetchMyFeedback = async () => {
        if (!user?.email) return;
        
        try {
            setLoading(true);
            const { data } = await api.get(`/api/feedback/my-feedback?email=${encodeURIComponent(user.email)}`);
            setFeedbacks(data);
        } catch (err) {
            console.error("Failed to fetch feedback:", err);
            setError("Failed to load your feedback");
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (feedback) => {
        setEditingId(feedback.id);
        setEditForm({
            notes: feedback.notes || "",
            quality: feedback.quality || 0,
            support: feedback.support || 0,
            useful: feedback.useful || [],
            missing: feedback.missing || []
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({
            notes: "",
            quality: 0,
            support: 0,
            useful: [],
            missing: []
        });
    };

    const updateFeedback = async (feedbackId) => {
        try {
            await api.put(`/api/feedback/${feedbackId}?email=${encodeURIComponent(user.email)}`, editForm);
            await fetchMyFeedback(); // Refresh the list
            setEditingId(null);
            setError("");
        } catch (err) {
            console.error("Failed to update feedback:", err);
            setError("Failed to update feedback");
        }
    };

    const toggleFeature = (key, feature) => {
        setEditForm(prev => ({
            ...prev,
            [key]: prev[key].includes(feature) 
                ? prev[key].filter(f => f !== feature)
                : [...prev[key], feature]
        }));
    };

    // Star Rating Component (reuse from FeedbackForm)
    function StarRating({ value, onChange, max = 5, label }) {
        return (
            <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
                {Array.from({ length: max }).map((_, i) => {
                    const starValue = i + 1;
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onChange(starValue)}
                            className="p-1 focus:outline-none"
                            aria-label={`${starValue} stars`}
                        >
                            <svg 
                                viewBox="0 0 24 24" 
                                className="w-6 h-6"
                                fill={starValue <= value ? "#fbbf24" : "#e5e7eb"}
                                stroke="#9ca3af"
                                strokeWidth="0.6"
                            >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" />
                            </svg>
                        </button>
                    );
                })}
                <span className="ml-1 text-sm text-gray-500">{value}/5</span>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
                <div className="text-lg text-gray-600">Loading your feedback...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-poppins">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">My Feedback</h1>
                    <p className="text-gray-600">
                        View and manage all the feedback you've submitted. You can edit your recent feedback entries.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {feedbacks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Feedback Yet</h3>
                        <p className="text-gray-500 mb-4">You haven't submitted any feedback yet.</p>
                        <a 
                            href="/feedback" 
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Submit Your First Feedback
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {feedbacks.map((feedback) => (
                            <div key={feedback.id} className="bg-white rounded-2xl shadow-lg p-6">
                                {editingId === feedback.id ? (
                                    // Edit Mode
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-gray-800">Edit Feedback</h3>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateFeedback(feedback.id)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>

                                        {/* Quality Rating */}
                                        <div>
                                            <label className="block font-medium mb-2">Overall Quality Rating</label>
                                            <StarRating
                                                value={editForm.quality}
                                                onChange={(value) => setEditForm(prev => ({ ...prev, quality: value }))}
                                            />
                                        </div>

                                        {/* Support Rating */}
                                        <div>
                                            <label className="block font-medium mb-2">Customer Support Rating</label>
                                            <StarRating
                                                value={editForm.support}
                                                onChange={(value) => setEditForm(prev => ({ ...prev, support: value }))}
                                            />
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block font-medium mb-2">Additional Comments</label>
                                            <textarea
                                                value={editForm.notes}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                                rows={4}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Share your thoughts..."
                                            />
                                        </div>

                                        {/* Useful Features */}
                                        <div>
                                            <label className="block font-medium mb-2">Useful Features</label>
                                            <div className="space-y-2">
                                                {FEATURES_USEFUL.map((feature) => (
                                                    <label key={feature} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={editForm.useful.includes(feature)}
                                                            onChange={() => toggleFeature('useful', feature)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm">{feature}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Missing Features */}
                                        <div>
                                            <label className="block font-medium mb-2">Missing Features</label>
                                            <div className="space-y-2">
                                                {FEATURES_MISSING.map((feature) => (
                                                    <label key={feature} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={editForm.missing.includes(feature)}
                                                            onChange={() => toggleFeature('missing', feature)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm">{feature}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    Feedback from {formatDate(feedback.createdAt)}
                                                </h3>
                                                {feedback.updatedAt && (
                                                    <p className="text-sm text-gray-500">
                                                        Updated: {formatDate(feedback.updatedAt)}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => startEdit(feedback)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                Edit Feedback
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Ratings */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="font-medium text-gray-700">Quality Rating:</label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <svg
                                                                    key={star}
                                                                    viewBox="0 0 24 24"
                                                                    className="w-5 h-5"
                                                                    fill={star <= feedback.quality ? "#fbbf24" : "#e5e7eb"}
                                                                    stroke="#9ca3af"
                                                                    strokeWidth="0.6"
                                                                >
                                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-600">{feedback.quality}/5</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="font-medium text-gray-700">Support Rating:</label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <svg
                                                                    key={star}
                                                                    viewBox="0 0 24 24"
                                                                    className="w-5 h-5"
                                                                    fill={star <= feedback.support ? "#fbbf24" : "#e5e7eb"}
                                                                    stroke="#9ca3af"
                                                                    strokeWidth="0.6"
                                                                >
                                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-600">{feedback.support}/5</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="space-y-4">
                                                {feedback.useful && feedback.useful.length > 0 && (
                                                    <div>
                                                        <label className="font-medium text-gray-700">Useful Features:</label>
                                                        <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                                                            {feedback.useful.map((feature, index) => (
                                                                <li key={index}>{feature}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {feedback.missing && feedback.missing.length > 0 && (
                                                    <div>
                                                        <label className="font-medium text-gray-700">Missing Features:</label>
                                                        <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                                                            {feedback.missing.map((feature, index) => (
                                                                <li key={index}>{feature}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {feedback.notes && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <label className="font-medium text-gray-700">Additional Comments:</label>
                                                <p className="mt-1 text-gray-600 text-sm leading-relaxed">
                                                    {feedback.notes}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}