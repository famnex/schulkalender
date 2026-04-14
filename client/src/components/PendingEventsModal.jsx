import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Edit3, Loader2 } from 'lucide-react';
import api from '../api';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const PendingEventsModal = ({ onClose, onEventPublished, onEditEvent }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/events/pending');
            setEvents(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handlePublish = async (evt) => {
        try {
            await api.put(`/admin/events/${evt.id}/publish`);
            setEvents(events.filter(e => e.id !== evt.id));
            if (onEventPublished) onEventPublished();
        } catch (err) {
            console.error(err);
            alert('Fehler beim Freigeben');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <CheckCircle className="text-yellow-500" size={24} />
                        Ausstehende Freigaben
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
                    ) : events.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 border border-dashed border-gray-300 dark:border-slate-700 rounded-lg">
                            Keine ausstehenden Termine zur Freigabe.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map(evt => (
                                <div key={evt.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 flex flex-col md:flex-row justify-between gap-4 md:items-center hover:shadow-sm transition-shadow">
                                    <div>
                                        <div className="font-bold text-lg text-gray-900 dark:text-white">{evt.title}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {format(parseISO(evt.start), 'dd.MM.yyyy HH:mm')} - {format(parseISO(evt.end), 'dd.MM.yyyy HH:mm')}
                                        </div>
                                        {evt.Category && (
                                            <div className="mt-2 text-xs bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-300 inline-block px-2 py-1 rounded">
                                                {evt.Category.title}
                                            </div>
                                        )}
                                        {evt.location && (
                                            <div className="mt-1 text-sm text-gray-500">Ort: {evt.location}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                                        <button 
                                            onClick={() => onEditEvent(evt)}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800"
                                        >
                                            Prüfen & Freigeben
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                    >
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingEventsModal;
