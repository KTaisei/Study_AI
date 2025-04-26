import { useEffect, useState } from 'react';
import { PlusCircle, MinusCircle, ArrowRight } from 'lucide-react';
import { StudyData, Subject, TestResult } from '../types';

interface StudyInputFormProps {
  studyData: StudyData | null;
  onDataSubmit: (data: StudyData) => void;
}

export function StudyInputForm({ studyData, onDataSubmit }: StudyInputFormProps) {
  const [formData, setFormData] = useState<StudyData>(() => {
    if (studyData) return { ...studyData };
    
    return {
      name: '',
      subjects: [{ id: '1', name: '', testResults: [{ id: '1', score: 0, totalPossible: 100, date: '' }] }],
      studyHabits: {
        preferredTimeOfDay: 'morning',
        sessionDuration: 60,
        daysPerWeek: 5,
        focusLevel: 'medium'
      }
    };
  });

  // Prefill with date if empty
  useEffect(() => {
    if (formData.subjects.some(s => s.testResults.some(t => !t.date))) {
      const today = new Date().toISOString().split('T')[0];
      
      setFormData(current => ({
        ...current,
        subjects: current.subjects.map(subject => ({
          ...subject,
          testResults: subject.testResults.map(result => ({
            ...result,
            date: result.date || today
          }))
        }))
      }));
    }
  }, []);

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [
        ...formData.subjects,
        {
          id: Date.now().toString(),
          name: '',
          testResults: [{ id: Date.now().toString(), score: 0, totalPossible: 100, date: new Date().toISOString().split('T')[0] }]
        }
      ]
    });
  };

  const removeSubject = (id: string) => {
    if (formData.subjects.length <= 1) return;
    
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(subject => subject.id !== id)
    });
  };

  const addTestResult = (subjectId: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            testResults: [
              ...subject.testResults,
              { id: Date.now().toString(), score: 0, totalPossible: 100, date: new Date().toISOString().split('T')[0] }
            ]
          };
        }
        return subject;
      })
    });
  };

  const removeTestResult = (subjectId: string, testId: string) => {
    const subject = formData.subjects.find(s => s.id === subjectId);
    if (!subject || subject.testResults.length <= 1) return;
    
    setFormData({
      ...formData,
      subjects: formData.subjects.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            testResults: subject.testResults.filter(test => test.id !== testId)
          };
        }
        return subject;
      })
    });
  };

  const updateSubject = (id: string, name: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.map(subject => {
        if (subject.id === id) {
          return { ...subject, name };
        }
        return subject;
      })
    });
  };

  const updateTestResult = (subjectId: string, testId: string, field: keyof TestResult, value: any) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            testResults: subject.testResults.map(test => {
              if (test.id === testId) {
                return { ...test, [field]: value };
              }
              return test;
            })
          };
        }
        return subject;
      })
    });
  };

  const updateStudyHabits = (field: keyof StudyData['studyHabits'], value: any) => {
    setFormData({
      ...formData,
      studyHabits: {
        ...formData.studyHabits,
        [field]: value
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDataSubmit(formData);
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.subjects.every(
        subject => 
          subject.name.trim() !== '' && 
          subject.testResults.every(
            test => 
              test.score >= 0 && 
              test.totalPossible > 0 && 
              test.date.trim() !== ''
          )
      )
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Study Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Subjects and Test Results */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Subjects & Test Results</h3>
              <button
                type="button"
                onClick={addSubject}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <PlusCircle size={18} className="mr-1" />
                <span>Add Subject</span>
              </button>
            </div>

            {formData.subjects.map((subject, subjectIndex) => (
              <div key={subject.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      value={subject.name}
                      onChange={(e) => updateSubject(subject.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., Mathematics, History"
                      required
                    />
                  </div>
                  {formData.subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(subject.id)}
                      className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                      aria-label="Remove subject"
                    >
                      <MinusCircle size={20} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Test Results</h4>
                    <button
                      type="button"
                      onClick={() => addTestResult(subject.id)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <PlusCircle size={16} className="mr-1" />
                      <span>Add Result</span>
                    </button>
                  </div>

                  {subject.testResults.map((test, testIndex) => (
                    <div key={test.id} className="flex flex-wrap gap-3 items-end p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-20">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Score
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={test.score}
                          onChange={(e) => updateTestResult(subject.id, test.id, 'score', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Out of
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={test.totalPossible}
                          onChange={(e) => updateTestResult(subject.id, test.id, 'totalPossible', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                      <div className="flex-grow">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={test.date}
                          onChange={(e) => updateTestResult(subject.id, test.id, 'date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                      {subject.testResults.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestResult(subject.id, test.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remove test result"
                        >
                          <MinusCircle size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Study Habits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Study Habits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time of Day
                </label>
                <select
                  value={formData.studyHabits.preferredTimeOfDay}
                  onChange={(e) => updateStudyHabits('preferredTimeOfDay', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Session Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  step="15"
                  value={formData.studyHabits.sessionDuration}
                  onChange={(e) => updateStudyHabits('sessionDuration', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Study Days Per Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.studyHabits.daysPerWeek}
                  onChange={(e) => updateStudyHabits('daysPerWeek', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Focus Level
                </label>
                <select
                  value={formData.studyHabits.focusLevel}
                  onChange={(e) => updateStudyHabits('focusLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="low">Low (easily distracted)</option>
                  <option value="medium">Medium (average focus)</option>
                  <option value="high">High (good concentration)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full flex justify-center items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-colors
                ${isFormValid() 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
                }
              `}
            >
              Generate Study Plan
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}