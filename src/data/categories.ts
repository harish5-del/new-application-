import { TopicCategory } from '../types';

export const TOPIC_CATEGORIES: TopicCategory[] = [
  // Topics matching screenshot 4 (sccurrentaffairs.in)
  {
    id: 'tn_policy_notes',
    name: 'Tamil Nadu Policy Notes',
    tamil_name: 'கொள்கை விளக்கக் குறிப்புகள்',
    color: '#f97316',
    accentClass: 'border-l-amber-500',
    icon: '📋',
    description: 'Tamil Nadu Government Department Policy Notes and welfare summaries'
  },
  {
    id: 'tamil_arasu',
    name: 'Tamil Arasu Magazine',
    tamil_name: 'தமிழரசு இதழ் தொகுப்பு',
    color: '#0284c7',
    accentClass: 'border-l-sky-600',
    icon: '📖',
    description: 'Official monthly publication of the Government of Tamil Nadu'
  },
  {
    id: 'central_budget',
    name: 'Central Govt Budget',
    tamil_name: 'மத்திய பட்ஜெட் குறிப்புகள்',
    color: '#e11d48',
    accentClass: 'border-l-rose-600',
    icon: '🏛️',
    description: 'Union Budget key allocations, tax slabs, and capital expenditure'
  },
  {
    id: 'economic_survey',
    name: 'Economic Survey of India',
    tamil_name: 'இந்திய பொருளாதார ஆய்வறிக்கை',
    color: '#059669',
    accentClass: 'border-l-emerald-600',
    icon: '📊',
    description: 'Annual economic review by the Chief Economic Adviser'
  },
  {
    id: 'central_schemes',
    name: 'Central Govt Schemes',
    tamil_name: 'மத்திய அரசு திட்டங்கள்',
    color: '#d97706',
    accentClass: 'border-l-amber-600',
    icon: '🇮🇳',
    description: 'Flagship centrally sponsored initiatives and welfare programs'
  },
  {
    id: 'thittam_magazine',
    name: 'Thittam Magazine Gist',
    tamil_name: 'திட்டம் (Yojana) இதழ் சுருக்கம்',
    color: '#2563eb',
    accentClass: 'border-l-blue-600',
    icon: '📰',
    description: 'Tamil Yojana edition summary on national development topics'
  },
  {
    id: 'static_gk',
    name: 'Static GK for TNPSC',
    tamil_name: 'முக்கிய பொது அறிவு',
    color: '#db2777',
    accentClass: 'border-l-pink-600',
    icon: '🧠',
    description: 'Indian history, Tamil culture, geography, and general knowledge'
  },
  {
    id: 'gi_tags',
    name: 'GI Tags',
    tamil_name: 'புவிசார் குறியீடுகள்',
    color: '#0d9488',
    accentClass: 'border-l-teal-600',
    icon: '🏷️',
    description: 'Geographical Indications registered across Tamil Nadu and India'
  },
  {
    id: 'awards_honours',
    name: 'Awards and Honours',
    tamil_name: 'முக்கிய விருதுகள்',
    color: '#d97706',
    accentClass: 'border-l-amber-500',
    icon: '🏆',
    description: 'Nobel, Bharat Ratna, Padma Awards, Sahitya Akademi, Gallantry'
  },
  {
    id: 'important_days',
    name: 'Important Days',
    tamil_name: 'முக்கிய தினங்கள் & Themes',
    color: '#3b82f6',
    accentClass: 'border-l-blue-500',
    icon: '📅',
    description: 'National and International observances with annual themes'
  },
  {
    id: 'polity',
    name: 'Polity Current Affairs',
    tamil_name: 'அரசியல் & நிர்வாக நிகழ்வுகள்',
    color: '#dc2626',
    accentClass: 'border-l-red-600',
    icon: '⚖️',
    description: 'Constitutional amendments, Supreme Court rulings, Election Commission'
  },

  // Additional essential categories from prompt & exam syllabus
  {
    id: 'appointments',
    name: 'Appointments',
    tamil_name: 'முக்கிய நியமனங்கள்',
    color: '#6366f1',
    accentClass: 'border-l-indigo-600',
    icon: '👔',
    description: 'President, Governors, CJI, CEOs, Armed Forces chiefs, Ambassadors'
  },
  {
    id: 'sports',
    name: 'Sports',
    tamil_name: 'விளையாட்டு நிகழ்வுகள்',
    color: '#10b981',
    accentClass: 'border-l-emerald-500',
    icon: '⚽',
    description: 'Olympics, Cricket, Asian Games, Chess, Tennis tournaments'
  },
  {
    id: 'national',
    name: 'National Affairs',
    tamil_name: 'தேசிய நிகழ்வுகள்',
    color: '#2563eb',
    accentClass: 'border-l-blue-600',
    icon: '🇮🇳',
    description: 'National policies, inaugurations, state summits, major summits'
  },
  {
    id: 'international',
    name: 'International Affairs',
    tamil_name: 'சர்வதேச நிகழ்வுகள்',
    color: '#0284c7',
    accentClass: 'border-l-sky-600',
    icon: '🌐',
    description: 'UN sessions, bilateral pacts, G20, BRICS, global conflicts'
  },
  {
    id: 'economy',
    name: 'Economy',
    tamil_name: 'பொருளாதாரம் & வங்கி',
    color: '#059669',
    accentClass: 'border-l-emerald-600',
    icon: '📈',
    description: 'RBI repo rate, GDP projections, inflation, GST collection'
  },
  {
    id: 'science_tech',
    name: 'Science and Technology',
    tamil_name: 'அறிவியல் & விண்வெளி',
    color: '#7c3aed',
    accentClass: 'border-l-purple-600',
    icon: '🚀',
    description: 'ISRO launches, Gaganyaan, AI discoveries, supercomputing'
  },
  {
    id: 'defence',
    name: 'Defence',
    tamil_name: 'பாதுகாப்பு & ராணுவம்',
    color: '#475569',
    accentClass: 'border-l-slate-600',
    icon: '🛡️',
    description: 'Military exercises, missile tests, DRDO inductments, warships'
  },
  {
    id: 'environment',
    name: 'Environment',
    tamil_name: 'சுற்றுச்சூழல் & பருவநிலை',
    color: '#16a34a',
    accentClass: 'border-l-green-600',
    icon: '🌿',
    description: 'COP summits, Tiger reserves, Ramsar sites, wildlife conservation'
  },
  {
    id: 'reports_indexes',
    name: 'Reports and Indexes',
    tamil_name: 'அறிக்கைகள் & குறியீடுகள்',
    color: '#ea580c',
    accentClass: 'border-l-orange-600',
    icon: '📑',
    description: 'Global Hunger Index, HDI, Ease of Doing Business, NITI Aayog'
  },
  {
    id: 'books_authors',
    name: 'Books and Authors',
    tamil_name: 'நூல்கள் & ஆசிரியர்கள்',
    color: '#9333ea',
    accentClass: 'border-l-purple-700',
    icon: '📚',
    description: 'Autobiographies, historical releases, literary launches'
  },
  {
    id: 'others',
    name: 'Others',
    tamil_name: 'பிற முக்கிய நிகழ்வுகள்',
    color: '#64748b',
    accentClass: 'border-l-slate-500',
    icon: '📌',
    description: 'Miscellaneous state news, obituaries, and cultural festivals'
  }
];

