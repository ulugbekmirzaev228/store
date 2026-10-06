import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    return NextResponse.json(settingsMap);
  } catch (err: any) {
    return NextResponse.json({
      site_name: 'NasiyaGo Electronics',
      phone_hotline: '+998 71 200 44 00',
      telegram_channel: 'https://t.me/nasiyago_uz',
      instagram: 'https://instagram.com/nasiyago_uz',
      require_passport: 'false',
      free_delivery_tashkent: 'true',
    });
  }
}
