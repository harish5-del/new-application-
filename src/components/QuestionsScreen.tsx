import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Shuffle,
  Filter,
  Check,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Question, LanguageMode } from '../types';

interface QuestionsScreenProps {
  questions: Question[];
  language: LanguageMode;
  onSelectQuestion: (question: Question) => void;
  onToggleBookmark: (question: Question) => void;
  onToggleStudied: (question: Question) => void;
}

export const QuestionsScreen: React.FC<QuestionsScreenProps> = ({
  questions,
  language,
  onSelectQuestion,
  onToggleBookmark,
  onToggleStudied,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unstudied' | 'studied' | 'bookmarked'>('all');

  // Unique topics
  const topics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.main_topic) set.add(q.main_topic);
    });
    return ['All', ...Array.from(set).sort()];
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedTopic !== 'All' && q.main_topic !== selectedTopic) return false;
      if (statusFilter === 'unstudied' && q.studied) return false;
      if (statusFilter === 'studied' && !q.studied) return false;
      if (statusFilter === 'bookmarked' && !q.bookmarked) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inQ = q.question.toLowerCase().includes(query);
        const inTaQ = q.tamil_question?.toLowerCase().includes(query);
        const inExp = q.explanation.toLowerCase().includes(query);
        const inTaExp = q.tamil_explanation?.toLowerCase().includes(query);
        const inKeys = q.keywords.some((k) => k.toLowerCase().includes(query));
        const inTopic = q.main_topic.toLowerCase().includes(query);
        if (!inQ && !inTaQ && !inExp && !inTaExp && !inKeys && !inTopic) return false;
      }

      return true;
    });
  }, [questions, selectedTopic, statusFilter, searchQuery]);

  // Pick random question for quick quiz practice
  const handleRandomPractice = () => {
    if (questions.length === 0) return;
    const randomIndex = Math.floor(Math.random() * questions.length);
    onSelectQuestion(questions[randomIndex]);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      {/* Title & Action */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>{language === 'ta' ? 'வினா வங்கி & பயிற்சி' : 'Current Affairs Question Bank'}</span>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {questions.length}
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {language === 'ta'
              ? 'அனைத்து PDF ஆவணங்களிலிருந்தும் பிரித்தெடுக்கப்பட்ட வினாக்கள்'
              : 'Auto-extracted MCQs with detailed English and Tamil explanations'}
          </p>
        </div>

        {/* Random Practice Button */}
        <button
          onClick={handleRandomPractice}
          disabled={questions.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition shrink-0"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'சீரற்ற வினா' : 'Random Quiz'}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'ta' ? 'வினா அல்லது விடையைத் தேடுங்கள்...' : 'Search questions, keywords, answers...'}
          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-2xs"
        />
      </div>

      {/* Filter Row: Topic Selector & Status Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-700 focus:outline-hidden"
        >
          {topics.map((t) => (
            <option key={t} value={t}>
              Topic: {t}
            </option>
          ))}
        </select>

        {/* Status Filter buttons */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              statusFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('unstudied')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              statusFilter === 'unstudied' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('studied')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              statusFilter === 'studied' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-gray-600'
            }`}
          >
            Studied
          </button>
          <button
            onClick={() => setStatusFilter('bookmarked')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              statusFilter === 'bookmarked' ? 'bg-white text-amber-700 shadow-2xs' : 'text-gray-600'
            }`}
          >
            Bookmarked
          </button>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center my-6">
            <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-gray-800">No questions found matching criteria</h4>
            <p className="text-xs text-gray-500 mt-1">Try resetting filters or import new PDFs.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isBookmarked = !!q.bookmarked;
            const isStudied = !!q.studied;

            return (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-blue-400 shadow-2xs hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                      Q #{idx + 1}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">{q.main_topic}</span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Mark Studied quick button */}
                    <button
                      onClick={() => onToggleStudied(q)}
                      className={`p-1.5 rounded-lg border transition ${
                        isStudied
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'text-gray-400 hover:text-gray-700 border-gray-200'
                      }`}
                      title={isStudied ? 'Studied' : 'Mark as Studied'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* Bookmark quick button */}
                    <button
                      onClick={() => onToggleBookmark(q)}
                      className={`p-1.5 rounded-lg border transition ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'text-gray-400 hover:text-gray-700 border-gray-200'
                      }`}
                      title={isBookmarked ? 'Bookmarked' : 'Add Bookmark'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-3.5 h-3.5 fill-amber-600" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-600 transition mb-2.5 font-serif">
                  {language === 'ta' && q.tamil_question ? q.tamil_question : q.question}
                </h3>

                {/* Options list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2.5">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className="text-xs bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-150 truncate"
                    >
                      {opt}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-50">
                  <span className="font-medium text-emerald-700">
                    Ans: {q.correct_answer.split('.')[0] || 'View'}
                  </span>
                  <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:translate-x-0.5 transition">
                    <span>{language === 'ta' ? 'பயிற்சி செய்க' : 'Practice MCQ'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
