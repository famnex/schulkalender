import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Link as LinkIcon, Check, Copy, ChevronDown, ChevronRight, Save, Trash2, Edit3, Plus, Minus } from 'lucide-react';
import api from '../api';

const CalendarExportModal = ({ onClose, categories, tags }) => {
    // selections: { [catId]: { mode: 'all'|'some'|'none', tags: [], stufe: '' } }
    const [selections, setSelections] = useState({});

    const [filteredCategories, setFilteredCategories] = useState([]);

    // UI State
    const [expandedCategories, setExpandedCategories] = useState({});
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [copied, setCopied] = useState(false);

    // Filters Management State
    const [savedFilters, setSavedFilters] = useState([]);
    const [selectedFilterId, setSelectedFilterId] = useState(null);
    const [filterName, setFilterName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);

    // Helpers
    const getCategoryTags = (catId) => tags.filter(t => t.categoryId === catId);

    // Initial Filter of Columns
    useEffect(() => {
        if (categories) {
            const filtered = categories.filter(c => {
                const title = (c.title || '').toLowerCase();
                return !title.includes('ferien') && !title.includes('feiertag');
            });
            setFilteredCategories(filtered);

            // Init selections: Select All by default
            const initialSelections = {};
            filtered.forEach(c => {
                initialSelections[c.id] = { mode: 'all', tags: [], stufe: '' };
            });
            setSelections(initialSelections);
        }
    }, [categories]);

    // Fetch Saved Filters
    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            const res = await api.get('/filters');
            setSavedFilters(res.data);
        } catch (err) {
            console.error("Failed to fetch filters", err);
        }
    };

    const handleCategoryToggle = (catId) => {
        setSelections(prev => {
            const current = prev[catId] || { mode: 'none', tags: [], stufe: '' };
            const newMode = current.mode === 'all' ? 'none' : 'all';

            return {
                ...prev,
                [catId]: { ...current, mode: newMode, tags: [] }
            };
        });
    };

    const handleTagToggle = (catId, tagId) => {
        setSelections(prev => {
            const current = prev[catId] || { mode: 'none', tags: [], stufe: '' };
            const allCatTags = getCategoryTags(catId).map(t => t.id || t.name);
            let newTags = [];
            let newMode = current.mode;

            if (current.mode === 'all') {
                newTags = allCatTags.filter(id => id !== tagId);
                newMode = 'some';
            } else if (current.mode === 'none') {
                newTags = [tagId];
                newMode = 'some';
            } else { // 'some'
                if (current.tags.includes(tagId)) {
                    newTags = current.tags.filter(id => id !== tagId);
                } else {
                    newTags = [...current.tags, tagId];
                }
            }

            if (newTags.length === 0) {
                newMode = 'none';
            } else if (newTags.length === allCatTags.length) {
                newMode = 'all';
                newTags = [];
            } else {
                newMode = 'some';
            }

            return {
                ...prev,
                [catId]: { ...current, mode: newMode, tags: newTags }
            };
        });
    };

    // Updates stufe state for category (used for view filtering)
    const handleStufeChange = (catId, val) => {
        setSelections(prev => ({
            ...prev,
            [catId]: { ...prev[catId], stufe: val }
        }));
    };

    const toggleExpand = (catId) => {
        setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    // Load Filter
    const loadFilter = (filter) => {
        setSelectedFilterId(filter.id);
        setFilterName(filter.name);
        setIsEditingName(false);

        try {
            let configDeps = [];
            if (filter.config && filter.config.filters) {
                configDeps = typeof filter.config.filters === 'string' ? JSON.parse(filter.config.filters) : filter.config.filters;
            } else if (filter.config && filter.config.categoryIds) {
                return;
            }

            const newSelections = {};
            filteredCategories.forEach(c => newSelections[c.id] = { mode: 'none', tags: [], stufe: '' });

            configDeps.forEach(g => {
                const mode = (g.tags && g.tags.length > 0) ? 'some' : 'all';
                newSelections[g.id] = {
                    mode,
                    tags: g.tags || [],
                    stufe: g.stufe || ''
                };
            });
            setSelections(newSelections);
        } catch (e) { console.error(e); }
    };

    const handleNewFilter = () => {
        setSelectedFilterId(null);
        setFilterName('');
        setIsEditingName(true);
        const newSelections = {};
        filteredCategories.forEach(c => {
            newSelections[c.id] = { mode: 'all', tags: [], stufe: '' };
        });
        setSelections(newSelections);
    };

    const handleSave = async () => {
        const filters = [];
        Object.keys(selections).forEach(catId => {
            const sel = selections[catId];
            if (sel.mode !== 'none') {
                filters.push({
                    id: parseInt(catId),
                    tags: sel.mode === 'some' ? sel.tags : [],
                    stufe: sel.stufe
                });
            }
        });

        const config = { filters };

        try {
            if (selectedFilterId) {
                await api.put(`/filters/${selectedFilterId}`, { name: filterName, config });
                setSavedFilters(prev => prev.map(f => f.id === selectedFilterId ? { ...f, name: filterName, config } : f));
            } else {
                if (!filterName.trim()) { alert('Bitte Name eingeben'); return; }
                const res = await api.post('/filters', { name: filterName, config });
                setSavedFilters([...savedFilters, res.data]);
                setSelectedFilterId(res.data.id);
            }
            setIsEditingName(false);
            alert('Gespeichert');
        } catch (err) {
            console.error(err);
            alert('Fehler: ' + err.message);
        }
    };

    useEffect(() => {
        const protocol = window.location.protocol;
        const host = window.location.host;
        let query = '';

        if (selectedFilterId) {
            query = `token=${selectedFilterId}`;
        } else {
            const filters = [];
            Object.keys(selections).forEach(catId => {
                const sel = selections[catId];
                if (sel && sel.mode !== 'none') {
                    filters.push({
                        id: parseInt(catId),
                        tags: sel.mode === 'some' ? sel.tags : [],
                        stufe: sel.stufe
                    });
                }
            });
            if (filters.length > 0) {
                query = `filters=${encodeURIComponent(JSON.stringify(filters))}`;
            }
        }
        // User requested http(s) link ending in .ics
        setGeneratedUrl(`${protocol}//${host}/kalender_new/api/export/ics/schulkalender.ics?${query}`);
    }, [selections, selectedFilterId]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-xl shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden">

                <div className="w-full md:w-64 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Meine Kalender</span>
                        <button onClick={handleNewFilter} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-primary" title="Neu"><Plus size={20} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {savedFilters.map(filter => (
                            <div
                                key={filter.id}
                                onClick={() => loadFilter(filter)}
                                className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${selectedFilterId === filter.id ? 'bg-white shadow dark:bg-slate-800' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                            >
                                <span className="text-sm truncate font-medium text-gray-700 dark:text-gray-300">{filter.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(filter.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex-1 mr-4">
                            <div className="flex items-center gap-2 mb-1">
                                {selectedFilterId && !isEditingName ? (
                                    <>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate">{filterName}</h2>
                                        <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-primary"><Edit3 size={16} /></button>
                                    </>
                                ) : (
                                    <input
                                        type="text"
                                        className="text-xl font-bold text-gray-800 dark:text-white bg-transparent border-b border-gray-300 focus:border-primary outline-none w-full"
                                        placeholder="Name des Kalenders..."
                                        value={filterName}
                                        onChange={(e) => setFilterName(e.target.value)}
                                        autoFocus={isEditingName}
                                    />
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 space-y-4">
                        <div className="space-y-2">
                            {filteredCategories.map(cat => {
                                const catId = cat.id.toString();
                                const sel = selections[cat.id] || { mode: 'none', tags: [], stufe: '' };

                                const isExpanded = expandedCategories[catId];
                                const catTags = getCategoryTags(cat.id);
                                const hasChildren = catTags.length > 0 || catId === '5';

                                return (
                                    <div key={cat.id} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                        <div className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${isExpanded ? 'border-b border-gray-100 dark:border-slate-600' : ''}`}>
                                            <button
                                                onClick={() => toggleExpand(catId)}
                                                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 ${!hasChildren ? 'invisible' : ''}`}
                                            >
                                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            </button>

                                            <button
                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${sel.mode !== 'none' ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'}`}
                                                onClick={() => handleCategoryToggle(cat.id)}
                                            >
                                                {sel.mode === 'all' && <Check size={14} strokeWidth={3} />}
                                                {sel.mode === 'some' && <Minus size={14} strokeWidth={3} />}
                                            </button>

                                            <label onClick={() => handleCategoryToggle(cat.id)} className="flex items-center gap-2 cursor-pointer flex-1 select-none">
                                                <span style={{ backgroundColor: cat.color }} className="w-3 h-3 rounded-full inline-block"></span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{cat.title}</span>
                                            </label>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-3 pl-12 space-y-3 bg-white dark:bg-slate-800">
                                                {catId === '5' && (
                                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-200 dark:border-yellow-900/30 mb-3">
                                                        <select
                                                            value={sel.stufe}
                                                            onChange={(e) => handleStufeChange(cat.id, e.target.value)}
                                                            className="form-select text-sm py-1 rounded bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 w-full"
                                                        >
                                                            <option value="">Alle Stufen</option>
                                                            {['E1', 'E2', 'Q1', 'Q2', 'Q3', 'Q4'].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {catTags.filter(tag => {
                                                        const tagName = tag.name || tag.title;
                                                        if (!tagName) return false;
                                                        // Filter displayed tags if Stufe is selected (only for Klausuren id=5)
                                                        if (catId === '5' && sel.stufe) {
                                                            return tagName.includes(sel.stufe);
                                                        }
                                                        return true;
                                                    }).map(tag => {
                                                        const tagId = tag.id;
                                                        const tagName = tag.title || tag.name;
                                                        const isTagChecked = sel.mode === 'all' || (sel.mode === 'some' && sel.tags.includes(tagId));

                                                        return (
                                                            <label key={tag.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                                                <div
                                                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isTagChecked ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'}`}
                                                                >
                                                                    {isTagChecked && <Check size={12} strokeWidth={3} />}
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={isTagChecked}
                                                                    onChange={() => handleTagToggle(cat.id, tagId)}
                                                                />
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">{tagName}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {selectedFilterId && (
                            <section className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700 mt-4">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Abo-Link für "{filterName}"</label>
                                <div className="flex gap-2">
                                    <input type="text" readOnly value={generatedUrl} className="flex-1 text-sm p-2 rounded border border-gray-300 bg-white select-all font-mono" />
                                    <button onClick={copyToClipboard} className="px-4 py-2 bg-white border border-gray-300 rounded"><Copy size={18} /></button>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/50 rounded-b-xl">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Schließen</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center gap-2"><Save size={18} /> Speichern</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarExportModal;
