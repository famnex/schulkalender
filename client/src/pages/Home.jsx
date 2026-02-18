import React, { useState, useEffect } from 'react';
import api from '../api';
import FilterPanel from '../components/FilterPanel';
import CalendarGrid from '../components/CalendarGrid';
import { format } from 'date-fns';

const Home = () => {
    const [filters, setFilters] = useState({
        categoryId: '0',
        tags: [],
        stufe: '',
        startMonth: format(new Date(), 'yyyy-MM')
    });

    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch Categories and Settings
        Promise.all([
            api.get('/public/categories'),
            api.get('/public/settings')
        ]).then(([catRes, setRes]) => {
            setCategories(catRes.data);
            setSettings(setRes.data || {});
        }).catch(console.error);
    }, []);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('print')) {
            const printMonths = parseInt(queryParams.get('print'));
            setFilters(prev => ({
                ...prev,
                categoryId: queryParams.get('categoryId') || '0',
                stufe: queryParams.get('stufe') || '',
                tags: queryParams.get('tags') ? queryParams.get('tags').split(',') : [],
                startMonth: queryParams.get('startMonth') || prev.startMonth,
                printMonths: printMonths
            }));

            // Auto-trigger print after a short delay to allow data load
            setTimeout(() => {
                window.print();
            }, 1500);
        }
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const { categoryId, tags, stufe, startMonth, token } = filters;
                const params = {
                    start: startMonth,
                    categoryId: (categoryId && categoryId !== '0' && !categoryId.startsWith('saved:')) ? categoryId : undefined,
                    stufe: stufe || undefined,
                    tags: tags && tags.length > 0 ? tags.join(',') : undefined,
                    token: token || undefined
                };

                const res = await api.get('/events', { params });
                setEvents(res.data);
            } catch (err) {
                console.error('Failed to load events', err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchEvents, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 print:hidden">
                {settings.school_name || 'Schulkalender'}
            </h1>

            <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                eventsLoading={loading}
            />

            {/* Print Header */}
            <div className={`print:block ${filters.printMonths === 1 ? 'print-portrait' : 'print-landscape'} print:break-inside-avoid`}>
                <div className="hidden print:flex justify-between items-end border-b border-black pb-1 mb-1 print:break-after-avoid">
                    <div className="flex items-center gap-4">
                        {settings.school_logo && (
                            <img src={settings.school_logo} alt="Logo" className="h-6 w-auto object-contain" />
                        )}
                        <span className="text-lg font-bold text-black uppercase">
                            {settings.school_name || 'Schulkalender'}
                        </span>
                    </div>

                    <div className="text-right">
                        <span className="text-base font-bold text-black italic">
                            {(() => {
                                if (filters.token) {
                                    return filters.filterName || 'Mein Kalender';
                                }
                                const cat = categories.find(c => c.id == filters.categoryId);
                                if (!cat) return 'Gesamtübersicht';
                                let title = cat.title;
                                if (filters.categoryId == '5' && filters.stufe && filters.stufe !== '0') {
                                    title += ` - ${filters.stufe}`;
                                }
                                return title;
                            })()}
                        </span>
                    </div>
                </div>

                <CalendarGrid
                    events={events}
                    startMonthStr={filters.startMonth}
                    monthsToShow={filters.printMonths || 6}
                    settings={settings}
                />

                <div className="hidden print:block fixed bottom-2 right-2 text-xs text-gray-500 opacity-50 bg-white/80 p-1 rounded z-50">
                    Stand: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
            </div>
        </div>
    );
};

export default Home;
