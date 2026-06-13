import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const provinceId = req.nextUrl.searchParams.get('province');
  if (!provinceId) {
    return NextResponse.json({ districts: [] });
  }

  const { data, error } = await supabase
    .from('districts')
    .select('id, name, slug, province_id')
    .eq('province_id', Number(provinceId))
    .order('name');

  if (error) {
    return NextResponse.json({ districts: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ districts: data });
}
