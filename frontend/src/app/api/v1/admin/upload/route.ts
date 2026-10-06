import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../lib/server-auth';
import { uploadImageToSupabase } from '../../../../../lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = verifyAdminToken(req, ['ADMIN', 'MANAGER']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Rasm fayli yuklanmadi' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `img_${Date.now()}_${Math.floor(Math.random() * 1e6)}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const uploadedUrl = await uploadImageToSupabase(buffer, filename, file.type || 'image/webp', 'images');

    if (!uploadedUrl) {
      return NextResponse.json({ message: 'Supabase Storage yuklashda xatolik' }, { status: 500 });
    }

    return NextResponse.json({
      url: uploadedUrl,
      relativePath: uploadedUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Xatolik' }, { status: 500 });
  }
}
