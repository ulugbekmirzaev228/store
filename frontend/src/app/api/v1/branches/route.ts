import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
    });
    return NextResponse.json(branches);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}
