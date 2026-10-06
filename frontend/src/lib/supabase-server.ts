import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseServerInstance: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!supabaseServerInstance) {
    supabaseServerInstance = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }

  return supabaseServerInstance;
}

export async function uploadImageToSupabase(
  buffer: Buffer,
  filename: string,
  contentType: string = 'image/webp',
  bucket: string = 'images'
): Promise<string | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(filename, buffer, {
      contentType,
      cacheControl: '31536000',
      upsert: true,
    });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Upload to Supabase failed:', err);
    return null;
  }
}
