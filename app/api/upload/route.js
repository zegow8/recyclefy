import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // Cek session (hanya user yang login)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized - Silakan login terlebih dahulu' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'Tidak ada file yang diupload' },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Hanya file gambar yang diperbolehkan (JPEG, PNG, WEBP, GIF)' },
        { status: 400 }
      );
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      );
    }

    // Baca file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama file unik
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const originalName = file.name.replace(/\s/g, '_');
    const extension = path.extname(originalName);
    const filename = `${timestamp}_${randomString}${extension}`;
    
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filePath = path.join(uploadDir, filename);

    // Buat folder kalo belum ada
    await mkdir(uploadDir, { recursive: true });

    // Simpan file
    await writeFile(filePath, buffer);

    // Return URL gambar
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      message: 'File berhasil diupload'
    }, { status: 200 });

  } catch (error) {
    console.error('Error upload:', error);
    return NextResponse.json(
      { message: 'Gagal upload file' },
      { status: 500 }
    );
  }
}