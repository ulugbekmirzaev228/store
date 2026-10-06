import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export class SettingController {
  static async getPublicSettings(req: Request, res: Response) {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    res.json({
      site_name: settingsMap.site_name || 'NasiyaGo Electronics',
      logo_url: settingsMap.logo_url || null,
      phone_hotline: settingsMap.phone_hotline || '+998 71 200 44 00',
      telegram_channel: settingsMap.telegram_channel || 'https://t.me/nasiyago_uz',
      instagram: settingsMap.instagram || 'https://instagram.com/nasiyago_uz',
      require_passport: settingsMap.require_passport === 'true',
      free_delivery_tashkent: settingsMap.free_delivery_tashkent === 'true',
    });
  }
}
