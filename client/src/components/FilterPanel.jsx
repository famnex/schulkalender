import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Filter, Calendar as CalIcon, RefreshCw, Printer, Search, CalendarPlus, ChevronDown, ChevronUp, Share, Check } from 'lucide-react';
import clsx from 'clsx';
import CalendarExportModal from './CalendarExportModal';

const FilterPanel = ({ filters, onFilterChange, eventsLoading }) => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [savedFilters, setSavedFilters] = useState([]);

    const [showPrintDialog, setShowPrintDialog] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [shared, setShared] = useState(false);

    // Load categories/tags on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, tagRes] = await Promise.all([
                    api.get('/public/categories'),
                    api.get('/public/tags')
                ]);
                setCategories(catRes.data);
                setTags(tagRes.data);
            } catch (err) {
                console.error('Failed to load filters', err);
            }
        };
        fetchData();
    }, []);

    // Load saved filters if user
    useEffect(() => {
        if (user) {
            api.get('/filters').then(res => setSavedFilters(res.data)).catch(console.error);
        }
    }, [user, showExportModal]); // Reload when export modal closes (might have saved new one)

    const handleShare = () => {
        const protocol = window.location.protocol;
        const host = window.location.host;
        let query = '';

        if (filters.token) {
            query = `token=${filters.token}`;
        } else {
            const exportFilters = [];
            if (filters.categoryId && filters.categoryId !== '0') {
                exportFilters.push({
                    id: parseInt(filters.categoryId),
                    tags: filters.tags,
                    stufe: filters.stufe
                });
            }
            if (exportFilters.length > 0) {
                query = `filters=${encodeURIComponent(JSON.stringify(exportFilters))}`;
            }
        }

        const url = `${protocol}//${host}/kalender_new/api/export/ics/schulkalender.ics${query ? '?' + query : ''}`;

        navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 3000);
    };
    const handleCategoryChange = (e) => {
        const val = e.target.value;
        if (val.startsWith('saved:')) {
            const token = val.split(':')[1];
            const foundFilter = savedFilters.find(f => f.id == token);
            const name = foundFilter ? foundFilter.name : '';
            onFilterChange({ ...filters, categoryId: val, token, stufe: '', tags: [], filterName: name });
        } else {
            onFilterChange({ ...filters, categoryId: val, token: null, stufe: '', tags: [], filterName: null });
        }
    };

    const handleStufeChange = (e) => {
        onFilterChange({ ...filters, stufe: e.target.value });
    };

    const handlePrint = (months) => {
        if (months === 1) {
            // Open 1 month view in a new popup window
            const params = new URLSearchParams();
            params.set('categoryId', filters.categoryId);
            if (filters.token) params.set('token', filters.token);
            if (filters.filterName) params.set('filterName', filters.filterName);
            if (filters.stufe) params.set('stufe', filters.stufe);
            params.set('startMonth', filters.startMonth);
            if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));

            const url = `${window.location.origin}/kalender_new/print?${params.toString()}`;
            window.open(url, 'PrintView', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1000,height=800');
        } else {
            // For 6 months: do it in-place (landscape requested)
            onFilterChange({ ...filters, printMonths: months });
            setTimeout(() => window.print(), 300);
            setTimeout(() => onFilterChange({ ...filters, printMonths: undefined }), 2000);
        }
        setShowPrintDialog(false);
    };

    const [isExpanded, setIsExpanded] = useState(false);

    // Filter displayed categories (No Ferien/Feiertage)
    const displayCategories = categories.filter(c => {
        const t = (c.title || '').toLowerCase();
        return !t.includes('ferien') && !t.includes('feiertag');
    });

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 mb-6 print:hidden">
            {/* Mobile Toggle Header */}
            <div className="flex md:hidden justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
                    <Filter size={18} />
                    <span>Filter & Menü</span>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {/* Content (Collapsible on mobile, visible on desktop) */}
            <div className={clsx(
                "flex-col md:flex-row gap-4 items-center justify-between mt-4 md:mt-0",
                isExpanded ? "flex" : "hidden md:flex"
            )}>

                {/* Left: Filters */}
                <div className="flex flex-wrap gap-4 items-center flex-grow w-full md:w-auto">
                    <div className="hidden md:flex items-center gap-2">
                        <Filter size={18} className="text-gray-400" />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">Filter:</span>
                    </div>

                    <select
                        className="form-select block w-full md:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={filters.categoryId}
                        onChange={handleCategoryChange}
                    >
                        <option value="0">Alle Kategorien</option>
                        {displayCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}

                        {savedFilters.length > 0 && (
                            <>
                                <option disabled>-----------</option>
                                <optgroup label="Meine Kalender">
                                    {savedFilters.map(f => (
                                        <option key={f.id} value={`saved:${f.id}`}>{f.name}</option>
                                    ))}
                                </optgroup>
                            </>
                        )}
                    </select>

                    {/* Conditional Filter for Klausuren (ID 5 usually) */}
                    {filters.categoryId == '5' && (
                        <select
                            className="form-select block w-full md:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={filters.stufe || ''}
                            onChange={handleStufeChange}
                        >
                            <option value="0">Alle Stufen</option>
                            {['E1', 'E2', 'Q1', 'Q2', 'Q3', 'Q4'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    )}

                    {/* Date Picker (Start Month) */}
                    <input
                        type="month"
                        className="form-input block w-full md:w-auto rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        value={filters.startMonth}
                        onChange={(e) => onFilterChange({ ...filters, startMonth: e.target.value })}
                    />

                </div>

                {/* Right: Actions */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 relative w-full md:w-auto">
                    {eventsLoading && <RefreshCw className="animate-spin text-gray-400 hidden md:block" size={20} />}

                    <div className="flex gap-1">
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 rounded-l-md transition-colors dark:bg-slate-700 dark:text-blue-300 dark:hover:bg-slate-600"
                            title="Individuellen Kalender erstellen"
                        >
                            <CalendarPlus size={18} />
                            <span>Individuell</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 rounded-r-md border-l border-blue-200 dark:border-slate-600 transition-colors dark:bg-slate-700 dark:text-blue-300 dark:hover:bg-slate-600"
                            title="Kalender-Abo-Link teilen"
                        >
                            {shared ? <Check size={18} className="text-green-600" /> : <Share size={18} />}
                        </button>

                        {shared && (
                            <div className="absolute bottom-full mb-2 right-0 bg-slate-800 text-white text-xs p-2 rounded shadow-lg z-50 animate-in fade-in slide-in-from-bottom-1 w-48 pointer-events-none">
                                Abo-Link kopiert! Importiere diesen Link in dein Kalenderprogramm (Outlook, Google, etc.).
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowPrintDialog(!showPrintDialog)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
                    >
                        <Printer size={18} />
                        <span>Drucken</span>
                    </button>

                    {/* Print Dialog Popover */}
                    {showPrintDialog && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 z-50 p-2">
                            <div className="text-sm font-semibold mb-2 px-2 text-gray-700 dark:text-gray-200">Druckansicht:</div>
                            <button onClick={() => handlePrint(1)} className="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 rounded text-sm text-gray-700 dark:text-gray-200">
                                1 Monat
                            </button>
                            <button onClick={() => handlePrint(6)} className="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 rounded text-sm text-gray-700 dark:text-gray-200">
                                6 Monate (Querformat)
                            </button>
                        </div>
                    )}
                </div>

                {/* Export Modal */}
                {showExportModal && (
                    <CalendarExportModal
                        categories={categories}
                        tags={tags}
                        onClose={() => setShowExportModal(false)}
                    />
                )}

            </div>
        </div>
    );
};

export default FilterPanel;
