import React, { useState, useEffect } from 'react';
import api from '../api';
import FilterPanel from '../components/FilterPanel';
import CalendarGrid from '../components/CalendarGrid';
import EventTable from '../components/EventTable';
import NewEventModal from '../components/NewEventModal';
import PendingEventsModal from '../components/PendingEventsModal';
import { format } from 'date-fns';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [filters, setFilters] = useState({
        categoryId: '0',
        tags: [],
        stufe: '',
        startMonth: format(new Date(), 'yyyy-MM')
    });

    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [showApprovals, setShowApprovals] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Fetch Categories and Settings
        Promise.all([
            api.get('/public/categories'),
            api.get('/public/settings'),
            api.get('/public/tags')
        ]).then(([catRes, setRes, tagsRes]) => {
            setCategories(Array.isArray(catRes.data) ? catRes.data : []);
            setSettings(setRes.data || {});
            setTags(Array.isArray(tagsRes.data) ? tagsRes.data : []);
        }).catch(console.error);
    }, []);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
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
                setEvents(Array.isArray(res.data) ? res.data : []);
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
                onOpenNewEvent={() => setEditingEvent({})}
                onOpenApprovals={() => setShowApprovals(true)}
            />

            {/* Print Header */}
            <div className={clsx(
                "print:block print:break-inside-avoid",
                filters.printMonths === 1 ? 'print-portrait' : 'print-landscape',
                filters.printMonths === 12 && 'print-a3'
            )}>
                <div className="hidden print:flex justify-between items-end border-b border-black pb-1 mb-1 print:break-after-avoid">
                    <div className="flex items-center gap-4">
                        {settings.school_logo && (
                            <img
                                src={(() => {
                                    const logo = settings.school_logo;
                                    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
                                    if (logo.startsWith(baseUrl)) return logo;
                                    if (logo.startsWith('/')) return `${baseUrl}${logo}`;
                                    return logo;
                                })()}
                                alt="Logo"
                                className="h-6 w-auto object-contain"
                            />
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
                                const cat = Array.isArray(categories) ? categories.find(c => c.id == filters.categoryId) : null;
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

                {(filters.viewMode === 'list') ? (
                    <EventTable
                        events={events}
                        tags={tags}
                        settings={settings}
                        onEventClick={(evt) => {
                            if (user) {
                                if (!evt.isManual) {
                                    if (user.isAdmin) alert('Dieser Termin wird automatisch synchronisiert und kann hier nicht bearbeitet werden. Bitte ändere ihn im verknüpften Ursprungskalender.');
                                    return;
                                }
                                if (user.isAdmin || (evt.status === 'pending' && evt.creatorId === user.id)) {
                                    setEditingEvent(evt);
                                } else {
                                    if (evt.creatorId === user.id) {
                                        alert('Dieser Termin wurde bereits veröffentlicht und kann nicht mehr bearbeitet werden.');
                                    }
                                }
                            }
                        }}
                    />
                ) : (
                    <CalendarGrid
                        events={events}
                        startMonthStr={filters.startMonth}
                        monthsToShow={filters.printMonths || (isMobile ? 6 : 3)}
                        settings={settings}
                        onEventClick={(evt) => {
                            if (user) {
                                if (!evt.isManual) {
                                    if (user.isAdmin) alert('Dieser Termin wird automatisch synchronisiert und kann hier nicht bearbeitet werden. Bitte ändere ihn im verknüpften Ursprungskalender.');
                                    return;
                                }
                                if (user.isAdmin || (evt.status === 'pending' && evt.creatorId === user.id)) {
                                    setEditingEvent(evt);
                                } else {
                                    if (evt.creatorId === user.id) {
                                        alert('Dieser Termin wurde bereits veröffentlicht und kann nicht mehr bearbeitet werden.');
                                    }
                                }
                            }
                        }}
                    />
                )}

                <div className="hidden print:block fixed bottom-2 right-2 text-xs text-gray-500 opacity-50 bg-white/80 p-1 rounded z-50">
                    Stand: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
            </div>

            {editingEvent && (
                <NewEventModal
                    categories={categories}
                    tags={tags}
                    editEvent={editingEvent}
                    onClose={() => setEditingEvent(null)}
                    onEventCreated={() => {
                        setEditingEvent(null);
                        setFilters({ ...filters }); // refresh events
                    }}
                />
            )}

            {showApprovals && (
                <PendingEventsModal
                    onClose={() => setShowApprovals(false)}
                    onEventPublished={() => setFilters({ ...filters })}
                    onEditEvent={(evt) => {
                        setEditingEvent(evt);
                        setShowApprovals(false);
                    }}
                />
            )}
        </div>
    );
};

export default Home;
