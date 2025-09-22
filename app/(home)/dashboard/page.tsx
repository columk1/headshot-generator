import { redirect } from 'next/navigation';
import { Dashboard } from './dashboard';
import { getGenerations, getUser } from '@/lib/db/queries';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const generations = await getGenerations();

  // const completedGenerations = generations.filter(g => g.status === 'COMPLETED');

  const pendingGeneration = generations.find((g) => g.status === 'PROCESSING') ?? null;

  return <Dashboard
    generations={generations}
    pendingGeneration={pendingGeneration}
  />;
}
