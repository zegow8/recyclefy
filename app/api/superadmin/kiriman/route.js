import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json([], { status: 401 });
    }

    const kiriman = await prisma.kirimanAdmin.findMany({
      where: { 
        status: 'MENUNGGU_KONFIRMASI' 
      },
      include: {
        wilayah: true,
        admin: true,
        barangKiriman: {
          include: {
            barangDaurUlang: {
              include: {
                resep: true
              }
            }
          }
        }
      },
      orderBy: { tanggalKirim: 'asc' }
    });

    // Format data biar aman
    const formattedData = kiriman.map(item => ({
      id: item.id,
      wilayah: item.wilayah,
      admin: item.admin,
      tanggalKirim: item.tanggalKirim,
      barangKiriman: item.barangKiriman?.map(bk => ({
        id: bk.id,
        jumlah: bk.jumlah,
        resep: bk.barangDaurUlang?.resep || null
      })) || []
    }));

    return NextResponse.json(formattedData, { status: 200 });

  } catch (error) {
    console.error('Error get kiriman:', error);
    return NextResponse.json([], { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
}