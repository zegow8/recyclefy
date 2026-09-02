import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    const { resepId, jumlah, namaPenerima, noHpPenerima, alamatKirim } = body;

    if (!resepId || !jumlah || jumlah < 1) {
      return NextResponse.json(
        { message: 'Data pembelian tidak lengkap' },
        { status: 400 }
      );
    }

    if (!namaPenerima || !noHpPenerima || !alamatKirim) {
      return NextResponse.json(
        { message: 'Nama, no HP, dan alamat wajib diisi' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil resep
      const resep = await tx.resepDaurUlang.findUnique({
        where: { id: resepId }
      });

      if (!resep) {
        throw new Error('Produk tidak ditemukan');
      }

      // 2. Cek stok
      const stok = await tx.stokBarang.findUnique({
        where: { resepId }
      });

      if (!stok || stok.jumlahStok < jumlah) {
        throw new Error('Stok tidak mencukupi');
      }

      // 3. Cek koin user
      const user = await tx.user.findUnique({
        where: { id: session.user.id }
      });

      const totalKoin = resep.hargaKoin * jumlah;
      if (user.koin < totalKoin) {
        throw new Error('Poin tidak mencukupi');
      }

      // 4. Buat transaksi
      const transaksi = await tx.transaksiPembelian.create({
        data: {
          userId: session.user.id,
          resepId,
          jumlah,
          totalKoin,
          status: 'DIPESAN',
          alamatKirim,
          noHpPenerima,
          namaPenerima
        }
      });

      // 5. Kurangi koin user
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          koin: {
            decrement: totalKoin
          }
        }
      });

      // 6. Kurangi stok
      await tx.stokBarang.update({
        where: { resepId },
        data: {
          jumlahStok: {
            decrement: jumlah
          }
        }
      });

      // 7. Catat riwayat koin
      await tx.riwayatKoin.create({
        data: {
          userId: session.user.id,
          jumlah: -totalKoin,
          keterangan: `Beli ${resep.namaBarang} x${jumlah}`
        }
      });

      return { transaksi, updatedUser };
    });

    return NextResponse.json({
      message: 'Pembelian berhasil!',
      transaksi: result.transaksi,
      user: {
        id: result.updatedUser.id,
        koin: result.updatedUser.koin
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error checkout:', error);
    return NextResponse.json(
      { message: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}