import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(brands);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}
