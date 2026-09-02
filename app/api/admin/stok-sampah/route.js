import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { wilayah: true }
    });

    if (!admin || !admin.wilayahId) {
      return NextResponse.json(
        { message: 'Admin tidak memiliki wilayah' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;

    // Get stok sampah dari laporan yang belum diproses
    const whereClause = {
      wilayahId: admin.wilayahId,
      status: 'MENUNGGU',
      jenisSampah: {
        namaJenis: { contains: search, mode: 'insensitive' }
      }
    };

    const [stok, total] = await Promise.all([
      prisma.laporanSampah.groupBy({
        by: ['jenisSampahId'],
        where: whereClause,
        _sum: {
          kuantitas: true,
          berat: true
        },
        orderBy: {
          _sum: {
            kuantitas: 'desc'
          }
        },
        skip,
        take: limit
      }),
      prisma.laporanSampah.groupBy({
        by: ['jenisSampahId'],
        where: whereClause
      })
    ]);

    // Get detail jenis sampah
    const stokWithDetail = await Promise.all(stok.map(async (item) => {
      const jenis = await prisma.jenisSampah.findUnique({
        where: { id: item.jenisSampahId }
      });

      // Hitung total berat
      const totalBerat = await prisma.laporanSampah.aggregate({
        where: {
          wilayahId: admin.wilayahId,
          jenisSampahId: item.jenisSampahId,
          status: 'MENUNGGU'
        },
        _sum: { berat: true }
      });

      return {
        id: item.jenisSampahId,
        nama: jenis?.namaJenis || 'Unknown',
        gambarUrl: jenis?.gambarUrl || null,
        stok: item._sum.kuantitas || 0,
        totalBerat: totalBerat._sum.berat || 0,
        poinPerUnit: jenis?.poinPerUnit || 0,
        beratPerUnit: jenis?.beratPerUnit || 0
      };
    }));

    return NextResponse.json({
      data: stokWithDetail,
      total: total.length,
      page,
      totalPages: Math.ceil(total.length / limit)
    }, { status: 200 });

  } catch (error) {
    console.error('Error get stok sampah:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}