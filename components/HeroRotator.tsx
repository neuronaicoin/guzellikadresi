'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Yakınındaki güzellik ve bakım merkezini dakikalar içinde bul',
  'Semtindeki en iyi uzmanları keşfet, anında ulaş',
  'Saçından cildine, tırnağından estetiğine — hepsi tek adreste',
  'Bölgendeki müşteriler seni saniyeler içinde bulsun',
  'Semtindeki müşterilere ulaşmanın en hızlı yolu',
  'İşletmen bulunduğun ilçede ilk sırada görünsün',
  'Hemen üye ol, çevrendeki müşteriler işletmeni anında görsün',
];

export default function HeroRotator() {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false); // fade out
      setTimeout(() => {
        setI((prev) => (prev + 1) % MESSAGES.length);
        setShow(true); // fade in
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      style={{
        marginTop: 10,
        color: '#c5cde0',
        fontSize: 15,
        maxWidth: 500,
        minHeight: 44,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity .4s ease, transform .4s ease',
      }}
    >
      {MESSAGES[i]}
    </p>
  );
}
