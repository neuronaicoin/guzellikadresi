'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  function go() {
    const term = q.trim();
    if (!term) return;
    router.push(`/ara?q=${encodeURIComponent(term)}`);
  }

  return (
    <div className="ga-searchbar">
      <span className="ga-searchbar-icon">🔍</span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') go(); }}
        placeholder="Hizmet, işletme veya semt ara… (örn. lazer epilasyon)"
      />
      <button onClick={go}>Ara</button>
    </div>
  );
}
