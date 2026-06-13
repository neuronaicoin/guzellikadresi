'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (!images.length) {
    return <div className="ga-gallery-empty">Fotoğraf eklenmemiş</div>;
  }

  return (
    <>
      <div className="ga-gallery">
        <div className="ga-gallery-main" onClick={() => setZoom(true)}>
          <Image src={images[active]} alt={alt} fill style={{ objectFit: 'cover' }} sizes="(max-width:880px) 100vw, 640px" priority />
        </div>
        {images.length > 1 && (
          <div className="ga-gallery-thumbs">
            {images.map((src, i) => (
              <div key={i} className={`ga-gallery-thumb ${i === active ? 'active' : ''}`} onClick={() => setActive(i)}>
                <Image src={src} alt={`${alt} ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="80px" />
              </div>
            ))}
          </div>
        )}
      </div>

      {zoom && (
        <div className="ga-lightbox" onClick={() => setZoom(false)}>
          <span className="ga-lightbox-x">×</span>
          <img src={images[active]} alt={alt} />
        </div>
      )}
    </>
  );
}
