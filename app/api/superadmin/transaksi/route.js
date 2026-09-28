import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const transaksi = await prisma.transaksiPembelian.findMany({
      include: {
        user: true,
        resep: true
      },
      orderBy: { tanggalBeli: 'desc' }
    });

    const formattedTransaksi = transaksi.map(t => ({
      id: t.id,
      tanggal: t.tanggalBeli.toLocaleDateString('id-ID'),
      user: t.user.nama,
      produk: t.resep.namaBarang,
      gambar: t.resep.gambarBarang || '📦',
      jumlah: t.jumlah,
      total: t.totalKoin,
      status: t.status,
      alamatKirim: t.alamatKirim,
      noHpPenerima: t.noHpPenerima,
      namaPenerima: t.namaPenerima
    }));

    return NextResponse.json(formattedTransaksi, { status: 200 });

  } catch (error) {
    console.error('Error get transaksi:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Validasi status flow
    const currentTransaksi = await prisma.transaksiPembelian.findUnique({
      where: { id }
    });

    if (!currentTransaksi) {
      return NextResponse.json(
        { message: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    const statusOrder = ['DIPESAN', 'DIKIRIM', 'SELESAI'];
    const currentIndex = statusOrder.indexOf(currentTransaksi.status);
    const newIndex = statusOrder.indexOf(status);

    // Cuma boleh maju, ga boleh mundur
    if (newIndex < currentIndex) {
      return NextResponse.json(
        { message: 'Tidak bisa mengubah status ke status sebelumnya' },
        { status: 400 }
      );
    }

    // Kalo udah SELESAI ga bisa diubah lagi
    if (currentTransaksi.status === 'SELESAI') {
      return NextResponse.json(
        { message: 'Transaksi sudah selesai, tidak bisa diubah' },
        { status: 400 }
      );
    }

    const updated = await prisma.transaksiPembelian.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({
      message: `Status berhasil diubah ke ${status}`,
      transaksi: updated
    }, { status: 200 });

  } catch (error) {
    console.error('Error update transaksi:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}