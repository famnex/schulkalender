import React, { useState, useEffect } from 'react';
import api from '../api';
import { Trash2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const AdminSync = () => {
    const [syncing, setSyncing] = useState(false);
    const [syncLogs, setSyncLogs] = useState([]);
    const [events, setEvents] = useState([]);
    const [totalEvents, setTotalEvents] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState([]);
    const [activeCategoryId, setActiveCategoryId] = useState('all');
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadEvents();
    }, [page, activeCategoryId]);

    const loadCategories = async () => {
        try {
            const res = await api.get('/admin/categories');
            console.log('Loaded categories:', res.data);
            setCategories(res.data);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    const loadEvents = async () => {
        setLoadingEvents(true);
        try {
            const url = `/admin/events?page=${page}&limit=20&categoryId=${activeCategoryId}`;
            console.log('Fetching events from:', url);
            const res = await api.get(url);
            setEvents(res.data.events);
            setTotalEvents(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Error loading events:', err);
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncLogs([]);
        try {
            const res = await api.post('/admin/sync');
            setSyncLogs(res.data.logs || ['Sync Success']);
            setPage(1);
            loadEvents();
        } catch (err) {
            setSyncLogs(['Error: ' + (err.response?.data?.details || err.message)]);
        } finally {
            setSyncing(false);
        }
    };

    const handleClearEvents = async () => {
        if (!window.confirm('WIRKLICH ALLE Termine aus der Datenbank löschen? (Dies kann nicht rückgängig gemacht werden!)')) return;
        try {
            await api.delete('/admin/events/clear');
            setSyncLogs(['Tabelle erfolgreich geleert.']);
            setPage(1);
            loadEvents();
            loadCategories(); // Reload cats just in case
        } catch (err) {
            alert('Fehler beim Leeren: ' + err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Datenbank & Synchronisation</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 font-thin">
                    Starten Sie hier die manuelle Synchronisation. Dies lädt alle konfigurierten ICS-Feeds neu und aktualisiert die Datenbank.
                </p>

                <div className="flex items-center gap-4 mb-4">
                    <div className={`h-3 w-3 rounded-full ${syncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="font-medium text-gray-900 dark:text-white">{syncing ? 'Synchronisiert...' : 'Bereit'}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-4">
                    <button type="button" onClick={handleSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                        <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Synchronisiere...' : 'Jetzt Synchronisieren'}
                    </button>

                    <button type="button" onClick={handleClearEvents} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors">
                        <Trash2 size={18} />
                        Tabelle leeren
                    </button>
                </div>

                {(syncLogs.length > 0) && (
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold mb-2 dark:text-white">Protokoll:</h4>
                        <div className="p-4 bg-black text-green-400 font-mono text-xs rounded h-64 overflow-y-auto shadow-inner border border-gray-700">
                            {syncLogs.map((line, i) => (
                                <div key={i} className="whitespace-pre-wrap py-0.5 border-b border-white/5 last:border-0">{line}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Event Table Section */}
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gespeicherte Termine ({totalEvents})</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Seite {page} von {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs for Categories */}
                <div className="flex gap-2 mb-6 border-b border-gray-100 dark:border-slate-700 pb-2 overflow-x-auto scroller-hidden">
                    <button
                        onClick={() => { setActiveCategoryId('all'); setPage(1); }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${String(activeCategoryId) === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300'
                            }`}
                    >
                        Alle
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategoryId(cat.id); setPage(1); }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${String(activeCategoryId) === String(cat.id)
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300'
                                }`}
                        >
                            {cat.title}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto border border-gray-100 dark:border-slate-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titel</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beschreibung</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raw</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700">
                            {loadingEvents ? (
                                <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">Lade Termine...</td></tr>
                            ) : events.length === 0 ? (
                                <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">Keine Termine gefunden.</td></tr>
                            ) : (
                                events.map(evt => (
                                    <tr key={evt.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                                            {format(new Date(evt.start), 'dd.MM.yyyy', { locale: de })}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-medium text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={evt.title}>{evt.title}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                                {evt.Category?.title || 'Unbekannt'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate" title={evt.description}>
                                            {evt.description || '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400 font-mono">
                                            {evt.id.substring(0, 8)}...
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSync;
