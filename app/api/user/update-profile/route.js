import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized - Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nama, noHp, alamat, password } = body;

    if (!nama || !noHp || !alamat) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    const updateData = {
      nama: nama,
      noHp: noHp,
      alamat: alamat,
    };

    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Profile berhasil diupdate!',
      user: {
        id: updatedUser.id,
        name: updatedUser.nama,
        email: updatedUser.email,
        noHp: updatedUser.noHp,
        alamat: updatedUser.alamat,
        role: updatedUser.role,
        koin: updatedUser.koin,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error update profile:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Nomor telepon sudah terdaftar' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}