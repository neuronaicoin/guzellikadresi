'use client';

import { useState, useEffect } from 'react';
import { supabaseAuth } from '@/lib/supabase-auth';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  // Giriş modunda kayıtlı maili hatırla
  useEffect(() => {
    if (mode === 'login') {
      try {
        const saved = localStorage.getItem('ga_remember_email');
        if (saved) setEmail(saved);
      } catch {}
    }
  }, [mode]);

  async function submit() {
    setErr(''); setInfo('');
    if (!email.trim() || !pw) { setErr('E-posta ve şifre gerekli.'); return; }
    if (mode === 'register') {
      if (pw.length < 6) { setErr('Şifre en az 6 karakter olmalı.'); return; }
      if (pw !== pw2) { setErr('Şifreler eşleşmiyor.'); return; }
    }
    setBusy(true);
    try {
      if (mode === 'register') {
        const { error } = await supabaseAuth.auth.signUp({ email: email.trim(), password: pw });
        if (error) { setErr(cevirHata(error.message)); setBusy(false); return; }
        // mail doğrulama kapalı → direkt giriş yapılmış olur
        // Tam sayfa yönlendirme kullanılıyor: oturumun tarayıcıya tam
        // olarak yazıldığından emin olunduktan sonra /panel açılır —
        // istemci-taraflı router.push'ta bazı mobil tarayıcılarda görülen
        // "giriş yapıp anında geri atılma" sorununu tamamen ortadan kaldırır.
        window.location.href = '/panel';
      } else {
        const { error } = await supabaseAuth.auth.signInWithPassword({ email: email.trim(), password: pw });
        if (error) { setErr(cevirHata(error.message)); setBusy(false); return; }
        try { localStorage.setItem('ga_remember_email', email.trim()); } catch {}
        window.location.href = '/panel';
      }
    } catch {
      setErr('Bir hata oluştu. Tekrar deneyin.');
      setBusy(false);
    }
  }

  async function sifreSifirla() {
    setErr(''); setInfo('');
    if (!email.trim()) { setErr('Önce e-posta adresinizi girin.'); return; }
    setBusy(true);
    try {
      const { error } = await supabaseAuth.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/sifre-yenile` : undefined,
      });
      if (error) setErr(cevirHata(error.message));
      else setInfo('Şifre sıfırlama bağlantısı e-postanıza gönderildi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ga-auth-card">
      <div className="ga-field"><label>E-posta</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" autoComplete="email" />
      </div>
      <div className="ga-field"><label>Şifre</label>
        <div className="ga-pw-wrap">
          <input type={showPw ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
          <button type="button" className="ga-pw-eye" onClick={() => setShowPw(!showPw)} aria-label="Şifreyi göster/gizle">
            {showPw ? '🙈' : '👁'}
          </button>
        </div>
      </div>
      {mode === 'register' && (
        <div className="ga-field"><label>Şifre (tekrar)</label>
          <div className="ga-pw-wrap">
            <input type={showPw ? 'text' : 'password'} value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••" autoComplete="new-password" />
          </div>
        </div>
      )}

      {err && <div className="ga-err">{err}</div>}
      {info && <div className="ga-info-ok">{info}</div>}

      <button className="ga-auth-btn" onClick={submit} disabled={busy}>
        {busy ? 'Lütfen bekleyin…' : (mode === 'register' ? 'Hesap Oluştur' : 'Giriş Yap')}
      </button>

      {mode === 'login' ? (
        <div className="ga-auth-links">
          <button onClick={sifreSifirla} className="ga-auth-link">Şifremi unuttum</button>
          <a href="/kayit" className="ga-auth-link">Hesabın yok mu? Kayıt ol</a>
        </div>
      ) : (
        <div className="ga-auth-links">
          <a href="/giris" className="ga-auth-link">Zaten hesabın var mı? Giriş yap</a>
        </div>
      )}
    </div>
  );
}

function cevirHata(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'E-posta veya şifre hatalı.';
  if (m.includes('already registered') || m.includes('already exists')) return 'Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.';
  if (m.includes('password')) return 'Şifre çok kısa (en az 6 karakter).';
  if (m.includes('email')) return 'Geçerli bir e-posta girin.';
  return 'İşlem başarısız. Tekrar deneyin.';
}
