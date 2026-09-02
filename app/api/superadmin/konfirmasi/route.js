import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { kirimanId, status, catatan } = body;

    if (!kirimanId || !status) {
      return NextResponse.json(
        { message: 'Data konfirmasi tidak lengkap' },
        { status: 400 }
      );
    }

    if (!['DISETUJUI', 'DITOLAK'].includes(status)) {
      return NextResponse.json(
        { message: 'Status tidak valid' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update kiriman
      const kiriman = await tx.kirimanAdmin.update({
        where: { id: kirimanId },
        data: {
          status: status,
          tanggalKonfirmasi: new Date(),
          catatanSuper: catatan || null
        }
      });

      // 2. Ambil barang kiriman
      const barangKiriman = await tx.barangKiriman.findMany({
        where: {
          kirimanId: kirimanId
        },
        include: {
          barangDaurUlang: {
            include: {
              resep: true
            }
          }
        }
      });

      // 3. Jika disetujui, tambah stok
      if (status === 'DISETUJUI') {
        for (const item of barangKiriman) {
          const existingStok = await tx.stokBarang.findUnique({
            where: { resepId: item.barangDaurUlang.resepId }
          });

          if (existingStok) {
            await tx.stokBarang.update({
              where: { resepId: item.barangDaurUlang.resepId },
              data: {
                jumlahStok: {
                  increment: item.jumlah
                }
              }
            });
          } else {
            await tx.stokBarang.create({
              data: {
                resepId: item.barangDaurUlang.resepId,
                jumlahStok: item.jumlah
              }
            });
          }
        }
      }

      // 4. Update status barang di barangKiriman
      await tx.barangKiriman.updateMany({
        where: { kirimanId: kirimanId },
        data: {
          // Tidak ada field status di BarangKiriman, jadi skip
        }
      });

      return kiriman;
    });

    return NextResponse.json({
      message: `Kiriman ${status === 'DISETUJUI' ? 'disetujui' : 'ditolak'}!`,
      kiriman: result
    }, { status: 200 });

  } catch (error) {
    console.error('Error konfirmasi:', error);
    return NextResponse.json(
      { message: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}