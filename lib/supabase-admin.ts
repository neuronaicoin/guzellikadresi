import { createClient } from '@supabase/supabase-js';

// ADMIN client — service_role anahtarı kullanır, RLS'i BYPASS eder.
// ⚠️ SADECE sunucu tarafında (API route / server action) kullan.
// Bu dosya asla client component'te import edilmemeli.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
