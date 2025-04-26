import { StudyData, ScheduleData, DailySchedule, SubjectAnalysis } from '../types';

// Mock AI function to generate a study schedule
export async function generateStudySchedule(studyData: StudyData): Promise<ScheduleData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Calculate subject performances
  const subjectAnalysis = studyData.subjects.map(subject => {
    // Calculate average performance for the subject
    const totalScore = subject.testResults.reduce((sum, test) => sum + test.score, 0);
    const totalPossible = subject.testResults.reduce((sum, test) => sum + test.totalPossible, 0);
    const performance = Math.round((totalScore / totalPossible) * 100);

    // Determine weak areas (simplified for this example)
    const weakAreas = ["Concept understanding", "Problem solving", "Application"]
      .filter(() => Math.random() > 0.5);

    // Calculate time allocation based on performance
    // Lower performing subjects get more time
    const inversePerformance = 100 - performance;
    const timeAllocation = 2 + Math.round((inversePerformance / 100) * 10) / 2;

    // Expected improvement (lower performing subjects improve more)
    const expectedImprovement = Math.round(15 - (performance / 10));

    return {
      name: subject.name,
      timeAllocation,
      currentPerformance: performance,
      weakAreas,
      expectedImprovement,
    };
  });

  // Generate 4 weeks of daily schedules
  const weeklySchedules: DailySchedule[][] = [];
  
  // Get today's date
  const today = new Date();

  // Helper function to check if a time slot overlaps with existing slots
  const hasTimeConflict = (
    existingSlots: { startTime: string; endTime: string }[],
    newStart: string,
    newEnd: string
  ): boolean => {
    const newStartMinutes = timeToMinutes(newStart);
    const newEndMinutes = timeToMinutes(newEnd);

    return existingSlots.some(slot => {
      const slotStartMinutes = timeToMinutes(slot.startTime);
      const slotEndMinutes = timeToMinutes(slot.endTime);

      return (
        (newStartMinutes >= slotStartMinutes && newStartMinutes < slotEndMinutes) ||
        (newEndMinutes > slotStartMinutes && newEndMinutes <= slotEndMinutes) ||
        (newStartMinutes <= slotStartMinutes && newEndMinutes >= slotEndMinutes)
      );
    });
  };

  // Helper function to convert time string to minutes since midnight
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to format minutes to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Generate schedules for 4 weeks
  for (let week = 0; week < 4; week++) {
    const weekSchedule: DailySchedule[] = [];
    
    // Generate schedule for each day of the week (up to user's preferred daysPerWeek)
    for (let day = 0; day < 7; day++) {
      // Skip days if beyond user's preferred study days per week
      if (day >= studyData.studyHabits.daysPerWeek) continue;
      
      const scheduleDate = new Date(today);
      scheduleDate.setDate(today.getDate() + (week * 7) + day);
      
      // Create daily schedule
      const dailySchedule: DailySchedule = {
        date: scheduleDate.toISOString().split('T')[0],
        schedule: [],
      };
      
      // Assign subjects to study
      const shuffledSubjects = [...subjectAnalysis]
        .sort(() => Math.random() - 0.5)  // Random order
        .slice(0, 1 + Math.min(3, subjectAnalysis.length - 1));  // 1-3 subjects per day
      
      // Determine start time based on preferred time of day
      let baseStartHour;
      switch (studyData.studyHabits.preferredTimeOfDay) {
        case 'morning': baseStartHour = 8; break;
        case 'afternoon': baseStartHour = 13; break;
        case 'evening': baseStartHour = 18; break;
        case 'night': baseStartHour = 20; break;
        default: baseStartHour = 9;
      }

      // Convert session duration to minutes
      const sessionDuration = studyData.studyHabits.sessionDuration;
      const breakDuration = 15; // 15-minute break between sessions
      
      // Schedule each subject
      shuffledSubjects.forEach((subject, index) => {
        let startMinutes = baseStartHour * 60;
        let found = false;
        
        // Try to find a non-conflicting time slot
        while (!found && startMinutes < (baseStartHour + 6) * 60) { // Limit to 6 hours from base start time
          const endMinutes = startMinutes + sessionDuration;
          const startTime = minutesToTime(startMinutes);
          const endTime = minutesToTime(endMinutes);
          
          if (!hasTimeConflict(dailySchedule.schedule, startTime, endTime)) {
            // Determine priority based on performance
            let priority: 'low' | 'medium' | 'high';
            if (subject.currentPerformance < 60) priority = 'high';
            else if (subject.currentPerformance < 80) priority = 'medium';
            else priority = 'low';
            
            // Get a random weak area or a general focus
            const focusArea = subject.weakAreas.length > 0
              ? subject.weakAreas[Math.floor(Math.random() * subject.weakAreas.length)]
              : "General review";
            
            dailySchedule.schedule.push({
              subject: subject.name,
              startTime,
              endTime,
              focusArea,
              priority,
            });
            found = true;
          }
          
          // Try next time slot (add session duration + break)
          startMinutes += sessionDuration + breakDuration;
        }
      });
      
      // Sort schedule by start time
      dailySchedule.schedule.sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
      
      weekSchedule.push(dailySchedule);
    }
    
    weeklySchedules.push(weekSchedule);
  }

  // Calculate overall expected improvement
  const overallImprovement = Math.round(
    subjectAnalysis.reduce((sum, subject) => sum + subject.expectedImprovement, 0) / 
    subjectAnalysis.length
  );

  // Generate recommendation
  const lowestPerformingSubject = [...subjectAnalysis]
    .sort((a, b) => a.currentPerformance - b.currentPerformance)[0];
  
  const recommendation = `Based on your test results, I recommend focusing more time on ${lowestPerformingSubject.name} 
    where your current performance is ${lowestPerformingSubject.currentPerformance}%. 
    With consistent practice on ${lowestPerformingSubject.weakAreas.join(' and ')}, 
    you could improve by approximately ${lowestPerformingSubject.expectedImprovement}% in this subject.`;

  return {
    weeklySchedules,
    subjectAnalysis,
    recommendation,
    overallImprovement
  };
}

