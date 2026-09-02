import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'USER') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nama: true,
        email: true,
        noHp: true,
        alamat: true,
        koin: true,
        role: true
      }
    });

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error('Error get profile:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'USER') {
      return NextResponse.json(
        { message: 'Unauthorized' },
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
      nama,
      noHp,
      alamat
    };

    if (password && password.length >= 6) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        nama: true,
        email: true,
        noHp: true,
        alamat: true,
        koin: true,
        role: true
      }
    });

    return NextResponse.json({
      message: 'Profile berhasil diupdate!',
      user: updatedUser
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