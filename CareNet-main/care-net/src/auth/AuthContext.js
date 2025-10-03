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
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
    }, [token]);

    useEffect(() => {
        if (user) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");
    }, [user]);

    const register = async (payload) => {
        setLoading(true);
        try {
        const { data } = await api.post("/api/auth/register", payload);
        setToken(data.accessToken);
        setUser({ email: data.email, role: data.role, id: data.userId });
        return data;
        } finally { setLoading(false); }
    };

    const login = async ({ email, password }) => {
        setLoading(true);
        try {
        const { data } = await api.post("/api/auth/login", { email, password });
        setToken(data.accessToken);
        setUser({ email: data.email, role: data.role, id: data.userId });
        return data;
        } finally { setLoading(false); }
    };

    const logout = () => { setToken(null); setUser(null); };

    return (
        <AuthCtx.Provider value={{ token, user, loading, login, register, logout }}>
        {children}
        </AuthCtx.Provider>
    );
}
