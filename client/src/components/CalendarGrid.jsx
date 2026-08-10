import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isWeekend, isSameDay, getDay, addMonths, parseISO, isBefore, isAfter, startOfDay, getISOWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import clsx from 'clsx';


const getValidStartDate = (monthStr) => {
    if (!monthStr || typeof monthStr !== 'string') {
        return startOfMonth(new Date());
    }
    const trimmed = monthStr.trim();
    if (!trimmed) {
        return startOfMonth(new Date());
    }

    let dateToParse = trimmed;
    if (/^\d{4}-\d{1,2}$/.test(trimmed)) {
        const [y, m] = trimmed.split('-');
        dateToParse = `${y}-${m.padStart(2, '0')}-01`;
    }

    const parsed = parseISO(dateToParse);
    if (!isNaN(parsed.getTime())) {
        return startOfMonth(parsed);
    }
    const fallback = new Date(trimmed);
    if (!isNaN(fallback.getTime())) {
        return startOfMonth(fallback);
    }
    return startOfMonth(new Date());
};

const getValidDate = (dateVal) => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
    const parsed = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal);
    if (!isNaN(parsed.getTime())) return parsed;
    const fallback = new Date(dateVal);
    if (!isNaN(fallback.getTime())) return fallback;
    return null;
};

