import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

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
      namaBarang: { contains: search, mode: 'insensitive' }
    };

    const [resep, total] = await Promise.all([
      prisma.resepDaurUlang.findMany({
        where: whereClause,
        include: {
          bahanBaku: {
            include: {
              jenisSampah: true
            }
          },
          stokBarang: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.resepDaurUlang.count({ where: whereClause })
    ]);

    const resepWithStatus = await Promise.all(resep.map(async (item) => {
      let canProduce = true;
      let bahanInfo = [];

      for (const bahan of item.bahanBaku) {
        const stokSampah = await prisma.laporanSampah.aggregate({
          where: {
            wilayahId: admin.wilayahId,
            jenisSampahId: bahan.jenisSampahId,
            status: 'MENUNGGU'
          },
          _sum: { kuantitas: true }
        });

        const tersedia = stokSampah._sum.kuantitas || 0;
        const dibutuhkan = bahan.jumlah;
        bahanInfo.push({
          nama: bahan.jenisSampah.namaJenis,
          tersedia,
          dibutuhkan,
          cukup: tersedia >= dibutuhkan
        });

        if (tersedia < dibutuhkan) {
          canProduce = false;
        }
      }

      return {
        ...item,
        canProduce,
        bahanInfo
      };
    }));

    return NextResponse.json({
      data: resepWithStatus,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });

  } catch (error) {
    console.error('Error get produksi:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  } finally {
    // disconnect removed
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
    const { resepId, jumlah } = body;

    if (!resepId || !jumlah || jumlah < 1) {
      return NextResponse.json(
        { message: 'Resep ID dan jumlah wajib diisi' },
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
      // 1. Ambil resep + bahan baku
      const resep = await tx.resepDaurUlang.findUnique({
        where: { id: resepId },
        include: {
          bahanBaku: {
            include: {
              jenisSampah: true
            }
          }
        }
      });

      if (!resep) {
        throw new Error('Resep tidak ditemukan');
      }

      // 2. Cek stok bahan baku
      for (const bahan of resep.bahanBaku) {
        const stokSampah = await tx.laporanSampah.aggregate({
          where: {
            wilayahId: admin.wilayahId,
            jenisSampahId: bahan.jenisSampahId,
            status: 'MENUNGGU'
          },
          _sum: { kuantitas: true }
        });

        const tersedia = stokSampah._sum.kuantitas || 0;
        const dibutuhkan = bahan.jumlah * jumlah;

        if (tersedia < dibutuhkan) {
          throw new Error(`Stok ${bahan.jenisSampah.namaJenis} tidak mencukupi`);
        }
      }

      // 3. Kurangi stok sampah
      for (const bahan of resep.bahanBaku) {
        const dibutuhkan = bahan.jumlah * jumlah;
        let sisaDibutuhkan = dibutuhkan;

        const laporan = await tx.laporanSampah.findMany({
          where: {
            wilayahId: admin.wilayahId,
            jenisSampahId: bahan.jenisSampahId,
            status: 'MENUNGGU'
          },
          orderBy: { tanggalLapor: 'asc' }
        });

        for (const laporanItem of laporan) {
          if (sisaDibutuhkan <= 0) break;

          const kurangi = Math.min(laporanItem.kuantitas, sisaDibutuhkan);
          await tx.laporanSampah.update({
            where: { id: laporanItem.id },
            data: {
              kuantitas: laporanItem.kuantitas - kurangi,
              berat: laporanItem.berat - (kurangi * laporanItem.berat / laporanItem.kuantitas)
            }
          });

          if (laporanItem.kuantitas - kurangi === 0) {
            await tx.laporanSampah.delete({
              where: { id: laporanItem.id }
            });
          }

          sisaDibutuhkan -= kurangi;
        }
      }

      // 🔥 4. Buat barang produksi dengan jumlah yg BENAR
      const barang = await tx.barangDaurUlang.create({
        data: {
          resepId: resepId,
          adminId: session.user.id,
          wilayahId: admin.wilayahId,
          jumlah: jumlah, // 🔥 PASTIKAN JUMLAHNYA TERISI
          statusKirim: 'MENUNGGU'
        }
      });

      return barang;
    });

    return NextResponse.json({
      message: 'Produksi berhasil!',
      barang: result
    }, { status: 200 });

  } catch (error) {
    console.error('Error produksi:', error);
    return NextResponse.json(
      { message: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  } finally {
    // disconnect removed
  }
}