import { getAllPosts, getAllCategories } from '@/lib/blog';
import { BlogIndex } from '@/components/blog/blog-index';

export const metadata = {
  title: 'Learn | PeptideAtlas',
  description:
    'Educational articles on peptides, stacking protocols, safety, and the science behind healing and performance peptides.',
};

export default function LearnPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  return <BlogIndex posts={posts} categories={categories} />;
}
