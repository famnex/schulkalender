import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpCircle, CheckCircle, AlertCircle, RefreshCw, GitBranch, GitCommit } from 'lucide-react';
import api from '../api';

const AdminUpdate = () => {
    const [status, setStatus] = useState('checking'); // checking, available, up-to-date, updating, complete, error
    const [updateInfo, setUpdateInfo] = useState(null);
    const [logs, setLogs] = useState('');
    const [error, setError] = useState(null);
    const logIntervalRef = useRef(null);

    useEffect(() => {
        checkForUpdates();
    }, []);

    const checkForUpdates = async () => {
        setStatus('checking');
        try {
            const res = await api.get('/admin/update/check');
            setUpdateInfo(res.data);
            if (res.data.updateAvailable) {
                setStatus('available');
            } else {
                setStatus('up-to-date');
            }
        } catch (err) {
            console.error(err);
            setError('Konnte Update-Status nicht prüfen.');
            setStatus('error'); // Soft error, maybe allow force update?
        }
    };

    const startUpdate = async () => {
        if (!confirm('Soll das Update wirklich gestartet werden? Der Server wird dabei neu gestartet.')) return;

        setStatus('updating');
        setLogs('Initialisiere Update...\n');
        setError(null);

        try {
            await api.post('/admin/update');
            startLogPolling();
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setStatus('error');
        }
    };

    const startLogPolling = () => {
        if (logIntervalRef.current) clearInterval(logIntervalRef.current);

        // Poll every second
        logIntervalRef.current = setInterval(async () => {
            try {
                const res = await api.get('/admin/update/log');
                setLogs(res.data);

                // Simple heuristic to detect completion
                if (res.data.includes('Update completed successfully') || res.data.includes('Exiting process')) {
                    setStatus('complete');
                    clearInterval(logIntervalRef.current);
                }
                if (res.data.includes('FATAL ERROR')) {
                    setStatus('error');
                    clearInterval(logIntervalRef.current);
                }
            } catch (ignored) {
                // If fetch fails, server might be restarting. Keep trying.
                setLogs(prev => prev + '\n[Verbindung unterbrochen - Server startet neu...]');
            }
        }, 1000);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (logIntervalRef.current) clearInterval(logIntervalRef.current);
        };
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <RefreshCw className={status === 'updating' ? 'animate-spin' : ''} />
                System Update
            </h2>

            <p className="mb-2">Hier können Sie das System auf die neueste Version aktualisieren (Pull von GitHub).</p>
            <div className="flex items-center gap-2 mt-2 font-mono text-sm bg-gray-100 p-2 rounded w-fit">
                <GitBranch size={16} />
                Status: {status === 'checking' && 'Prüfe...'}
                {status === 'up-to-date' && <span className="text-green-600 font-bold">System ist aktuell</span>}
                {status === 'available' && <span className="text-blue-600 font-bold">Update verfügbar</span>}
                {status === 'error' && <span className="text-red-600">Fehler bei der Prüfung</span>}
            </div>
            {updateInfo && updateInfo.updateAvailable && (
                <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-blue-800 border-l-4 border-blue-400">
                    <div className="flex gap-4">
                        <span>Lokal: {updateInfo.localHash}</span>
                        <span>Remote: {updateInfo.remoteHash}</span>
                    </div>
                    {updateInfo.message && (
                        <div className="mt-2 text-xs opacity-80 whitespace-pre-wrap">
                            {updateInfo.message}
                        </div>
                    )}
                </div>
            )}
            {
                status === 'available' && (
                    <button
                        onClick={startUpdate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                        <ArrowUpCircle size={18} />
                        Update jetzt installieren
                    </button>
                )
            }

            {
                status === 'up-to-date' && (
                    <button
                        onClick={() => { if (confirm('Trotzdem neu installieren?')) startUpdate() }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors text-xs"
                    >
                        <RefreshCw size={14} />
                        System neu aufsetzen (Force Update)
                    </button>
                )
            }

            {
                status === 'error' && (
                    <div className="p-4 mb-4 bg-red-50 text-red-700 rounded border border-red-200 flex items-center gap-2">
                        <AlertCircle size={20} />
                        <div>
                            <strong>Fehler beim Update:</strong>
                            <p>{error}</p>
                        </div>
                    </div>
                )
            }

            {
                (status === 'updating' || status === 'complete' || logs) && (
                    <div className="mt-6">
                        <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Update Protokoll:</h3>
                        <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-xs h-96 overflow-y-auto whitespace-pre-wrap">
                            {logs}
                        </div>
                        {status === 'complete' && (
                            <div className="mt-4 flex items-center gap-2 text-green-600 font-bold bg-green-50 p-2 rounded border border-green-200">
                                <CheckCircle size={20} />
                                Update abgeschlossen. Bitte Seite neu laden.
                                <button onClick={() => window.location.reload()} className="ml-auto underline text-sm">
                                    Jetzt neu laden
                                </button>
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
};

export default AdminUpdate;
