import { StudyData, ScheduleData, DailySchedule, SubjectAnalysis } from '../types';

// スタディスケジュールを生成するためのモックAI関数
export async function generateStudySchedule(studyData: StudyData): Promise<ScheduleData> {
  // APIの遅延をシミュレート
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 科目のパフォーマンスを計算する
  const subjectAnalysis = studyData.subjects.map(subject => {
    // 科目の平均パフォーマンスを計算する
    const totalScore = subject.testResults.reduce((sum, test) => sum + test.score, 0);
    const totalPossible = subject.testResults.reduce((sum, test) => sum + test.totalPossible, 0);
    const performance = Math.round((totalScore / totalPossible) * 100);

    // 弱点を特定する（この例では簡略化されています）
    const weakAreas = ["概念理解", "問題解決", "応用"]
      .filter(() => Math.random() > 0.5);

    // パフォーマンスに基づいて時間配分を計算する
    // パフォーマンスが低い科目ほど時間を多く割り当てる
    const inversePerformance = 100 - performance;
    const timeAllocation = 2 + Math.round((inversePerformance / 100) * 10) / 2;

    // 予想される改善度（パフォーマンスが低い科目ほど改善度が高い）
    const expectedImprovement = Math.round(15 - (performance / 10));

    return {
      name: subject.name,
      timeAllocation,
      currentPerformance: performance,
      weakAreas,
      expectedImprovement,
    };
  });

  // 4週間分のデイリースケジュールを生成する
  const weeklySchedules: DailySchedule[][] = [];
  
  // 今日の日付を取得する
  const today = new Date();

  // 時間帯が重複しているかどうかをチェックするためのヘルパー関数
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

  // 時間を分単位の数値に変換するヘルパー関数
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 分を時間の文字列にフォーマットするヘルパー関数
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // 4週間分のスケジュールを生成する
  for (let week = 0; week < 4; week++) {
    const weekSchedule: DailySchedule[] = [];
    
    // 週の各日のスケジュールを生成する（ユーザーの希望する週あたりの勉強日数まで）
    for (let day = 0; day < 7; day++) {
      // ユーザーの希望する週あたりの勉強日数を超えた場合はスキップする
      if (day >= studyData.studyHabits.daysPerWeek) continue;
      
      const scheduleDate = new Date(today);
      scheduleDate.setDate(today.getDate() + (week * 7) + day);
      
      // デイリースケジュールを作成する
      const dailySchedule: DailySchedule = {
        date: scheduleDate.toISOString().split('T')[0],
        schedule: [],
      };
      
      // 勉強する科目を割り当てる
      const shuffledSubjects = [...subjectAnalysis]
        .sort(() => Math.random() - 0.5)  // ランダムな順序
        .slice(0, 1 + Math.min(3, subjectAnalysis.length - 1));  // 1日あたり1〜3科目
      
      // 希望する時間帯に基づいて開始時刻を決定する
      let baseStartHour;
      switch (studyData.studyHabits.preferredTimeOfDay) {
        case 'Morning': baseStartHour = 8; break;
        case 'Afternoon': baseStartHour = 13; break;
        case 'Evening': baseStartHour = 18; break;
        case 'Night': baseStartHour = 20; break;
        default: baseStartHour = 9;
      }

      // セッションの長さを分単位に変換する
      const sessionDuration = studyData.studyHabits.sessionDuration;
      const breakDuration = 15; // セッション間の15分の休憩
      
      // 各科目のスケジュールを作成する
      shuffledSubjects.forEach((subject, index) => {
        let startMinutes = baseStartHour * 60;
        let found = false;
        
        // 重複しない時間帯を見つける
        while (!found && startMinutes < (baseStartHour + 6) * 60) { // 基準開始時刻から6時間以内に制限する
          const endMinutes = startMinutes + sessionDuration;
          const startTime = minutesToTime(startMinutes);
          const endTime = minutesToTime(endMinutes);
          
          if (!hasTimeConflict(dailySchedule.schedule, startTime, endTime)) {
            // パフォーマンスに基づいて優先度を決定する
            let priority: 'low' | 'medium' | 'high';
            if (subject.currentPerformance < 60) priority = 'high';
            else if (subject.currentPerformance < 80) priority = 'medium';
            else priority = 'low';
            
            // ランダムな弱点または一般的なフォーカスを取得する
            const focusArea = subject.weakAreas.length > 0
              ? subject.weakAreas[Math.floor(Math.random() * subject.weakAreas.length)]
              : "一般的な復習";
            
            dailySchedule.schedule.push({
              subject: subject.name,
              startTime,
              endTime,
              focusArea,
              priority,
            });
            found = true;
          }
          
          // 次の時間帯を試す（セッションの長さ + 休憩時間を追加）
          startMinutes += sessionDuration + breakDuration;
        }
      });
      
      // 開始時刻でスケジュールをソートする
      dailySchedule.schedule.sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
      
      weekSchedule.push(dailySchedule);
    }
    
    weeklySchedules.push(weekSchedule);
  }

  // 全体の予想改善度を計算する
  const overallImprovement = Math.round(
    subjectAnalysis.reduce((sum, subject) => sum + subject.expectedImprovement, 0) / 
    subjectAnalysis.length
  );

  // 推薦を生成する
  const lowestPerformingSubject = [...subjectAnalysis]
    .sort((a, b) => a.currentPerformance - b.currentPerformance)[0];
  
  const recommendation = `テストの結果に基づいて、${lowestPerformingSubject.name}にもっと時間を集中することをおすすめします。現在のパフォーマンスは${lowestPerformingSubject.currentPerformance}%です。${lowestPerformingSubject.weakAreas.join('と')}の練習を継続することで、この科目の成績を約${lowestPerformingSubject.expectedImprovement}%改善することができます。`;

  return {
    weeklySchedules,
    subjectAnalysis,
    recommendation,
    overallImprovement
  };
}

