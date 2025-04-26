import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, PieChart, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { ScheduleData, DailySchedule, SubjectSchedule } from '../types';
import { PerformanceChart } from './PerformanceChart';

interface StudyScheduleProps {
  scheduleData: ScheduleData;
}

export function StudySchedule({ scheduleData }: StudyScheduleProps) {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState<'calendar' | 'performance'>('calendar');

  const maxWeeks = 4;
  
  const handlePrevWeek = () => {
    setCurrentWeek(current => Math.max(0, current - 1));
  };
  
  const handleNextWeek = () => {
    setCurrentWeek(current => Math.min(maxWeeks - 1, current + 1));
  };

  // Get the current week's schedule
  const currentWeekSchedule = scheduleData.weeklySchedules[currentWeek] || [];
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const getSubjectColor = (subjectName: string) => {
    // Simple hash function to generate consistent colors for subjects
    const hash = subjectName.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-teal-100 text-teal-800 border-teal-200'
    ];
    
    return colors[hash % colors.length];
  };

  // Calculate time display
  const formatTimeSlot = (slot: SubjectSchedule) => {
    return `${slot.startTime} - ${slot.endTime}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Study Schedule</h2>
          
          <div className="flex mt-4 sm:mt-0">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center px-3 py-1.5 rounded-l-lg border ${
                viewMode === 'calendar' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Calendar size={16} className="mr-1" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('performance')}
              className={`flex items-center px-3 py-1.5 rounded-r-lg border-t border-b border-r ${
                viewMode === 'performance' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <PieChart size={16} className="mr-1" />
              <span>Performance</span>
            </button>
          </div>
        </div>

        {viewMode === 'calendar' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevWeek}
                disabled={currentWeek === 0}
                className={`p-2 rounded-lg ${
                  currentWeek === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              
              <h3 className="text-lg font-semibold text-gray-700">
                Week {currentWeek + 1} of {maxWeeks}
              </h3>
              
              <button
                onClick={handleNextWeek}
                disabled={currentWeek === maxWeeks - 1}
                className={`p-2 rounded-lg ${
                  currentWeek === maxWeeks - 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {currentWeekSchedule.map((day: DailySchedule) => (
                <div key={day.date} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    {formatDate(day.date)}
                  </h4>
                  
                  {day.schedule.length > 0 ? (
                    <div className="space-y-3">
                      {day.schedule.map((slot, idx) => (
                        <div 
                          key={idx} 
                          className={`flex flex-col sm:flex-row sm:items-center p-3 rounded-lg border ${getSubjectColor(slot.subject)}`}
                        >
                          <div className="flex items-center mb-2 sm:mb-0 sm:mr-3">
                            <Clock size={16} className="mr-2" />
                            <span className="text-sm font-medium">{formatTimeSlot(slot)}</span>
                          </div>
                          
                          <div className="sm:flex-grow">
                            <h5 className="font-medium">{slot.subject}</h5>
                            <p className="text-sm">{slot.focusArea}</p>
                          </div>
                          
                          <div className="flex items-center mt-2 sm:mt-0">
                            {slot.priority === 'high' && (
                              <span className="flex items-center text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">
                                <ArrowUp size={12} className="mr-1" />
                                High Priority
                              </span>
                            )}
                            {slot.priority === 'low' && (
                              <span className="flex items-center text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                                <ArrowDown size={12} className="mr-1" />
                                Low Priority
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No study sessions scheduled for this day
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {viewMode === 'performance' && <PerformanceChart scheduleData={scheduleData} />}
      </div>
    </div>
  );
}