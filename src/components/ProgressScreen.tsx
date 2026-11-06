import React from 'react';
import { TrendingUp, CheckCircle, Bookmark, Award, Target, Flame, BookOpen } from 'lucide-react';
import { Question, NewsArticle, LanguageMode } from '../types';
import { TOPIC_CATEGORIES } from '../data/categories';

interface ProgressScreenProps {
  questions: Question[];
  articles: NewsArticle[];
  language: LanguageMode;
  onGoToQuestions: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  questions,
  articles,
  language,
  onGoToQuestions,
}) => {
  const totalQuestions = questions.length;
  const studiedQuestions = questions.filter((q) => q.studied).length;
  const bookmarkedQuestions = questions.filter((q) => q.bookmarked).length;
  const pendingQuestions = totalQuestions - studiedQuestions;

  const totalArticles = articles.length;
  const studiedArticles = articles.filter((a) => a.studied).length;

  const overallMastery = totalQuestions > 0 ? Math.round((studiedQuestions / totalQuestions) * 100) : 0;

  // Topic-wise progress breakdown
  const topicProgress = React.useMemo(() => {
    return TOPIC_CATEGORIES.map((cat) => {
      const topicQs = questions.filter((q) => {
        const lower = q.main_topic.toLowerCase();
        return (
          lower.includes(cat.name.toLowerCase()) ||
          cat.name.toLowerCase().includes(lower) ||
          lower.includes(cat.id.replace(/_/g, ' '))
        );
      });
      const studied = topicQs.filter((q) => q.studied).length;
      const percent = topicQs.length > 0 ? Math.round((studied / topicQs.length) * 100) : 0;

      return {
        category: cat,
        total: topicQs.length,
        studied,
        percent,
      };
    }).filter((t) => t.total > 0);
  }, [questions]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>{language === 'ta' ? 'படிப்பு முன்னேற்றம் & பகுப்பாய்வு' : 'Study Progress Tracker'}</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            {overallMastery}% Complete
          </span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {language === 'ta'
            ? 'உங்கள் தினசரி நடப்பு நிகழ்வுகள் தயாரிப்பு நிலை மற்றும் தலைப்பு வாரியான முன்னேற்றம்.'
            : 'Track your preparation status, accuracy, topic coverage, and revisions.'}
        </p>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold">Total MCQs</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
          <span className="text-[10px] text-gray-400">Questions saved</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-semibold">Studied</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{studiedQuestions}</div>
          <span className="text-[10px] text-emerald-600 font-medium">{overallMastery}% mastered</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-100 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-semibold">Pending</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{pendingQuestions}</div>
          <span className="text-[10px] text-amber-600 font-medium">To be revised</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-indigo-100 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-[11px] font-semibold">Bookmarked</span>
            <Bookmark className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700">{bookmarkedQuestions}</div>
          <span className="text-[10px] text-indigo-600 font-medium">Key revision points</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-800">Overall Syllabus Completion</span>
          <span className="text-xs font-extrabold text-blue-600">{overallMastery}%</span>
        </div>
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallMastery}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-500 mt-2">
          {studiedQuestions === totalQuestions && totalQuestions > 0
            ? 'Outstanding! You have revised all saved questions.'
            : `${pendingQuestions} questions left to study. Keep going!`}
        </p>
      </div>

      {/* Topic-Wise Mastery Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
          <span>Topic-Wise Coverage</span>
          <span className="text-xs font-normal text-gray-400">Questions studied</span>
        </h3>

        {topicProgress.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No topic questions found yet.</p>
        ) : (
          <div className="space-y-3">
            {topicProgress.map(({ category, total, studied, percent }) => (
              <div key={category.id} className="border-b border-gray-50 pb-2.5 last:border-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                  <span className="font-bold text-gray-600 text-[11px]">
                    {studied} / {total} ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onGoToQuestions}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
        >
          {language === 'ta' ? 'வினாக்களைப் பயிற்சி செய்க' : 'Practice Pending Questions'} &rarr;
        </button>
      </div>
    </div>
  );
};
