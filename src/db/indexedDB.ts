import { Question, NewsArticle, ImportRecord } from '../types';

const DB_NAME = 'SmartCurrentAffairsDB';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported on this platform'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Questions Store
      if (!db.objectStoreNames.contains('questions')) {
        const qStore = db.createObjectStore('questions', { keyPath: 'id' });
        qStore.createIndex('main_topic', 'main_topic', { unique: false });
        qStore.createIndex('publication_date', 'publication_date', { unique: false });
        qStore.createIndex('bookmarked', 'bookmarked', { unique: false });
        qStore.createIndex('studied', 'studied', { unique: false });
      }

      // News Articles Store
      if (!db.objectStoreNames.contains('articles')) {
        const aStore = db.createObjectStore('articles', { keyPath: 'id' });
        aStore.createIndex('main_topic', 'main_topic', { unique: false });
        aStore.createIndex('publication_date', 'publication_date', { unique: false });
        aStore.createIndex('bookmarked', 'bookmarked', { unique: false });
        aStore.createIndex('studied', 'studied', { unique: false });
      }

      // Import History Store
      if (!db.objectStoreNames.contains('import_history')) {
        const hStore = db.createObjectStore('import_history', { keyPath: 'id' });
        hStore.createIndex('import_date', 'import_date', { unique: false });
      }

      // Settings & App Meta Store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Simple text normalizer for duplicate prevention
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0B80-\u0BFF]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ==================== Questions CRUD ====================

