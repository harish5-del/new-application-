import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, Search, Filter } from 'lucide-react';
import { TOPIC_CATEGORIES } from '../data/categories';
import { TopicCategory, Question, NewsArticle, LanguageMode } from '../types';

interface TopicsScreenProps {
  questions: Question[];
  articles: NewsArticle[];
  language: LanguageMode;
  onSelectQuestion: (question: Question) => void;
  onSelectArticle: (article: NewsArticle) => void;
  onToggleBookmarkQuestion: (question: Question) => void;
  onToggleBookmarkArticle: (article: NewsArticle) => void;
}

export const TopicsScreen: React.FC<TopicsScreenProps> = ({
  questions,
  articles,
  language,
  onSelectQuestion,
  onSelectArticle,
  onToggleBookmarkQuestion,
  onToggleBookmarkArticle,
}) => {
  const [activeCategory, setActiveCategory] = useState<TopicCategory | null>(null);
  const [topicFilter, setTopicFilter] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'questions' | 'news'>('all');

  // Compute counts per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, { questions: number; articles: number }> = {};
    for (const cat of TOPIC_CATEGORIES) {
      counts[cat.id] = { questions: 0, articles: 0 };
    }

    const matchCategory = (topicName: string): string => {
      const lower = (topicName || '').toLowerCase();
      for (const cat of TOPIC_CATEGORIES) {
        if (
          lower.includes(cat.id.replace(/_/g, ' ')) ||
          lower.includes(cat.name.toLowerCase()) ||
          cat.name.toLowerCase().includes(lower)
        ) {
          return cat.id;
        }
      }
      return 'others';
    };

    for (const q of questions) {
      const cId = matchCategory(q.main_topic);
      if (counts[cId]) counts[cId].questions++;
      else counts['others'].questions++;
    }

    for (const a of articles) {
      const cId = matchCategory(a.main_topic);
      if (counts[cId]) counts[cId].articles++;
      else counts['others'].articles++;
    }

    return counts;
  }, [questions, articles]);

  // If a topic is opened, show its questions & articles
  if (activeCategory) {
    const topicQuestions = questions.filter((q) => {
      const lower = q.main_topic.toLowerCase();
      return (
        lower.includes(activeCategory.name.toLowerCase()) ||
        activeCategory.name.toLowerCase().includes(lower) ||
        lower.includes(activeCategory.id.replace(/_/g, ' '))
      );
    });

    const topicArticles = articles.filter((a) => {
      const lower = a.main_topic.toLowerCase();
      return (
        lower.includes(activeCategory.name.toLowerCase()) ||
        activeCategory.name.toLowerCase().includes(lower) ||
        lower.includes(activeCategory.id.replace(/_/g, ' '))
      );
    });

    const showQs = itemTypeFilter === 'all' || itemTypeFilter === 'questions';
    const showArts = itemTypeFilter === 'all' || itemTypeFilter === 'news';

    return (
      <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Back Button & Header */}
        <button
          onClick={() => setActiveCategory(null)}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-4 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{language === 'ta' ? 'அனைத்து தலைப்புகள்' : 'Back to all topics'}</span>
        </button>

        {/* Topic Title Banner */}
        <div className={`p-4 rounded-2xl bg-white border border-gray-200 border-l-8 ${activeCategory.accentClass} shadow-2xs mb-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeCategory.icon}</span>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{activeCategory.name}</h1>
                <p className="text-sm font-medium text-gray-600">{activeCategory.tamil_name}</p>
              </div>
            </div>
          </div>
          {activeCategory.description && (
            <p className="text-xs text-gray-500 mt-2">{activeCategory.description}</p>
          )}

          {/* Counts pill */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100 text-xs">
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-semibold">
              {topicQuestions.length} Questions
            </span>
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-semibold">
              {topicArticles.length} News Stories
            </span>
          </div>
        </div>

        {/* Sub-Filter Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setItemTypeFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              itemTypeFilter === 'all' ? 'bg-[#152347] text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            All Items ({topicQuestions.length + topicArticles.length})
          </button>
          <button
            onClick={() => setItemTypeFilter('questions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              itemTypeFilter === 'questions' ? 'bg-[#152347] text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Questions ({topicQuestions.length})
          </button>
          <button
            onClick={() => setItemTypeFilter('news')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              itemTypeFilter === 'news' ? 'bg-[#152347] text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            News Articles ({topicArticles.length})
          </button>
        </div>

        {/* Content list */}
        <div className="space-y-3">
          {showQs &&
            topicQuestions.map((q, idx) => (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="bg-white rounded-xl p-3.5 border border-gray-200 hover:border-blue-400 shadow-2xs hover:shadow-xs transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                  <span className="font-semibold text-blue-600">Question #{idx + 1}</span>
                  <span>{q.publication_date}</span>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">
                  {language === 'ta' && q.tamil_question ? q.tamil_question : q.question}
                </h4>
                <div className="flex items-center justify-between text-xs text-emerald-700 pt-1 border-t border-gray-50">
                  <span>Answer: {q.correct_answer.split('.')[0]}</span>
                  <span className="text-blue-600 font-medium">Practice &rarr;</span>
                </div>
              </div>
            ))}

          {showArts &&
            topicArticles.map((a) => (
              <div
                key={a.id}
                onClick={() => onSelectArticle(a)}
                className="bg-white rounded-xl p-3.5 border border-gray-200 hover:border-blue-400 shadow-2xs hover:shadow-xs transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                  <span className="font-semibold text-emerald-600">Article</span>
                  <span>{a.publication_date}</span>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1.5">
                  {language === 'ta' && a.tamil_headline ? a.tamil_headline : a.headline}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2">{a.summary}</p>
              </div>
            ))}

          {topicQuestions.length === 0 && topicArticles.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center my-6">
              <p className="text-sm font-semibold text-gray-700 mb-1">No questions yet for this topic</p>
              <p className="text-xs text-gray-500">
                Upload daily Current Affairs PDFs or import web news to automatically populate this section!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Topics Grid List matching screenshot 4
  const filteredCategories = TOPIC_CATEGORIES.filter((cat) => {
    if (!topicFilter) return true;
    const q = topicFilter.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.tamil_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      {/* Title & Search header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {language === 'ta' ? 'நடப்பு நிகழ்வுகள் தலைப்புகள்' : 'Current Affairs Topics & Syllabus'}
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {language === 'ta'
            ? 'அனைத்து தேர்வுகளுக்கான தலைப்பு வாரியான தொகுப்பு'
            : 'Organized topic collections for TNPSC, UPSC, and competitive exams'}
        </p>

        {/* Search topic input */}
        <div className="relative mt-3">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            placeholder={language === 'ta' ? 'தலைப்பை வடிகட்டுக (Filter topics)...' : 'Search topic categories...'}
            className="w-full pl-9 pr-4 py-2 bg-white text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Topics list cards matching reference Screenshot 4 */}
      <div className="space-y-3">
        {filteredCategories.map((cat) => {
          const stats = categoryCounts[cat.id] || { questions: 0, articles: 0 };
          const totalItems = stats.questions + stats.articles;

          return (
            <div
              key={cat.id}
              onClick={() => setActiveCategory(cat)}
              className={`bg-white rounded-2xl p-3.5 border border-gray-150 border-l-[6px] ${cat.accentClass} shadow-2xs hover:shadow-md hover:border-gray-300 transition-all cursor-pointer flex items-center justify-between gap-3 group`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Topic Icon */}
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition">
                  {cat.icon}
                </div>

                {/* English Title & Tamil Subtitle matching reference screenshot */}
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition truncate">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 truncate font-serif">
                    {cat.tamil_name}
                  </p>
                </div>
              </div>

              {/* Right Arrow and Badge */}
              <div className="flex items-center gap-2 shrink-0">
                {totalItems > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {totalItems}
                  </span>
                )}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
