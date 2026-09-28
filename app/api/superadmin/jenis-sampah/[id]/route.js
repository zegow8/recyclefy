import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const data = await prisma.jenisSampah.findUnique({
      where: { id }
    });

    if (!data) {
      return NextResponse.json(
        { message: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error get jenis sampah by id:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}