import React, { useState, useEffect } from 'react';
import api from '../api';

const AdminGeneral = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/settings');
            setSettings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const darkenColor = (hex) => {
        if (!hex || !hex.startsWith('#')) return hex;
        try {
            let r = parseInt(hex.slice(1, 3), 16);
            let g = parseInt(hex.slice(3, 5), 16);
            let b = parseInt(hex.slice(5, 7), 16);

            // Convert to HSL to make it "very dark" but same hue/saturation
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                    default: break;
                }
                h /= 6;
            }

            // Set Lightness to ~15-20% for "very dark"
            l = 0.2;

            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);

            const toHex = x => {
                const hex = Math.round(x * 255).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        } catch (e) {
            return hex;
        }
    };

    const handleSettingChange = (key, val) => {
        setSettings(prev => {
            const next = { ...prev, [key]: val };
            // Auto-update text color if it's a known background key
            if (key === 'vacation_color') next.vacation_text_color = darkenColor(val);
            if (key === 'holiday_color') next.holiday_text_color = darkenColor(val);
            if (key === 'weekend_color') next.weekend_text_color = darkenColor(val);
            if (key === 'today_color') next.today_text_color = darkenColor(val);
            return next;
        });
    };

    const saveSettings = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/settings', settings);
            alert('Einstellungen gespeichert!');
        } catch (err) {
            alert('Fehler beim Speichern');
        }
    };

    if (loading) return <div>Laden...</div>;

    return (
        <form onSubmit={saveSettings} className="space-y-6 max-w-2xl bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Design</h3>
                <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Schulname</label>
                        <input
                            type="text"
                            value={settings.school_name || ''}
                            onChange={e => handleSettingChange('school_name', e.target.value)}
                            className="mt-1 shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2"
                            placeholder="z.B. Mustermann-Gymnasium"
                        />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Schullogo</label>
                        <div className="mt-1 flex items-center gap-4">
                            {settings.school_logo && (
                                <img src={(() => {
                                    const logo = settings.school_logo;
                                    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
                                    if (logo.startsWith(baseUrl)) return logo;
                                    if (logo.startsWith('/')) return `${baseUrl}${logo}`;
                                    return logo;
                                })()} alt="Logo Preview" className="h-12 w-auto object-contain border rounded p-1 bg-gray-50 dark:bg-slate-700" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    const formData = new FormData();
                                    formData.append('logo', file);
                                    try {
                                        const res = await api.post('/admin/settings/logo', formData, {
                                            headers: { 'Content-Type': 'multipart/form-data' }
                                        });
                                        handleSettingChange('school_logo', res.data.url);
                                    } catch (err) {
                                        alert('Fehler beim Upload des Logos');
                                    }
                                }}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700"
                            />
                        </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 border-t border-gray-100 dark:border-slate-700 my-2"></div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primärfarbe</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="color" value={settings.primary_color || '#004291'} onChange={e => handleSettingChange('primary_color', e.target.value)} className="h-9 w-16 p-0 border-0" />
                            <input type="text" value={settings.primary_color || '#004291'} onChange={e => handleSettingChange('primary_color', e.target.value)} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md dark:bg-slate-700" />
                        </div>
                    </div>
                    <div className="hidden sm:block"></div>

                    <div className="col-span-1 sm:col-span-2 border-t border-gray-100 dark:border-slate-700 my-2"></div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ferien (Hintergrund)</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="color" value={settings.vacation_color || '#FFFBEB'} onChange={e => handleSettingChange('vacation_color', e.target.value)} className="h-9 w-16 p-0 border-0" />
                            <input type="text" value={settings.vacation_color || '#FFFBEB'} onChange={e => handleSettingChange('vacation_color', e.target.value)} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md dark:bg-slate-700" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ferien (Text)</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="color" value={settings.vacation_text_color || '#713F12'} onChange={e => handleSettingChange('vacation_text_color', e.target.value)} className="h-9 w-16 p-0 border-0" />
                            <input type="text" value={settings.vacation_text_color || '#713F12'} onChange={e => handleSettingChange('vacation_text_color', e.target.value)} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md dark:bg-slate-700" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feiertage (Hintergrund)</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="color" value={settings.holiday_color || '#FEF2F2'} onChange={e => handleSettingChange('holiday_color', e.target.value)} className="h-9 w-16 p-0 border-0" />
                            <input type="text" value={settings.holiday_color || '#FEF2F2'} onChange={e => handleSettingChange('holiday_color', e.target.value)} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md dark:bg-slate-700" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feiertage (Text)</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="color" value={settings.holiday_text_color || '#991B1B'} onChange={e => handleSettingChange('holiday_text_color', e.target.value)} className="h-9 w-16 p-0 border-0" />
                            <input type="text" value={settings.holiday_text_color || '#991B1B'} onChange={e => handleSettingChange('holiday_text_color', e.target.value)} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md dark:bg-slate-700" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wochenende (Hintergrund)</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="color" value={settings.weekend_color || '#F3F4F6'} onChange={e => handleSettingChange('weekend_color', e.target.value)} className="h-9 w-16 p-0 border-0" />
                            <input type="text" value={settings.weekend_color || '#F3F4F6'} onChange={e => handleSettingChange('weekend_color', e.target.value)} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md dark:bg-slate-700" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wochenende (Text)</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="color" value={settings.weekend_text_color || '#4B5563'} onChange={e => handleSettingChange('weekend_text_color', e.target.value)} className="h-9 w-16 p-0 border-0" />
                            <input type="text" value={settings.weekend_text_color || '#4B5563'} onChange={e => handleSettingChange('weekend_text_color', e.target.value)} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md dark:bg-slate-700" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aktueller Tag (Hintergrund)</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="color" value={settings.today_color || '#ffffff'} onChange={e => handleSettingChange('today_color', e.target.value)} className="h-9 w-16 p-0 border-0" />
                            <input type="text" value={settings.today_color || ''} placeholder="#ffffff" onChange={e => handleSettingChange('today_color', e.target.value)} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md dark:bg-slate-700" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Leer lassen für Standard (Weiß)</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aktueller Tag (Text)</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input type="color" value={settings.today_text_color || '#000000'} onChange={e => handleSettingChange('today_text_color', e.target.value)} className="h-9 w-16 p-0 border-0" />
                            <input type="text" value={settings.today_text_color || ''} placeholder="#000000" onChange={e => handleSettingChange('today_text_color', e.target.value)} className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md dark:bg-slate-700" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Leer lassen für Standard (Schwarz)</p>
                    </div>
                </div>
            </div >

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Funktionen</h3>
                <div className="mt-4 flex items-center">
                    <input type="checkbox" id="reg_enabled" checked={settings.registration_enabled === 'true'} onChange={e => handleSettingChange('registration_enabled', e.target.checked ? 'true' : 'false')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <label htmlFor="reg_enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Öffentliche Registrierung erlauben</label>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Externe Kalender (Global)</h3>
                <p className="text-sm text-gray-500 mb-4">Spezielle ICS-Links für globale Ferien und Feiertage.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ferien (ICS URL)</label>
                        <input type="text" value={settings.vacation_ics_url || ''} onChange={e => handleSettingChange('vacation_ics_url', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feiertage (ICS URL)</label>
                        <input type="text" value={settings.holiday_ics_url || ''} onChange={e => handleSettingChange('holiday_ics_url', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-blue-700">Speichern</button>
            </div>
        </form >
    );
};

export default AdminGeneral;
