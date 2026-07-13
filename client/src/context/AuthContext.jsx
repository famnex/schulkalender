import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleAuthFailure = () => {
            logout();
        };

        window.addEventListener('auth-failure', handleAuthFailure);

        const params = new URLSearchParams(window.location.search);
        const ssoToken = params.get('token') || params.get('sso_token');

        if (ssoToken) {
            setLoading(true);
            api.post('/auth/sso-login', { token: ssoToken })
                .then(res => {
                    localStorage.setItem('token', res.data.token);
                    setUser(res.data.user);
                    
                    // Cleanup URL query params
                    const url = new URL(window.location.href);
                    url.searchParams.delete('token');
                    url.searchParams.delete('sso_token');
                    window.history.replaceState({}, '', url.pathname + url.search);
                })
                .catch(err => {
                    console.error('SSO auto-login failed:', err);
                    logout();
                })
                .finally(() => setLoading(false));
        } else {
            const token = localStorage.getItem('token');
            if (token) {
                api.get('/auth/me')
                    .then(res => {
                        setUser(res.data);
                    })
                    .catch(() => {
                        logout();
                    })
                    .finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        }

        return () => {
            window.removeEventListener('auth-failure', handleAuthFailure);
        };
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const loginSSO = async (token) => {
        const res = await api.post('/auth/sso-login', { token });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (username, password, email) => {
        await api.post('/auth/register', { username, password, email });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, loginSSO, logout, register, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
