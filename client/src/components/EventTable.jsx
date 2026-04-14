import React from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';

const EventTable = ({ events, tags = [], onEventClick, settings }) => {
    // Sort events by start date, and filter out events that have already ended
    const now = new Date();
    const activeEvents = [...(events || [])].filter(evt => new Date(evt.end) >= now);
    
    const sortedEvents = activeEvents.sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
            <div className="overflow-x-auto print:overflow-visible">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-sm print:text-[10pt] print:divide-black">
                    <thead className="bg-gray-50/80 dark:bg-slate-700/50 print:bg-transparent">
                        <tr>
                            <th scope="col" className="px-6 py-3 print:px-2 print:py-1 text-left font-semibold text-gray-900 dark:text-gray-100 print:text-black uppercase tracking-wider print:border-b-2 print:border-black">Datum</th>
                            <th scope="col" className="px-6 py-3 print:px-2 print:py-1 text-left font-semibold text-gray-900 dark:text-gray-100 print:text-black uppercase tracking-wider print:border-b-2 print:border-black">Zeit</th>
                            <th scope="col" className="px-6 py-3 print:px-2 print:py-1 text-left font-semibold text-gray-900 dark:text-gray-100 print:text-black uppercase tracking-wider print:border-b-2 print:border-black">Titel</th>
                            <th scope="col" className="hidden sm:table-cell print:table-cell px-6 py-3 print:px-2 print:py-1 text-left font-semibold text-gray-900 dark:text-gray-100 print:text-black uppercase tracking-wider print:border-b-2 print:border-black">Kategorie</th>
                            <th scope="col" className="hidden md:table-cell print:table-cell px-6 py-3 print:px-2 print:py-1 text-left font-semibold text-gray-900 dark:text-gray-100 print:text-black uppercase tracking-wider print:border-b-2 print:border-black">Tags</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700 print:bg-transparent print:divide-gray-400">
                        {sortedEvents.map(evt => {
                            const start = parseISO(evt.start);
                            const end = parseISO(evt.end);
                            const isMultiDay = !isSameDay(start, end);
                            
                            // Format Date string
                            let dateStr = format(start, 'dd.MM.yyyy');
                            if (isMultiDay) {
                                dateStr += ` - ${format(end, 'dd.MM.yyyy')}`;
                            }

                            // Format Time string
                            let timeStr = 'Ganztägig';
                            if (!evt.isAllDay) {
                                if (format(start, 'HH:mm') === format(end, 'HH:mm') && format(start, 'HH:mm') !== '00:00') {
                                    timeStr = format(start, 'HH:mm');
                                } else if (format(end, 'HH:mm') === '00:00' || format(end, 'HH:mm') === '') {
                                    timeStr = `ab ${format(start, 'HH:mm')} Uhr`;
                                } else {
                                    timeStr = `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')} Uhr`;
                                }
                            }

                            // Dynamic style based on type
                            let rowClass = "hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group print:break-inside-avoid";
                            let titleClass = "font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors print:text-black";
                            
                            if (evt.type === 'holiday') {
                                rowClass += " bg-red-50/30 dark:bg-red-900/10 print:bg-transparent";
                                titleClass = "font-bold text-red-700 dark:text-red-400 print:text-black";
                            } else if (evt.type === 'vacation') {
                                rowClass += " bg-yellow-50/50 dark:bg-yellow-900/10 print:bg-transparent";
                                titleClass = "font-semibold text-yellow-800 dark:text-yellow-500 print:text-black";
                            }

                            // Extract tags from description (IDs stored as lines or #hashtags in ICS)
                            let eventTags = [];
                            if (evt.description && tags.length > 0) {
                                const descStr = String(evt.description);
                                const descLower = descStr.toLowerCase();
                                
                                // 1. Match by Tag ID directly embedded in description (e.g. "KLA:Q1_A" or "ABW:BFS")
                                const matchedById = tags.filter(t => descStr.includes(t.id)).map(t => t.name);
                                
                                // 2. Match by exact Tag Name as substring (fallback for synced events without full ID)
                                const matchedByName = tags.filter(t => t.name && t.name.length >= 2 && descLower.includes(t.name.toLowerCase())).map(t => t.name);
                                
                                // 3. Match explicit #Hashtags
                                const hashTags = (descStr.match(/#[A-Za-zäöüÄÖÜß0-9_-]+/g) || []).map(t => t.substring(1));
                                
                                // Combine all matches and ensure uniqueness
                                eventTags = [...new Set([...matchedById, ...matchedByName, ...hashTags])];
                            }

                            return (
                                <tr 
                                    key={evt.id} 
                                    className={rowClass}
                                    onClick={() => onEventClick && onEventClick(evt)}
                                >
                                    <td className="px-6 py-4 print:px-2 print:py-1 whitespace-nowrap text-gray-700 dark:text-gray-300 print:text-black">
                                        {dateStr}
                                    </td>
                                    <td className="px-6 py-4 print:px-2 print:py-1 whitespace-nowrap text-gray-500 dark:text-gray-400 print:text-black">
                                        {timeStr}
                                    </td>
                                    <td className="px-6 py-4 print:px-2 print:py-1">
                                        <div className={titleClass}>
                                            {evt.title}
                                            {evt.status === 'pending' && (
                                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 print:hidden border border-yellow-200 dark:border-yellow-800">Ausstehend</span>
                                            )}
                                        </div>
                                        {evt.location && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 print:text-[8pt] print:text-gray-700">{evt.location}</div>
                                        )}
                                    </td>
                                    <td className="hidden sm:table-cell print:table-cell px-6 py-4 print:px-2 print:py-1 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 print:px-0 print:py-0 rounded-full text-xs print:text-[8pt] font-medium bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300 print:bg-transparent print:text-gray-700 border print:border-none print:font-normal">
                                            {evt.Category?.title || 'Unkategorisiert'}
                                        </span>
                                    </td>
                                    <td className="hidden md:table-cell print:table-cell px-6 py-4 print:px-2 print:py-1 whitespace-nowrap">
                                        {eventTags.length > 0 && (
                                            <div className="flex gap-1 flex-wrap max-w-[150px] print:max-w-none">
                                                {eventTags.map((tagName, idx) => (
                                                    <span key={idx} className="inline-block text-[10px] print:text-[7pt] text-gray-500 dark:text-gray-400 print:text-gray-600 bg-gray-50 dark:bg-slate-800 print:bg-transparent border border-gray-200 dark:border-slate-600 print:border-none px-1.5 py-0.5 rounded">
                                                        #{tagName}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {sortedEvents.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    Keine Termine für diesen Zeitraum gefunden.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventTable;
