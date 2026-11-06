import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles,
  ClipboardPaste,
  History,
  Info
} from 'lucide-react';
import { ImportRecord, Question, NewsArticle, LanguageMode } from '../types';
import { useOnlineStatus } from '../hooks/usePWA';

interface ImportPDFScreenProps {
  language: LanguageMode;
  onImportComplete: (data: {
    questions: Question[];
    articles: NewsArticle[];
    record: ImportRecord;
  }) => void;
  importHistory: ImportRecord[];
}

export const ImportPDFScreen: React.FC<ImportPDFScreenProps> = ({
  language,
  onImportComplete,
  importHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    fileName: string;
    questionsCount: number;
    articlesCount: number;
    summary?: string;
  } | null>(null);

  // Manual paste state
  const [pastedText, setPastedText] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);

  const isOnline = useOnlineStatus();

  // Handle PDF file selection
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!isOnline) {
      setErrorMessage(
        'Internet connection is required for Gemini AI to process new PDFs. Previously saved questions remain available offline.'
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    // Process each file (supports multiple PDFs)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProcessStatus(
        `Uploading & analyzing ${file.name} (${i + 1}/${files.length}) with Gemini 3.8 Flash...`
      );

      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Extract pure base64 without prefix
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        setProcessStatus(`Extracting questions, options, and Tamil translations from ${file.name}...`);

        const response = await fetch('/api/gemini/extract-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            mimeType: file.type || 'application/pdf',
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to analyze PDF with Gemini API');
        }

        const resData = await response.json();
        const extracted = resData.data;

        // Map and sanitize extracted questions
        const extractedQuestions: Question[] = (extracted.questions || []).map(
          (q: any, idx: number) => ({
            id: `q-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            question: q.question || 'Current Affairs Question',
            tamil_question: q.tamil_question || '',
            options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['A. Yes', 'B. No'],
            correct_answer: q.correct_answer || 'NEEDS REVIEW',
            explanation: q.explanation || 'Refer to current affairs notes.',
            tamil_explanation: q.tamil_explanation || 'விளக்கம் சேமிக்கப்பட்டுள்ளது.',
            main_topic: q.main_topic || 'National Affairs',
            sub_topic: q.sub_topic || '',
            keywords: Array.isArray(q.keywords) ? q.keywords : ['Current Affairs'],
            source_file: file.name,
            source_page: q.source_page || 1,
            publication_date: extracted.document_date || extracted.publication_date || documentDate,
            created_at: new Date().toISOString(),
            bookmarked: false,
            studied: false,
          })
        );

        // Map extracted articles
        const extractedArticles: NewsArticle[] = (extracted.articles || []).map(
          (a: any, idx: number) => ({
            id: `art-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            headline: a.headline || 'Current Affairs Headline',
            tamil_headline: a.tamil_headline || '',
            summary: a.summary || '',
            content: a.content || a.summary || '',
            tamil_explanation: a.tamil_explanation || a.summary || '',
            key_facts: Array.isArray(a.key_facts) ? a.key_facts : [],
            main_topic: a.main_topic || 'National Affairs',
            sub_topic: a.sub_topic || '',
            keywords: Array.isArray(a.keywords) ? a.keywords : ['Current Affairs'],
            publication_date: extracted.document_date || extracted.publication_date || documentDate,
            source_name: file.name,
            source_file: file.name,
            created_at: new Date().toISOString(),
            bookmarked: false,
            studied: false,
          })
        );

        const importRecord: ImportRecord = {
          id: `imp-${Date.now()}-${i}`,
          file_name: file.name,
          import_date: new Date().toISOString(),
          total_detected: extractedQuestions.length + extractedArticles.length,
          questions_count: extractedQuestions.length,
          articles_count: extractedArticles.length,
          status: 'success',
          source_type: 'pdf',
          summary: extracted.summary || `Extracted ${extractedQuestions.length} questions and ${extractedArticles.length} news items.`,
        };

        onImportComplete({
          questions: extractedQuestions,
          articles: extractedArticles,
          record: importRecord,
        });

        setSuccessInfo({
          fileName: file.name,
          questionsCount: extractedQuestions.length,
          articlesCount: extractedArticles.length,
          summary: extracted.summary,
        });
      } catch (err: any) {
        console.error('PDF error:', err);
        setErrorMessage(`Error processing ${file.name}: ${err.message}`);
      }
    }

    setIsProcessing(false);
    setProcessStatus('');
    // Clear input
    e.target.value = '';
  };

  // Handle manual pasted text
  const handlePastedTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    if (!isOnline) {
      setErrorMessage('Internet connection is required for Gemini AI to analyze text.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessInfo(null);
    setProcessStatus('Gemini 3.8 Flash is analyzing text, extracting questions, and generating Tamil explanations...');

    try {
      const response = await fetch('/api/gemini/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pastedText,
          sourceName: sourceName.trim() || 'Telegram Post / Text Excerpt',
          customDate: documentDate,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to extract text with Gemini API');
      }

      const resData = await response.json();
      const extracted = resData.data;

      const extractedQuestions: Question[] = (extracted.questions || []).map(
        (q: any, idx: number) => ({
          id: `q-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          question: q.question || 'Question',
          tamil_question: q.tamil_question || '',
          options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['A. Yes', 'B. No'],
          correct_answer: q.correct_answer || 'NEEDS REVIEW',
          explanation: q.explanation || 'Detailed answer explanation',
          tamil_explanation: q.tamil_explanation || 'விளக்கம்',
          main_topic: q.main_topic || 'National Affairs',
          sub_topic: q.sub_topic || '',
          keywords: Array.isArray(q.keywords) ? q.keywords : ['Current Affairs'],
          source_file: sourceName || 'Telegram Post',
          source_page: 1,
          publication_date: documentDate,
          created_at: new Date().toISOString(),
          bookmarked: false,
          studied: false,
        })
      );

      const extractedArticles: NewsArticle[] = (extracted.articles || []).map(
        (a: any, idx: number) => ({
          id: `art-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          headline: a.headline || 'Current Affairs Headline',
          tamil_headline: a.tamil_headline || '',
          summary: a.summary || '',
          content: a.content || a.summary || '',
          tamil_explanation: a.tamil_explanation || a.summary || '',
          key_facts: Array.isArray(a.key_facts) ? a.key_facts : [],
          main_topic: a.main_topic || 'National Affairs',
          sub_topic: a.sub_topic || '',
          keywords: Array.isArray(a.keywords) ? a.keywords : ['Current Affairs'],
          publication_date: documentDate,
          source_name: sourceName || 'Telegram Excerpt',
          source_file: sourceName || 'Pasted Text',
          created_at: new Date().toISOString(),
          bookmarked: false,
          studied: false,
        })
      );

      const importRecord: ImportRecord = {
        id: `imp-${Date.now()}`,
        file_name: sourceName || 'Telegram / Text Excerpt',
        import_date: new Date().toISOString(),
        total_detected: extractedQuestions.length + extractedArticles.length,
        questions_count: extractedQuestions.length,
        articles_count: extractedArticles.length,
        status: 'success',
        source_type: 'text',
        summary: extracted.summary || `Extracted ${extractedQuestions.length} questions and ${extractedArticles.length} news items.`,
      };

      onImportComplete({
        questions: extractedQuestions,
        articles: extractedArticles,
        record: importRecord,
      });

      setSuccessInfo({
        fileName: sourceName || 'Telegram Post',
        questionsCount: extractedQuestions.length,
        articlesCount: extractedArticles.length,
        summary: extracted.summary,
      });

      setPastedText('');
    } catch (err: any) {
      setErrorMessage(`Extraction failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>{language === 'ta' ? 'PDF & குறிப்புகள் பதிவேற்றம்' : 'PDF & Question Import Center'}</span>
          <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
            Gemini AI
          </span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {language === 'ta'
            ? 'தினசரி நடப்பு நிகழ்வுகள் PDF அல்லது டெலிகிராம் பதிவுகளைப் பதிவேற்றுங்கள். AI தானாகவே வினாக்களைப் பிரித்து வகைப்படுத்தும்.'
            : 'Upload daily Telegram PDFs or paste questions. Gemini AI will automatically extract MCQs, answers, Tamil explanations, keywords, and organize into topics.'}
        </p>
      </div>

      {/* Tabs: PDF Upload vs Manual Paste */}
      <div className="flex border-b border-gray-200 mb-5">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'upload'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload PDF (Single / Multiple)</span>
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'paste'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          <span>Paste Text / Telegram Post</span>
        </button>
      </div>

      {/* Success Banner */}
      {successInfo && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-emerald-900">
                Successfully processed {successInfo.fileName}!
              </h4>
              <p className="text-xs text-emerald-700 mt-1">
                Extracted <strong>{successInfo.questionsCount} questions</strong> and{' '}
                <strong>{successInfo.articlesCount} news articles</strong>. They are now automatically
                organized into your topic categories and searchable.
              </p>
              {successInfo.summary && (
                <p className="text-[11px] text-emerald-800 mt-1 italic">&ldquo;{successInfo.summary}&rdquo;</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <strong className="block font-bold">Import Notice:</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Processing Loader Modal */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5 text-center animate-pulse">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
          <h4 className="text-xs font-bold text-blue-900">AI Intelligence in Progress</h4>
          <p className="text-xs text-blue-700 mt-1 max-w-sm mx-auto">{processStatus}</p>
        </div>
      )}

      {/* Tab 1: PDF Upload Box */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <label className="block border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer bg-white transition hover:bg-blue-50/20">
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              Select or Drop Daily Current Affairs PDFs
            </h3>
            <p className="text-xs text-gray-500 mb-3 max-w-md mx-auto">
              Supports single or multiple PDF files (Telegram daily digests, monthly compilation, exam question banks).
            </p>
            <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs">
              Browse PDF Files
            </span>
          </label>

          {/* Quick Notice */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Duplicate Prevention:</strong> If you upload a PDF containing questions that were already
              imported, duplicate questions will be automatically detected and merged without clutter.
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Manual Text / Telegram Paste */}
      {activeTab === 'paste' && (
        <form onSubmit={handlePastedTextSubmit} className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Source Title / Telegram Channel Name:
            </label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g. TNPSC Telegram Daily CA Oct 31, Shankar IAS Daily, etc."
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Publication Date:</label>
            <input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Paste Questions / Notes Text:
            </label>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={8}
              placeholder={`Paste your daily Current Affairs questions here in English or Tamil. Example:
1. Who has been appointed as the new Chief Justice of India?
A. Justice Sanjiv Khanna  B. Justice D.Y. Chandrachud
Answer: A
Explanation: Justice Sanjiv Khanna took oath as the 51st CJI...`}
              className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing || !pastedText.trim()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Process & Organize with Gemini AI</span>
          </button>
        </form>
      )}

      {/* Import History Table */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-gray-500" />
          <span>Import History & Status</span>
        </h3>

        {importHistory.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
            No imports yet. Upload a PDF above to see your history!
          </div>
        ) : (
          <div className="space-y-2">
            {importHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-semibold text-gray-900 truncate">{item.file_name}</h5>
                    <p className="text-[10px] text-gray-400">
                      {new Date(item.import_date).toLocaleDateString()} &middot;{' '}
                      {item.questions_count} Questions, {item.articles_count} Articles
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Success
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
