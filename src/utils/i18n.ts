export type AppLanguage = 'en' | 'ja';

export const APP_LANGUAGES: { id: AppLanguage; name: string }[] = [
  { id: 'en', name: 'English' },
  { id: 'ja', name: '日本語' },
];

const translations: Record<string, Record<AppLanguage, string>> = {
  'app.pomodoro': {
    en: 'Pomodoro', ja: 'ポモドーロ',
  },
  'glass.work': {
    en: 'WORK', ja: '集中',
  },
  'glass.break': {
    en: 'REST', ja: '休憩',
  },
  'glass.cycle': {
    en: 'Cycle', ja: 'サイクル',
  },
  'glass.cycles': {
    en: 'cycles', ja: 'サイクル',
  },
  'glass.workDuration': {
    en: 'Work Duration', ja: 'ワーク時間',
  },
  'glass.breakDuration': {
    en: 'Break Duration', ja: '休憩時間',
  },
  'glass.configure': {
    en: 'Configure', ja: '設定',
  },
  'glass.startSession': {
    en: 'Start', ja: '開始',
  },
  'glass.pause': {
    en: 'Pause', ja: '一時停止',
  },
  'glass.resume': {
    en: 'Resume', ja: '再開',
  },
  'glass.complete': {
    en: 'Complete', ja: '完了',
  },
  'glass.skip': {
    en: 'Skip', ja: 'スキップ',
  },
  'glass.skipBreak': {
    en: 'Skip Break', ja: '休憩スキップ',
  },
  'glass.continue': {
    en: 'Continue', ja: '続ける',
  },
  'glass.finish': {
    en: 'Finish', ja: '終了',
  },
  'glass.greatWork': {
    en: 'Great work!', ja: 'お疲れ様!',
  },
  'glass.cyclesCompleted': {
    en: 'Cycles Completed', ja: '完了サイクル',
  },
  'glass.totalTime': {
    en: 'Total Time', ja: '合計時間',
  },
  'glass.duration': {
    en: 'Duration', ja: '時間',
  },
  'glass.history': {
    en: 'History', ja: '履歴',
  },
  'glass.back': {
    en: 'Back', ja: '戻る',
  },
  'glass.home': {
    en: 'Home', ja: 'ホーム',
  },
  'glass.start': {
    en: 'Start', ja: '開始',
  },
};

export function t(key: string, lang: AppLanguage): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en ?? key;
}

export function getLanguageName(lang: AppLanguage): string {
  const found = APP_LANGUAGES.find((l) => l.id === lang);
  return found?.name ?? lang;
}
