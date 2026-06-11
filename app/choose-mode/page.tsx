'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChooseModePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/single');
  }, [router]);

  return null;
}
