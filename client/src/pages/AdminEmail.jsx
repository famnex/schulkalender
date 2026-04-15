import React, { useState, useEffect } from 'react';
import api from '../api';
import { Mail, Send, CheckCircle, AlertCircle, RefreshCw, X, Plus } from 'lucide-react';

const AdminEmail = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Status states
    const [testStatus, setTestStatus] = useState(null);
    const [reminderStatus, setReminderStatus] = useState(null);

    // Recipients states
    const [recipientInput, setRecipientInput] = useState('');
    const [recipients, setRecipients] = useState([]);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            setSettings(res.data);
            
            if (res.data.mail_recipients) {
                try {
                    setRecipients(JSON.parse(res.data.mail_recipients));
                } catch(e) {
                    setRecipients([]);
                }
            }
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
            const payload = { ...settings, mail_recipients: JSON.stringify(recipients) };
            await api.post('/admin/settings', payload);
            alert('E-Mail-Einstellungen gespeichert!');
        } catch (err) {
            alert('Fehler beim Speichern');
        }
    };

    // --- Empfänger Logik ---
    const addRecipient = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = recipientInput.trim();
            if (val && val.includes('@') && !recipients.includes(val)) {
                setRecipients([...recipients, val]);
                setRecipientInput('');
            }
        }
    };

    const addRecipientClick = (e) => {
        e.preventDefault();
        const val = recipientInput.trim();
        if (val && val.includes('@') && !recipients.includes(val)) {
            setRecipients([...recipients, val]);
            setRecipientInput('');
        }
    }

    const removeRecipient = (email) => {
        setRecipients(recipients.filter(r => r !== email));
    };

    // --- Test Aktionen ---
    const handleTestMail = async () => {
        setTestStatus('testing');
        try {
            const payload = { ...settings, mail_recipients: JSON.stringify(recipients) };
            const res = await api.post('/admin/email/test', { config: payload });
            setTestStatus('success: ' + res.data.message);
        } catch (err) {
            setTestStatus('error: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleTriggerReminder = async () => {
        setReminderStatus('testing');
        try {
            const res = await api.post('/admin/email/trigger-reminder');
            setReminderStatus('success: ' + res.data.message);
        } catch (err) {
            setReminderStatus('error: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) return <div>Laden...</div>;

    return (
        <form onSubmit={saveSettings} className="space-y-6 max-w-4xl bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Mail size={24} className="text-primary" /> E-Mail Benachrichtigungen
            </h2>

            <div className="flex items-center mb-6">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.mail_enabled === 'true'} onChange={e => handleSettingChange('mail_enabled', e.target.checked ? 'true' : 'false')} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">E-Mail Versand & Tägliche Erinnerung aktivieren</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h4 className="font-medium mb-2">Allgemein</h4>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kalender-URL (für Links in E-Mails) *</label>
                    <input required type="text" placeholder="http://meine-schule.de/kalender_new/" value={settings.mail_base_url || ''} onChange={e => handleSettingChange('mail_base_url', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2 text-gray-900 dark:text-white" />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h4 className="font-medium mb-2">SMTP Servereinstellungen</h4>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Server / Host *</label>
                    <input required type="text" placeholder="smtp.example.com" value={settings.mail_host || ''} onChange={e => handleSettingChange('mail_host', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2 text-gray-900 dark:text-white" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Port *</label>
                    <input required type="text" placeholder="587 oder 465" value={settings.mail_port || ''} onChange={e => handleSettingChange('mail_port', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2 text-gray-900 dark:text-white" />
                </div>

                <div className="flex flex-col justify-center space-y-4">
                    <div className="flex items-center">
                        <input type="checkbox" id="mail_tls" checked={settings.mail_tls === 'true'} onChange={e => handleSettingChange('mail_tls', e.target.checked ? 'true' : 'false')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <label htmlFor="mail_tls" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">TLS (SSL/TLS verwenden)</label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Benutzername</label>
                    <input type="text" placeholder="admin@example.com" value={settings.mail_user || ''} onChange={e => handleSettingChange('mail_user', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2 text-gray-900 dark:text-white" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Passwort</label>
                    <input type="password" value={settings.mail_pass || ''} onChange={e => handleSettingChange('mail_pass', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2 text-gray-900 dark:text-white" />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h4 className="font-medium mb-2">Absender & Empfänger</h4>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Absende-E-Mail *</label>
                    <input required type="text" placeholder="noreply@example.com" value={settings.mail_from || ''} onChange={e => handleSettingChange('mail_from', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2 text-gray-900 dark:text-white" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Absendername</label>
                    <input type="text" placeholder="Schulkalender Admin" value={settings.mail_from_name || ''} onChange={e => handleSettingChange('mail_from_name', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2 text-gray-900 dark:text-white" />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Benachrichtigungs-Empfänger (E-Mails)</label>
                    <div className="flex flex-wrap gap-2 mb-2 p-2 min-h-[44px] bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md">
                        {recipients.map(r => (
                            <div key={r} className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-sm">
                                <span>{r}</span>
                                <button type="button" onClick={() => removeRecipient(r)} className="hover:text-red-500 rounded-full focus:outline-none">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {recipients.length === 0 && <span className="text-gray-400 text-sm italic">Keine Empfänger konfiguriert</span>}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Neue E-Mail (mit Enter bestätigen)" 
                            value={recipientInput} 
                            onChange={e => setRecipientInput(e.target.value)}
                            onKeyDown={addRecipient}
                            className="flex-1 shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2 text-gray-900 dark:text-white" 
                        />
                        <button type="button" onClick={addRecipientClick} className="px-3 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded text-gray-700 dark:text-gray-300">
                            Hinzufügen
                        </button>
                    </div>
                </div>
            </div>

            {/* Test Aktionen */}
            <div className="mt-8 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-md border border-gray-200 dark:border-slate-600 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-slate-600 pb-4">
                    <div>
                        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">Verbindung testen</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sendet sofort eine Test-Mail an alle Empfänger mit den aktuellen Formulardaten (ungespeichert).</p>
                    </div>
                    <button type="button" onClick={handleTestMail} className="flex shrink-0 items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition">
                        <Send size={16} /> Test-E-Mail senden
                    </button>
                </div>
                {testStatus && (
                    <div className={`text-sm flex gap-2 items-center ${testStatus.startsWith('success') ? 'text-green-600' : testStatus === 'testing' ? 'text-blue-500' : 'text-red-600'}`}>
                        {testStatus.startsWith('success') ? <CheckCircle size={16} /> : testStatus === 'testing' ? <RefreshCw className="animate-spin" size={16} /> : <AlertCircle size={16} />}
                        {testStatus === 'testing' ? 'Sende Test...' : testStatus.replace('success: ', '').replace('error: ', '')}
                    </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                    <div>
                        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">Erinnerung manuell auslösen</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Simuliert den Cronjob und checkt, ob aktuell Freigaben offen sind.</p>
                    </div>
                    <button type="button" onClick={handleTriggerReminder} className="flex shrink-0 items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded text-sm hover:bg-blue-50 dark:hover:bg-blue-900/40 transition">
                        <RefreshCw size={16} /> Erinnerung testen
                    </button>
                </div>
                {reminderStatus && (
                    <div className={`text-sm flex gap-2 items-center ${reminderStatus.startsWith('success') ? 'text-green-600' : reminderStatus === 'testing' ? 'text-blue-500' : 'text-red-600'}`}>
                        {reminderStatus.startsWith('success') ? <CheckCircle size={16} /> : reminderStatus === 'testing' ? <RefreshCw className="animate-spin" size={16} /> : <AlertCircle size={16} />}
                        {reminderStatus === 'testing' ? 'Prüfe & Sende...' : reminderStatus.replace('success: ', '').replace('error: ', '')}
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-6">
                <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 font-medium">Einstellungen Speichern</button>
            </div>
        </form>
    );
};

export default AdminEmail;
