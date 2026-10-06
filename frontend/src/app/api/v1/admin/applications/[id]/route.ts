import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { verifyAdminToken } from '../../../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminToken(req);
  if (!auth) {
    return NextResponse.json({ message: 'Avtorizatsiyadan oʻtilmagan' }, { status: 401 });
  }

  try {
    const { id } = params;
    const { status, assignedManagerId, internalNotes, comment } = await req.json();

    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Ariza topilmadi' }, { status: 404 });
    }

    const updateData: any = {};
    if (status && status !== existing.status) updateData.status = status;
    if (assignedManagerId !== undefined) updateData.assignedManagerId = assignedManagerId;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: updateData,
        include: {
          assignedManager: { select: { id: true, name: true } },
          items: { include: { product: true, variant: true } },
        },
      });

      if (status && status !== existing.status) {
        await tx.applicationStatusLog.create({
          data: {
            applicationId: id,
            oldStatus: existing.status,
            newStatus: status,
            changedById: auth.id || null,
            comment: comment || `Status oʻzgartirildi: ${existing.status} -> ${status}`,
          },
        });
      }

      return app;
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
