import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// ==========================================
// GET - Ambil semua resep
// ==========================================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resep = await prisma.resepDaurUlang.findMany({
      include: {
        bahanBaku: {
          include: {
            jenisSampah: true
          }
        },
        stokBarang: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(resep, { status: 200 });

  } catch (error) {
    console.error('Error get resep:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// ==========================================
// POST - Tambah resep baru
// ==========================================
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { namaBarang, deskripsi, gambarBarang, hargaKoin, bahanBaku } = body;

    // Validasi
    if (!namaBarang || !hargaKoin || !bahanBaku || bahanBaku.length === 0) {
      return NextResponse.json(
        { message: 'Nama barang, harga, dan bahan baku wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi setiap bahan baku
    for (const b of bahanBaku) {
      if (!b.jenisSampahId || !b.jumlah || b.jumlah < 1) {
        return NextResponse.json(
          { message: 'Data bahan baku tidak lengkap' },
          { status: 400 }
        );
      }
    }

    // Cek duplikat nama barang
    const existing = await prisma.resepDaurUlang.findFirst({
      where: { namaBarang }
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Nama barang sudah ada' },
        { status: 400 }
      );
    }

    // Buat resep dengan transaction
    const resep = await prisma.$transaction(async (tx) => {
      // 1. Buat resep
      const newResep = await tx.resepDaurUlang.create({
        data: {
          namaBarang,
          deskripsi: deskripsi || null,
          gambarBarang: gambarBarang || null,
          hargaKoin: parseInt(hargaKoin),
        }
      });

      // 2. Buat bahan baku
      await tx.bahanBakuResep.createMany({
        data: bahanBaku.map(b => ({
          resepId: newResep.id,
          jenisSampahId: b.jenisSampahId,
          jumlah: parseInt(b.jumlah)
        }))
      });

      // 3. Buat stok barang otomatis
      await tx.stokBarang.create({
        data: {
          resepId: newResep.id,
          jumlahStok: 0
        }
      });

      return newResep;
    });

    return NextResponse.json({
      message: 'Resep berhasil disimpan!',
      resep
    }, { status: 201 });

  } catch (error) {
    console.error('Error create resep:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT - Update resep (termasuk edit bahan baku)
// ==========================================
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
    const { id, namaBarang, deskripsi, gambarBarang, hargaKoin, bahanBaku } = body;

    // Validasi
    if (!id) {
      return NextResponse.json(
        { message: 'ID wajib diisi' },
        { status: 400 }
      );
    }

    if (!namaBarang || !hargaKoin || !bahanBaku || bahanBaku.length === 0) {
      return NextResponse.json(
        { message: 'Nama barang, harga, dan bahan baku wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi setiap bahan baku
    for (const b of bahanBaku) {
      if (!b.jenisSampahId || !b.jumlah || b.jumlah < 1) {
        return NextResponse.json(
          { message: 'Data bahan baku tidak lengkap' },
          { status: 400 }
        );
      }
    }

    // Cek apakah resep ada
    const existingResep = await prisma.resepDaurUlang.findUnique({
      where: { id }
    });

    if (!existingResep) {
      return NextResponse.json(
        { message: 'Resep tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update resep dengan transaction
    const resep = await prisma.$transaction(async (tx) => {
      // 1. Update resep
      const updated = await tx.resepDaurUlang.update({
        where: { id },
        data: {
          namaBarang,
          deskripsi: deskripsi || null,
          gambarBarang: gambarBarang || null,
          hargaKoin: parseInt(hargaKoin),
        }
      });

      // 2. Hapus bahan baku lama
      await tx.bahanBakuResep.deleteMany({
        where: { resepId: id }
      });

      // 3. Buat bahan baku baru
      await tx.bahanBakuResep.createMany({
        data: bahanBaku.map(b => ({
          resepId: id,
          jenisSampahId: b.jenisSampahId,
          jumlah: parseInt(b.jumlah)
        }))
      });

      return updated;
    });

    return NextResponse.json({
      message: 'Resep berhasil diupdate!',
      resep
    }, { status: 200 });

  } catch (error) {
    console.error('Error update resep:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Resep tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE - Hapus resep
// ==========================================
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'ID wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah resep ada
    const existingResep = await prisma.resepDaurUlang.findUnique({
      where: { id },
      include: {
        barangDaurUlang: true,
        transaksiBeli: true
      }
    });

    if (!existingResep) {
      return NextResponse.json(
        { message: 'Resep tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek apakah resep sudah digunakan
    if (existingResep.barangDaurUlang.length > 0 || existingResep.transaksiBeli.length > 0) {
      return NextResponse.json(
        { message: 'Resep tidak bisa dihapus karena sudah digunakan' },
        { status: 400 }
      );
    }

    // Hapus resep dengan transaction
    await prisma.$transaction(async (tx) => {
      // 1. Hapus stok
      await tx.stokBarang.delete({
        where: { resepId: id }
      });

      // 2. Hapus bahan baku
      await tx.bahanBakuResep.deleteMany({
        where: { resepId: id }
      });

      // 3. Hapus resep
      await tx.resepDaurUlang.delete({
        where: { id }
      });
    });

    return NextResponse.json({
      message: 'Resep berhasil dihapus!'
    }, { status: 200 });

  } catch (error) {
    console.error('Error delete resep:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Resep tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}