import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'USER') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, wilayahId } = body;

    if (!items || items.length === 0 || !wilayahId) {
      return NextResponse.json(
        { message: 'Data setoran tidak lengkap' },
        { status: 400 }
      );
    }

    let totalPoin = 0;
    const laporanData = [];

    for (const item of items) {
      const jenisSampah = await prisma.jenisSampah.findUnique({
        where: { id: item.jenisSampahId }
      });

      if (!jenisSampah) {
        return NextResponse.json(
          { message: `Jenis sampah ${item.jenisSampahId} tidak ditemukan` },
          { status: 404 }
        );
      }

      const poin = jenisSampah.poinPerUnit * item.kuantitas;
      totalPoin += poin;

      laporanData.push({
        userId: session.user.id,
        jenisSampahId: item.jenisSampahId,
        wilayahId: wilayahId,
        berat: jenisSampah.beratPerUnit * item.kuantitas,
        kuantitas: item.kuantitas,
        koinDiberikan: poin,
        status: 'MENUNGGU'
      });
    }

    // Buat laporan menggunakan transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat laporan
      const laporan = await tx.laporanSampah.createMany({
        data: laporanData
      });

      // 2. Tambah poin ke user
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          koin: {
            increment: totalPoin
          }
        }
      });

      // 3. Catat riwayat koin
      await tx.riwayatKoin.create({
        data: {
          userId: session.user.id,
          jumlah: totalPoin,
          keterangan: `Setor ${items.length} jenis sampah ke wilayah ${wilayahId}`
        }
      });

      return { updatedUser, totalPoin };
    });

    return NextResponse.json({
      message: 'Setor sampah berhasil!',
      totalPoin: result.totalPoin,
      user: {
        id: result.updatedUser.id,
        koin: result.updatedUser.koin
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error setor sampah:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}