export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  coverImage?: string;
  author: string;
  tags: string[];
  readingTime: string;
  content: string;
}

export interface BlogPostMeta extends Omit<BlogPost, 'content'> {}