export async function getAllQuestions(): Promise<Question[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readonly');
    const store = tx.objectStore('questions');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveQuestion(question: Question): Promise<boolean> {
  const db = await openDB();
  const existing = await getAllQuestions();

  // Duplicate detection by question content
  const normNew = normalizeText(question.question);
  const isDuplicate = existing.some(
    (q) => q.id !== question.id && normalizeText(q.question) === normNew
  );

  if (isDuplicate) {
    return false; // Skip duplicate
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readwrite');
    const store = tx.objectStore('questions');
    const req = store.put(question);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMultipleQuestions(questions: Question[]): Promise<{ added: number; duplicates: number }> {
  const db = await openDB();
  const existing = await getAllQuestions();
  const existingMap = new Set(existing.map((q) => normalizeText(q.question)));

  let added = 0;
  let duplicates = 0;

  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readwrite');
    const store = tx.objectStore('questions');

    for (const q of questions) {
      const norm = normalizeText(q.question);
      if (existingMap.has(norm)) {
        duplicates++;
      } else {
        existingMap.add(norm);
        store.put(q);
        added++;
      }
    }

    tx.oncomplete = () => resolve({ added, duplicates });
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateQuestion(question: Question): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readwrite');
    const store = tx.objectStore('questions');
    const req = store.put(question);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteQuestion(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readwrite');
    const store = tx.objectStore('questions');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ==================== Articles CRUD ====================

export async function getAllArticles(): Promise<NewsArticle[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('articles', 'readonly');
    const store = tx.objectStore('articles');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMultipleArticles(articles: NewsArticle[]): Promise<{ added: number; duplicates: number }> {
  const db = await openDB();
  const existing = await getAllArticles();
  const existingMap = new Set(existing.map((a) => normalizeText(a.headline)));

  let added = 0;
  let duplicates = 0;

  return new Promise((resolve, reject) => {
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');

    for (const art of articles) {
      const norm = normalizeText(art.headline);
      if (existingMap.has(norm)) {
        duplicates++;
      } else {
        existingMap.add(norm);
        store.put(art);
        added++;
      }
    }

    tx.oncomplete = () => resolve({ added, duplicates });
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateArticle(article: NewsArticle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    const req = store.put(article);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteArticle(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ==================== Import History CRUD ====================

export async function getImportHistory(): Promise<ImportRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('import_history', 'readonly');
    const store = tx.objectStore('import_history');
    const req = store.getAll();
    req.onsuccess = () => {
      const results: ImportRecord[] = req.result || [];
      results.sort((a, b) => new Date(b.import_date).getTime() - new Date(a.import_date).getTime());
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function addImportRecord(record: ImportRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('import_history', 'readwrite');
    const store = tx.objectStore('import_history');
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ==================== Export & Backup ====================

export async function exportAllData(): Promise<string> {
  const [questions, articles, history] = await Promise.all([
    getAllQuestions(),
    getAllArticles(),
    getImportHistory(),
  ]);

  const backupObject = {
    app: 'SmartCurrentAffairsOrganizer',
    exported_at: new Date().toISOString(),
    version: '1.0.0',
    total_questions: questions.length,
    total_articles: articles.length,
    questions,
    articles,
    import_history: history,
  };

  return JSON.stringify(backupObject, null, 2);
}

export async function importAllData(jsonStr: string): Promise<{ questionsAdded: number; articlesAdded: number }> {
  const parsed = JSON.parse(jsonStr);
  if (!parsed.questions && !parsed.articles) {
    throw new Error('Invalid backup file format');
  }

  const qResult = parsed.questions ? await saveMultipleQuestions(parsed.questions) : { added: 0, duplicates: 0 };
  const aResult = parsed.articles ? await saveMultipleArticles(parsed.articles) : { added: 0, duplicates: 0 };

  return {
    questionsAdded: qResult.added,
    articlesAdded: aResult.added,
  };
}

export async function clearAllData(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['questions', 'articles', 'import_history'], 'readwrite');
    tx.objectStore('questions').clear();
    tx.objectStore('articles').clear();
    tx.objectStore('import_history').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Seed high-quality initial data based on the user's reference screenshots
export async function seedInitialDataIfEmpty(): Promise<void> {
  const existingArticles = await getAllArticles();
  const existingQuestions = await getAllQuestions();

  if (existingArticles.length > 0 || existingQuestions.length > 0) {
    return;
  }

  const sampleArticles: NewsArticle[] = [
    {
      id: 'art-un-disarm-2026',
      headline: 'UN Disarmament Week 2026 observed from October 24–30 with theme "Disarm for Peace"',
      tamil_headline: '"Disarm for Peace" கருப்பொருளுடன் அக்டோபர் 24–30 ஐ.நா. ஆயுதக் குறைப்பு வாரம் 2026',
      summary: 'United Nations observed Disarmament Week worldwide from October 24 to 30, 2026, advocating for the elimination of nuclear weapons and reduction of conventional arms.',
      content: 'ஆயுதக் குறைப்பு மற்றும் ஆயுதக் கட்டுப்பாடு குறித்த விழிப்புணர்வை ஏற்படுத்த, ஐக்கிய நாடுகள் சபை 2026 அக்டோபர் 24 முதல் 30 வரை ஆயுதக் குறைப்பு வாரத்தைக் கடைப்பிடித்தது. இவ்வாண்டின் கருப்பொருள்: "Disarm for Peace: Fewer Weapons, Safer Communities" (அமைதிக்காக ஆயுதக் குறைப்பு: குறைவான ஆயுதங்கள், பாதுகாப்பான சமூகங்கள்).',
      tamil_explanation: 'ஐக்கிய நாடுகள் சபையின் பொதுச்சபை 1978 ஆம் ஆண்டு ஆயுதக் குறைப்புக்கான சிறப்பு அமர்வில் இந்த வாரத்தை அறிவித்தது. ஐ.நா. தினம் அக்டோபர் 24 அன்று இது தொடங்குகிறது. அணு ஆயுதப் பரவல் தடை மற்றும் சர்வதேச அமைதியை மேம்படுத்துவதே இதன் பிரதான குறிக்கோள்.',
      key_facts: [
        'Observed annually from October 24 (UN Day) to October 30',
        'Theme: Disarm for Peace: Fewer Weapons, Safer Communities',
        'Originated from the 1978 UN General Assembly Special Session on Disarmament'
      ],
      main_topic: 'International Affairs',
      sub_topic: 'United Nations',
      keywords: ['UN', 'Disarmament', 'October 24', 'Peace', 'சர்வதேசம்', 'நடப்பு நிகழ்வுகள்', 'டிஎன்பிஎஸ்சி'],
      publication_date: '2026-10-31',
      source_name: 'tamiltest.in / UN News',
      created_at: new Date().toISOString(),
      bookmarked: false,
      studied: true,
    },
    {
      id: 'art-day-care-support-2026',
      headline: 'International Day of Care and Support observed on October 29 with 2026 theme on decent work',
      tamil_headline: 'கண்ணியமான வேலை குறித்த 2026 கருப்பொருளுடன் அக்டோபர் 29 சர்வதேச கவனிப்பு மற்றும் ஆதரவு தினம்',
      summary: 'The United Nations marks the International Day of Care and Support each year on October 29 to acknowledge paid and unpaid care work and push for social protection.',
      content: 'ஊதியம் பெறும் மற்றும் பெறாத கவனிப்புப் பணிகளை அங்கீகரிக்கவும், பராமரிப்பாளர்களுக்கான சமூகப் பாதுகாப்பை வலுப்படுத்தவும் அக்டோபர் 29 அன்று சர்வதேச கவனிப்பு மற்றும் ஆதரவு தினம் உலகம் முழுவதும் கடைப்பிடிக்கப்பட்டது.',
      tamil_explanation: 'பெண்களின் ஊதியமற்ற வீட்டுப் பணிகள் மற்றும் பராமரிப்புப் பணிகளுக்கு உரிய அங்கீகாரம் வழங்குவதையும், கண்ணியமான பணிச் சூழலை உருவாக்குவதையும் ஐ.நா. வலியுறுத்துகிறது.',
      key_facts: [
        'Observed on October 29 annually',
        'Focuses on paid and unpaid domestic care work',
        'Promotes gender equality and social security'
      ],
      main_topic: 'Important Days',
      sub_topic: 'UN Observances',
      keywords: ['Care and Support Day', 'October 29', 'Social Protection', 'முக்கிய தினங்கள்'],
      publication_date: '2026-10-31',
      source_name: 'tamiltest.in',
      created_at: new Date().toISOString(),
      bookmarked: true,
      studied: false,
    },
    {
      id: 'art-esanjeevani-50crore',
      headline: 'e-Sanjeevani national telemedicine service crosses nearly 50 crore teleconsultations',
      tamil_headline: 'இ-சஞ்சீவனி தேசிய தொலைமருத்துவ சேவை 50 கோடி மருத்துவ ஆலோசனைகளைக் கடந்து சாதனை',
      summary: "e-Sanjeevani, India's National Telemedicine Service, has enabled close to 50 crore teleconsultations nationwide, transforming healthcare access in rural areas.",
      content: 'மத்திய சுகாதாரம் மற்றும் குடும்ப நல அமைச்சகத்தால் தொடங்கப்பட்ட இ-சஞ்சீவனி (e-Sanjeevani) தேசிய தொலைமருத்துவத் தளம் நாடு முழுவதும் 50 கோடிக்கும் அதிகமான ஆலோசனைகளை வழங்கி புதிய மைல்கல்லை எட்டியுள்ளது.',
      tamil_explanation: 'சி-டாக் (C-DAC) மொஹாலி நிறுவனத்தால் உருவாக்கப்பட்ட இ-சஞ்சீவனி தளம், கிராமப்புற நோயாளிகளுக்கு அதிநவீன சிறப்பு மருத்துவர்களின் ஆலோசனைகளை இலவசமாக பெற வழிவகுக்கிறது.',
      key_facts: [
        'Milestone: Over 50 Crore teleconsultations',
        'Implemented by Ministry of Health and Family Welfare',
        'Developed by C-DAC Mohali',
        'Two models: eSanjeevani AB-HWC (Doctor-to-Doctor) and eSanjeevani OPD (Patient-to-Doctor)'
      ],
      main_topic: 'National Affairs',
      sub_topic: 'Digital Health',
      keywords: ['e-Sanjeevani', 'Telemedicine', 'C-DAC', 'Health Ministry', 'தேசிய நிகழ்வுகள்'],
      publication_date: '2026-10-30',
      source_name: 'PIB New Delhi',
      created_at: new Date().toISOString(),
      bookmarked: false,
      studied: true,
    },
    {
      id: 'art-bihar-museum-top10',
      headline: 'Bihar Museum, Patna ranked 9th globally and 1st in Asia in The World\'s 100 Best Museums 2026',
      tamil_headline: '\'உலகின் 100 சிறந்த அருங்காட்சியகங்கள் 2026\' பட்டியலில் பாட்னா பீகார் அருங்காட்சியகம் ஆசியாவில் முதலிடம்',
      summary: 'Bihar Museum in Patna has achieved a historic ranking of 9th in the world and 1st across Asia in the prestigious World\'s 100 Best Museums 2026 list.',
      content: 'சர்வதேச கலாச்சார மதிப்பீட்டு அமைப்பால் வெளியிடப்பட்ட உலகின் சிறந்த 100 அருங்காட்சியகங்கள் பட்டியலில் பீகாரின் பாட்னாவில் உள்ள பீகார் அருங்காட்சியகம் உலகளவில் 9-வது இடத்தையும், ஆசிய அளவில் முதலிடத்தையும் பெற்று சாதனை படைத்துள்ளது.',
      tamil_explanation: 'ஜப்பானின் புகழ்பெற்ற கட்டிடக் கலைஞர் ஃபுமிஹிகோ மக்கி வடிவமைத்த இந்த அருங்காட்சியகம், பண்டைய இந்திய வரலாறு மற்றும் மௌரிய, குப்த வம்ச தொல்பொருட்களைப் பாதுகாக்கும் கலைக் கருவூலமாகும்.',
      key_facts: [
        'Rank: 9th globally, 1st in Asia',
        'Architect: Fumihiko Maki (Japan)',
        'Location: Bailey Road, Patna, Bihar',
        'Highlights ancient Mauryan, Gupta, and Buddhist artifacts'
      ],
      main_topic: 'Awards and Honours',
      sub_topic: 'Heritage & Culture',
      keywords: ['Bihar Museum', 'Patna', 'Best Museums', 'Fumihiko Maki', 'விருதுகள்'],
      publication_date: '2026-10-31',
      source_name: 'Global Culture Index',
      created_at: new Date().toISOString(),
      bookmarked: false,
      studied: false,
    },
    {
      id: 'art-tn-breakfast-expansion',
      headline: 'Tamil Nadu Policy Notes: Chief Minister\'s Breakfast Scheme covers 100% aided primary schools',
      tamil_headline: 'தமிழ்நாடு கொள்கை குறிப்புகள்: முதலமைச்சரின் காலை உணவுத் திட்டம் அரசு உதவிபெறும் தொடக்கப் பள்ளிகளுக்கும் விரிவு',
      summary: 'Tamil Nadu expanded the pioneering Chief Minister\'s Breakfast Scheme across all government-aided primary schools, benefiting over 18 lakh students.',
      content: 'தமிழக அரசால் தொடங்கப்பட்ட வரலாற்று சிறப்புமிக்க முதலமைச்சரின் காலை உணவுத் திட்டம் அனைத்து அரசு உதவிபெறும் தொடக்கப் பள்ளிகளுக்கும் வெற்றிகரமாக விரிவுபடுத்தப்பட்டு கொள்கை விளக்கக் குறிப்புகளில் வெளியிடப்பட்டுள்ளது.',
      tamil_explanation: 'இத்திட்டம் 2022 செப்டம்பர் 15 அன்று பேரறிஞர் அண்ணா பிறந்தநாளில் மதுரையில் முதன்முதலில் தொடங்கப்பட்டது. மாணவர்களின் ஊட்டச்சத்து குறைபாட்டை நீக்குவதோடு பள்ளி வருகை விகிதத்தை 30% அதிகரித்துள்ளது.',
      key_facts: [
        'Pioneered by Government of Tamil Nadu',
        'First state in India to implement hot breakfast in government and aided schools',
        'Boosted attendance and eradicated classroom hunger'
      ],
      main_topic: 'Tamil Nadu Policy Notes',
      sub_topic: 'School Education & Nutrition',
      keywords: ['TN Breakfast Scheme', 'School Education', 'Madurai launch', 'கொள்கை குறிப்புகள்'],
      publication_date: '2026-10-29',
      source_name: 'Tamil Nadu Policy Notes 2026',
      created_at: new Date().toISOString(),
      bookmarked: true,
      studied: true,
    }
  ];

  const sampleQuestions: Question[] = [
    {
      id: 'q-101',
      question: 'Which week is observed annually by the United Nations as Disarmament Week?',
      tamil_question: 'ஐக்கிய நாடுகள் சபையால் ஆண்டுதோறும் ஆயுதக் குறைப்பு வாரமாக அனுசரிக்கப்படும் வாரம் எது?',
      options: [
        'A. October 1 to October 7',
        'B. October 15 to October 21',
        'C. October 24 to October 30',
        'D. November 1 to November 7'
      ],
      correct_answer: 'C. October 24 to October 30',
      explanation: 'Disarmament Week is observed every year starting on October 24, the founding anniversary of the United Nations, until October 30. It was first called for in the General Assembly\'s 1978 special session on disarmament.',
      tamil_explanation: 'ஐக்கிய நாடுகள் தினம் அனுசரிக்கப்படும் அக்டோபர் 24 முதல் அக்டோபர் 30 வரை ஆயுதக் குறைப்பு வாரமாக அனுசரிக்கப்படுகிறது. 1978 ஆம் ஆண்டு ஐ.நா. பொதுச் சபையின் சிறப்பு அமர்வில் இது முதன்முதலில் தீர்மானிக்கப்பட்டது.',
      main_topic: 'Important Days',
      sub_topic: 'United Nations',
      keywords: ['Disarmament Week', 'October 24-30', 'United Nations', 'TNPSC Group 1'],
      source_file: 'Daily_Telegram_CA_Oct31.pdf',
      source_page: 1,
      publication_date: '2026-10-31',
      created_at: new Date().toISOString(),
      bookmarked: true,
      studied: true,
      notes: 'Remember UN Day is Oct 24'
    },
    {
      id: 'q-102',
      question: 'Which Indian museum was ranked 1st in Asia in "The World\'s 100 Best Museums 2026"?',
      tamil_question: '\'உலகின் 100 சிறந்த அருங்காட்சியகங்கள் 2026\' பட்டியலில் ஆசிய அளவில் முதலிடம் பிடித்த இந்திய அருங்காட்சியகம் எது?',
      options: [
        'A. National Museum, New Delhi',
        'B. Bihar Museum, Patna',
        'C. Chhatrapati Shivaji Maharaj Vastu Sangrahalaya, Mumbai',
        'D. Indian Museum, Kolkata'
      ],
      correct_answer: 'B. Bihar Museum, Patna',
      explanation: 'Bihar Museum located in Patna, Bihar, achieved the 9th rank globally and the 1st rank in Asia in The World\'s 100 Best Museums 2026, acclaimed for its architectural brilliance and curated historical artifacts.',
      tamil_explanation: 'பீகார் தலைநகர் பாட்னாவில் உள்ள பீகார் அருங்காட்சியகம் உலகளவில் 9-வது இடத்தையும், ஆசிய கண்டத்தில் முதலிடத்தையும் பிடித்து இந்தியாவிற்கு பெருமை சேர்த்துள்ளது.',
      main_topic: 'Awards and Honours',
      sub_topic: 'Rankings and Culture',
      keywords: ['Bihar Museum', 'Patna', 'Museum Ranking', 'Culture'],
      source_file: 'Daily_Telegram_CA_Oct31.pdf',
      source_page: 2,
      publication_date: '2026-10-31',
      created_at: new Date().toISOString(),
      bookmarked: false,
      studied: false,
    },
    {
      id: 'q-103',
      question: 'The telemedicine initiative "e-Sanjeevani" was developed by which research organization?',
      tamil_question: '\'இ-சஞ்சீவனி\' தேசிய தொலைமருத்துவத் தளத்தை வடிவமைத்து உருவாக்கிய ஆராய்ச்சி நிறுவனம் எது?',
      options: [
        'A. ISRO Bengaluru',
        'B. C-DAC Mohali',
        'C. DRDO New Delhi',
        'D. NIC New Delhi'
      ],
      correct_answer: 'B. C-DAC Mohali',
      explanation: 'e-Sanjeevani was developed by the Centre for Development of Advanced Computing (C-DAC), Mohali, under the Ministry of Health and Family Welfare.',
      tamil_explanation: 'இ-சஞ்சீவனி தளத்தை மேம்பட்ட கணினிமயமாக்கல் மேம்பாட்டு மையம் (C-DAC மொஹாலி) வடிவமைத்து உருவாக்கியது.',
      main_topic: 'Science and Technology',
      sub_topic: 'Health Technology',
      keywords: ['e-Sanjeevani', 'C-DAC', 'Telemedicine', 'Health'],
      source_file: 'Daily_Telegram_CA_Oct31.pdf',
      source_page: 3,
      publication_date: '2026-10-30',
      created_at: new Date().toISOString(),
      bookmarked: true,
      studied: false,
    },
    {
      id: 'q-104',
      question: 'When was Tamil Nadu\'s Chief Minister\'s Breakfast Scheme originally launched?',
      tamil_question: 'தமிழகத்தில் முதலமைச்சரின் காலை உணவுத் திட்டம் முதன்முதலில் எப்போது எங்கு தொடங்கப்பட்டது?',
      options: [
        'A. 15 August 2021, Chennai',
        'B. 15 September 2022, Madurai',
        'C. 26 January 2023, Coimbatore',
        'D. 2 October 2022, Tiruchirappalli'
      ],
      correct_answer: 'B. 15 September 2022, Madurai',
      explanation: 'The Chief Minister\'s Breakfast Scheme was pioneered in Tamil Nadu on 15 September 2022 in Madurai on the birth anniversary of former Chief Minister C.N. Annadurai.',
      tamil_explanation: 'பேரறிஞர் அண்ணா அவர்களின் பிறந்தநாளான 2022 செப்டம்பர் 15 அன்று மதுரையில் ஆதிமூலம் மாநகராட்சி தொடக்கப் பள்ளியில் முதலமைச்சரால் இத்திட்டம் தொடங்கப்பட்டது.',
      main_topic: 'Tamil Nadu Policy Notes',
      sub_topic: 'Welfare Schemes',
      keywords: ['TN Breakfast Scheme', 'Madurai', 'Anna Birthday', 'TNPSC General Studies'],
      source_file: 'TamilNadu_Special_Policy.pdf',
      source_page: 5,
      publication_date: '2026-10-29',
      created_at: new Date().toISOString(),
      bookmarked: false,
      studied: true,
    }
  ];

  const sampleHistory: ImportRecord = {
    id: 'import-seed-1',
    file_name: 'Daily_Telegram_CA_Oct31.pdf',
    import_date: '2026-10-31T09:00:00.000Z',
    total_detected: 9,
    questions_count: 4,
    articles_count: 5,
    status: 'success',
    source_type: 'pdf',
    summary: 'Daily Current Affairs bundle containing UN Observances, National Telemedicine milestone, and Tamil Nadu policy notes.',
  };

  await saveMultipleArticles(sampleArticles);
  await saveMultipleQuestions(sampleQuestions);
  await addImportRecord(sampleHistory);
}
