'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ContactForm() {
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ isim: '', soyisim: '', telefon: '', mail: '', mesaj: '' });

  function upd(k: string, v: string) { setF({ ...f, [k]: v }); }

  async function submit() {
    setErr('');
    if (!f.isim.trim() || !f.mail.trim() || !f.mesaj.trim()) {
      setErr('Lütfen isim, e-posta ve mesaj alanlarını doldurun.');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        first_name: f.isim.trim(),
        last_name: f.soyisim.trim() || null,
        phone: f.telefon.trim() || null,
        email: f.mail.trim(),
        message: f.mesaj.trim(),
      });
      if (error) setErr('Gönderilemedi. Lütfen tekrar deneyin.');
      else setDone(true);
    } catch {
      setErr('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="ga-reg-done">
        <div className="ga-reg-check">✓</div>
        <h2>Mesajınız alındı!</h2>
        <p>En kısa sürede size dönüş yapacağız.</p>
      </div>
    );
  }

  return (
    <div className="ga-contact-form">
      <div className="ga-grid2">
        <div className="ga-field"><label>İsim *</label><input value={f.isim} onChange={(e) => upd('isim', e.target.value)} /></div>
        <div className="ga-field"><label>Soyisim</label><input value={f.soyisim} onChange={(e) => upd('soyisim', e.target.value)} /></div>
      </div>
      <div className="ga-grid2">
        <div className="ga-field"><label>Telefon</label><input value={f.telefon} onChange={(e) => upd('telefon', e.target.value)} placeholder="0 5XX XXX XX XX" /></div>
        <div className="ga-field"><label>E-posta *</label><input value={f.mail} onChange={(e) => upd('mail', e.target.value)} placeholder="ornek@mail.com" /></div>
      </div>
      <div className="ga-field"><label>Mesajınız *</label><textarea value={f.mesaj} onChange={(e) => upd('mesaj', e.target.value)} placeholder="Bize iletmek istediğiniz mesaj…" /></div>
      {err && <div className="ga-err" style={{ margin: '0 0 14px 0' }}>{err}</div>}
      <button type="button" className="ga-btn-submit" style={{ marginLeft: 0 }} onClick={submit} disabled={sending}>
        {sending ? 'Gönderiliyor…' : 'Mesajı Gönder'}
      </button>
    </div>
  );
}
