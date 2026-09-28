import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { barangIds } = body;

    if (!barangIds || barangIds.length === 0) {
      return NextResponse.json(
        { message: 'Pilih barang yang akan dikirim' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const admin = await tx.user.findUnique({
        where: { id: session.user.id }
      });

      // 1. Buat kiriman
      const kiriman = await tx.kirimanAdmin.create({
        data: {
          adminId: session.user.id,
          wilayahId: admin.wilayahId,
          status: 'MENUNGGU_KONFIRMASI'
        }
      });

      // 2. Update barang
      await tx.barangDaurUlang.updateMany({
        where: {
          id: { in: barangIds },
          adminId: session.user.id,
          statusKirim: 'MENUNGGU'
        },
        data: {
          statusKirim: 'DIKIRIM',
          kirimanAdminId: kiriman.id
        }
      });

      return kiriman;
    });

    return NextResponse.json({
      message: 'Barang berhasil dikirim ke Superadmin!',
      kiriman: result
    }, { status: 200 });

  } catch (error) {
    console.error('Error kirim:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}