// Helper to normalize topic string from AI output into a category ID/name
export function matchTopic(rawTopicName: string): TopicCategory {
  if (!rawTopicName) return TOPIC_CATEGORIES.find(c => c.id === 'others')!;
  const lower = rawTopicName.toLowerCase();

  for (const cat of TOPIC_CATEGORIES) {
    if (
      lower.includes(cat.id.replace(/_/g, ' ')) ||
      lower.includes(cat.name.toLowerCase()) ||
      cat.name.toLowerCase().includes(lower)
    ) {
      return cat;
    }
  }

  if (lower.includes('scheme') || lower.includes('yojana')) {
    return TOPIC_CATEGORIES.find(c => c.id === 'central_schemes')!;
  }
  if (lower.includes('budget') || lower.includes('tax')) {
    return TOPIC_CATEGORIES.find(c => c.id === 'central_budget')!;
  }
  if (lower.includes('appoint') || lower.includes('ceo') || lower.includes('chief')) {
    return TOPIC_CATEGORIES.find(c => c.id === 'appointments')!;
  }
  if (lower.includes('award') || lower.includes('prize') || lower.includes('honour')) {
    return TOPIC_CATEGORIES.find(c => c.id === 'awards_honours')!;
  }
  if (lower.includes('day') || lower.includes('week') || lower.includes('theme')) {
    return TOPIC_CATEGORIES.find(c => c.id === 'important_days')!;
  }
  if (lower.includes('sport') || lower.includes('cricket') || lower.includes('olympic')) {
    return TOPIC_CATEGORIES.find(c => c.id === 'sports')!;
  }
  if (lower.includes('tamil') || lower.includes('tnpsc') || lower.includes('chennai')) {
    return TOPIC_CATEGORIES.find(c => c.id === 'tn_policy_notes')!;
  }
  if (lower.includes('isro') || lower.includes('tech') || lower.includes('science')) {
    return TOPIC_CATEGORIES.find(c => c.id === 'science_tech')!;
  }
  if (lower.includes('defence') || lower.includes('army') || lower.includes('navy') || lower.includes('missile')) {
    return TOPIC_CATEGORIES.find(c => c.id === 'defence')!;
  }
  if (lower.includes('global') || lower.includes('un ') || lower.includes('international') || lower.includes('world')) {
    return TOPIC_CATEGORIES.find(c => c.id === 'international')!;
  }
  if (lower.includes('india') || lower.includes('national')) {
    return TOPIC_CATEGORIES.find(c => c.id === 'national')!;
  }

  return TOPIC_CATEGORIES.find(c => c.id === 'others')!;
}
