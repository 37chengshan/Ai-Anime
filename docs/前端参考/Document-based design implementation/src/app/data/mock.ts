export interface User {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  worksCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  isMember: boolean;
  memberType?: 'monthly' | 'yearly';
  createdAt: string;
}

export interface Work {
  id: string;
  title: string;
  description?: string;
  images: string[];
  author: User;
  category: string;
  tags: string[];
  toolUsed?: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  views: number;
  isPublic: boolean;
  isPremium: boolean;
}

export interface Comment {
  id: string;
  workId: string;
  author: User;
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
  parentId?: string;
}

export const CURRENT_USER: User = {
  id: 'u_0',
  nickname: 'Figmake Creator',
  avatar: 'https://images.unsplash.com/photo-1569913486515-b74bf7751574?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdmF0YXIlMjBnaXJsfGVufDF8fHx8MTc3NTQ1OTQ3MXww&ixlib=rb-4.1.0&q=80&w=1080',
  bio: 'AI Artist exploring digital frontiers. Midjourney / Stable Diffusion.',
  worksCount: 42,
  followersCount: 12500,
  followingCount: 128,
  likesReceived: 89000,
  isMember: true,
  memberType: 'yearly',
  createdAt: '2023-01-15T00:00:00Z',
};

const mockUsers: User[] = [
  CURRENT_USER,
  {
    id: 'u_1',
    nickname: 'NeoTokyo Arts',
    avatar: 'https://images.unsplash.com/photo-1626038135427-bd4eb8193ba5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdmF0YXIlMjBib3l8ZW58MXx8fHwxNzc1NDU5NDcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Cyberpunk & Sci-fi illustrator.',
    worksCount: 12,
    followersCount: 8900,
    followingCount: 45,
    likesReceived: 34000,
    isMember: true,
    createdAt: '2023-05-20T00:00:00Z',
  },
  {
    id: 'u_2',
    nickname: 'Fantasy Dreamer',
    avatar: 'https://images.unsplash.com/photo-1673047233297-41890c998920?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NTQ1OTQ3MXww&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Creating worlds that don\'t exist.',
    worksCount: 56,
    followersCount: 45200,
    followingCount: 890,
    likesReceived: 120000,
    isMember: false,
    createdAt: '2022-11-10T00:00:00Z',
  }
];

export const MOCK_WORKS: Work[] = [
  {
    id: 'w_1',
    title: 'Neon Nights in Neo-Tokyo',
    description: 'A cyberpunk cityscape generated with Midjourney v6, upscaled with Topaz Gigapixel.',
    images: ['https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBjaXR5fGVufDF8fHx8MTc3NTQ1OTQ2N3ww&ixlib=rb-4.1.0&q=80&w=1080'],
    author: mockUsers[1],
    category: 'Concept Art',
    tags: ['cyberpunk', 'cityscape', 'midjourney'],
    toolUsed: 'Midjourney v6',
    createdAt: '2024-03-10T14:30:00Z',
    updatedAt: '2024-03-10T14:30:00Z',
    likes: 1245,
    comments: 89,
    views: 12500,
    isPublic: true,
    isPremium: false,
  },
  {
    id: 'w_2',
    title: 'Ethereal Forest Spirit',
    description: 'Fantasy landscape featuring an ancient spirit guarding the sacred woods.',
    images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3NTQ1OTQ2N3ww&ixlib=rb-4.1.0&q=80&w=1080'],
    author: mockUsers[2],
    category: 'Illustration',
    tags: ['fantasy', 'nature', 'spirit', 'nijijourney'],
    toolUsed: 'Niji 6',
    createdAt: '2024-03-12T09:15:00Z',
    updatedAt: '2024-03-12T09:15:00Z',
    likes: 3402,
    comments: 156,
    views: 45000,
    isPublic: true,
    isPremium: true,
  },
  {
    id: 'w_3',
    title: 'Manga Protagonist Concept',
    description: 'Character design sheet for a shonen manga concept.',
    images: ['https://images.unsplash.com/photo-1769874825261-ef30d63f6817?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5nYSUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NzU0NTk0Njd8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    author: mockUsers[0],
    category: 'Manga',
    tags: ['character design', 'shonen', 'sketch'],
    toolUsed: 'Stable Diffusion XL',
    createdAt: '2024-03-15T18:45:00Z',
    updatedAt: '2024-03-15T18:45:00Z',
    likes: 892,
    comments: 45,
    views: 8900,
    isPublic: true,
    isPremium: false,
  },
  {
    id: 'w_4',
    title: 'Digital Painting - The Wanderer',
    description: 'Testing new painterly styles with custom LoRAs.',
    images: ['https://images.unsplash.com/photo-1744686909443-eb72a54de998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzc1NDU5NDcxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    author: mockUsers[1],
    category: 'Digital Painting',
    tags: ['portrait', 'painterly', 'lora'],
    toolUsed: 'Stable Diffusion v1.5',
    createdAt: '2024-03-18T11:20:00Z',
    updatedAt: '2024-03-18T11:20:00Z',
    likes: 2105,
    comments: 112,
    views: 18000,
    isPublic: true,
    isPremium: false,
  },
  {
    id: 'w_5',
    title: 'Anime Art Style Transfer',
    description: 'Testing anime style transfer on real photography.',
    images: ['https://images.unsplash.com/photo-1666153184660-a09d73e5b755?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGFydHxlbnwxfHx8fDE3NzU0NTk0Njd8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    author: mockUsers[2],
    category: 'Anime',
    tags: ['anime', 'style transfer', 'controlnet'],
    toolUsed: 'SD ControlNet',
    createdAt: '2024-03-20T16:05:00Z',
    updatedAt: '2024-03-20T16:05:00Z',
    likes: 5620,
    comments: 234,
    views: 67000,
    isPublic: true,
    isPremium: true,
  },
  {
    id: 'w_6',
    title: 'Sci-fi Space Station',
    description: 'Massive orbital station concept design for an upcoming game.',
    images: ['https://images.unsplash.com/photo-1771515220905-ba0784fb7522?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2lmaSUyMGNvbmNlcHQlMjBhcnR8ZW58MXx8fHwxNzc1NDU5NDcxfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    author: mockUsers[0],
    category: 'Concept Art',
    tags: ['scifi', 'space', 'environment'],
    toolUsed: 'Midjourney v6',
    createdAt: '2024-04-01T08:30:00Z',
    updatedAt: '2024-04-01T08:30:00Z',
    likes: 1890,
    comments: 76,
    views: 15400,
    isPublic: true,
    isPremium: false,
  }
];

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  'w_1': [
    {
      id: 'c_1',
      workId: 'w_1',
      author: mockUsers[0],
      content: 'The lighting here is phenomenal! What prompt did you use for the neon reflections?',
      createdAt: '2024-03-10T15:00:00Z',
      likes: 24,
    },
    {
      id: 'c_2',
      workId: 'w_1',
      author: mockUsers[2],
      content: 'Incredible detail on the background buildings.',
      createdAt: '2024-03-11T09:20:00Z',
      likes: 8,
    }
  ]
};