// AIのチャット応答をシミュレートする関数
export async function getAIResponse(
  message: string, 
  studyData: StudyData, 
  scheduleData: ScheduleData
): Promise<string> {
  // APIの遅延をシミュレート
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // よくある質問のためのシンプルなパターンマッチング
  const messageLower = message.toLowerCase();
  
  // スケジュールの調整リクエストを処理する
  if (messageLower.includes('スケジュール変更') || messageLower.includes('スケジュール調整')) {
    return `喜んでスケジュールを調整します、${studyData.name}さん。現在の計画に基づいて、最も時間を割り当てているのは${scheduleData.subjectAnalysis[0].name}です。特定の日や科目を変更しますか？`;
  }
  
  // スタディ戦略の質問に対応する
  if (messageLower.includes('どのように勉強すればいい') || messageLower.includes('勉強のヒント')) {
    return `効果的な勉強方法としては以下をおすすめします:
1. 受動的な復習ではなく、能動的な回想を使用する
2. 学習セッションを間隔を空けて行い、記憶の定着を促す
3. ${scheduleData.subjectAnalysis[0].name}については、${scheduleData.subjectAnalysis[0].weakAreas.join('と')}に焦点を当てる
4. 集中力を維持するために、25分ごとに5分の休憩を取る
5. 睡眠前に学習内容を復習して記憶の定着を促す`;
  }
  
  // 時間管理の質問に対応する
  if (messageLower.includes('時間管理') || messageLower.includes('集中力を高める')) {
    const focusLevel = studyData.studyHabits.focusLevel;
    let focusTips = '';
    
    if (focusLevel === 'low') {
      focusTips = `集中力に問題がある場合は、以下を試してみてください:
1. ポモドーロテクニックを使用する（25分の作業と5分の休憩）
2. 携帯電話を別の部屋に置いて、注意を散漫させないようにする
3. 指定された勉強スペースで作業する
4. 学習セッション中にウェブサイトのブロッカーを使用する`;
    } else if (focusLevel === 'medium') {
      focusTips = `平均的な集中力を向上させるためには:
1. 各学習セッションに明確な目標を設定する
2. 科目ごとに短い休憩を取る
3. 集中力を維持するために環境音やインストゥルメンタル音楽を使用する
4. ${studyData.studyHabits.preferredTimeOfDay}にエネルギーレベルが最も高い時間帯で勉強することを検討する`;
    } else {
      focusTips = `すでに高い集中力を維持するためには:
1. 難しい問題に挑戦する
2. 理解を確固たるものにするために他の人に教える
3. 関連するトピックを混ぜて学習することで知識を深める
4. 難しいタスクを完了した後に自分自身を褒める`;
    }
    
    return focusTips;
  }
  
  // 特定の科目に関する質問に対応する
  for (const subject of studyData.subjects) {
    if (messageLower.includes(subject.name.toLowerCase())) {
      const subjectAnalysis = scheduleData.subjectAnalysis.find(s => s.name === subject.name);
      
      if (subjectAnalysis) {
        return `${subject.name}については、現在のパフォーマンスは${subjectAnalysis.currentPerformance}%です。週に${subjectAnalysis.timeAllocation}時間を割り当てています。フォーカスエリア: ${subjectAnalysis.weakAreas.join(', ')}。継続的な練習により、次の4週間で約${subjectAnalysis.expectedImprovement}%改善することができます。`;
      }
    }
  }
  
  // 一般的な「どうすればいいか」の質問に対応する
  if (messageLower.includes('どうすれば') || messageLower.includes('何をすれば')) {
    return `素晴らしい質問です！あなたの学習プロフィールに基づいて、詰め込み勉強ではなく、一貫した日々の練習に重点を置くことをおすすめします。スケジュールは、最初に弱点を優先し、特に${scheduleData.subjectAnalysis[0].name}に焦点を当てるように設計されています。特定の科目について具体的なアドバイスが必要ですか？`;
  }
  
  // その他のクエリに対するデフォルトの応答
  const defaultResponses = [
    `${studyData.studyHabits.preferredTimeOfDay}の勉強に最適化されたスケジュールを作成しました。セッションの長さは${studyData.studyHabits.sessionDuration}分です。スケジュールの特定の部分について話し合いたいことはありますか？`,
    
    `テストの結果を見ると、${scheduleData.subjectAnalysis[0].name}にもっと注意を払う必要があるようです。この科目にはもっと勉強時間を割り当てています。問題ありますか？`,
    
    `スケジュールは週に${studyData.studyHabits.daysPerWeek}日の勉強を想定しています。この他の計画の側面を調整したいですか？`,
    
    `学習パターンとテストの結果を分析して、このパーソナライズされたスケジュールを作成しました。これを一貫して実施することで、全体的に約${scheduleData.overallImprovement}%の改善が期待できます。変更したい点はありますか？`
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}
