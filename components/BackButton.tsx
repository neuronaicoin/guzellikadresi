'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ label = 'Geri' }: { label?: string }) {
  const router = useRouter();
  return (
    <button type="button" className="ga-back-link" onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
      ‹ {label}
    </button>
  );
}
