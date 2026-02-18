import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CalendarGrid from '../components/CalendarGrid';
import api from '../api';

const PrintView = () => {
    const [searchParams] = useSearchParams();
    const [events, setEvents] = useState([]);
    const [settings, setSettings] = useState({});
    const [categories, setCategories] = useState([]);

    // Extract filters from URL
    const categoryId = searchParams.get('categoryId') || '0';
    const stufe = searchParams.get('stufe') || '0';
    const startMonthStr = searchParams.get('startMonth') || new Date().toISOString().substring(0, 7);
    const tags = searchParams.get('tags') ? searchParams.get('tags').split(',') : [];
    const token = searchParams.get('token');
    const filterName = searchParams.get('filterName');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Load Settings
                const settingsRes = await api.get('/public/settings');
                setSettings(settingsRes.data);

                // 2. Load Categories (for title)
                const catsRes = await api.get('/public/categories');
                setCategories(catsRes.data);

                // 3. Load Events
                // Build query params
                const params = new URLSearchParams();

                // Only pass categoryId if it's NOT a saved filter placeholder
                if (categoryId !== '0' && !categoryId.startsWith('saved:') && !token) {
                    params.append('categoryId', categoryId);
                }

                if (token) params.append('token', token);

                if (stufe && stufe !== '0') params.append('stufe', stufe);
                // Reference tags safely inside the effect, as it's derived from searchParams
                const currentTags = searchParams.get('tags') ? searchParams.get('tags').split(',') : [];
                if (currentTags.length > 0) params.append('tags', currentTags.join(','));

                // Use simple YYYY-MM string like Home.jsx does
                params.append('start', startMonthStr);

                // Try both authenticated and public endpoints
                let fetchedEvents = [];
                try {
                    // Try authenticated first (if cookie/token exists)
                    const res = await api.get('/events', { params });
                    fetchedEvents = res.data;
                } catch (e) {
                    console.log('Auth events failed, trying public', e);
                    try {
                        const res = await api.get('/public/events', { params });
                        fetchedEvents = res.data;
                    } catch (e2) {
                        console.error('Public events failed', e2);
                    }
                }

                setEvents(fetchedEvents);

            } catch (err) {
                console.error("Failed to load print data", err);
            } finally {
                // Always print, even if empty
                setTimeout(() => {
                    window.print();
                }, 1000);

                // Close after print dialog is closed
                window.onafterprint = () => {
                    window.close();
                };
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId, stufe, startMonthStr, searchParams.toString()]); // Depend on everything


    // Helper for title
    const getTitle = () => {
        if (token) return filterName || 'Mein Kalender';

        let title = 'Schulkalender';
        const cat = categories.find(c => c.id == categoryId);
        if (cat) {
            title = cat.title;
            if (categoryId == '5' && stufe && stufe !== '0') {
                title += ` - ${stufe}`;
            }
        }
        return title;
    };

    return (
        <div className="bg-white min-h-screen p-4 print:p-0">
            {/* Header matches Home.jsx print header logic */}
            <div className="flex justify-between items-end border-b border-black pb-1 mb-1 print:break-after-avoid">
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
                        {getTitle()}
                    </span>
                </div>
            </div>

            <CalendarGrid
                events={events}
                startMonthStr={startMonthStr}
                monthsToShow={1}
                settings={settings}
            />

            {/* Timestamp Overlay */}
            <div className="fixed bottom-2 right-2 text-xs text-gray-500 opacity-50 bg-white/80 p-1 rounded z-50 print:block">
                Stand: {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>

            {/* Force print styles on screen as requested: "dort wird schon das monatsdesign wie es gedruckt wird ... angezeigt" */}
            <style>{`
                /* Force 2 column split layout for 1 month view on screen too */
                .print\\:grid-cols-2-split {
                    display: grid !important;
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 20px !important;
                }
                .print\\:border-r {
                    border-right-width: 1px !important;
                    border-color: #1f2937 !important; /* gray-800 */
                }
                .hidden.print\\:flex {
                    display: flex !important;
                }
                .print\\:text-\\[7pt\\] {
                    font-size: 9pt !important; /* Slightly larger for screen readability? User said "wie es gedruckt wird", so keep it tight or legible? Print is 7pt. Screen might need to match.*/
                }
                
                /* Ensure background is white */
                body { background-color: white !important; }
            `}</style>
        </div>
    );
};

export default PrintView;
