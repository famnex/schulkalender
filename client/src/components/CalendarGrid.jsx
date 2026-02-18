import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isWeekend, isSameDay, getDay, addMonths, parseISO, isBefore, isAfter, startOfDay, getISOWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import clsx from 'clsx';


const CalendarGrid = ({ events, startMonthStr, monthsToShow = 6, settings = {} }) => {
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

                // Threshold for A4 landscape (~210mm) is approx 790px at 96dpi.
                // Subtracting header (~50px) and margins (~40px) leaves approx 700px.
                // Setting safe threshold to 680px to assert compact mode early.
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

    // Generate months based on startMonthStr (YYYY-MM)
    const startDate = parseISO(startMonthStr + '-01');
    const months = Array.from({ length: monthsToShow }).map((_, i) => addMonths(startDate, i));

    // Helper to find events for a day
    const getEventsForDay = (date) => {
        return events.filter(e => {
            const dayStart = startOfDay(date);
            const evtStart = new Date(e.start);
            const evtEnd = new Date(e.end);
            // Overlap: (EventStart <= DayEnd) and (EventEnd >= DayStart)
            // DayEnd is start of day + 24h (approx)
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
        : `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-6`;

    const handleEventEnter = (e, title) => {
        const truncateEl = e.currentTarget.querySelector('.truncate');
        if (truncateEl && truncateEl.scrollWidth > truncateEl.clientWidth) {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({
                x: rect.left,
                y: rect.top - 5, // slightly above the element
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
                "grid gap-6 print:gap-1 print:text-[7pt] print:grid-size-xs relative",
                gridCols,
                isTooTall && "print-compact-force"
            )}
        >
            {tooltip && (
                <div
                    className="fixed z-50 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-y-full whitespace-normal max-w-xs"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    {tooltip.content}
                    {/* Little arrow */}
                    <div className="absolute top-full left-4 -ml-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
            )}

            {months.map((month, monthIdx) => {
                const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });

                // For 1-month view, we split into two columns for the user's specific portrait request
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
                            key={day.toISOString()}
                            className={clsx(
                                "flex flex-row items-stretch min-h-[30px] text-sm border-b border-gray-800 dark:border-gray-600 print:min-h-[16px] print:text-[7pt]",
                                className,
                                isPast && !isSameDay(day, new Date()) && "opacity-60 grayscale bg-gray-50 dark:bg-slate-800/50 print:opacity-100 print:grayscale-0",
                            )}
                            style={(!isPast || isSameDay(day, new Date())) ? style : {}}
                        >
                            {/* Week Number (only on Mondays or first day of month if configured, but user asked for CW) */}
                            {/* To show CW cleanly, maybe a tiny col or just next to date on Mondays? */}
                            {/* Let's replicate standard calendar: CW in left margin or separate col? similar to PHP? */}
                            {/* PHP had `Kw` column. Let's add it if Monday. */}

                            {isMonday && (
                                <div
                                    className="w-5 flex-shrink-0 flex items-center justify-center text-[9px] border-r border-transparent print:bg-transparent print:w-4 print:text-[6pt]"
                                    style={{ ...style, opacity: 0.7 }}
                                >
                                    {weekNum}
                                </div>
                            )}
                            {!isMonday && <div className="w-5 flex-shrink-0 border-r border-transparent print:w-4"></div>}


                            {/* Date Column */}
                            <div className={clsx(
                                "w-6 flex-shrink-0 flex items-center justify-center font-mono border-r border-gray-800 dark:border-gray-600 print:w-5 print:text-[7pt]",
                                (getDay(day) === 0 || getDay(day) === 6) && "font-bold"
                            )}>
                                {format(day, 'dd', { locale: de })}
                            </div>

                            {/* Content Column */}
                            <div className="flex-grow p-1.5 overflow-hidden flex flex-col justify-center print:p-0">

                                {(!isPast || isSameDay(day, new Date())) && dayEvents.map((evt, idx) => {
                                    if (idx > 3) return null; // Limit items
                                    const evtStart = parseISO(evt.start);
                                    const evtEnd = parseISO(evt.end);

                                    const isFirstDayOfEvent = isSameDay(evtStart, day);
                                    const isFirstDayOfMonth = day.getDate() === 1;
                                    const startsBefore = isBefore(evtStart, day);
                                    const endsAfter = isAfter(evtEnd, day) || isSameDay(evtEnd, day);

                                    // Show if it starts today, OR if it's the 1st of the month, overlaps from before, AND it's the first month of the view
                                    const showEvent = isFirstDayOfEvent || (isFirstDayOfMonth && startsBefore && endsAfter && monthIdx === 0);

                                    if (!showEvent) return null;

                                    const isMultiDay = !isSameDay(evtStart, evtEnd);

                                    let timeStr = '';
                                    if (!evt.isAllDay) {
                                        timeStr = format(evtStart, 'HH:mm');
                                    }

                                    return (
                                        <div
                                            key={evt.id}
                                            className="leading-tight mb-0.5 cursor-help print:px-1"
                                            onMouseEnter={(e) => handleEventEnter(e, evt.title)}
                                            onMouseLeave={handleEventLeave}
                                            onTouchStart={(e) => handleEventEnter(e, evt.title)}
                                            onTouchEnd={handleEventLeave}
                                        >
                                            <div className="truncate flex flex-wrap items-baseline gap-1">
                                                {timeStr && (
                                                    <span className="inline-block px-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[9px] font-mono print:text-[6pt] print:bg-gray-100">
                                                        {timeStr}
                                                    </span>
                                                )}

                                                <span className={(evt.type === 'holiday' || evt.type === 'vacation') ? 'font-medium' : ''}>{evt.title}</span>

                                                {isMultiDay && (
                                                    <span className="inline-block px-1 rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-[9px] font-mono print:text-[6pt] print:bg-gray-100 whitespace-nowrap">
                                                        bis {format(evtEnd, 'dd.MM.')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Day Name Column (Right) */}
                            <div className="w-6 flex-shrink-0 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 border-l border-gray-800 dark:border-gray-600 print:hidden">
                                {format(day, 'EE', { locale: de }).substring(0, 2)}
                            </div>
                        </div>
                    );
                };

                return (
                    <div key={month.toISOString()} className={clsx(
                        "border border-gray-800 dark:border-gray-400 rounded-lg overflow-hidden break-inside-avoid page-break-inside-avoid shadow-sm print:shadow-none print:border-black print:mb-1",
                        isSingleMonthSplit && "print:border-0"
                    )}>
                        {/* Header */}
                        <div className="bg-primary/5 dark:bg-slate-700 p-2 text-center font-bold text-primary dark:text-blue-400 border-b border-gray-800 dark:border-gray-400 print:bg-white print:text-black print:p-0.5 print:text-xs">
                            {format(month, 'MMMM yyyy', { locale: de })}
                        </div>

                        {/* Grid container */}
                        <div className={clsx(
                            "bg-white dark:bg-slate-800",
                            isSingleMonthSplit ? "grid grid-cols-1 print:grid-cols-2-split" : "flex flex-col"
                        )}>
                            {/* Left side (or only side) */}
                            <div className={clsx(
                                "flex flex-col",
                                isSingleMonthSplit && "print:border-r print:border-gray-800"
                            )}>
                                {firstHalf.map(renderDay)}
                            </div>

                            {/* Right side (only for split 1-month print view) */}
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
