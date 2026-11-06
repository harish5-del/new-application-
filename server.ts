import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware for large PDF base64 payloads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// System prompt for current affairs extraction
const EXTRACTION_SYSTEM_PROMPT = `
You are an expert bilingual Current Affairs analyst and exam preparation specialist (TNPSC, UPSC, SSC, Banking, State PCS in Tamil Nadu and India).
Your task is to analyze documents, questions, and news articles in English and Tamil.
Extract EVERY single question and important Current Affairs article present.
Do not skip or drop any question or piece of news!
Never invent false facts. If an answer or date is unclear, mark correct_answer as "NEEDS REVIEW".

CRITICAL BILINGUAL REQUIREMENT:
- For every question and news article, provide rich, accurate Tamil translations and explanations (முழுமையான தமிழ் விளக்கம்) alongside the English version.
- Preserve the original question text, options A/B/C/D, and explanation.

TOPIC CATEGORIZATION:
Classify every item strictly into one of these standard categories:
1. Appointments (நியமனங்கள்)
2. Awards and Honours (முக்கிய விருதுகள்)
3. Important Days (முக்கிய தினங்கள் & Themes)
4. Sports (விளையாட்டு)
5. National Affairs (தேசிய நிகழ்வுகள்)
6. International Affairs (சர்வதேச நிகழ்வுகள்)
7. Government Schemes (மத்திய & மாநில அரசு திட்டங்கள்)
8. Economy (பொருளாதாரம் & பட்ஜெட்)
9. Science and Technology (அறிவியல் & விண்வெளி)
10. Defence (பாதுகாப்பு & ராணுவம்)
11. Environment (சுற்றுச்சூழல்)
12. Geography (புவியியல் & புவிசார் குறியீடுகள்)
13. Reports and Indexes (அறிக்கைகள் & குறியீடுகள்)
14. Books and Authors (நூல்கள் & ஆசிரியர்கள்)
15. Tamil Nadu Affairs (தமிழ்நாடு நடப்பு நிகழ்வுகள்)
16. Static GK (முக்கிய பொது அறிவு)
17. Others (பிற நிகழ்வுகள்)
`;

// Extract from PDF (accepts base64 data)
app.post('/api/gemini/extract-pdf', async (req: Request, res: Response) => {
  try {
    const { fileData, fileName, mimeType = 'application/pdf', customNotes } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please add it in Settings > Secrets.',
      });
    }

    const promptText = `
Analyze this PDF document (${fileName || 'document.pdf'}).
${customNotes ? `Additional context: ${customNotes}` : ''}
Extract:
1. Every Multiple Choice Question (MCQ) or Current Affairs Q&A.
2. Every standalone Current Affairs news article or headline summary.

Return a valid JSON object matching this structure:
{
  "summary": "Brief 1-2 sentence overview of this PDF",
  "document_date": "Date mentioned in PDF in YYYY-MM-DD or readable string",
  "total_questions_detected": number,
  "total_articles_detected": number,
  "questions": [
    {
      "question": "Question text in English or original language",
      "tamil_question": "கேள்வி தமிழ் வடிவம் (Question in Tamil)",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": "Exact option e.g. 'A. Option text' or 'NEEDS REVIEW'",
      "explanation": "Detailed explanation of the answer in English",
      "tamil_explanation": "முழுமையான தமிழ் விளக்கம் (Comprehensive explanation in Tamil)",
      "main_topic": "One of standard categories",
      "sub_topic": "Specific domain, e.g., ISRO, Banking, Tennis, Nobel, etc.",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "source_file": "${fileName || 'Uploaded PDF'}",
      "source_page": "1",
      "publication_date": "YYYY-MM-DD"
    }
  ],
  "articles": [
    {
      "headline": "English or primary headline",
      "tamil_headline": "தமிழ் தலைப்பு",
      "summary": "Concise summary",
      "content": "Full detailed article facts and body",
      "tamil_explanation": "முழுமையான தமிழ் விளக்கம்",
      "key_facts": ["Fact 1", "Fact 2"],
      "main_topic": "One of standard categories",
      "sub_topic": "Specific sub-topic",
      "keywords": ["keyword1", "keyword2"],
      "publication_date": "YYYY-MM-DD",
      "source_file": "${fileName || 'Uploaded PDF'}"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: fileData,
          },
        },
        {
          text: promptText,
        },
      ],
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(outputText);
    } catch {
      // Clean possible markdown code fence
      const cleaned = outputText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error extracting PDF:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process PDF with Gemini AI',
    });
  }
});

// Extract from raw pasted text (e.g. from Telegram channel or exam notes)
app.post('/api/gemini/extract-text', async (req: Request, res: Response) => {
  try {
    const { text, sourceName = 'Pasted Content', customDate } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const promptText = `
