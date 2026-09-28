import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json([], { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { wilayah: true }
    });

    if (!admin || !admin.wilayahId) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause = {
      wilayahId: admin.wilayahId
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.tanggalProduksi = {
        gte: start,
        lte: end
      };
    }

    // 🔥 AMBIL DARI BARANG_DAUR_ULANG AJA (yang statusnya DIKIRIM atau MENUNGGU)
    const riwayat = await prisma.barangDaurUlang.findMany({
      where: whereClause,
      include: {
        resep: true,
        barangKiriman: {
          include: {
            kirimanAdmin: true
          }
        }
      },
      orderBy: { tanggalProduksi: 'desc' }
    });

    // 🔥 FORMAT DATA - TAMPILIN SEMUA BARANG PRODUKSI, TERMASUK YANG UDAH DIKIRIM
    const formattedData = riwayat.map(item => {
      let status = 'Tersedia';
      
      // Cek apakah barang sudah dikirim ke superadmin
      if (item.barangKiriman.length > 0) {
        const kiriman = item.barangKiriman[0].kirimanAdmin;
        if (kiriman.status === 'MENUNGGU_KONFIRMASI') {
          status = 'Pending';
        } else if (kiriman.status === 'DISETUJUI') {
          status = 'Selesai';
        }
      }

      return {
        id: item.id,
        tanggal: item.tanggalProduksi,
        nama: item.resep.namaBarang,
        gambar: item.resep.gambarBarang || null,
        jumlah: item.jumlah,
        status: status
      };
    });

    // 🔥 TAMBAHKAN BARANG KIRIMAN YANG SUDAH DIKIRIM (PENDING/SELESAI)
    // TAPI HANYA YANG BELUM ADA DI FORMATTED DATA (CEK DUPLIKAT)
    const existingIds = new Set(formattedData.map(item => item.id));

    const kirimanItems = await prisma.barangKiriman.findMany({
      where: {
        kirimanAdmin: {
          wilayahId: admin.wilayahId
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
      orderBy: { kirimanAdmin: { tanggalKirim: 'desc' } }
    });

    // 🔥 TAMBAHKAN KIRIMAN YANG BELUM ADA DI FORMATTED DATA
    for (const item of kirimanItems) {
      // Cek apakah barang ini sudah ada di formattedData (berdasarkan ID barangDaurUlang)
      const existing = formattedData.find(f => f.id === item.barangDaurUlangId);
      if (!existing) {
        let status = 'Pending';
        if (item.kirimanAdmin.status === 'DISETUJUI') {
          status = 'Selesai';
        }

        formattedData.push({
          id: `kiriman_${item.id}`,
          tanggal: item.kirimanAdmin.tanggalKirim,
          nama: item.barangDaurUlang?.resep?.namaBarang || 'Unknown',
          gambar: item.barangDaurUlang?.resep?.gambarBarang || null,
          jumlah: item.jumlah,
          status: status
        });
      }
    }

    // 🔥 URUTKAN BERDASARKAN TANGGAL (TERBARU DULUAN)
    formattedData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    return NextResponse.json(formattedData, { status: 200 });

  } catch (error) {
    console.error('Error get riwayat produksi:', error);
    return NextResponse.json([], { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
}