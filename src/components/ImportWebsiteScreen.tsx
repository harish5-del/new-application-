import React, { useState } from 'react';
import { Globe, Sparkles, Loader2, CheckCircle, AlertCircle, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { NewsArticle, ImportRecord, LanguageMode } from '../types';
import { useOnlineStatus } from '../hooks/usePWA';

interface ImportWebsiteScreenProps {
  language: LanguageMode;
  onImportComplete: (data: {
    questions: any[];
    articles: NewsArticle[];
    record: ImportRecord;
  }) => void;
}

export const ImportWebsiteScreen: React.FC<ImportWebsiteScreenProps> = ({
  language,
  onImportComplete,
}) => {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [fallbackPaste, setFallbackPaste] = useState(false);
  const [manualText, setManualText] = useState('');

  const isOnline = useOnlineStatus();

  // Sample quick test links
  const sampleLinks = [
    { name: 'UN News Disarmament', url: 'https://news.un.org/en/story/2026/10/disarmament-week' },
    { name: 'PIB National Health', url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=esanjeevani' },
    { name: 'Tamil Nadu Govt Portal', url: 'https://www.tn.gov.in/scheme/data_view/breakfast' },
  ];

  const handleFetchUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!isOnline) {
      setErrorMessage('Internet connection is required to fetch web articles.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    try {
      const response = await fetch('/api/gemini/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch and extract from URL');
      }

      const resData = await response.json();
      const extracted = resData.data;

      const extractedArticles: NewsArticle[] = (extracted.articles || []).map(
        (a: any, idx: number) => ({
          id: `art-url-${Date.now()}-${idx}`,
          headline: a.headline || 'Web Current Affairs',
          tamil_headline: a.tamil_headline || '',
          summary: a.summary || '',
          content: a.content || a.summary || '',
          tamil_explanation: a.tamil_explanation || 'விளக்கம்',
          key_facts: Array.isArray(a.key_facts) ? a.key_facts : [],
          main_topic: a.main_topic || 'National Affairs',
          sub_topic: a.sub_topic || '',
          keywords: Array.isArray(a.keywords) ? a.keywords : ['Web News'],
          publication_date: a.publication_date || new Date().toISOString().split('T')[0],
          source_name: new URL(url).hostname,
          source_url: url,
          created_at: new Date().toISOString(),
          bookmarked: false,
          studied: false,
        })
      );

      const importRecord: ImportRecord = {
        id: `imp-url-${Date.now()}`,
        file_name: new URL(url).hostname,
        import_date: new Date().toISOString(),
        total_detected: extractedArticles.length,
        questions_count: 0,
        articles_count: extractedArticles.length,
        status: 'success',
        source_type: 'url',
        summary: `Imported from ${url}`,
      };

      onImportComplete({
        questions: [],
        articles: extractedArticles,
        record: importRecord,
      });

      setSuccessInfo(
        `Successfully extracted and categorized article: "${extractedArticles[0]?.headline || 'News'}"`
      );
      setUrl('');
    } catch (err: any) {
      setErrorMessage(err.message);
      setFallbackPaste(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualFallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: manualText,
          sourceName: url || 'Web Article Copy',
          customDate: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process text');
      }

      const resData = await response.json();
      const extracted = resData.data;

      const extractedArticles: NewsArticle[] = (extracted.articles || []).map(
        (a: any, idx: number) => ({
          id: `art-man-${Date.now()}-${idx}`,
          headline: a.headline || 'Web Article Excerpt',
          tamil_headline: a.tamil_headline || '',
          summary: a.summary || '',
          content: a.content || a.summary || '',
          tamil_explanation: a.tamil_explanation || 'விளக்கம்',
          key_facts: a.key_facts || [],
          main_topic: a.main_topic || 'National Affairs',
          sub_topic: a.sub_topic || '',
          keywords: a.keywords || ['Current Affairs'],
          publication_date: new Date().toISOString().split('T')[0],
          source_name: url ? new URL(url).hostname : 'Web News',
          source_url: url,
          created_at: new Date().toISOString(),
          bookmarked: false,
          studied: false,
        })
      );

      const importRecord: ImportRecord = {
        id: `imp-man-${Date.now()}`,
        file_name: url ? new URL(url).hostname : 'Web News Paste',
        import_date: new Date().toISOString(),
        total_detected: extractedArticles.length,
        questions_count: 0,
        articles_count: extractedArticles.length,
        status: 'success',
        source_type: 'url',
      };

      onImportComplete({
        questions: [],
        articles: extractedArticles,
        record: importRecord,
      });

      setSuccessInfo('Successfully saved pasted article into your library!');
      setManualText('');
      setFallbackPaste(false);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>{language === 'ta' ? 'இணையதள செய்தி இறக்குமதி' : 'Import Website News Article'}</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            Auto-Extract
          </span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {language === 'ta'
            ? 'பொது செய்தி தளத்தின் இணைப்பை (URL) உள்ளிடவும். AI தானாகவே முக்கியத் தகவல்களைப் பிரித்து, தமிழாக்கத்துடன் சேமிக்கும்.'
            : 'Enter any public news article URL. Gemini AI will retrieve key facts, summarize in English & Tamil, categorize by topic, and save to your library.'}
        </p>
      </div>

      {/* Success Banner */}
      {successInfo && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 font-medium">{successInfo}</p>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* URL Fetch Form */}
      <form onSubmit={handleFetchUrl} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3 mb-5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Article Webpage URL:
          </label>
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.thehindu.com/news/national/... or https://pib.gov.in/..."
              required
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !url.trim()}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fetching & Processing with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Fetch & Organize with Gemini AI</span>
            </>
          )}
        </button>

        {/* Quick sample chips */}
        <div className="pt-2 border-t border-gray-100">
          <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">Try sample source:</span>
          <div className="flex flex-wrap gap-1.5">
            {sampleLinks.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setUrl(s.url)}
                className="text-[11px] bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-2 py-1 rounded-lg transition"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Manual Paste Fallback */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <h3 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Paywall & Website Protection Fallback</span>
        </h3>
        <p className="text-[11px] text-gray-500 mb-3">
          Some news portals (The Hindu, Indian Express, BBC) restrict automated crawlers. You can simply copy the article text and paste it below:
        </p>

        {fallbackPaste ? (
          <form onSubmit={handleManualFallback} className="space-y-2">
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={5}
              placeholder="Paste article text here..."
              className="w-full p-2.5 bg-white text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isProcessing || !manualText.trim()}
                className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black"
              >
                Extract from Pasted Text
              </button>
              <button
                type="button"
                onClick={() => setFallbackPaste(false)}
                className="px-3 py-2 text-xs text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setFallbackPaste(true)}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            + Click here to paste article text manually
          </button>
        )}
      </div>
    </div>
  );
};
