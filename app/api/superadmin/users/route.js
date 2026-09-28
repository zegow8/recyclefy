import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { nama: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      },
      include: {
        wilayah: true,
        laporanSampah: true,
        transaksiBeli: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.nama,
      email: user.email,
      role: user.role,
      wilayah: user.wilayah?.namaWilayah || '-',
      totalSetor: user.laporanSampah.length,
      totalTransaksi: user.transaksiBeli.length,
      poin: user.koin,
      noHp: user.noHp,
      alamat: user.alamat
    }));

    return NextResponse.json(formattedUsers, { status: 200 });

  } catch (error) {
    console.error('Error get users:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

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

    // Cek jangan hapus superadmin
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Tidak bisa menghapus Super Admin' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'User berhasil dihapus' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error delete user:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}