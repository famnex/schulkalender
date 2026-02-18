import React, { useState, useEffect } from 'react';
import api from '../api';

const AdminLdap = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [testUser, setTestUser] = useState('');
    const [testPass, setTestPass] = useState('');
    const [testStatus, setTestStatus] = useState(null);

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
            alert('LDAP-Einstellungen gespeichert!');
        } catch (err) {
            alert('Fehler beim Speichern');
        }
    };

    const handleLdapTest = async () => {
        setTestStatus('testing');
        try {
            await api.post('/admin/ldap/test', { config: settings, username: testUser, password: testPass });
            setTestStatus('success');
        } catch (err) {
            setTestStatus('error: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) return <div>Laden...</div>;

    return (
        <form onSubmit={saveSettings} className="space-y-6 max-w-4xl bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">LDAP / Active Directory</h2>

            <div className="flex items-center mb-6">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.ldap_enabled === 'true'} onChange={e => handleSettingChange('ldap_enabled', e.target.checked ? 'true' : 'false')} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">LDAP aktivieren</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">LDAP Server URL *</label>
                    <input required type="text" placeholder="10.37.128.41" value={settings.ldap_url || ''} onChange={e => handleSettingChange('ldap_url', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Port</label>
                    <input type="text" placeholder="389 oder 636" value={settings.ldap_port || ''} onChange={e => handleSettingChange('ldap_port', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                </div>

                <div className="flex flex-col justify-center space-y-4">
                    <div className="flex items-center">
                        <input type="checkbox" id="ldap_ssl" checked={settings.ldap_ssl === 'true'} onChange={e => handleSettingChange('ldap_ssl', e.target.checked ? 'true' : 'false')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <label htmlFor="ldap_ssl" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">SSL/TLS verwenden</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="ldap_verify" checked={settings.ldap_verify_cert === 'true'} onChange={e => handleSettingChange('ldap_verify_cert', e.target.checked ? 'true' : 'false')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <label htmlFor="ldap_verify" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">SSL Zertifikat überprüfen</label>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h4 className="font-medium mb-2">Bind-Einstellungen</h4>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bind DN (Benutzer zum Suchen) *</label>
                    <input type="text" placeholder="CN=Administrator,CN=Users,DC=mso,DC=local" value={settings.ldap_bindDN || ''} onChange={e => handleSettingChange('ldap_bindDN', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bind Passwort</label>
                    <input type="password" value={settings.ldap_bindCredentials || ''} onChange={e => handleSettingChange('ldap_bindCredentials', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h4 className="font-medium mb-2">Such- & Zuordnungs-Einstellungen</h4>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search Base (Wo Suchen?)</label>
                    <input type="text" placeholder="OU=Users,DC=example,DC=com" value={settings.ldap_searchBase || ''} onChange={e => handleSettingChange('ldap_searchBase', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Benutzer-Attribut (Login Name)</label>
                    <input type="text" placeholder="sAMAccountName" value={settings.ldap_userAttr || ''} onChange={e => handleSettingChange('ldap_userAttr', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-Mail-Attribut</label>
                    <input type="text" placeholder="mail" value={settings.ldap_emailAttr || ''} onChange={e => handleSettingChange('ldap_emailAttr', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Anzeigenamen-Attribut</label>
                    <input type="text" placeholder="displayName" value={settings.ldap_displayNameAttr || ''} onChange={e => handleSettingChange('ldap_displayNameAttr', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">UPN Suffix (Optional, z.B. @schule.local)</label>
                    <input type="text" placeholder="@schule.local" value={settings.ldap_upnSuffix || ''} onChange={e => handleSettingChange('ldap_upnSuffix', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gruppen-Filter (Optional)</label>
                    <input type="text" placeholder="(memberOf=CN=Lehrer,...)" value={settings.ldap_groupFilter || ''} onChange={e => handleSettingChange('ldap_groupFilter', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 p-2" />
                </div>
            </div>

            {/* Connection Test */}
            <div className="mt-6 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-md border border-gray-200 dark:border-slate-600">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Verbindungstest</h4>
                <div className="flex gap-2 items-center">
                    <input type="text" placeholder="Test User" value={testUser} onChange={e => setTestUser(e.target.value)} className="block w-40 sm:text-sm border-gray-300 rounded-md p-1" />
                    <input type="password" placeholder="Password" value={testPass} onChange={e => setTestPass(e.target.value)} className="block w-40 sm:text-sm border-gray-300 rounded-md p-1" />
                    <button type="button" onClick={handleLdapTest} className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">Test</button>
                </div>
                {testStatus && (
                    <div className={`mt-2 text-sm ${testStatus === 'success' ? 'text-green-600' : testStatus === 'testing' ? 'text-blue-500' : 'text-red-600'}`}>
                        {testStatus === 'success' ? 'Verbindung & Login erfolgreich!' : testStatus === 'testing' ? 'Teste...' : testStatus}
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-blue-700">Speichern</button>
            </div>
        </form>
    );
};

export default AdminLdap;