// Function to simulate AI chat responses
export async function getAIResponse(
  message: string, 
  studyData: StudyData, 
  scheduleData: ScheduleData
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simple pattern matching for common questions
  const messageLower = message.toLowerCase();
  
  // Handle schedule adjustment requests
  if (messageLower.includes('change schedule') || messageLower.includes('adjust schedule')) {
    return `I'd be happy to adjust your schedule, ${studyData.name}. Based on your current plan, I've allocated the most time to ${scheduleData.subjectAnalysis[0].name} since it needs the most attention. Would you like to make changes to a specific day or subject?`;
  }
  
  // Handle study strategy questions
  if (messageLower.includes('how should i study') || messageLower.includes('study tips')) {
    return `For effective studying, I recommend:
1. Use active recall rather than passive review
2. Space out your study sessions for better retention
3. For ${scheduleData.subjectAnalysis[0].name}, focus on ${scheduleData.subjectAnalysis[0].weakAreas.join(' and ')}
4. Take 5-minute breaks every 25 minutes to maintain focus
5. Review material before sleeping to improve memory consolidation`;
  }
  
  // Handle time management questions
  if (messageLower.includes('time management') || messageLower.includes('focus better')) {
    const focusLevel = studyData.studyHabits.focusLevel;
    let focusTips = '';
    
    if (focusLevel === 'low') {
      focusTips = `Since you mentioned having difficulty focusing, try:
1. Using the Pomodoro technique (25 min work, 5 min break)
2. Eliminating distractions by putting your phone in another room
3. Working in a designated study space
4. Using website blockers during study sessions`;
    } else if (focusLevel === 'medium') {
      focusTips = `To improve your average focus level:
1. Set clear goals for each study session
2. Take short breaks between subjects
3. Use ambient noise or instrumental music to maintain concentration
4. Consider studying at your peak energy time (${studyData.studyHabits.preferredTimeOfDay})`;
    } else {
      focusTips = `To maintain your already strong focus level:
1. Challenge yourself with increasingly difficult problems
2. Teach concepts to others to solidify understanding
3. Use interleaving (mixing related topics) to deepen knowledge
4. Reward yourself after completing difficult tasks`;
    }
    
    return focusTips;
  }
  
  // Handle specific subject questions
  for (const subject of studyData.subjects) {
    if (messageLower.includes(subject.name.toLowerCase())) {
      const subjectAnalysis = scheduleData.subjectAnalysis.find(s => s.name === subject.name);
      
      if (subjectAnalysis) {
        return `For ${subject.name}, your current performance is at ${subjectAnalysis.currentPerformance}%. 
I've allocated ${subjectAnalysis.timeAllocation} hours per week to this subject.
Focus areas: ${subjectAnalysis.weakAreas.join(', ')}.
With consistent practice, you could improve by approximately ${subjectAnalysis.expectedImprovement}% over the next 4 weeks.`;
      }
    }
  }
  
  // Handle general how-to questions
  if (messageLower.includes('how do i') || messageLower.includes('what should i')) {
    return `That's a great question! Based on your study profile, I recommend focusing on consistent daily practice rather than cramming. Your schedule is designed to prioritize your weaker areas first, especially ${scheduleData.subjectAnalysis[0].name}. Would you like specific advice for any particular subject?`;
  }
  
  // Default responses for other queries
  const defaultResponses = [
    `Based on your study habits, I've optimized your schedule for ${studyData.studyHabits.preferredTimeOfDay} studying with ${studyData.studyHabits.sessionDuration}-minute sessions. Is there a specific part of your schedule you'd like to discuss?`,
    
    `Looking at your test results, I notice that ${scheduleData.subjectAnalysis[0].name} might need more attention. I've allocated more study time for this subject. Does that work for you?`,
    
    `Your schedule is designed for ${studyData.studyHabits.daysPerWeek} days per week of studying. Would you like to adjust this or any other aspect of your plan?`,
    
    `I've analyzed your learning patterns and test results to create this personalized schedule. Following it consistently should help you improve by approximately ${scheduleData.overallImprovement}% overall. Is there anything specific you'd like to change?`
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}