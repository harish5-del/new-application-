export interface Question {
  id: string;
  question: string;
  tamil_question?: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  tamil_explanation: string;
  main_topic: string;
  sub_topic?: string;
  keywords: string[];
  source_file?: string;
  source_page?: string | number;
  publication_date: string;
  created_at: string;
  bookmarked?: boolean;
  studied?: boolean;
  notes?: string;
  needs_review?: boolean;
}

export interface NewsArticle {
  id: string;
  headline: string;
  tamil_headline?: string;
  summary: string;
  content: string;
  tamil_explanation: string;
  key_facts: string[];
  main_topic: string;
  sub_topic?: string;
  keywords: string[];
  publication_date: string;
  source_name?: string;
  source_url?: string;
  source_file?: string;
  created_at: string;
  bookmarked?: boolean;
  studied?: boolean;
  notes?: string;
}

export interface ImportRecord {
  id: string;
  file_name: string;
  import_date: string;
  total_detected: number;
  questions_count: number;
  articles_count: number;
  status: 'success' | 'failed' | 'partial';
  source_type: 'pdf' | 'text' | 'url';
  summary?: string;
}

export interface TopicCategory {
  id: string;
  name: string;
  tamil_name: string;
  color: string;
  accentClass: string;
  icon: string;
  description?: string;
}

export type LanguageMode = 'en' | 'ta';

export type ActiveTab =
  | 'home'
  | 'topics'
  | 'import_pdf'
  | 'import_url'
  | 'questions'
  | 'news'
  | 'keywords'
  | 'bookmarks'
  | 'progress'
  | 'settings';
