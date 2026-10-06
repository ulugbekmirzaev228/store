import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../../../lib/prisma';
import { verifyAdminToken } from '../../../../../../lib/server-auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminToken(req, ['ADMIN']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { name, email, phone, role, password, isActive } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name.trim();
    if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null;
    if (role && ['ADMIN', 'MANAGER', 'OPERATOR'].includes(role)) {
      dataToUpdate.role = role;
    }
    if (isActive !== undefined) {
      dataToUpdate.isActive = Boolean(isActive);
    }

    if (email && email.trim().toLowerCase() !== existing.email) {
      const cleanEmail = email.trim().toLowerCase();
      const duplicate = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (duplicate) {
        return NextResponse.json({ message: 'Bu email allaqachon boshqa foydalanuvchida mavjud' }, { status: 400 });
      }
      dataToUpdate.email = cleanEmail;
    }

    if (password && password.trim().length > 0) {
      dataToUpdate.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = verifyAdminToken(req, ['ADMIN']);
  if (!auth) {
    return NextResponse.json({ message: 'Ruxsat berilmagan' }, { status: 403 });
  }

  try {
    const { id } = params;

    // Prevent deleting self
    if (auth.id === id) {
      return NextResponse.json({ message: 'Oʻzingizning hisobingizni oʻchira olmaysiz' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ message: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'Foydalanuvchi muvaffaqiyatli oʻchirildi' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
