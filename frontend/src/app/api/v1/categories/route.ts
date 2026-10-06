import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}
