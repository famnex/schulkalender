import React, { useState } from 'react';
import { X, Calendar, MapPin, Tag, Check } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const NewEventModal = ({ onClose, categories, tags = [], onEventCreated, editEvent }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    
    const isPendingApproval = user?.isAdmin && editEvent?.status === 'pending';

    // Helpers for date formatting
    const formatDate = (date, allDay) => {
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date - offset)).toISOString().slice(0, -1);
        return allDay ? localISOTime.split('T')[0] : localISOTime.substring(0, 16);
    };

    const now = new Date();
    // Default to next full hour for better UX
    now.setHours(now.getHours() + 1, 0, 0, 0); 
    const later = new Date(now.getTime() + 90 * 60000);

    const isEditing = editEvent && editEvent.id;

    const [formData, setFormData] = useState({
        title: isEditing ? editEvent.title : '',
        categoryId: isEditing ? editEvent.categoryId : (categories.length > 0 ? categories[0].id : ''),
        start: isEditing ? formatDate(new Date(editEvent.start), editEvent.isAllDay) : formatDate(now, false),
        end: isEditing ? formatDate(new Date(editEvent.end), editEvent.isAllDay) : formatDate(later, false),
        isAllDay: isEditing ? editEvent.isAllDay : false,
        location: isEditing ? (editEvent.location || '') : ''
    });

    const [selectedTags, setSelectedTags] = useState(() => {
        if (isEditing && editEvent.description) {
            // Description holds trailing/leading newlines optionally.
            const lines = editEvent.description.split('\n').map(l => l.trim()).filter(l => l);
            // We find tag IDs from names or just assume the names are in description?
            // Actually description previously held tag names? No, the user said tag "name" is rendered but its id is pushed.
            // Let's match by tag.id. If previous version saved tag keys we match tag.id.
            // Wait, selectedTags holds tag IDs. 
            // In the form: selectedTags.join('\n')
            // So lines are tag IDs!
            return lines;
        }
        return [];
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const nextData = { ...prev, [name]: newValue };

            // Logic for isAllDay toggle
            if (name === 'isAllDay') {
                if (newValue) {
                    // Switch to All Day: strip times
                    nextData.start = prev.start.split('T')[0];
                    nextData.end = prev.end.split('T')[0];
                } else {
                    // Switch to Time: add default times if missing
                    nextData.start = prev.start.includes('T') ? prev.start : `${prev.start}T08:00`;
                    nextData.end = prev.end.includes('T') ? prev.end : `${prev.end}T09:30`;
                }
            }

            // Clear tags if category changes
            if (name === 'categoryId') {
                setSelectedTags([]);
            }

            return nextData;
        });
    };

    const verifyDates = (e) => {
        const { name } = e.target;
        if (name !== 'start' && name !== 'end') return;

        setFormData(prev => {
            const nextData = { ...prev };
            const s = new Date(nextData.start);
            const evtEnd = new Date(nextData.end);

            if (!isNaN(s) && !isNaN(evtEnd)) {
                if (name === 'start') {
                    // If Start is pushed after End
                    if (s > evtEnd) {
                        if (nextData.isAllDay) {
                            nextData.end = nextData.start; // Same day
                        } else {
                            const newEnd = new Date(s.getTime() + 90 * 60000);
                            nextData.end = formatDate(newEnd, false);
                        }
                    }
                } else if (name === 'end') {
                    // If End is pushed before Start
                    if (evtEnd < s) {
                        if (nextData.isAllDay) {
                            nextData.start = nextData.end; // Same day
                        } else {
                            const newStart = new Date(evtEnd.getTime() - 90 * 60000);
                            nextData.start = formatDate(newStart, false);
                        }
                    }
                }
            }
            return nextData;
        });
    };

    const availableTags = tags.filter(t => parseInt(t.categoryId) === parseInt(formData.categoryId));

    const handleCustomSubmit = async (publishStatus = null) => {
        if (availableTags.length > 0 && selectedTags.length === 0) {
            const confirmNoTags = window.confirm('Achtung: Es ist kein Tag ausgewählt! Bestimmte Filter- oder Druckfunktionen könnten diesen Termin ignorieren. Möchten Sie trotzdem fortfahren?');
            if (!confirmNoTags) return;
        }

        setLoading(true);
        setError(null);

        if (formData.categoryId === '0' || formData.categoryId === 0) {
            setError('Bitte wählen Sie zuerst eine Kategorie (z.B. Klassenarbeiten) aus!');
            setLoading(false);
            return;
        }

        const description = selectedTags.length > 0 ? selectedTags.join('\n') + '\n' : '';
        const payload = { ...formData, description };

        if (publishStatus) {
            payload.status = publishStatus;
        }

        try {
            if (isEditing) {
                await api.put(`/events/${editEvent.id}`, payload);
            } else {
                await api.post('/events', payload);
            }
            if (onEventCreated) onEventCreated();
            onClose();
        } catch (err) {
            console.error('Error creating event:', err);
            setError(err.response?.data?.error || 'Fehler beim Erstellen des Termins');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        await handleCustomSubmit();
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            isPendingApproval
            ? 'Diesen Termin wirklich ablehnen? Diese Aktion löscht den Termin vollständig und kann nicht rückgängig gemacht werden.'
            : 'Diesen Termin wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.'
        );
        if (!confirmDelete) return;

        setLoading(true);
        setError(null);
        try {
            await api.delete(`/events/${editEvent.id}`);
            if (onEventCreated) onEventCreated();
            onClose();
        } catch (err) {
            console.error('Error deleting event:', err);
            setError(err.response?.data?.error || 'Fehler beim Löschen');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800 md:bg-white md:dark:bg-slate-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Calendar className="text-primary text-green-600" size={24} />
                        {isPendingApproval ? 'Termin freigeben' : (isEditing ? 'Termin bearbeiten' : 'Neuen Termin anlegen')}
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
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form id="new-event-form" onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Titel */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Titel <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="z. B. Konferenz, Wandertag..."
                                className="w-full form-input rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>

                        {/* Kategorie */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kategorie <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="categoryId"
                                required
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full form-select rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                                <option value="" disabled>Bitte wählen...</option>
                                {categories.filter(c => c.id !== 'all' && c.id !== 0 && !c.isPseudo).map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Datum/Uhrzeit Container */}
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg border border-gray-100 dark:border-slate-700 space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isAllDay"
                                    name="isAllDay"
                                    checked={formData.isAllDay}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-offset-0 focus:ring-green-200 focus:ring-opacity-50"
                                />
                                <label htmlFor="isAllDay" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Ganztägiger Termin
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Start <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type={formData.isAllDay ? "date" : "datetime-local"}
                                        name="start"
                                        required
                                        value={formData.start}
                                        onChange={handleChange}
                                        onBlur={verifyDates}
                                        className="w-full form-input rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Ende <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type={formData.isAllDay ? "date" : "datetime-local"}
                                        name="end"
                                        required
                                        value={formData.end}
                                        onChange={handleChange}
                                        onBlur={verifyDates}
                                        className="w-full form-input rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ort */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                <MapPin size={16} className="text-gray-400" /> Ort
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Optional"
                                className="w-full form-input rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>

                        {/* Tags Toggle Container */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                <Tag size={16} className="text-gray-400" /> Erforderliche Tags
                            </label>
                            
                            {availableTags.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">Keine expliziten Tags für diese Kategorie verfügbar.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map(tag => {
                                        const isSelected = selectedTags.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedTags(prev => 
                                                        isSelected 
                                                            ? prev.filter(t => t !== tag.id)
                                                            : [...prev, tag.id]
                                                    );
                                                }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm ${
                                                    isSelected 
                                                        ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800' 
                                                        : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/40'
                                                } border`}
                                            >
                                                {isSelected && <Check size={14} className="text-green-600 dark:text-green-400" />}
                                                {tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-between gap-3">
                    <div>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 dark:bg-slate-800 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-slate-700 transition-colors"
                            >
                                {isPendingApproval ? 'Ablehnen (Löschen)' : 'Aus Kalender löschen'}
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                        >
                            Abbrechen
                        </button>
                        {isPendingApproval ? (
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handleCustomSubmit('published')}
                                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[120px]"
                                >
                                    {loading ? (
                                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    ) : (
                                        'Freigeben'
                                    )}
                                </button>
                        ) : (
                            <button
                                type="submit"
                                form="new-event-form"
                                disabled={loading}
                                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[120px]"
                            >
                                {loading ? (
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                ) : (
                                    'Speichern'
                                )}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NewEventModal;