const CalendarGrid = ({ events, startMonthStr, monthsToShow = 6, settings = {}, onEventClick }) => {
    const containerRef = React.useRef(null);
    const [isTooTall, setIsTooTall] = React.useState(false);
    const [tooltip, setTooltip] = React.useState(null); // { x, y, content }

    React.useEffect(() => {
        const checkHeight = () => {
            if (containerRef.current && monthsToShow > 1) {
                const monthElements = containerRef.current.querySelectorAll('.break-inside-avoid');
                let maxMonthHeight = 0;
                monthElements.forEach(el => {
                    const h = el.offsetHeight;
                    if (h > maxMonthHeight) maxMonthHeight = h;
                });

                const threshold = 680;
                const tooTall = maxMonthHeight > threshold;

                console.log(`[PrintAutoScaling] Max Month Height: ${maxMonthHeight}px (Threshold: ${threshold}px) -> Compact: ${tooTall}`);

                if (tooTall) {
                    setIsTooTall(true);
                } else {
                    setIsTooTall(false);
                }
            }
        };

        const timer = setTimeout(checkHeight, 300);
        return () => clearTimeout(timer);
    }, [events, monthsToShow, startMonthStr, settings]);

    // Generate months safely based on startMonthStr (YYYY-MM)
    const startDate = getValidStartDate(startMonthStr);
    const months = Array.from({ length: monthsToShow || 6 }).map((_, i) => addMonths(startDate, i));

    // Helper to find events for a day
    const getEventsForDay = (date) => {
        if (!Array.isArray(events) || !date || isNaN(date.getTime())) return [];
        return events.filter(e => {
            if (!e || !e.start || !e.end) return false;
            const dayStart = startOfDay(date);
            const evtStart = getValidDate(e.start);
            const evtEnd = getValidDate(e.end);
            if (!evtStart || !evtEnd) return false;
            // Overlap: (EventStart <= DayEnd) and (EventEnd >= DayStart)
            return evtStart <= new Date(dayStart.getTime() + 86399999) && evtEnd >= dayStart;
        });
    };


    // Use settings for colors
    const vacationColor = settings.vacation_color || '#FFFBEB';
    const vacationTextColor = settings.vacation_text_color || '#713F12';
    const holidayColor = settings.holiday_color || '#FEF2F2';
    const holidayTextColor = settings.holiday_text_color || '#991B1B';
    const weekendColor = settings.weekend_color || '#F3F4F6';
    const weekendTextColor = settings.weekend_text_color || '#4B5563';

    const getPrintTimeStr = (evt, currentDay) => {
        if (!evt || evt.isAllDay || !evt.start || !evt.end || !currentDay || isNaN(currentDay.getTime())) return '';
        const start = getValidDate(evt.start);
        const end = getValidDate(evt.end);
        if (!start || !end) return '';
        
        const isStartDay = isSameDay(start, currentDay);
        const isEndDay = isSameDay(end, currentDay);

        const startStr = format(start, 'HH:mm');
        const endStr = format(end, 'HH:mm');

        if (isStartDay && isEndDay) {
            if (startStr === endStr) return `(${startStr})`; 
            return `(${startStr} - ${endStr})`;
        } else if (isStartDay) {
            return `(ab ${startStr})`;
        } else if (isEndDay) {
             if (endStr === '00:00' || endStr === '') return '';
             return `(bis ${endStr})`;
        } else {
            return '';
        }
    };

    // Custom styling helper
    const getDayStyle = (date, dayEvents) => {
        const dayOfWeek = getDay(date); // 0=Sun, 6=Sat
        const isToday = isSameDay(date, new Date());
        const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

        // Defaults
        let style = {};
        let className = "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100";

        const isHolidayEvent = dayEvents.some(e => e.type === 'holiday' || e.Category?.id === 100);
        const isVacationEvent = dayEvents.some(e => e.type === 'vacation' || e.Category?.id === 2);

        // Priority: Holiday > Weekend > Vacation
        if (isHolidayEvent) {
            style.backgroundColor = holidayColor;
            style.color = holidayTextColor;
            className = "font-medium";
        } else if (isWeekendDay) {
            style.backgroundColor = weekendColor;
            style.color = weekendTextColor;
        } else if (isVacationEvent) {
            style.backgroundColor = vacationColor;
            style.color = vacationTextColor;
        }

        if (isToday) {
            className = clsx(className, "!ring-2 !ring-primary !ring-inset z-10");
            // Only apply special text color if configured, NOT background
            if (settings.today_text_color) {
                style.color = settings.today_text_color;
            }
        }

        return { style, className };
    };

    // Dynamic columns for responsive layout
    // 6 months -> 3 cols (landscape)
    // 1 month -> 1 col (portrait, but full width)
    const gridCols = monthsToShow === 1
        ? "grid-cols-1 print:grid-cols-1"
        : monthsToShow === 3
            ? "lg:grid-cols-3 grid-cols-1 print:grid-cols-3"
            : monthsToShow === 6
                ? "lg:grid-cols-3 grid-cols-1 print:grid-cols-6"
                : monthsToShow === 12
                    ? "grid-cols-12 print:grid-cols-12"
                    : `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-6`;

    const handleEventEnter = (e, title) => {
        // In multi-month views (6 or 12), always show magnifier because text is very small
        // In 1-month view, only show if truncated
        const isMultiMonth = monthsToShow > 1;
        const truncateEl = e.currentTarget.querySelector('.truncate');
        const isTruncated = truncateEl && truncateEl.scrollWidth > truncateEl.clientWidth;

        if (isMultiMonth || isTruncated || e.currentTarget.classList.contains('magnify-target')) {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({
                x: rect.left + rect.width / 2,
                y: rect.top - 8,
                content: title
            });
        }
    };

    const handleEventLeave = () => {
        setTooltip(null);
    };

    return (
        <div
            ref={containerRef}
            className={clsx(
                "grid relative print:text-[7pt] print:grid-size-xs",
                monthsToShow === 1 ? "gap-6 print:gap-1" : "lg:gap-0 lg:print:gap-0 gap-6 print:gap-1",
                gridCols,
                isTooTall && "print-compact-force"
            )}
        >
            {tooltip && (
                <div
                    className="fixed z-[100] px-4 py-2 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full whitespace-normal max-w-sm animate-in fade-in zoom-in duration-200"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 0 0 0 1px rgba(0,0,0,0.1)'
                    }}
                >
                    <div className="text-sm font-semibold mb-0.5 leading-tight">{tooltip.content}</div>
                    {/* Little arrow */}
                    <div
                        className="absolute top-full left-1/2 -ml-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px]"
                        style={{ borderTopColor: 'rgba(15, 23, 42, 0.95)' }}
                    ></div>
                </div>
            )}

            {/* --- ALIGNED GRID SECTION (LG & PRINT) --- */}
            {(monthsToShow === 3 || monthsToShow === 6 || monthsToShow === 12) && (
                <div className="lg:contents hidden print:contents">
                    {/* Headers Row */}
                    {months.map((month) => (
                        <div key={`head-aligned-${month.toISOString()}`} className="bg-primary/5 dark:bg-slate-700 p-1 text-center font-bold text-primary dark:text-blue-400 border border-gray-800 dark:border-gray-400 print:bg-white print:text-black print:text-[8pt] print:p-0.5">
                            {format(month, monthsToShow === 12 ? 'MMM' : 'MMMM', { locale: de })}
                        </div>
                    ))}

                    {/* Days Rows (Flat) */}
                    {Array.from({ length: 31 }).map((_, dayIdx) => {
                        const dayNum = dayIdx + 1;
                        return months.map((month) => {
                            const lastDay = endOfMonth(month).getDate();
                            if (dayNum > lastDay) {
                                return (
                                    <div key={`empty-${month.toISOString()}-${dayNum}`} className="bg-gray-100/50 dark:bg-slate-900/50 border-x border-b border-gray-200 dark:border-gray-700 min-h-[30px] print:min-h-[16px]"></div>
                                );
                            }
                            const date = new Date(month.getFullYear(), month.getMonth(), dayNum);
                            const dayEvents = getEventsForDay(date);
                            const isPast = isBefore(date, startOfDay(new Date()));
                            const { style, className } = getDayStyle(date, dayEvents);
                            const isMonday = getDay(date) === 1;
                            const weekNum = getISOWeek(date);

                            return (
                                <div
                                    key={`aligned-${date.toISOString()}`}
                                    className={clsx(
                                        "flex flex-row items-stretch min-h-[30px] text-sm border-x border-b border-gray-800 dark:border-gray-600 print:min-h-[16px] print:text-[6pt] lg:text-[10px]",
                                        className,
                                        isPast && !isSameDay(date, new Date()) && "opacity-60 grayscale bg-gray-50 dark:bg-slate-800/50 print:opacity-100 print:grayscale-0",
                                    )}
                                    style={(!isPast || isSameDay(date, new Date())) ? style : {}}
                                >
                                    <div className="w-4 flex-shrink-0 flex items-center justify-center font-mono text-[10px] print:w-3 print:text-[6pt]">
                                        {dayNum}
                                    </div>
                                    <div className="flex-grow p-1 lg:p-0.5 overflow-hidden flex flex-col justify-center print:p-0">
                                        {dayEvents.slice(0, 5).map((evt) => {
                                            const evtStart = new Date(evt.start);
                 const evtEnd = new Date(evt.end);
                 
                                            const printTime = getPrintTimeStr(evt, date);
                                            const timeStr = (!evt.isAllDay && isSameDay(evtStart, date)) ? format(evtStart, 'HH:mm') : '';
                 const isMultiDay = !isSameDay(evtStart, evtEnd);
                 
                 const isFirstDayOfEvent = isSameDay(evtStart, date);
                 const startsBefore = isBefore(evtStart, date);
                 const isFirstDayOfMonth = date.getDate() === 1;
                 const endsAfter = isAfter(evtEnd, date) || isSameDay(evtEnd, date);
                 
                 // Display only on first day of event, OR first day of the month (if event started previously)
                 const showInDisplay = isFirstDayOfEvent || (startsBefore && endsAfter && isFirstDayOfMonth);

                                            return (
                                                <div
                                                    key={evt.id}
                                                    className={clsx(
                                                        "leading-tight mb-1 lg:mb-0.5 text-[15px] lg:text-[14px] print:text-[6pt] break-words cursor-help magnify-target hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 px-0.5 rounded",
                                                        showInDisplay ? "block print:block" : "hidden print:block"
                                                    )}
                                                    onMouseEnter={(e) => handleEventEnter(e, evt.title)}
                                                    onMouseLeave={handleEventLeave}
                                                    onTouchStart={(e) => handleEventEnter(e, evt.title)}
                                                    onTouchEnd={handleEventLeave}
                                                    onClick={() => onEventClick && onEventClick(evt)}
                                                >
                                                    {/* Screen View */}
                                                    <span className="print:hidden flex gap-1 flex-wrap items-center">
                                                        {timeStr && <span className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded text-[10px] text-blue-800 dark:text-blue-300 font-mono">{timeStr}</span>}
                                                        <span>{evt.title}</span>
                                                        {evt.status === 'pending' && <span className="ml-0.5 inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" title="Wartet auf Freigabe"></span>}
                                                        {isMultiDay && (
                                                            <span className="inline-block px-1 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-[10px] font-mono whitespace-nowrap">
                                                                bis {format(evtEnd, 'dd.MM.')}
                                                            </span>
                                                        )}
                                                    </span>
                                                    {/* Print Version uses text time */}
                                                    <span className="hidden print:inline">
                                                        {printTime && <span className="mr-1">{printTime}</span>}
                                                        <span>{evt.title}</span>
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Aligned Grid KW Indicator (Only on Mondays) */}
                                    {isMonday && (
                                        <div className="w-5 flex-shrink-0 flex items-center justify-center border-l border-gray-200 dark:border-gray-700 bg-black/5 dark:bg-white/5 text-[8px] lg:text-[7px] text-gray-500 font-bold print:w-3 print:text-[4pt] leading-none text-center vertical-text">
                                            KW {weekNum}
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })}
                </div>
            )}

            {/* --- CHRONOLOGICAL STACKED SECTION (MOBILE & 1-MONTH) --- */}
            {months.map((month, monthIdx) => {
                const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
                const isSingleMonthSplit = monthsToShow === 1;
                const splitIndex = Math.ceil(days.length / 2);
                const firstHalf = isSingleMonthSplit ? days.slice(0, splitIndex) : days;
                const secondHalf = isSingleMonthSplit ? days.slice(splitIndex) : [];

                const renderDay = (day) => {
                    const dayEvents = getEventsForDay(day);
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const weekNum = getISOWeek(day);
                    const isMonday = getDay(day) === 1;
                    const { style, className } = getDayStyle(day, dayEvents);

                    return (
                        <div
                            key={`stack-${day.toISOString()}`}
                            className={clsx(
                                "flex flex-row items-stretch min-h-[40px] lg:min-h-[30px] text-sm border-b border-gray-800 dark:border-gray-600 print:min-h-[16px] print:text-[7pt]",
                                className,
                                isPast && !isSameDay(day, new Date()) && "opacity-60 grayscale bg-gray-50 dark:bg-slate-800/50 print:opacity-100 print:grayscale-0",
                            )}
                            style={(!isPast || isSameDay(day, new Date())) ? style : {}}
                        >
                            {isMonday && (
                                <div className="w-5 flex-shrink-0 flex items-center justify-center text-[9px] border-r border-transparent print:w-4 print:text-[6pt]" style={{ ...style, opacity: 0.7 }}>
                                    {weekNum}
                                </div>
                            )}
                            {!isMonday && <div className="w-5 flex-shrink-0 border-r border-transparent print:w-4"></div>}

                            <div className={clsx("w-8 lg:w-6 flex-shrink-0 flex items-center justify-center font-mono print:w-5 print:text-[7pt]", (getDay(day) === 0 || getDay(day) === 6) && "font-bold")}>
                                {format(day, 'dd', { locale: de })}
                            </div>

                            <div className="flex-grow p-1.5 overflow-hidden flex flex-col justify-center print:p-0">
                                {(!isPast || isSameDay(day, new Date())) && dayEvents.map((evt, idx) => {
                                    if (idx > 3 || !evt || !evt.start || !evt.end) return null;
                                    const evtStart = getValidDate(evt.start);
                                    const evtEnd = getValidDate(evt.end);
                                    if (!evtStart || !evtEnd) return null;

                                    const isFirstDayOfEvent = isSameDay(evtStart, day);
                                    const isFirstDayOfMonth = day.getDate() === 1;
                                    const startsBefore = isBefore(evtStart, day);
                                    const endsAfter = isAfter(evtEnd, day) || isSameDay(evtEnd, day);

                                    const showInDisplay = isFirstDayOfEvent || (isFirstDayOfMonth && startsBefore && endsAfter && monthIdx === 0);
                                    
                                    const isMultiDay = !isSameDay(evtStart, evtEnd);
                                    const timeStr = evt.isAllDay ? '' : format(evtStart, 'HH:mm');
                                    const printTime = getPrintTimeStr(evt, day);
                                    
                                    return (
                                        <div
                                            key={evt.id}
                                            className={clsx(
                                                "leading-tight mb-1.5 lg:mb-1 cursor-help px-1 rounded magnify-target hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150",
                                                showInDisplay ? 'block print:block' : 'hidden print:block'
                                            )}
                                            onMouseEnter={(e) => handleEventEnter(e, evt.title)}
                                            onMouseLeave={handleEventLeave}
                                            onTouchStart={(e) => handleEventEnter(e, evt.title)}
                                            onTouchEnd={handleEventLeave}
                                            onClick={() => onEventClick && onEventClick(evt)}
                                        >
                                            <div className="flex flex-wrap items-baseline gap-1 break-words text-[16px] lg:text-[15px] print:text-[7pt]">
                                                {/* SCREEN VIEW */}
                                                <span className="print:hidden flex flex-wrap items-baseline gap-1">
                                                    {timeStr && (
                                                        <span className="inline-block px-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[11px] lg:text-[10px] font-mono whitespace-nowrap">
                                                            {timeStr}
                                                        </span>
                                                    )}
                                                    <span className={evt.type === 'holiday' || evt.type === 'vacation' ? 'font-medium' : ''}>{evt.title}</span>
                                                    {evt.status === 'pending' && <span className="ml-0.5 inline-block w-1.5 h-1.5 rounded-full bg-yellow-500" title="Wartet auf Freigabe"></span>}
                                                    {isMultiDay && (
                                                        <span className="inline-block px-1 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-[11px] lg:text-[10px] font-mono whitespace-nowrap">
                                                            bis {format(evtEnd, 'dd.MM.')}
                                                        </span>
                                                    )}
                                                </span>
                                                {/* PRINT VIEW */}
                                                <span className="hidden print:inline-flex items-baseline gap-1">
                                                    {printTime && <span className="mr-0.5">{printTime}</span>}
                                                    <span className={evt.type === 'holiday' || evt.type === 'vacation' ? 'font-medium' : ''}>{evt.title}</span>
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Stacked View KW Indicator (Only on Mondays) */}
                            {isMonday && (
                                <div className="w-7 lg:w-6 flex-shrink-0 flex items-center justify-center border-l border-gray-800 dark:border-gray-600 bg-black/5 dark:bg-white/5 text-[9px] text-gray-500 font-bold print:w-4 print:text-[5pt]">
                                    KW {weekNum}
                                </div>
                            )}

                            <div className="w-8 lg:w-6 flex-shrink-0 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 border-l border-gray-800 dark:border-gray-600 print:hidden">
                                {format(day, 'EE', { locale: de }).substring(0, 2)}
                            </div>
                        </div>
                    );
                };

                return (
                    <div
                        key={`month-card-${month && !isNaN(month.getTime()) ? month.toISOString() : monthIdx}`}
                        className={clsx(
                            "border border-gray-800 dark:border-gray-400 rounded-lg overflow-hidden break-inside-avoid shadow-sm print:shadow-none print:border-black",
                            monthsToShow > 1 && "lg:hidden print:hidden",
                            isSingleMonthSplit && "print:border-0"
                        )}
                    >
                        <div className="bg-primary/5 dark:bg-slate-700 p-2 text-center font-bold text-primary dark:text-blue-400 border-b border-gray-800 dark:border-gray-400 print:bg-white print:text-black print:p-0.5 print:text-xs">
                            {format(month, 'MMMM yyyy', { locale: de })}
                        </div>
                        <div className={clsx("bg-white dark:bg-slate-800", isSingleMonthSplit ? "grid grid-cols-1 print:grid-cols-2-split" : "flex flex-col")}>
                            <div className={clsx("flex flex-col", isSingleMonthSplit && "print:border-r print:border-gray-800")}>
                                {firstHalf.map(renderDay)}
                            </div>
                            {isSingleMonthSplit && (
                                <div className="hidden print:flex flex-col border-l border-gray-800">
                                    {secondHalf.map(renderDay)}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CalendarGrid;
