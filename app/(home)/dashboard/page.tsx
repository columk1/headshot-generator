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

  // Handle searchParams safely by extracting the value first
  const { processing } = await searchParams;
  const processingId = processing ? Number(processing) : null;

  const generations = await getGenerations();

  const completedGenerations = generations.filter(g => g.status === 'COMPLETED');

  // Only pass a generation that's actually in PROCESSING state to avoid infinite loops
  // If we have a processingId from query params, we'll only use it if the generation is in PROCESSING state
  let pendingGeneration = null;

  // First look for any generation that's in PROCESSING state
  const processingGeneration = generations.find(g => g.status === 'PROCESSING');
  if (processingGeneration) {
    pendingGeneration = processingGeneration;
  } else if (processingId) {
    // If we have a processingId but no generation is in PROCESSING state,
    // this means the webhook hasn't updated the status yet or the generation is already completed
    // We'll log this but not start polling
    console.log(`Generation ${processingId} is not in PROCESSING state`);
  }

  return <Dashboard
    initialGenerations={completedGenerations}
    pendingGeneration={pendingGeneration}
  />;
}
