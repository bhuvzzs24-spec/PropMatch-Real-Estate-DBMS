export const dynamic = 'force-dynamic';

import { listProperties } from '@/services/properties';
import ModernHome from '@/components/home/ModernHome';

export default async function HomePage() {
  const { items } = await listProperties({
    sort: 'newest',
    limit: 12,
    page: 1,
  });

  return <ModernHome properties={items} />;
}
