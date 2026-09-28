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
    let totalBerat = 0;
    const laporanData = [];

    for (const item of items) {
      const jenisSampah = await prisma.jenisSampah.findUnique({
        where: { id: item.id }
      });

      if (!jenisSampah) {
        return NextResponse.json(
          { message: `Jenis sampah tidak ditemukan` },
          { status: 404 }
        );
      }

      const poin = jenisSampah.poinPerUnit * item.kuantitas;
      const berat = (jenisSampah.beratPerUnit || 0) * item.kuantitas;
      totalPoin += poin;
      totalBerat += berat;

      laporanData.push({
        userId: session.user.id,
        jenisSampahId: item.id,
        wilayahId: wilayahId,
        berat: berat,
        kuantitas: item.kuantitas,
        koinDiberikan: poin,
        status: 'MENUNGGU'
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.laporanSampah.createMany({
        data: laporanData
      });

      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          koin: {
            increment: totalPoin
          }
        }
      });

      await tx.riwayatKoin.create({
        data: {
          userId: session.user.id,
          jumlah: totalPoin,
          keterangan: `Setor ${items.length} jenis sampah ke wilayah ${wilayahId}`
        }
      });

      return { updatedUser, totalPoin, totalBerat };
    });

    return NextResponse.json({
      message: 'Setor sampah berhasil!',
      totalPoin: result.totalPoin,
      totalBerat: result.totalBerat,
      user: {
        id: result.updatedUser.id,
        koin: result.updatedUser.koin
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error setor sampah:', error);
    return NextResponse.json(
      { message: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}