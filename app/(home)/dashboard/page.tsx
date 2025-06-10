import { redirect } from 'next/navigation';
import { Dashboard } from './dashboard';
import { getGenerations, getUser } from '@/lib/db/queries';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const generations = await getGenerations()

  return <Dashboard initialGenerations={generations} />;
}
