'use client';

import { useEffect, useState } from 'react';
import {
  getPublicServices, getPublicWorkingHours, getDayAvailability,
  type PublicService, type PublicWorkingHour, type SlotInfo,
} from '@/lib/queries-booking';

type Props = {
  businessId: string;
  businessName: string;
  whatsapp: string | null;
  staffCount: number;
  showPrice: boolean;
  onClose: () => void;
};

const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

// JS getDay: 0=Pazar..6=Cumartesi → bizim 0=Pazartesi..6=Pazar'a çevir
function jsDayToOur(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

// Sonraki 14 günü üret
function nextDays(count: number): Date[] {
  const arr: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    arr.push(d);
  }
  return arr;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// "09:00"-"18:00" arası, adım dakika (varsayılan 30dk) slotlar üret
function buildSlots(open: string, close: string, stepMin = 30): string[] {
  const [oh, om] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  const start = oh * 60 + om;
  const end = ch * 60 + cm;
  const out: string[] = [];
  for (let t = start; t + stepMin <= end; t += stepMin) {
    const h = String(Math.floor(t / 60)).padStart(2, '0');
    const m = String(t % 60).padStart(2, '0');
    out.push(`${h}:${m}`);
  }
  return out;
}

function cleanPhone(wa: string): string {
  let n = wa.replace(/[^0-9]/g, '');
  if (n.startsWith('0')) n = '90' + n.slice(1);
  else if (!n.startsWith('90')) n = '90' + n;
  return n;
}

export default function BookingModal(p: Props) {
  const [step, setStep] = useState(1); // 1=hizmet 2=gün/saat 3=bilgi 4=onaylandı
  const [services, setServices] = useState<PublicService[]>([]);
  const [hours, setHours] = useState<PublicWorkingHour[]>([]);
  const [loading, setLoading] = useState(true);

  const [selService, setSelService] = useState<PublicService | null>(null);
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);
  const [dayAvail, setDayAvail] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const [svc, wh] = await Promise.all([
        getPublicServices(p.businessId),
        getPublicWorkingHours(p.businessId),
      ]);
      setServices(svc);
      setHours(wh);
      setLoading(false);
    })();
  }, [p.businessId]);

  // Gün seçilince o günün doluluk durumunu çek
  useEffect(() => {
    if (!selDate) return;
    setLoadingSlots(true);
    setSelTime(null);
    getDayAvailability(p.businessId, toISO(selDate)).then((a) => {
      setDayAvail(a);
      setLoadingSlots(false);
    });
  }, [selDate, p.businessId]);

  // Seçili günün çalışma saati
  function workingForDate(d: Date): PublicWorkingHour | null {
    const our = jsDayToOur(d.getDay());
    return hours.find((h) => h.day_of_week === our) || null;
  }

  // Seçili gün için slotlar (dolu/bloklu işaretli)
  function slotsForSelectedDate(): { time: string; remaining: number; disabled: boolean }[] {
    if (!selService || !selDate) return [];
    const wh = workingForDate(selDate);
    if (!wh || wh.is_closed || !wh.open_time || !wh.close_time) return [];
    const raw = buildSlots(wh.open_time.slice(0, 5), wh.close_time.slice(0, 5), selService.duration_min || 30);

    const now = new Date();
    const isToday = toISO(selDate) === toISO(now);

    return raw.map((t) => {
      const info = dayAvail.find((a) => a.slot_time === t);
      const taken = info?.taken || 0;
      const blocked = info?.blocked || false;
      const remaining = p.staffCount - taken;
      // geçmiş saat mi (bugünse)
      let past = false;
      if (isToday) {
        const [h, m] = t.split(':').map(Number);
        const slotMin = h * 60 + m;
        const nowMin = now.getHours() * 60 + now.getMinutes();
        past = slotMin <= nowMin;
      }
      return { time: t, remaining, disabled: blocked || remaining <= 0 || past };
    });
  }

  async function submit() {
    if (!selService || !selDate || !selTime) return;
    if (custName.trim().length < 2) { setErr('Lütfen adınızı girin.'); return; }
    if (custPhone.replace(/[^0-9]/g, '').length < 10) { setErr('Lütfen geçerli bir telefon girin.'); return; }
    setErr('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: p.businessId,
          service_id: selService.id,
          name: custName,
          phone: custPhone,
          date: toISO(selDate),
          time: selTime,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErr(data.error || 'Randevu alınamadı.');
        setSubmitting(false);
        // slot dolduysa doluluk tekrar çek
        if (selDate) getDayAvailability(p.businessId, toISO(selDate)).then(setDayAvail);
        return;
      }
      setStep(4); // onaylandı
    } catch {
      setErr('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
    setSubmitting(false);
  }

  // wa.me bildirim linki (marka mesajlı)
  function waLink(): string {
    if (!p.whatsapp) return '';
    const num = cleanPhone(p.whatsapp);
    const dateStr = selDate
      ? `${selDate.getDate()} ${MONTHS[selDate.getMonth()]}`
      : '';
    const msg =
      `🔔 GÜZELLİKADRESİN'DEN YENİ RANDEVU\n\n` +
      `👤 Müşteri: ${custName}\n` +
      `📞 Telefon: ${custPhone}\n` +
      `✂️ Hizmet: ${selService?.name || '-'}\n` +
      `📅 Tarih: ${dateStr}\n` +
      `🕐 Saat: ${selTime}\n\n` +
      `✨ Bu randevu guzellikadresin.com üzerinden oluşturuldu.`;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }

  const days = nextDays(14);

  return (
    <div className="ga-modal-overlay" onClick={p.onClose}>
      <div className="ga-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ga-modal-head">
          <div>
            <div className="ga-modal-title">Randevu Al</div>
            <div className="ga-modal-sub">{p.businessName}</div>
          </div>
          <button className="ga-modal-x" onClick={p.onClose} aria-label="Kapat">×</button>
        </div>

        {loading ? (
          <div className="ga-modal-body"><p style={{ textAlign: 'center', color: '#7a869a' }}>Yükleniyor…</p></div>
        ) : services.length === 0 ? (
          <div className="ga-modal-body">
            <p style={{ textAlign: 'center', color: '#7a869a' }}>
              Bu işletme henüz hizmet tanımlamamış. Lütfen telefonla iletişime geçin.
            </p>
          </div>
        ) : (
          <div className="ga-modal-body">
            {/* Adım göstergesi */}
            {step < 4 && (
              <div className="ga-book-steps">
                <span className={step >= 1 ? 'on' : ''}>1 Hizmet</span>
                <span className={step >= 2 ? 'on' : ''}>2 Tarih & Saat</span>
                <span className={step >= 3 ? 'on' : ''}>3 Bilgiler</span>
              </div>
            )}

            {/* ADIM 1: Hizmet */}
            {step === 1 && (
              <div className="ga-book-services">
                {services.map((s) => (
                  <button key={s.id} className="ga-book-svc"
                    onClick={() => { setSelService(s); setStep(2); }}>
                    <div>
                      <div className="ga-book-svc-name">{s.name}</div>
                      <div className="ga-book-svc-dur">{s.duration_min} dk</div>
                    </div>
                    {p.showPrice && s.price != null && (
                      <div className="ga-book-svc-price">{s.price} TL</div>
                    )}
                    {(!p.showPrice || s.price == null) && (
                      <div className="ga-book-svc-price muted">Fiyat için sorun</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ADIM 2: Gün + Saat */}
            {step === 2 && selService && (
              <div>
                <div className="ga-book-picked" onClick={() => setStep(1)}>
                  {selService.name} · {selService.duration_min} dk <span>değiştir</span>
                </div>

                <div className="ga-book-days">
                  {days.map((d) => {
                    const wh = workingForDate(d);
                    const closed = !wh || wh.is_closed;
                    const active = selDate && toISO(selDate) === toISO(d);
                    return (
                      <button key={toISO(d)} disabled={closed}
                        className={`ga-book-day${active ? ' active' : ''}${closed ? ' closed' : ''}`}
                        onClick={() => setSelDate(d)}>
                        <span className="d-name">{DAY_NAMES[jsDayToOur(d.getDay())].slice(0, 3)}</span>
                        <span className="d-num">{d.getDate()}</span>
                        <span className="d-mon">{MONTHS[d.getMonth()].slice(0, 3)}</span>
                      </button>
                    );
                  })}
                </div>

                {selDate && (
                  loadingSlots ? (
                    <p style={{ textAlign: 'center', color: '#7a869a', fontSize: 13, padding: 12 }}>Saatler yükleniyor…</p>
                  ) : (
                    <div className="ga-book-slots">
                      {slotsForSelectedDate().length === 0 && (
                        <p style={{ color: '#7a869a', fontSize: 13, gridColumn: '1/-1', textAlign: 'center' }}>
                          Bu gün için uygun saat yok.
                        </p>
                      )}
                      {slotsForSelectedDate().map((s) => (
                        <button key={s.time} disabled={s.disabled}
                          className={`ga-book-slot${selTime === s.time ? ' active' : ''}${s.disabled ? ' full' : ''}`}
                          onClick={() => setSelTime(s.time)}>
                          {s.time}
                          {!s.disabled && p.staffCount > 1 && (
                            <span className="rem">{s.remaining} yer</span>
                          )}
                          {s.disabled && <span className="rem">dolu</span>}
                        </button>
                      ))}
                    </div>
                  )
                )}

                {selDate && selTime && (
                  <button className="ga-book-next" onClick={() => setStep(3)}>Devam →</button>
                )}
              </div>
            )}

            {/* ADIM 3: Bilgiler + özet */}
            {step === 3 && selService && selDate && selTime && (
              <div>
                <div className="ga-book-summary">
                  <div><b>{selService.name}</b> · {selService.duration_min} dk</div>
                  <div>{selDate.getDate()} {MONTHS[selDate.getMonth()]} {DAY_NAMES[jsDayToOur(selDate.getDay())]}, saat {selTime}</div>
                </div>
                <div className="ga-field" style={{ marginTop: 14 }}>
                  <label>Adınız Soyadınız</label>
                  <input value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Ad Soyad" />
                </div>
                <div className="ga-field">
                  <label>Telefon</label>
                  <input value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="05XX XXX XX XX" inputMode="tel" />
                </div>
                {err && <div className="ga-err" style={{ margin: '0 0 12px' }}>{err}</div>}
                <button className="ga-book-confirm" onClick={submit} disabled={submitting}>
                  {submitting ? 'Oluşturuluyor…' : 'Randevuyu Oluştur'}
                </button>
                <button className="ga-book-back" onClick={() => setStep(2)}>← Geri</button>
              </div>
            )}

            {/* ADIM 4: Onaylandı */}
            {step === 4 && selService && selDate && selTime && (
              <div className="ga-book-done">
                <div className="ga-book-check">✓</div>
                <h3>Randevunuz Oluşturuldu!</h3>
                <div className="ga-book-done-sum">
                  <div><b>{selService.name}</b></div>
                  <div>{selDate.getDate()} {MONTHS[selDate.getMonth()]} {DAY_NAMES[jsDayToOur(selDate.getDay())]}, {selTime}</div>
                  <div style={{ color: '#7a869a', fontSize: 13 }}>{p.businessName}</div>
                </div>
                {p.whatsapp && (
                  <a className="ga-book-wa" href={waLink()} target="_blank" rel="noopener">
                    💬 Randevunu işletmeye WhatsApp'tan bildir
                  </a>
                )}
                <p className="ga-book-done-note">
                  Randevunuz işletmeye iletildi. Dilerseniz WhatsApp'tan da bildirebilirsiniz.
                </p>
                <button className="ga-book-close2" onClick={p.onClose}>Kapat</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
