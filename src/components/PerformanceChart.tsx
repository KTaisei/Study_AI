import { useState } from 'react';
import { ScheduleData } from '../types';

interface PerformanceChartProps {
  scheduleData: ScheduleData;
}

export function PerformanceChart({ scheduleData }: PerformanceChartProps) {
  const [chartType, setChartType] = useState<'subjects' | 'improvement'>('subjects');
  
  // Extract subject names and calculate time allocation
  const subjectData = scheduleData.subjectAnalysis.map(subject => ({
    name: subject.name,
    timeAllocation: subject.timeAllocation,
    performance: subject.currentPerformance,
    expectedImprovement: subject.expectedImprovement
  }));
  
  // Sort subjects by time allocation in descending order
  const sortedByTime = [...subjectData].sort((a, b) => b.timeAllocation - a.timeAllocation);
  
  // Calculate total time for percentage
  const totalTime = subjectData.reduce((acc, subject) => acc + subject.timeAllocation, 0);
  
  // Calculate max value for the chart scaling
  const maxTimeAllocation = Math.max(...subjectData.map(s => s.timeAllocation));
  const maxPerformance = 100; // Assuming performance is on a 0-100 scale

  const getBarColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setChartType('subjects')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              chartType === 'subjects'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            時間配分
          </button>
          <button
            onClick={() => setChartType('improvement')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              chartType === 'improvement'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-r border-t border-b border-gray-300'
            }`}
          >
            成績向上予測
          </button>
        </div>
      </div>

      {chartType === 'subjects' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-center text-gray-800">
            科目別の学習時間配分
          </h3>
          
          {/* Bar Chart */}
          <div className="space-y-4">
            {sortedByTime.map((subject, index) => {
              const percentage = Math.round((subject.timeAllocation / totalTime) * 100);
              return (
                <div key={subject.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-gray-600">{percentage}% ({subject.timeAllocation} hours)</span>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getBarColor(index)} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">AIコメント</h4>
            <p className="text-blue-700">
              {scheduleData.recommendation || 
                "Based on your test results, we've allocated more time to subjects where improvement is needed most. This balanced approach will help strengthen your weaker areas while maintaining your strengths."}
            </p>
          </div>
        </div>
      )}
      
      {chartType === 'improvement' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-center text-gray-800">
            今後の成績向上予測
          </h3>
          
          {/* Performance Chart */}
          <div className="space-y-4">
            {sortedByTime.map((subject, index) => (
              <div key={subject.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{subject.name}</span>
                  <span className="text-gray-600">
                    Current: {subject.performance}% → Expected: {subject.performance + subject.expectedImprovement}%
                  </span>
                </div>
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden relative">
                  {/* Current performance */}
                  <div 
                    className={`h-full ${getBarColor(index)} rounded-l-full absolute left-0 transition-all duration-500`}
                    style={{ width: `${subject.performance}%` }}
                  ></div>
                  
                  {/* Expected improvement */}
                  <div 
                    className={`h-full ${getBarColor(index)} opacity-50 rounded-r-full absolute transition-all duration-500`}
                    style={{ 
                      left: `${subject.performance}%`,
                      width: `${subject.expectedImprovement}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">期待される効果</h4>
            <p className="text-green-700">
              この学習プランを4週間続けると、全体的なパフォーマンスが {scheduleData.overallImprovement}% 向上する可能性があります。
              AIがあなたの学習パターンとテスト履歴に基づいてスケジュールを最適化します。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}