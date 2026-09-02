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

    const whereClause = {
      wilayahId: admin.wilayahId,
      statusKirim: 'MENUNGGU',
      resep: {
        namaBarang: { contains: search, mode: 'insensitive' }
      }
    };

    const [barang, total] = await Promise.all([
      prisma.barangDaurUlang.findMany({
        where: whereClause,
        include: {
          resep: true
        },
        skip,
        take: limit,
        orderBy: { tanggalProduksi: 'desc' }
      }),
      prisma.barangDaurUlang.count({ where: whereClause })
    ]);

    const formattedData = barang.map(item => ({
      id: item.id,
      nama: item.resep.namaBarang,
      gambar: item.resep.gambarBarang || null,
      stok: item.jumlah,
      harga: item.resep.hargaKoin,
      tanggal: item.tanggalProduksi
    }));

    return NextResponse.json({
      data: formattedData,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });

  } catch (error) {
    console.error('Error get barang produksi:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

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
    const { barangIds, jumlahKirim } = body;

    if (!barangIds || barangIds.length === 0 || !jumlahKirim || jumlahKirim < 1) {
      return NextResponse.json(
        { message: 'Data kiriman tidak lengkap' },
        { status: 400 }
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

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil barang yang akan dikirim
      const barangList = await tx.barangDaurUlang.findMany({
        where: {
          id: { in: barangIds },
          wilayahId: admin.wilayahId,
          statusKirim: 'MENUNGGU'
        },
        include: {
          resep: true
        }
      });

      if (barangList.length === 0) {
        throw new Error('Barang tidak ditemukan atau sudah dikirim');
      }

      // 2. Buat kiriman admin
      const kiriman = await tx.kirimanAdmin.create({
        data: {
          adminId: session.user.id,
          wilayahId: admin.wilayahId,
          status: 'MENUNGGU_KONFIRMASI'
        }
      });

      let totalDikirim = 0;

      for (const barang of barangList) {
        const kirim = Math.min(barang.jumlah, jumlahKirim);
        if (kirim > 0) {
          // 🔥 UPDATE STATUS KIRIM (jumlah TETAP, ga diubah)
          await tx.barangDaurUlang.update({
            where: { id: barang.id },
            data: {
              statusKirim: 'DIKIRIM'
            }
          });
          
          // 🔥 BUAT ENTRY DI BARANG KIRIMAN
          await tx.barangKiriman.create({
            data: {
              kirimanId: kiriman.id,
              barangDaurUlangId: barang.id,
              jumlah: kirim
            }
          });
          
          totalDikirim += kirim;
        }
      }

      return { kiriman, totalDikirim };
    });

    return NextResponse.json({
      message: `${result.totalDikirim} unit berhasil dikirim ke Superadmin!`,
      kiriman: result.kiriman
    }, { status: 200 });

  } catch (error) {
    console.error('Error kirim barang:', error);
    return NextResponse.json(
      { message: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}