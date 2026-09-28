import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
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
      return NextResponse.json({
        sampahHariIni: 0,
        totalSampah: 0,
        barangProduksi: 0,
        menungguAcc: 0,
        sudahDiAcc: 0,
        userSetor: [],
        barangNungguAcc: [],
        totalUserSetor: 0,
        topJenisSampah: []
      }, { status: 200 });
    }

    const wilayahId = admin.wilayahId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Sampah masuk hari ini
    const sampahHariIni = await prisma.laporanSampah.aggregate({
      where: {
        wilayahId,
        tanggalLapor: {
          gte: today,
          lt: tomorrow
        },
        status: 'MENUNGGU'
      },
      _sum: { berat: true }
    });

    // 2. Total sampah
    const totalSampah = await prisma.laporanSampah.aggregate({
      where: {
        wilayahId,
        status: 'MENUNGGU'
      },
      _sum: { berat: true }
    });

    // 3. Barang produksi (belum dikirim)
    const barangProduksi = await prisma.barangDaurUlang.count({
      where: {
        wilayahId,
        statusKirim: 'MENUNGGU'
      }
    });

    // 4. Menunggu ACC superadmin
    const menungguAcc = await prisma.kirimanAdmin.count({
      where: {
        wilayahId,
        status: 'MENUNGGU_KONFIRMASI'
      }
    });

    // 5. Sudah di-ACC
    const sudahDiAcc = await prisma.kirimanAdmin.count({
      where: {
        wilayahId,
        status: 'DISETUJUI'
      }
    });

    // 6. User setor terbaru
    const userSetor = await prisma.laporanSampah.findMany({
      where: {
        wilayahId,
        status: 'MENUNGGU'
      },
      include: {
        user: true,
        jenisSampah: true
      },
      orderBy: { tanggalLapor: 'desc' },
      take: 10
    });

    // 7. Barang nunggu ACC
    const barangNungguAcc = await prisma.barangKiriman.findMany({
      where: {
        kirimanAdmin: {
          wilayahId: wilayahId,
          status: 'MENUNGGU_KONFIRMASI'
        }
      },
      include: {
        kirimanAdmin: true,
        barangDaurUlang: {
          include: {
            resep: true
          }
        }
      },
      orderBy: { kirimanAdmin: { tanggalKirim: 'desc' } },
      take: 10
    });

    // Format user setor
    const formattedUserSetor = userSetor.map(item => ({
      id: item.id,
      user: item.user.nama,
      jenis: item.jenisSampah.namaJenis,
      berat: item.berat,
      kuantitas: item.kuantitas,
      tanggal: item.tanggalLapor,
      poin: item.koinDiberikan
    }));

    // Format barang nunggu ACC
    const formattedBarangNunggu = barangNungguAcc.map(item => ({
      id: item.id,
      nama: item.barangDaurUlang?.resep?.namaBarang || 'Unknown',
      jumlah: item.jumlah || 0,
      tanggal: item.kirimanAdmin?.tanggalKirim || new Date(),
      status: item.kirimanAdmin?.status || 'MENUNGGU_KONFIRMASI'
    }));

    // 8. Total user setor
    const totalUserSetor = await prisma.laporanSampah.groupBy({
      by: ['userId'],
      where: { wilayahId },
      _count: true
    });

    // 9. Top 5 jenis sampah
    const topJenisSampah = await prisma.laporanSampah.groupBy({
      by: ['jenisSampahId'],
      where: { wilayahId },
      _sum: { kuantitas: true },
      orderBy: { _sum: { kuantitas: 'desc' } },
      take: 5
    });

    const topJenisWithName = await Promise.all(topJenisSampah.map(async (item) => {
      const jenis = await prisma.jenisSampah.findUnique({
        where: { id: item.jenisSampahId }
      });
      return {
        nama: jenis?.namaJenis || 'Unknown',
        total: item._sum.kuantitas || 0
      };
    }));

    return NextResponse.json({
      sampahHariIni: sampahHariIni._sum.berat || 0,
      totalSampah: totalSampah._sum.berat || 0,
      barangProduksi: barangProduksi || 0,
      menungguAcc: menungguAcc || 0,
      sudahDiAcc: sudahDiAcc || 0,
      userSetor: formattedUserSetor,
      barangNungguAcc: formattedBarangNunggu,
      totalUserSetor: totalUserSetor.length || 0,
      topJenisSampah: topJenisWithName
    }, { status: 200 });

  } catch (error) {
    console.error('Error get admin dashboard:', error);
    return NextResponse.json({
      sampahHariIni: 0,
      totalSampah: 0,
      barangProduksi: 0,
      menungguAcc: 0,
      sudahDiAcc: 0,
      userSetor: [],
      barangNungguAcc: [],
      totalUserSetor: 0,
      topJenisSampah: []
    }, { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
}