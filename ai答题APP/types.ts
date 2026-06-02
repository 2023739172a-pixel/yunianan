export interface Answer {
  id: string;
  platform: string;
  question: string;
  answer: string;
  source: string;
  url: string;
  timestamp: number;
  qualityScore: number;
}

export interface SearchRequest {
  keyword: string;
  platforms: string[];
}

export interface SearchResponse {
  success: boolean;
  data: Answer[];
  timestamp: number;
}

export const PLATFORMS = [
  { id: 'doubao', name: '豆包', url: 'https://www.doubao.com', color: '#10B981' },
  { id: 'qianwen', name: '千问', url: 'https://qianwen.aliyun.com', color: '#F59E0B' },
  { id: 'yuanbao', name: '元宝', url: 'https://yuanbao.tencent.com', color: '#3B82F6' }
];

export const SAMPLE_ANSWERS: Answer[] = [
  {
    id: '1',
    platform: '豆包',
    question: '什么是人工智能？',
    answer: '人工智能是计算机科学的一个分支，它企图了解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器。该领域的研究包括机器人、语言识别、图像识别、自然语言处理和专家系统等。',
    source: '豆包AI',
    url: 'https://www.doubao.com',
    timestamp: Date.now() - 3600000,
    qualityScore: 85
  },
  {
    id: '2',
    platform: '千问',
    question: '什么是人工智能？',
    answer: '人工智能（AI）是指由人制造出来的机器所表现出来的智能，通常AI是指通过普通计算机程序的手段实现的类人智能技术。人工智能是对人的意识、思维的信息过程的模拟。',
    source: '千问AI',
    url: 'https://qianwen.aliyun.com',
    timestamp: Date.now() - 7200000,
    qualityScore: 88
  },
  {
    id: '3',
    platform: '元宝',
    question: '什么是人工智能？',
    answer: '人工智能是研究、开发用于模拟、延伸和扩展人的智能的理论、方法、技术及应用系统的一门新的技术科学。人工智能是计算机科学的一个分支，它企图了解智能的实质。',
    source: '元宝AI',
    url: 'https://yuanbao.tencent.com',
    timestamp: Date.now() - 10800000,
    qualityScore: 82
  }
];
