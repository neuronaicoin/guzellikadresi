import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { slugify, shortId } from '@/lib/slugify';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const name = String(form.get('name') || '').trim();
    const description = String(form.get('description') || '').trim();
    const categoryId = Number(form.get('categoryId'));
    const provinceId = Number(form.get('provinceId'));
    const districtId = Number(form.get('districtId'));
    const neighborhood = String(form.get('neighborhood') || '').trim();
    const address = String(form.get('address') || '').trim();
    const lat = form.get('lat') ? Number(form.get('lat')) : null;
    const lng = form.get('lng') ? Number(form.get('lng')) : null;
    const phone = String(form.get('phone') || '').trim();
    const whatsapp = String(form.get('whatsapp') || '').trim();
    const website = String(form.get('website') || '').trim();
    const instagram = String(form.get('instagram') || '').trim();
    const facebook = String(form.get('facebook') || '').trim();
    const xTwitter = String(form.get('x') || '').trim();
    const linkedin = String(form.get('linkedin') || '').trim();
    const serviceIds = JSON.parse(String(form.get('serviceIds') || '[]')) as number[];

    // Zorunlu alan kontrolü
    if (!name || !categoryId || !provinceId || !districtId || !address || !phone || serviceIds.length === 0) {
      return NextResponse.json({ ok: false, error: 'Zorunlu alanlar eksik.' }, { status: 400 });
    }

    // Slug üret
    const slug = `${slugify(name)}-${shortId()}`;

    // İşletmeyi ekle (hemen yayında: approved)
    // Not: mahalle şu an serbest metin (dropdown yok) — adrese ekleniyor.
    const fullAddress = neighborhood ? `${neighborhood} Mah., ${address}` : address;
    const { data: biz, error: bizErr } = await supabaseAdmin
      .from('businesses')
      .insert({
        name,
        slug,
        description,
        category_id: categoryId,
        province_id: provinceId,
        district_id: districtId,
        address: fullAddress,
        lat,
        lng,
        phone,
        whatsapp: whatsapp || null,
        website: website || null,
        instagram: instagram || null,
        facebook: facebook || null,
        x_twitter: xTwitter || null,
        linkedin: linkedin || null,
        status: 'approved',
        is_featured: false,
      })
      .select('id')
      .single();

    if (bizErr || !biz) {
      return NextResponse.json({ ok: false, error: bizErr?.message || 'İşletme kaydedilemedi.' }, { status: 500 });
    }

    const businessId = biz.id;

    // Hizmetleri bağla
    if (serviceIds.length) {
      const rows = serviceIds.map((sid) => ({ business_id: businessId, service_id: sid }));
      await supabaseAdmin.from('business_services').insert(rows);
    }

    // Fotoğrafları Storage'a yükle + kaydet
    const photoEntries = form.getAll('photos') as File[];
    const workEntries = form.getAll('works') as File[];
    let order = 0;

    async function uploadOne(file: File, isCover: boolean, kind: string) {
      const ext = 'webp';
      const path = `${businessId}/${kind}-${Date.now()}-${order}.${ext}`;
      const buf = Buffer.from(await file.arrayBuffer());
      const { error: upErr } = await supabaseAdmin.storage
        .from('business-photos')
        .upload(path, buf, { contentType: 'image/webp', upsert: false });
      if (upErr) return;
      const { data: pub } = supabaseAdmin.storage.from('business-photos').getPublicUrl(path);
      await supabaseAdmin.from('business_photos').insert({
        business_id: businessId,
        url: pub.publicUrl,
        kind,
        is_cover: isCover,
        sort_order: order,
      });
      order++;
    }

    for (let i = 0; i < photoEntries.length; i++) {
      await uploadOne(photoEntries[i], i === 0, 'gallery');
    }
    for (let i = 0; i < workEntries.length; i++) {
      await uploadOne(workEntries[i], false, 'work');
    }

    return NextResponse.json({ ok: true, slug });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Beklenmeyen hata.' }, { status: 500 });
  }
}
