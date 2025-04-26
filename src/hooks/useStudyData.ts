import { useState, useEffect } from 'react';
import { StudyData, ScheduleData } from '../types';
import { generateStudySchedule } from '../services/ai';
import { saveToStorage, loadFromStorage } from '../utils/storage';

export function useStudyData() {
  const [studyData, setStudyData] = useState<StudyData | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      const savedStudyData = await loadFromStorage<StudyData>('studyData');
      const savedScheduleData = await loadFromStorage<ScheduleData>('scheduleData');
      
      if (savedStudyData) setStudyData(savedStudyData);
      if (savedScheduleData) setScheduleData(savedScheduleData);
    };
    
    loadData();
  }, []);

  // Save data to storage when it changes
  useEffect(() => {
    if (studyData) {
      saveToStorage('studyData', studyData);
    }
  }, [studyData]);

  useEffect(() => {
    if (scheduleData) {
      saveToStorage('scheduleData', scheduleData);
    }
  }, [scheduleData]);

  // Function to generate schedule
  const generateSchedule = async (data: StudyData) => {
    setIsLoading(true);
    try {
      const schedule = await generateStudySchedule(data);
      setScheduleData(schedule);
    } catch (error) {
      console.error('Error generating schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset all data
  const resetData = () => {
    setStudyData(null);
    setScheduleData(null);
    localStorage.removeItem('studyData');
    localStorage.removeItem('scheduleData');
  };

  return { 
    studyData, 
    setStudyData, 
    scheduleData, 
    isLoading, 
    generateSchedule,
    resetData
  };
}