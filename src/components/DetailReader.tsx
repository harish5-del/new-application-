import React, { useState } from 'react';
import {
  X,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Send,
  MessageCircle,
  FileText
} from 'lucide-react';
import { NewsArticle, Question, LanguageMode } from '../types';

interface DetailReaderProps {
  item:
    | { type: 'article'; data: NewsArticle }
    | { type: 'question'; data: Question }
    | null;
  onClose: () => void;
  language: LanguageMode;
  onToggleBookmarkArticle?: (article: NewsArticle) => void;
  onToggleBookmarkQuestion?: (question: Question) => void;
  onToggleStudiedQuestion?: (question: Question) => void;
  onToggleStudiedArticle?: (article: NewsArticle) => void;
  onSaveNotes?: (id: string, notes: string) => void;
  onSelectKeyword?: (keyword: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const DetailReader: React.FC<DetailReaderProps> = ({
  item,
  onClose,
  language,
  onToggleBookmarkArticle,
  onToggleBookmarkQuestion,
  onToggleStudiedQuestion,
  onToggleStudiedArticle,
  onSaveNotes,
  onSelectKeyword,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [notes, setNotes] = useState(item?.data.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  if (!item) return null;

  const isArticle = item.type === 'article';
  const article = isArticle ? (item.data as NewsArticle) : null;
  const question = !isArticle ? (item.data as Question) : null;

  const title = isArticle
    ? language === 'ta' && article?.tamil_headline
      ? article.tamil_headline
      : article?.headline
    : language === 'ta' && question?.tamil_question
    ? question.tamil_question
    : question?.question;

  const secondaryTitle = isArticle
    ? language === 'ta'
      ? article?.headline
      : article?.tamil_headline
    : language === 'ta'
    ? question?.question
    : question?.tamil_question;

  const topic = isArticle ? article?.main_topic : question?.main_topic;
  const date = isArticle ? article?.publication_date : question?.publication_date;
  const isBookmarked = isArticle ? article?.bookmarked : question?.bookmarked;
  const isStudied = isArticle ? article?.studied : question?.studied;
  const keywords = isArticle ? article?.keywords || [] : question?.keywords || [];

  const handleShare = async (platform?: 'whatsapp' | 'telegram') => {
    const shareText = `${title}\n\nRead more on Smart Current Affairs Organizer: ${window.location.href}`;
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title || '')}`, '_blank');
    } else {
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'Current Affairs',
            text: shareText,
            url: window.location.href,
          });
        } catch {
          // User cancelled
        }
      } else {
        navigator.clipboard.writeText(shareText);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    if (onSaveNotes) {
      onSaveNotes(item.data.id, notes);
    }
    setTimeout(() => setIsSavingNotes(false), 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-2xl min-h-screen sm:min-h-0 sm:rounded-2xl shadow-2xl flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'ta' ? 'பின்செல்க' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Studied Toggle */}
            <button
              onClick={() => {
                if (isArticle && onToggleStudiedArticle && article) {
                  onToggleStudiedArticle(article);
                } else if (!isArticle && onToggleStudiedQuestion && question) {
                  onToggleStudiedQuestion(question);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                isStudied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isStudied ? (language === 'ta' ? 'படித்தாயிற்று' : 'Studied') : (language === 'ta' ? 'படிக்க' : 'Mark Studied')}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={() => {
                if (isArticle && onToggleBookmarkArticle && article) {
                  onToggleBookmarkArticle(article);
                } else if (!isArticle && onToggleBookmarkQuestion && question) {
                  onToggleBookmarkQuestion(question);
                }
              }}
              className={`p-1.5 rounded-lg border transition ${
                isBookmarked
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'text-gray-500 hover:text-gray-900 border-gray-200 hover:bg-gray-50'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 fill-blue-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Body matching Screenshot 3 */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Breadcrumbs matching Screenshot 3 */}
          <div className="text-[11px] text-gray-500 mb-2.5 flex items-center gap-1 truncate font-medium">
            <span>{language === 'ta' ? 'முகப்பு' : 'Home'}</span>
            <span>&gt;</span>
            <span>{language === 'ta' ? 'நடப்பு நிகழ்வுகள்' : 'Current Affairs'}</span>
            <span>&gt;</span>
            <span className="truncate text-gray-700 font-semibold">{topic}</span>
          </div>

          {/* Badges: Topic, Date, Reading time */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
              {topic}
            </span>
            <span className="text-xs text-gray-500 font-medium">{date}</span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? '1 நிமிட வாசிப்பு' : '1 min read'}</span>
            </div>
            {question?.source_file && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm font-mono truncate max-w-[200px]">
                {question.source_file} {question.source_page ? `(p.${question.source_page})` : ''}
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug mb-2 font-serif">
            {title}
          </h1>

          {/* Secondary Title in alternate language */}
          {secondaryTitle && (
            <h2 className="text-sm font-medium text-gray-600 mb-4 pb-3 border-b border-gray-100 leading-normal italic">
              {secondaryTitle}
            </h2>
          )}

          {/* Action pill buttons: சேமி (Bookmark) | பகிர் (Share) */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                if (isArticle && onToggleBookmarkArticle && article) onToggleBookmarkArticle(article);
                else if (!isArticle && onToggleBookmarkQuestion && question) onToggleBookmarkQuestion(question);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'சேமி' : 'Bookmark'}</span>
            </button>
            <button
              onClick={() => handleShare()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'பகிர்' : 'Share'}</span>
            </button>
          </div>

          {/* Swipe Hint Banner matching Screenshot 3 */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-center text-xs text-gray-600 font-medium mb-5 flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>
              {language === 'ta'
                ? 'மேலும் வினாக்கள் / செய்திகளைப் படிக்க கீழே உள்ள அம்புக்குறிகளைப் பயன்படுத்தவும்'
                : 'Use previous and next arrows below to navigate through library items'}
            </span>
          </div>

          {/* QUESTION VIEW: Interactive MCQ practice mode */}
          {!isArticle && question && (
            <div className="mb-6 bg-blue-50/40 rounded-2xl p-4 border border-blue-100">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-800 mb-3 flex items-center gap-1.5">
                <span>Interactive Practice Mode</span>
              </h3>

              <div className="space-y-2 mb-4">
                {question.options.map((opt, idx) => {
                  const optLetter = opt.charAt(0);
                  const isUserPick = selectedOption === opt;
                  const isCorrectAnswer =
                    showAnswer &&
                    (question.correct_answer.toLowerCase().includes(optLetter.toLowerCase()) ||
                      question.correct_answer.toLowerCase().includes(opt.slice(3).trim().toLowerCase()));
                  const isWrongAnswer = showAnswer && isUserPick && !isCorrectAnswer;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedOption(opt);
                        setShowAnswer(true);
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition flex items-center justify-between gap-3 ${
                        isCorrectAnswer
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                          : isWrongAnswer
                          ? 'bg-rose-50 border-rose-500 text-rose-900'
                          : isUserPick
                          ? 'bg-blue-50 border-blue-500 text-blue-900'
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <span>{opt}</span>
                      {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                      {isWrongAnswer && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Reveal Answer Button */}
              {!showAnswer && (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                >
                  {language === 'ta' ? 'விடையைக் காட்டு (Show Answer)' : 'Show Answer & Explanation'}
                </button>
              )}

              {/* Correct Answer Banner */}
              {showAnswer && (
                <div className="p-3 bg-emerald-100/80 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-bold mb-3 flex items-center justify-between">
                  <span>Correct Answer: {question.correct_answer}</span>
                  <span className="text-[11px] font-normal text-emerald-800">Verified by AI</span>
                </div>
              )}
            </div>
          )}

          {/* DETAILED EXPLANATION / CONTENT SECTION */}
          <div className="space-y-4 text-xs sm:text-sm text-gray-800 leading-relaxed font-sans">
            {/* Tamil Explanation (முழுமையான தமிழ் விளக்கம்) */}
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5 font-serif">
                <span>முழுமையான தமிழ் விளக்கம் (Tamil Detailed Explanation):</span>
              </h4>
              <p className="leading-relaxed font-serif text-gray-800 whitespace-pre-line text-xs sm:text-sm">
                {isArticle ? article?.tamil_explanation : question?.tamil_explanation}
              </p>
            </div>

            {/* English Explanation */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Original Content & Detailed Explanation:</span>
              </h4>
              <p className="leading-relaxed text-gray-700 whitespace-pre-line text-xs sm:text-sm">
                {isArticle ? article?.content || article?.summary : question?.explanation}
              </p>
            </div>

            {/* Key Facts list if article */}
            {isArticle && article?.key_facts && article.key_facts.length > 0 && (
              <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl">
                <h4 className="text-xs font-bold text-sky-900 mb-2">Key Exam Facts (முக்கிய குறிப்புகள்):</h4>
                <ul className="space-y-1.5 text-xs text-sky-950 list-disc list-inside">
                  {article.key_facts.map((fact, idx) => (
                    <li key={idx}>{fact}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* தலைப்புகள் / Tags matching Screenshot 3 */}
          {keywords.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-150">
              <h4 className="text-xs font-bold text-gray-700 mb-2 font-serif">
                {language === 'ta' ? 'தலைப்புகள் (Tags / Keywords):' : 'Keywords & Tags:'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((kw, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (onSelectKeyword) onSelectKeyword(kw);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 text-xs font-semibold rounded-lg border border-gray-200 transition"
                  >
                    #{kw.replace(/^#/, '')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Social Share Shortcuts matching Screenshot 3 */}
          <div className="mt-5 pt-4 border-t border-gray-150">
            <h4 className="text-xs font-bold text-gray-700 mb-2.5 font-serif">
              {language === 'ta' ? 'பகிர் (Share):' : 'Share with study group:'}
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </button>
              <button
                onClick={() => handleShare()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : (language === 'ta' ? 'இணைப்பை நகலெடு' : 'Copy Link')}</span>
              </button>
            </div>
          </div>

          {/* Personal Notes Section */}
          <div className="mt-6 pt-4 border-t border-gray-150">
            <h4 className="text-xs font-bold text-gray-700 mb-1.5">
              {language === 'ta' ? 'எனது தனிப்பட்ட குறிப்பு (Personal Study Notes):' : 'Personal Study Notes:'}
            </h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'ta' ? 'இந்த வினா தொடர்பான உங்கள் குறிப்புகளை இங்கே எழுதி சேமிக்கவும்...' : 'Write your revision notes, mnemonic tricks, or hints here...'}
              rows={2}
              className="w-full p-2.5 bg-gray-50 text-xs border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <div className="flex justify-end mt-1.5">
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-gray-800 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-2xs transition"
              >
                {isSavingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar: Prev / Next */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-3 px-4 flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              hasPrev
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'ta' ? 'முந்தையது' : 'Previous'}</span>
          </button>

          <span className="text-[11px] font-medium text-gray-400">
            {isArticle ? 'News Story' : 'Question Bank'}
          </span>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              hasNext
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <span>{language === 'ta' ? 'அடுத்தது' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
