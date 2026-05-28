import { notFound } from 'next/navigation';
import { mockRepoDetail } from '@/lib/mock-data';
import { RepoDetailView } from '@/components/repo-detail-view';

export default async function RepoDetailPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;
  const detail = mockRepoDetail(`${owner}/${repo}`);
  if (!detail) notFound();
  return <RepoDetailView initial={detail} />;
}
