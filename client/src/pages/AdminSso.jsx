import React, { useState, useEffect } from 'react';
import api from '../api';

const AdminSso = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            setSettings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (key, val) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    };

    const saveSettings = async (e) => {
        if (e) e.preventDefault();
        try {
            await api.post('/admin/settings', settings);
            alert('SSO-Einstellungen gespeichert!');
        } catch (err) {
            alert('Fehler beim Speichern');
        }
    };

    if (loading) return <div>Laden...</div>;

    return (
        <form onSubmit={saveSettings} className="space-y-6 max-w-4xl bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">SSO via JWT (Single Sign-On)</h2>

            <div className="flex items-center mb-6">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={settings.sso_enabled === 'true'} 
                        onChange={e => handleSettingChange('sso_enabled', e.target.checked ? 'true' : 'false')} 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">SSO-Anmeldung aktivieren</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SSO JWT Secret (Shared Secret) *</label>
                    <input 
                        required={settings.sso_enabled === 'true'}
                        type="password" 
                        placeholder="Geben Sie das Secret zur Verifizierung des Tokens ein" 
                        value={settings.sso_jwt_secret || ''} 
                        onChange={e => handleSettingChange('sso_jwt_secret', e.target.value)} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Wird verwendet, um das vom SSO-Provider übergebene JWT-Token zu verifizieren.</p>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SSO Identity Provider Login-URL (Optional)</label>
                    <input 
                        type="text" 
                        placeholder="https://sso.your-school.com/login?redirect=..." 
                        value={settings.sso_login_url || ''} 
                        onChange={e => handleSettingChange('sso_login_url', e.target.value)} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Die URL, zu der Benutzer weitergeleitet werden, wenn sie auf "Mit SSO anmelden" klicken.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username Claim Name (optional)</label>
                    <input 
                        type="text" 
                        placeholder="username (Standard)" 
                        value={settings.sso_username_claim || ''} 
                        onChange={e => handleSettingChange('sso_username_claim', e.target.value)} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Claim im Token für den Benutzernamen (z.B. 'username', 'sub', 'uid').</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-Mail Claim Name (optional)</label>
                    <input 
                        type="text" 
                        placeholder="email (Standard)" 
                        value={settings.sso_email_claim || ''} 
                        onChange={e => handleSettingChange('sso_email_claim', e.target.value)} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Claim im Token für die E-Mail-Adresse (z.B. 'email', 'mail').</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name Claim Name (optional)</label>
                    <input 
                        type="text" 
                        placeholder="display_name (Standard)" 
                        value={settings.sso_display_name_claim || ''} 
                        onChange={e => handleSettingChange('sso_display_name_claim', e.target.value)} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Claim im Token für den Anzeigenamen (z.B. 'display_name', 'displayName', 'cn').</p>
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Abmeldeverhalten & Anpassung</h4>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logout Redirect-URL (optional)</label>
                    <input 
                        type="text" 
                        placeholder="https://sso.your-school.com/logout oder /" 
                        value={settings.sso_logout_redirect || ''} 
                        onChange={e => handleSettingChange('sso_logout_redirect', e.target.value)} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Die URL, auf die der Benutzer nach dem Abmelden weitergeleitet wird (z.B. die Logout-URL des Providers).</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Abmelden-Button Text (optional)</label>
                    <input 
                        type="text" 
                        placeholder="Abmelden (Standard)" 
                        value={settings.sso_logout_button_text || ''} 
                        onChange={e => handleSettingChange('sso_logout_button_text', e.target.value)} 
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Name des Buttons zum Abmelden (z.B. "Portal verlassen", "SSO Abmelden").</p>
                </div>
            </div>

            <div className="flex justify-end">
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors">Speichern</button>
            </div>
        </form>
    );
};

export default AdminSso;
