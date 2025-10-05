// src/auth/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u) : null;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            // Set authorization header for API calls
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem("token");
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    const register = async (payload) => {
        setLoading(true);
        try {
            const { data } = await api.post("/api/auth/register", payload);
            setToken(data.accessToken);
            
            // Ensure all user fields are properly set
            const userData = {
                email: data.email,
                role: data.role,
                id: data.userId,
                firstName: data.firstName || payload.firstName || "",
                lastName: data.lastName || payload.lastName || ""
            };
            setUser(userData);
            return data;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        } finally { 
            setLoading(false); 
        }
    };

    const login = async ({ email, password }) => {
        setLoading(true);
        try {
            const { data } = await api.post("/api/auth/login", { email, password });
            setToken(data.accessToken);
            
            // Ensure all user fields are properly set
            const userData = {
                email: data.email,
                role: data.role,
                id: data.userId,
                firstName: data.firstName || "",
                lastName: data.lastName || ""
            };
            setUser(userData);
            return data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        } finally { 
            setLoading(false); 
        }
    };

    const updateUserProfile = (updates) => {
        setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };
            return updated;
        });
    };

    const logout = () => { 
        setToken(null); 
        setUser(null); 
    };

    return (
        <AuthCtx.Provider value={{ 
            token, 
            user, 
            loading, 
            login, 
            register, 
            logout,
            updateUserProfile 
        }}>
            {children}
        </AuthCtx.Provider>
    );
}