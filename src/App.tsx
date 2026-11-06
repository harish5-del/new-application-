import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { HomeScreen } from './components/HomeScreen';
import { TopicsScreen } from './components/TopicsScreen';
import { DetailReader } from './components/DetailReader';
import { ImportPDFScreen } from './components/ImportPDFScreen';
import { ImportWebsiteScreen } from './components/ImportWebsiteScreen';
import { QuestionsScreen } from './components/QuestionsScreen';
import { KeywordsScreen } from './components/KeywordsScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { SettingsScreen } from './components/SettingsScreen';

import {
  getAllQuestions,
  getAllArticles,
  getImportHistory,
  saveQuestion,
  updateQuestion,
  saveMultipleQuestions,
  saveMultipleArticles,
  updateArticle,
  addImportRecord,
  seedInitialDataIfEmpty,
} from './db/indexedDB';

import { Question, NewsArticle, ImportRecord, ActiveTab, LanguageMode } from './types';
import { useOnlineStatus } from './hooks/usePWA';
import { WifiOff, Bookmark } from 'lucide-react';

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [importHistory, setImportHistory] = useState<ImportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [language, setLanguage] = useState<LanguageMode>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Selected item in detail reader modal
  const [readerItem, setReaderItem] = useState<
    | { type: 'article'; data: NewsArticle }
    | { type: 'question'; data: Question }
    | null
  >(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const isOnline = useOnlineStatus();

  // Load data from IndexedDB on startup & register Service Worker
  const loadDatabase = async () => {
    try {
      await seedInitialDataIfEmpty();
      const [qList, aList, hList] = await Promise.all([
        getAllQuestions(),
        getAllArticles(),
        getImportHistory(),
      ]);
      setQuestions(qList);
      setArticles(aList);
      setImportHistory(hList);
    } catch (err) {
      console.error('Failed to load IndexedDB data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();

    // Register PWA service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Service Worker registered:', reg.scope))
        .catch((err) => console.warn('Service Worker registration failed:', err));
    }
  }, []);

  // Toggle bookmark for an article
  const handleToggleBookmarkArticle = async (article: NewsArticle) => {
    const updated = { ...article, bookmarked: !article.bookmarked };
    await updateArticle(updated);
    setArticles((prev) => prev.map((a) => (a.id === article.id ? updated : a)));
    if (readerItem && readerItem.type === 'article' && readerItem.data.id === article.id) {
      setReaderItem({ type: 'article', data: updated });
    }
  };

  // Toggle bookmark for a question
  const handleToggleBookmarkQuestion = async (question: Question) => {
    const updated = { ...question, bookmarked: !question.bookmarked };
    await updateQuestion(updated);
    setQuestions((prev) => prev.map((q) => (q.id === question.id ? updated : q)));
    if (readerItem && readerItem.type === 'question' && readerItem.data.id === question.id) {
      setReaderItem({ type: 'question', data: updated });
    }
  };

  // Toggle studied status for a question
  const handleToggleStudiedQuestion = async (question: Question) => {
    const updated = { ...question, studied: !question.studied };
    await updateQuestion(updated);
    setQuestions((prev) => prev.map((q) => (q.id === question.id ? updated : q)));
    if (readerItem && readerItem.type === 'question' && readerItem.data.id === question.id) {
      setReaderItem({ type: 'question', data: updated });
    }
  };

  // Toggle studied status for an article
  const handleToggleStudiedArticle = async (article: NewsArticle) => {
    const updated = { ...article, studied: !article.studied };
    await updateArticle(updated);
    setArticles((prev) => prev.map((a) => (a.id === article.id ? updated : a)));
    if (readerItem && readerItem.type === 'article' && readerItem.data.id === article.id) {
      setReaderItem({ type: 'article', data: updated });
    }
  };

  // Save personal notes
  const handleSaveNotes = async (id: string, notes: string) => {
    if (readerItem?.type === 'article') {
      const art = articles.find((a) => a.id === id);
      if (art) {
        const updated = { ...art, notes };
        await updateArticle(updated);
        setArticles((prev) => prev.map((a) => (a.id === id ? updated : a)));
        setReaderItem({ type: 'article', data: updated });
      }
    } else if (readerItem?.type === 'question') {
      const q = questions.find((item) => item.id === id);
      if (q) {
        const updated = { ...q, notes };
        await updateQuestion(updated);
        setQuestions((prev) => prev.map((item) => (item.id === id ? updated : item)));
        setReaderItem({ type: 'question', data: updated });
      }
    }
  };

  // Handle import complete (saves into IndexedDB and state)
  const handleImportComplete = async (data: {
    questions: Question[];
    articles: NewsArticle[];
    record: ImportRecord;
  }) => {
    if (data.questions.length > 0) {
      await saveMultipleQuestions(data.questions);
    }
    if (data.articles.length > 0) {
      await saveMultipleArticles(data.articles);
    }
    await addImportRecord(data.record);
    await loadDatabase();
  };

  // Navigate through reader items (prev / next)
  const currentList = readerItem?.type === 'article' ? articles : questions;
  const currentIndex = readerItem
    ? currentList.findIndex((item) => item.id === readerItem.data.id)
    : -1;

  const handleNextReader = () => {
    if (currentIndex >= 0 && currentIndex < currentList.length - 1) {
      const nextItem = currentList[currentIndex + 1];
      if (readerItem?.type === 'article') {
        setReaderItem({ type: 'article', data: nextItem as NewsArticle });
      } else {
        setReaderItem({ type: 'question', data: nextItem as Question });
      }
    }
  };

  const handlePrevReader = () => {
    if (currentIndex > 0) {
      const prevItem = currentList[currentIndex - 1];
      if (readerItem?.type === 'article') {
        setReaderItem({ type: 'article', data: prevItem as NewsArticle });
      } else {
        setReaderItem({ type: 'question', data: prevItem as Question });
      }
    }
  };

  // Quick search focus trigger from header
  const handleFocusSearch = () => {
    if (activeTab !== 'home') {
      setActiveTab('home');
    }
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Counts for drawer badges
  const counts = {
    totalQuestions: questions.length,
    totalArticles: articles.length,
    bookmarked:
      questions.filter((q) => q.bookmarked).length +
      articles.filter((a) => a.bookmarked).length,
    studied:
      questions.filter((q) => q.studied).length +
      articles.filter((a) => a.studied).length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header matching reference screenshot */}
      <Header
        currentLanguage={language}
        onToggleLanguage={(lang) => setLanguage(lang)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onFocusSearch={handleFocusSearch}
      />

      {/* 2. Navigation Drawer */}
      <NavigationDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        language={language}
        counts={counts}
      />

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2 text-center sticky top-16 z-30 shadow-xs">
          <WifiOff className="w-3.5 h-3.5" />
          <span>
            {language === 'ta'
              ? 'ஆஃப்லைன் முறை: சேமிக்கப்பட்ட வினாக்கள் மற்றும் குறிப்புகளை இணையம் இன்றியே படிக்கலாம்.'
              : 'Offline Mode: Saved questions and news are 100% accessible offline without internet.'}
          </span>
        </div>
      )}

      {/* 3. Main Views */}
      <main className="flex-1">
        {isLoading ? (
          <div className="max-w-2xl mx-auto p-12 text-center">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-gray-500">Loading your Current Affairs Library...</p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                articles={articles}
                questions={questions}
                language={language}
                onSelectArticle={(art) => setReaderItem({ type: 'article', data: art })}
                onSelectQuestion={(q) => setReaderItem({ type: 'question', data: q })}
                onToggleBookmarkArticle={handleToggleBookmarkArticle}
                onToggleBookmarkQuestion={handleToggleBookmarkQuestion}
                onGoToImport={() => setActiveTab('import_pdf')}
                onGoToTopics={() => setActiveTab('topics')}
                searchRef={searchInputRef}
              />
            )}

            {activeTab === 'topics' && (
              <TopicsScreen
                questions={questions}
                articles={articles}
                language={language}
                onSelectQuestion={(q) => setReaderItem({ type: 'question', data: q })}
                onSelectArticle={(art) => setReaderItem({ type: 'article', data: art })}
                onToggleBookmarkQuestion={handleToggleBookmarkQuestion}
                onToggleBookmarkArticle={handleToggleBookmarkArticle}
              />
            )}

            {activeTab === 'import_pdf' && (
              <ImportPDFScreen
                language={language}
                onImportComplete={handleImportComplete}
                importHistory={importHistory}
              />
            )}

            {activeTab === 'import_url' && (
              <ImportWebsiteScreen
                language={language}
                onImportComplete={handleImportComplete}
              />
            )}

            {activeTab === 'questions' && (
              <QuestionsScreen
                questions={questions}
                language={language}
                onSelectQuestion={(q) => setReaderItem({ type: 'question', data: q })}
                onToggleBookmark={handleToggleBookmarkQuestion}
                onToggleStudied={handleToggleStudiedQuestion}
              />
            )}

            {activeTab === 'news' && (
              <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
                <div className="mb-4">
                  <h1 className="text-xl font-bold text-gray-900">
                    {language === 'ta' ? 'அனைத்து நடப்பு நிகழ்வுகள்' : 'All Current Affairs News'}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {articles.length} news stories in your library
                  </p>
                </div>
                <div className="space-y-3">
                  {articles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => setReaderItem({ type: 'article', data: art })}
                      className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs hover:shadow-md transition cursor-pointer"
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-100 mb-2">
                        {art.main_topic}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm mb-1.5 font-serif">
                        {language === 'ta' && art.tamil_headline ? art.tamil_headline : art.headline}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">{art.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'keywords' && (
              <KeywordsScreen
                questions={questions}
                articles={articles}
                language={language}
                onSelectQuestion={(q) => setReaderItem({ type: 'question', data: q })}
                onSelectArticle={(art) => setReaderItem({ type: 'article', data: art })}
              />
            )}

            {activeTab === 'bookmarks' && (
              <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
                <div className="mb-4">
                  <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>{language === 'ta' ? 'சேமிக்கப்பட்ட வினாக்கள் & செய்திகள்' : 'Bookmarked Items'}</span>
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                      {counts.bookmarked}
                    </span>
                  </h1>
                </div>

                {counts.bookmarked === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center my-6">
                    <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">No bookmarks yet</p>
                    <p className="text-xs text-gray-400 mt-1">Tap the bookmark icon on any question or article to save it for quick revision.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Bookmarked questions */}
                    {questions
                      .filter((q) => q.bookmarked)
                      .map((q) => (
                        <div
                          key={q.id}
                          onClick={() => setReaderItem({ type: 'question', data: q })}
                          className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs hover:shadow-md transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
                            <span>Question &middot; {q.main_topic}</span>
                            <span>{q.publication_date}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {language === 'ta' && q.tamil_question ? q.tamil_question : q.question}
                          </h4>
                        </div>
                      ))}

                    {/* Bookmarked articles */}
                    {articles
                      .filter((a) => a.bookmarked)
                      .map((a) => (
                        <div
                          key={a.id}
                          onClick={() => setReaderItem({ type: 'article', data: a })}
                          className="bg-white rounded-2xl p-4 border border-blue-200 shadow-2xs hover:shadow-md transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-xs text-blue-800 font-semibold mb-1">
                            <span>Article &middot; {a.main_topic}</span>
                            <span>{a.publication_date}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">
                            {language === 'ta' && a.tamil_headline ? a.tamil_headline : a.headline}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">{a.summary}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <ProgressScreen
                questions={questions}
                articles={articles}
                language={language}
                onGoToQuestions={() => setActiveTab('questions')}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsScreen
                language={language}
                totalQuestions={questions.length}
                totalArticles={articles.length}
                onRefreshData={loadDatabase}
              />
            )}
          </>
        )}
      </main>

      {/* 4. Detail Reader Modal matching Screenshot 3 */}
      {readerItem && (
        <DetailReader
          item={readerItem}
          onClose={() => setReaderItem(null)}
          language={language}
          onToggleBookmarkArticle={handleToggleBookmarkArticle}
          onToggleBookmarkQuestion={handleToggleBookmarkQuestion}
          onToggleStudiedQuestion={handleToggleStudiedQuestion}
          onToggleStudiedArticle={handleToggleStudiedArticle}
          onSaveNotes={handleSaveNotes}
          onSelectKeyword={(kw) => {
            setActiveTab('home');
            setTimeout(() => {
              if (searchInputRef.current) {
                searchInputRef.current.value = kw;
              }
            }, 50);
          }}
          onNext={handleNextReader}
          onPrev={handlePrevReader}
          hasNext={currentIndex < currentList.length - 1}
          hasPrev={currentIndex > 0}
        />
      )}
    </div>
  );
}
