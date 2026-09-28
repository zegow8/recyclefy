import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Ambil semua jenis sampah
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const jenisSampah = await prisma.jenisSampah.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(jenisSampah, { status: 200 });
  } catch (error) {
    console.error('Error get jenis sampah:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// POST - Tambah jenis sampah
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
    const { namaJenis, gambarUrl, beratPerUnit, poinPerUnit, deskripsi } = body;

    if (!namaJenis || !poinPerUnit) {
      return NextResponse.json(
        { message: 'Nama jenis dan poin wajib diisi' },
        { status: 400 }
      );
    }

    // Cek duplikat
    const existing = await prisma.jenisSampah.findUnique({
      where: { namaJenis }
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Nama jenis sampah sudah ada' },
        { status: 400 }
      );
    }

    const jenisSampah = await prisma.jenisSampah.create({
      data: {
        namaJenis,
        gambarUrl: gambarUrl || null,
        beratPerUnit: beratPerUnit ? parseFloat(beratPerUnit) : null,
        poinPerUnit: parseInt(poinPerUnit),
        deskripsi: deskripsi || null,
      }
    });

    return NextResponse.json(jenisSampah, { status: 201 });
  } catch (error) {
    console.error('Error create jenis sampah:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// PUT - Update jenis sampah
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
    const { id, namaJenis, gambarUrl, beratPerUnit, poinPerUnit, deskripsi } = body;

    if (!id || !namaJenis || !poinPerUnit) {
      return NextResponse.json(
        { message: 'ID, nama jenis, dan poin wajib diisi' },
        { status: 400 }
      );
    }

    const jenisSampah = await prisma.jenisSampah.update({
      where: { id },
      data: {
        namaJenis,
        gambarUrl: gambarUrl || null,
        beratPerUnit: beratPerUnit ? parseFloat(beratPerUnit) : null,
        poinPerUnit: parseInt(poinPerUnit),
        deskripsi: deskripsi || null,
      }
    });

    return NextResponse.json(jenisSampah, { status: 200 });
  } catch (error) {
    console.error('Error update jenis sampah:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Jenis sampah tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus jenis sampah
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

    await prisma.jenisSampah.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Jenis sampah berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error delete jenis sampah:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Jenis sampah tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}