Here is the raw Current Affairs text (from Telegram channel, notes, or web excerpt):
---
${text.slice(0, 45000)}
---
Source name: ${sourceName}
Reference date: ${customDate || new Date().toISOString().split('T')[0]}

Extract:
1. Every Question (with options A-D, correct answer, explanation, Tamil explanation, keywords, topic).
2. Every standalone news item/fact (with headline, summary, Tamil explanation, keywords, topic).

Return a valid JSON object matching the standard format:
{
  "summary": "Brief summary",
  "document_date": "YYYY-MM-DD",
  "total_questions_detected": number,
  "total_articles_detected": number,
  "questions": [
    {
      "question": "Question text",
      "tamil_question": "கேள்வி தமிழ் வடிவம்",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": "Option letter and text or 'NEEDS REVIEW'",
      "explanation": "Detailed explanation",
      "tamil_explanation": "முழுமையான தமிழ் விளக்கம்",
      "main_topic": "One of standard categories",
      "sub_topic": "Sub topic",
      "keywords": ["tag1", "tag2"],
      "source_file": "${sourceName}",
      "source_page": "1",
      "publication_date": "${customDate || new Date().toISOString().split('T')[0]}"
    }
  ],
  "articles": [
    {
      "headline": "Headline",
      "tamil_headline": "தமிழ் தலைப்பு",
      "summary": "Summary",
      "content": "Detailed content",
      "tamil_explanation": "முழுமையான தமிழ் விளக்கம்",
      "key_facts": ["Fact 1", "Fact 2"],
      "main_topic": "One of standard categories",
      "sub_topic": "Sub topic",
      "keywords": ["tag1", "tag2"],
      "publication_date": "${customDate || new Date().toISOString().split('T')[0]}",
      "source_file": "${sourceName}"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(outputText);
    } catch {
      const cleaned = outputText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error extracting text:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process text with Gemini AI',
    });
  }
});

// Import news from public website URL
app.post('/api/gemini/extract-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    // Attempt to fetch public URL content
    let htmlContent = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,ta;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(422).json({
          error: `Website returned status ${response.status}. Some websites protect articles behind Cloudflare or Paywalls. Please copy and paste the article text into the Manual Paste tab.`,
        });
      }

      htmlContent = await response.text();
    } catch (fetchErr: any) {
      return res.status(422).json({
        error: `Could not reach ${url}: ${fetchErr.message}. You can copy and paste the article text directly.`,
      });
    }

    // Strip scripts, styles, and tags for clean text
    const cleanText = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 30000);

    if (cleanText.length < 50) {
      return res.status(422).json({
        error: 'Unable to extract readable text from the provided webpage. Please copy and paste the article text manually.',
      });
    }

    const promptText = `
Extract Current Affairs information from this web article:
Source URL: ${url}
Extracted Content:
---
${cleanText}
---

Return a valid JSON object matching:
{
  "summary": "Brief summary",
  "document_date": "Date detected or current date",
  "articles": [
    {
      "headline": "Headline in English",
      "tamil_headline": "தமிழ் தலைப்பு (Headline in Tamil)",
      "summary": "2-3 sentence overview",
      "content": "Key article body and facts",
      "tamil_explanation": "முழுமையான தமிழ் விளக்கம் (Comprehensive explanation in Tamil)",
      "key_facts": ["Fact 1", "Fact 2", "Fact 3"],
      "main_topic": "One of standard categories (Appointments, Awards, Sports, National Affairs, International Affairs, etc.)",
      "sub_topic": "Specific topic",
      "keywords": ["tag1", "tag2"],
      "publication_date": "YYYY-MM-DD",
      "source_url": "${url}"
    }
  ],
  "questions": []
}
`;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });

    const outputText = aiRes.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(outputText);
    } catch {
      const cleaned = outputText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error extracting from URL:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to extract news article from URL',
    });
  }
});

// Translate / generate Tamil explanation
app.post('/api/gemini/translate-tamil', async (req: Request, res: Response) => {
  try {
    const { text, context } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = `
Translate and explain the following Current Affairs content into clear, academic, easy-to-understand Tamil (பயனுள்ள தேர்வு நோக்கு தமிழ் விளக்கம்):
---
${text}
---
${context ? `Context: ${context}` : ''}

Provide:
1. தமிழ் தலைப்பு / சுருக்கம் (Title/Summary in Tamil)
2. முழுமையான விளக்கம் (Detailed explanation with relevant exam points, names, dates, significance)
`;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ success: true, tamil_explanation: aiRes.text });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Vite & Static file serving setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Current Affairs Organizer server running on port ${PORT}`);
  });
}

startServer();
