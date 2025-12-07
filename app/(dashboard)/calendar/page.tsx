'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from 'lucide-react';
import { getCalendar, getScheduled, CalendarItem, ScheduledItem } from '@/lib/api';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    const [calendarResult, scheduledResult] = await Promise.all([
      getCalendar({
        startDate: monthStart.toISOString(),
        endDate: monthEnd.toISOString(),
      }),
      getScheduled(),
    ]);

    if (calendarResult.data) setCalendarItems(calendarResult.data);
    if (scheduledResult.data) setScheduled(scheduledResult.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getItemsForDay = (day: Date) => {
    return calendarItems.filter((item) =>
      isSameDay(new Date(item.scheduledTime), day)
    );
  };

  const selectedDayItems = selectedDate ? getItemsForDay(selectedDate) : [];

  return (
    <>
      <Header
        title="Content Calendar"
        subtitle="Schedule and manage your posts"
        onRefresh={fetchData}
      />

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const dayItems = getItemsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-24 p-2 rounded-lg border transition-colors text-left ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-transparent hover:bg-gray-50'
                      } ${!isCurrentMonth && 'opacity-40'}`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                          isToday
                            ? 'bg-emerald-600 text-white'
                            : 'text-gray-700'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayItems.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded truncate"
                          >
                            {item.title}
                          </div>
                        ))}
                        {dayItems.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayItems.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Day Details */}
            {selectedDate && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
                {selectedDayItems.length === 0 ? (
                  <p className="text-sm text-gray-500">No posts scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDayItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {format(new Date(item.scheduledTime), 'h:mm a')}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {item.platforms.map((platform, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-emerald-600" />
                Upcoming Posts
              </h3>
              {scheduled.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming posts</p>
              ) : (
                <div className="space-y-3">
                  {scheduled.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="text-center">
                        <div className="text-xs font-medium text-emerald-600">
                          {format(new Date(item.scheduledTime), 'MMM')}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {format(new Date(item.scheduledTime), 'd')}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(item.scheduledTime), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
