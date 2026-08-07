import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Filter, Calendar as CalIcon, RefreshCw, Printer, Search, CalendarPlus, ChevronDown, ChevronUp, Share, Check, Plus, LayoutGrid, List, Inbox, Menu as MenuIcon } from 'lucide-react';
import clsx from 'clsx';
import CalendarExportModal from './CalendarExportModal';

const FilterPanel = ({ filters, onFilterChange, eventsLoading, onOpenNewEvent, onOpenApprovals }) => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [savedFilters, setSavedFilters] = useState([]);

    const [showPrintDialog, setShowPrintDialog] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [shared, setShared] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Load categories/tags on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, tagRes] = await Promise.all([
                    api.get('/public/categories'),
                    api.get('/public/tags')
                ]);
                setCategories(Array.isArray(catRes.data) ? catRes.data : []);
                setTags(Array.isArray(tagRes.data) ? tagRes.data : []);
            } catch (err) {
                console.error('Failed to load filters', err);
                setCategories([]);
                setTags([]);
            }
        };
        fetchData();
    }, []);

    // Load saved filters if user
    useEffect(() => {
        if (user) {
            api.get('/filters').then(res => setSavedFilters(Array.isArray(res.data) ? res.data : [])).catch(err => {
                console.error('Failed to load filters', err);
                setSavedFilters([]);
            });
        }
    }, [user, showExportModal]);

    // Fetch pending count
    useEffect(() => {
        const canManageEvents = user && (user.isAdmin === true || user.isAdmin === 1 || user.role === 'manager' || user.role === 'admin');
        if (canManageEvents) {
            api.get(`/admin/events/pending?_t=${new Date().getTime()}`)
                .then(res => setPendingCount(Array.isArray(res.data) ? res.data.length : 0))
                .catch(console.error);
        }
    }, [user, filters]);

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
            const foundFilter = Array.isArray(savedFilters) ? savedFilters.find(f => f.id == token) : null;
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showMobilePrintOptions, setShowMobilePrintOptions] = useState(false);

    // Filter displayed categories (No Ferien/Feiertage)
    const displayCategories = Array.isArray(categories) ? categories.filter(c => {
        const t = (c.title || '').toLowerCase();
        return !t.includes('ferien') && !t.includes('feiertag');
    }) : [];

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 mb-6 print:hidden relative">
            {/* Mobile Toggle Header */}
            <div className="flex md:hidden justify-between items-center relative">
                <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200 cursor-pointer flex-grow" onClick={() => setIsExpanded(!isExpanded)}>
                    <Filter size={18} />
                    <span>Filter & Anzeige</span>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {/* Burger Menu Button for Mobile Actions */}
                <div className="relative z-40">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
                        className="p-2 text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-blue-400 relative"
                        title="Menü"
                    >
                        <MenuIcon size={24} />
                        {pendingCount > 0 && (user?.isAdmin || user?.role === 'manager') && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white dark:border-slate-800">
                                {pendingCount}
                            </span>
                        )}
                    </button>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 p-2 flex flex-col gap-1 z-40">
                            <button onClick={() => { setShowExportModal(true); setIsMobileMenuOpen(false); }} className="flex items-center w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded text-sm text-gray-700 dark:text-gray-200">
                                <CalendarPlus size={18} className="mr-3" />
                                Kalender-Abo
                            </button>
                            <button onClick={() => { handleShare(); setIsMobileMenuOpen(false); }} className="flex items-center w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded text-sm text-gray-700 dark:text-gray-200">
                                {shared ? <Check size={18} className="mr-3 text-green-500" /> : <Share size={18} className="mr-3" />}
                                {shared ? 'Link kopiert!' : 'Link kopieren'}
                            </button>
                            <div className="relative">
                                <button onClick={() => {
                                    if (filters.viewMode === 'list') {
                                        setIsMobileMenuOpen(false);
                                        window.print();
                                    } else {
                                        setShowMobilePrintOptions(!showMobilePrintOptions);
                                    }
                                }} className="flex items-center w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded text-sm text-gray-700 dark:text-gray-200">
                                    <Printer size={18} className="mr-3" />
                                    Drucken
                                </button>
                                {showMobilePrintOptions && filters.viewMode !== 'list' && (
                                    <div className="pl-9 pb-2 flex flex-col gap-1">
                                        <button onClick={() => { handlePrint(1); setIsMobileMenuOpen(false); setShowMobilePrintOptions(false); }} className="text-left px-2 py-1.5 text-sm w-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-600 rounded">1 Monat</button>
                                        <button onClick={() => { handlePrint(6); setIsMobileMenuOpen(false); setShowMobilePrintOptions(false); }} className="text-left px-2 py-1.5 text-sm w-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-600 rounded">6 Monate (Quer)</button>
                                        <button onClick={() => { handlePrint(12); setIsMobileMenuOpen(false); setShowMobilePrintOptions(false); }} className="text-left px-2 py-1.5 text-sm w-full text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-600 rounded">12 Monate (A3)</button>
                                    </div>
                                )}
                            </div>

                            {user && (
                                <>
                                    <div className="h-px bg-gray-200 dark:bg-slate-600 my-1 mx-2"></div>
                                    {(user.isAdmin || user.role === 'manager') && (
                                        <button onClick={() => { onOpenApprovals(); setIsMobileMenuOpen(false); }} className="flex items-center w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded text-sm text-yellow-700 dark:text-yellow-400">
                                            <div className="relative mr-3">
                                                <Inbox size={18} />
                                                {pendingCount > 0 && (
                                                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white dark:border-slate-800">
                                                        {pendingCount}
                                                    </span>
                                                )}
                                            </div>
                                            Freigaben
                                        </button>
                                    )}
                                    <button onClick={() => { onOpenNewEvent(); setIsMobileMenuOpen(false); }} className="flex items-center w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded text-sm text-green-700 dark:text-green-400">
                                        <Plus size={18} className="mr-3" />
                                        Neuer Termin
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content (Collapsible on mobile, visible on desktop) */}
            <div className={clsx(
                "flex-col md:flex-row gap-4 items-start md:items-center justify-between mt-4 md:mt-0",
                isExpanded ? "flex" : "hidden md:flex"
            )}>

                {/* Left: Filters und Anzeige */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-grow w-full md:w-auto">

                    <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                        <div className="hidden md:flex items-center gap-2">
                            <Filter size={18} className="text-gray-400" />
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Filter:</span>
                        </div>

                        <select
                            className="form-select block w-full md:w-auto min-w-[200px] rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            value={filters.categoryId}
                            onChange={handleCategoryChange}
                        >
                            <option value="0">Alle Kategorien</option>
                            {displayCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}

                            {Array.isArray(savedFilters) && savedFilters.length > 0 && (
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

                    {/* View Mode Toggle */}
                    <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-gray-200 dark:border-slate-700 md:border-none">
                        <div className="flex items-center gap-2">
                            <span className="md:hidden font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                Anzeige:
                            </span>
                            <div className="hidden md:block w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                        </div>

                        <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-lg shrink-0">
                            <button
                                onClick={() => onFilterChange({ ...filters, viewMode: 'grid' })}
                                className={clsx(
                                    "p-1.5 rounded-md flex items-center justify-center transition-colors",
                                    (!filters.viewMode || filters.viewMode === 'grid') ? "bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                )}
                                title="Kalenderansicht"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => onFilterChange({ ...filters, viewMode: 'list' })}
                                className={clsx(
                                    "p-1.5 rounded-md flex items-center justify-center transition-colors",
                                    filters.viewMode === 'list' ? "bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                )}
                                title="Listenansicht"
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right: Actions (Desktop Only) */}
                <div className="hidden md:flex items-center gap-2 relative mt-4 md:mt-0">
                    {eventsLoading && <RefreshCw className="animate-spin text-gray-400" size={20} />}

                    {/* Export / Share / Print */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="flex shrink-0 items-center justify-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors dark:bg-slate-700 dark:text-blue-300 dark:hover:bg-slate-600 border border-blue-100 dark:border-transparent"
                            title="Kalender Feed / ICS Link generieren"
                        >
                            <CalendarPlus size={18} className="mr-1.5" />
                            <span className="font-medium text-sm">Kalender-Abo</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className={clsx(
                                "flex shrink-0 items-center justify-center px-3 py-2 rounded-lg transition-all duration-300 border border-blue-100 dark:border-transparent",
                                shared
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-blue-300 dark:hover:bg-slate-600"
                            )}
                            title="Link zur aktuellen Filter-Ansicht kopieren"
                        >
                            {shared ? <Check size={18} /> : <Share size={18} className="mr-1.5" />}
                            <span className="font-medium text-sm">{shared ? 'Kopiert' : 'Teilen'}</span>
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => {
                                    if (filters.viewMode === 'list') {
                                        window.print();
                                    } else {
                                        setShowPrintDialog(!showPrintDialog);
                                    }
                                }}
                                className={clsx(
                                    "flex shrink-0 items-center justify-center px-3 py-2 border rounded-lg transition-colors dark:border-transparent",
                                    showPrintDialog
                                        ? "bg-gray-200 border-gray-300 text-gray-900 dark:bg-slate-600 dark:text-white"
                                        : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                                )}
                                title="Ansicht drucken"
                            >
                                <Printer size={18} className="mr-1.5" />
                                <span className="font-medium text-sm">Drucken</span>
                            </button>

                            {/* Print Dialog Popover (Desktop) */}
                            {showPrintDialog && (
                                <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 z-50 p-2">
                                    <div className="text-sm font-semibold mb-2 px-2 text-gray-700 dark:text-gray-200">Druckansicht:</div>
                                    <button onClick={() => { handlePrint(1); setShowPrintDialog(false); }} className="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 rounded text-sm text-gray-700 dark:text-gray-200">
                                        1 Monat
                                    </button>
                                    <button onClick={() => { handlePrint(6); setShowPrintDialog(false); }} className="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 rounded text-sm text-gray-700 dark:text-gray-200">
                                        6 Monate (Querformat)
                                    </button>
                                    <button onClick={() => { handlePrint(12); setShowPrintDialog(false); }} className="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 rounded text-sm text-gray-700 dark:text-gray-200">
                                        12 Monate (A3 Querformat)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User/Admin Actions */}
                    {user && (
                        <>
                            <div className="w-px bg-gray-200 dark:bg-slate-700 my-1.5 mx-1 h-6"></div>
                            {(user.isAdmin || user.role === 'manager') && (
                                <div className="relative mr-2">
                                    <button
                                        onClick={onOpenApprovals}
                                        className="flex shrink-0 items-center justify-center px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 hover:text-yellow-800 rounded-lg transition-colors dark:bg-yellow-900/40 dark:text-yellow-400 dark:hover:bg-yellow-900/60 border border-yellow-200 dark:border-transparent shadow-sm"
                                        title="Terminfreigaben verwalten"
                                    >
                                        <Inbox size={18} className="mr-1.5" />
                                        <span className="font-medium text-sm">Freigaben</span>
                                    </button>
                                    {pendingCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 shadow-sm border border-white dark:border-slate-800">
                                            {pendingCount}
                                        </span>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={onOpenNewEvent}
                                className="flex shrink-0 items-center justify-center px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-800 rounded-lg transition-colors dark:bg-slate-700 dark:text-green-300 dark:hover:bg-slate-600 border border-green-200 dark:border-transparent shadow-sm"
                                title="Neuen Termin anlegen"
                            >
                                <Plus size={18} className="mr-1.5" />
                                <span className="font-medium text-sm">Neu</span>
                            </button>
                        </>
                    )}

                </div>
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
    );
};

export default FilterPanel;
