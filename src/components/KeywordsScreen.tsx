import React, { useState, useMemo } from 'react';
import { Tag, Search, ChevronRight, BookOpen } from 'lucide-react';
import { Question, NewsArticle, LanguageMode } from '../types';

interface KeywordsScreenProps {
  questions: Question[];
  articles: NewsArticle[];
  language: LanguageMode;
  onSelectQuestion: (question: Question) => void;
  onSelectArticle: (article: NewsArticle) => void;
}

export const KeywordsScreen: React.FC<KeywordsScreenProps> = ({
  questions,
  articles,
  language,
  onSelectQuestion,
  onSelectArticle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  // Compute all unique keywords and their occurrences
  const keywordStats = useMemo(() => {
    const map = new Map<string, { count: number; questions: Question[]; articles: NewsArticle[] }>();

    const addKeyword = (rawTag: string, q?: Question, a?: NewsArticle) => {
      const clean = rawTag.replace(/^#/, '').trim();
      if (!clean || clean.length < 2) return;

      if (!map.has(clean)) {
        map.set(clean, { count: 0, questions: [], articles: [] });
      }
      const entry = map.get(clean)!;
      entry.count++;
      if (q && !entry.questions.some((item) => item.id === q.id)) {
        entry.questions.push(q);
      }
      if (a && !entry.articles.some((item) => item.id === a.id)) {
        entry.articles.push(a);
      }
    };

    questions.forEach((q) => {
      q.keywords.forEach((k) => addKeyword(k, q, undefined));
    });

    articles.forEach((a) => {
      a.keywords.forEach((k) => addKeyword(k, undefined, a));
    });

    // Convert to sorted array by frequency
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [questions, articles]);

  // Filtered keyword tags
  const filteredKeywords = useMemo(() => {
    if (!searchQuery.trim()) return keywordStats;
    const q = searchQuery.toLowerCase().trim();
    return keywordStats.filter((k) => k.name.toLowerCase().includes(q));
  }, [keywordStats, searchQuery]);

  // Selected keyword data
  const activeKeywordData = useMemo(() => {
    if (!selectedKeyword) return null;
    return keywordStats.find((k) => k.name.toLowerCase() === selectedKeyword.toLowerCase());
  }, [keywordStats, selectedKeyword]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>{language === 'ta' ? 'முக்கிய சொற்கள் நூலகம்' : 'Smart Keyword Library'}</span>
          <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
            {keywordStats.length} Tags
          </span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {language === 'ta'
            ? 'ஏதேனும் ஒரு முக்கியச் சொல்லைத் தேர்ந்தெடுத்து, அனைத்து தேதிகளிலிருந்தும் தொடர்புடைய வினாக்கள் மற்றும் செய்திகளை ஒரே இடத்தில் படிக்கலாம்.'
            : 'Click any keyword to find all related questions and news items across all imported daily PDFs.'}
        </p>
      </div>

      {/* Keyword Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'ta' ? 'முக்கியச் சொல்லைத் தேடுங்கள் (எ.கா: ISRO, RBI, Nobel, திட்டம்)...' : 'Filter keywords (e.g. ISRO, RBI, Nobel, Scheme)...'}
          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-2xs"
        />
      </div>

      {/* Keywords Cloud / Pills */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs mb-6">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
          Popular Keywords & Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {filteredKeywords.map((k) => {
            const isSelected = selectedKeyword === k.name;
            return (
              <button
                key={k.name}
                onClick={() => setSelectedKeyword(isSelected ? null : k.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200'
                }`}
              >
                <span>#{k.name}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {k.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Display Results for Selected Keyword */}
      {selectedKeyword && activeKeywordData && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Stories & Questions for &ldquo;#{selectedKeyword}&rdquo;
            </h3>
            <span className="text-xs font-semibold text-blue-600">
              {activeKeywordData.questions.length + activeKeywordData.articles.length} results
            </span>
          </div>

          {/* Questions */}
          {activeKeywordData.questions.map((q) => (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="bg-white rounded-xl p-3.5 border border-blue-100 hover:border-blue-400 shadow-2xs transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                <span className="font-semibold text-blue-600">Question &middot; {q.main_topic}</span>
                <span>{q.publication_date}</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">
                {language === 'ta' && q.tamil_question ? q.tamil_question : q.question}
              </h4>
            </div>
          ))}

          {/* Articles */}
          {activeKeywordData.articles.map((a) => (
            <div
              key={a.id}
              onClick={() => onSelectArticle(a)}
              className="bg-white rounded-xl p-3.5 border border-emerald-100 hover:border-emerald-400 shadow-2xs transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                <span className="font-semibold text-emerald-600">Article &middot; {a.main_topic}</span>
                <span>{a.publication_date}</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">
                {language === 'ta' && a.tamil_headline ? a.tamil_headline : a.headline}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">{a.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
