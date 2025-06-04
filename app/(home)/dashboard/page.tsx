import { redirect } from 'next/navigation';
import { Dashboard } from './dashboard';
import { getGenerations, getUser } from '@/lib/db/queries';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // const generations = await getGenerations()
  const generations = [{ createdAt: 1747605149, storagePath: '', id: 3, imageUrl: 'https://replicate.delivery/xezq/019Hjqu5AJZMARpuYWviDetblCQO1Gvg2Zbj4wAEE7tMZegUA/output.jpg' }];

  return <Dashboard initialGenerations={generations} />;
}
