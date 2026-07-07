'use client';

import { useEffect, useState } from 'react';
import {
  getAppointments, updateAppointmentStatus,
  getBlockedSlots, addBlockedSlot, removeBlockedSlot,
  type Appointment, type BlockedSlot,
} from '@/lib/queries-appointment';

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
function fmtTime(t: string): string {
  return t.slice(0, 5);
}
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AppointmentManager({ businessId }: { businessId: string }) {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [blocked, setBlocked] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past' | 'blocked'>('upcoming');

  // Blok ekleme formu
  const [blkDate, setBlkDate] = useState('');
  const [blkTime, setBlkTime] = useState('');
  const [blkMsg, setBlkMsg] = useState('');

  async function reload() {
    const [a, b] = await Promise.all([
      getAppointments(businessId),
      getBlockedSlots(businessId),
    ]);
    setAppts(a);
    setBlocked(b);
    setLoading(false);
  }

  useEffect(() => { reload(); }, [businessId]);

  const today = todayISO();
  const upcoming = appts.filter((a) => a.appointment_date >= today && a.status !== 'cancelled');
  const past = appts.filter((a) => a.appointment_date < today || a.status === 'cancelled');

  async function setStatus(id: string, status: 'confirmed' | 'cancelled') {
    await updateAppointmentStatus(id, status);
    reload();
  }

  async function addBlock() {
    setBlkMsg('');
    if (!blkDate || !blkTime) { setBlkMsg('Tarih ve saat seçin.'); return; }
    const r = await addBlockedSlot(businessId, blkDate, blkTime);
    if (!r.ok) { setBlkMsg(r.error || 'Eklenemedi.'); return; }
    setBlkDate(''); setBlkTime('');
    reload();
  }

  async function delBlock(id: string) {
    await removeBlockedSlot(id);
    reload();
  }

  function waLink(a: Appointment): string {
    const phone = a.customer_phone.replace(/[^0-9]/g, '');
    let num = phone;
    if (num.startsWith('0')) num = '90' + num.slice(1);
    else if (!num.startsWith('90')) num = '90' + num;
    const msg = `Merhaba ${a.customer_name}, ${fmtDate(a.appointment_date)} ${fmtTime(a.appointment_time)} randevunuz hakkında bilgi vermek istiyoruz.`;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }

  if (loading) return <p className="ga-static-lead">Randevular yükleniyor…</p>;

  return (
    <div>
      {/* Alt sekmeler */}
      <div className="ga-appt-tabs">
        <button className={tab === 'upcoming' ? 'on' : ''} onClick={() => setTab('upcoming')}>
          Yaklaşan ({upcoming.length})
        </button>
        <button className={tab === 'past' ? 'on' : ''} onClick={() => setTab('past')}>
          Geçmiş ({past.length})
        </button>
        <button className={tab === 'blocked' ? 'on' : ''} onClick={() => setTab('blocked')}>
          Kapalı Saatler ({blocked.length})
        </button>
      </div>

      {/* Yaklaşan randevular */}
      {tab === 'upcoming' && (
        <div className="ga-appt-list">
          {upcoming.length === 0 && (
            <div className="ga-list-empty" style={{ padding: 30 }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>📭</div>
              <h3>Yaklaşan randevu yok</h3>
              <p>Müşteriler randevu aldıkça burada görünecek.</p>
            </div>
          )}
          {upcoming.map((a) => (
            <div key={a.id} className="ga-appt-card">
              <div className="ga-appt-main">
                <div className="ga-appt-when">
                  📅 {fmtDate(a.appointment_date)} · 🕐 {fmtTime(a.appointment_time)}
                </div>
                <div className="ga-appt-who">
                  <b>{a.customer_name}</b> · {a.customer_phone}
                </div>
                {a.service_name && <div className="ga-appt-svc">{a.service_name}</div>}
                <span className={`ga-appt-status ${a.status}`}>
                  {a.status === 'confirmed' ? '✓ Onaylandı' : '⏳ Bekliyor'}
                </span>
              </div>
              <div className="ga-appt-actions">
                {a.status !== 'confirmed' && (
                  <button className="ga-appt-btn ok" onClick={() => setStatus(a.id, 'confirmed')}>Onayla</button>
                )}
                <a className="ga-appt-btn wa" href={waLink(a)} target="_blank" rel="noopener">WhatsApp</a>
                <button className="ga-appt-btn del" onClick={() => setStatus(a.id, 'cancelled')}>İptal</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Geçmiş randevular */}
      {tab === 'past' && (
        <div className="ga-appt-list">
          {past.length === 0 && (
            <div className="ga-list-empty" style={{ padding: 30 }}>
              <h3>Geçmiş randevu yok</h3>
            </div>
          )}
          {past.map((a) => (
            <div key={a.id} className="ga-appt-card past">
              <div className="ga-appt-main">
                <div className="ga-appt-when">
                  {fmtDate(a.appointment_date)} · {fmtTime(a.appointment_time)}
                </div>
                <div className="ga-appt-who"><b>{a.customer_name}</b> · {a.customer_phone}</div>
                {a.service_name && <div className="ga-appt-svc">{a.service_name}</div>}
                <span className={`ga-appt-status ${a.status}`}>
                  {a.status === 'cancelled' ? '✕ İptal' : a.status === 'confirmed' ? '✓ Tamamlandı' : 'Geçmiş'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kapalı saatler */}
      {tab === 'blocked' && (
        <div>
          <div className="ga-edit-note" style={{ marginBottom: 14 }}>
            Telefonla randevu aldığınız veya müsait olmadığınız saatleri kapatın.
            Kapalı saatlerde müşteri online randevu alamaz.
          </div>
          <div className="ga-blk-form">
            <input type="date" value={blkDate} onChange={(e) => setBlkDate(e.target.value)} min={today} />
            <input type="time" value={blkTime} onChange={(e) => setBlkTime(e.target.value)} />
            <button className="ga-appt-btn ok" onClick={addBlock}>Kapat</button>
          </div>
          {blkMsg && <div className="ga-err" style={{ margin: '10px 0' }}>{blkMsg}</div>}

          <div className="ga-appt-list" style={{ marginTop: 14 }}>
            {blocked.length === 0 && (
              <p style={{ color: '#7a869a', fontSize: 13.5, textAlign: 'center', padding: 16 }}>
                Kapalı saat yok.
              </p>
            )}
            {blocked.map((b) => (
              <div key={b.id} className="ga-blk-row">
                <span>🔒 {fmtDate(b.blocked_date)} · {fmtTime(b.blocked_time)}</span>
                <button className="ga-appt-btn del" onClick={() => delBlock(b.id)}>Kaldır</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
