import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, email, noHp, alamat, password } = body;

    // Validasi
    if (!nama || !email || !noHp || !alamat || !password) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Cek email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Cek noHp sudah terdaftar
    const existingNoHp = await prisma.user.findUnique({
      where: { noHp }
    });

    if (existingNoHp) {
      return NextResponse.json(
        { message: 'Nomor telepon sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user
    const user = await prisma.user.create({
      data: {
        nama,
        email,
        noHp,
        alamat,
        password: hashedPassword,
        role: 'USER',
        koin: 0,
      }
    });

    return NextResponse.json(
      { 
        message: 'Registrasi berhasil', 
        user: { 
          id: user.id, 
          email: user.email, 
          nama: user.nama 
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error register:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}