import { redirect } from 'next/navigation';
import { Dashboard } from './dashboard';
import { getGenerations, getUser } from '@/lib/db/queries';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const generations = await getGenerations();

  // const completedGenerations = generations.filter(g => g.status === 'COMPLETED');

  const pendingGeneration = generations?.[0]?.status === 'PROCESSING' ? generations?.[0] : null;

  return <Dashboard
    generations={generations}
    pendingGeneration={pendingGeneration}
  />;
}
