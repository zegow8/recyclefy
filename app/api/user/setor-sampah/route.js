import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'USER') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;

    const whereClause = {
      namaJenis: { contains: search, mode: 'insensitive' }
    };

    const [jenisSampah, total] = await Promise.all([
      prisma.jenisSampah.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { namaJenis: 'asc' }
      }),
      prisma.jenisSampah.count({ where: whereClause })
    ]);

    return NextResponse.json({
      data: jenisSampah,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });

  } catch (error) {
    console.error('Error get setor sampah:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}