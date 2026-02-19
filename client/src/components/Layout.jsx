import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, Calendar, User } from 'lucide-react';
import api from '../api';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState({});

    useEffect(() => {
        api.get('/public/settings').then(res => setSettings(res.data)).catch(console.error);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 print:hidden sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        {settings.school_logo ? (
                            <img
                                key="school-logo"
                                src={(() => {
                                    const logo = settings.school_logo;
                                    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
                                    if (logo.startsWith(baseUrl)) return logo;
                                    if (logo.startsWith('/')) return `${baseUrl}${logo}`;
                                    return logo;
                                })()}
                                alt="Logo"
                                className="h-8 w-auto object-contain"
                            />
                        ) : (
                            <img
                                key="default-logo"
                                src={`${import.meta.env.BASE_URL}logo.png`}
                                alt="Logo"
                                className="h-8 w-auto"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                        <span className="text-xl font-bold text-primary dark:text-blue-400">
                            Schulkalender
                        </span>
                    </Link>

                    <nav className="flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">Hallo, {user.username}</span>
                                {user.isAdmin && (
                                    <Link to="/admin" className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-blue-400" title="Admin Dashboard">
                                        <Settings size={20} />
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="Abmelden">
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                                <User size={16} />
                                Anmelden
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-grow w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 print:p-0 print:w-full print:max-w-none">
                <Outlet />
            </main>

            <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-6 print:hidden">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Schulkalender. Alle Rechte vorbehalten.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
