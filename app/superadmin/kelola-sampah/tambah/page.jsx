'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function TambahJenisSampah() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    namaJenis: '',
    gambarUrl: '',
    beratPerUnit: '',
    poinPerUnit: '',
    deskripsi: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.role === 'USER') {
      router.push('/user/home');
    }
    if (session?.user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      
      setForm({ ...form, gambarUrl: result.imageUrl });
      toast.success('Gambar berhasil diupload');
    } catch (error) {
      toast.error(error.message || 'Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm({ ...form, gambarUrl: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.namaJenis || !form.poinPerUnit) {
      toast.error('Nama jenis dan poin wajib diisi');
      return;
    }

    try {
      const res = await fetch('/api/superadmin/jenis-sampah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success(result.message || 'Berhasil menyimpan');
      router.push('/superadmin/kelola-sampah');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (status === 'loading') {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Memuat...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container container">
          <div className="navbar-brand">
            <Image 
              src="/uploads/recyclefy-logo.png" 
              alt="Recyclefy Logo" 
              width={32} 
              height={32} 
              className="nav-logo"
            />
            <h1>Recycle<span>fy</span></h1>
          </div>
          <div className="navbar-menu">
            <Link href="/superadmin/dashboard">Dashboard</Link>
            <Link href="/superadmin/user">User</Link>
            <Link href="/superadmin/kelola-sampah" className="active">Kelola Sampah</Link>
            <Link href="/superadmin/kelola-resep">Kelola Resep</Link>
            <Link href="/superadmin/kelola-wilayah">Kelola Wilayah</Link>
            <Link href="/superadmin/manajemen-stok">Stok</Link>
            <Link href="/superadmin/riwayat-transaksi">Transaksi</Link>
          </div>
          <div className="navbar-user">
            <span className="badge-role">👑 Super Admin</span>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <div className="form-card">
            <div className="form-header">
              <h1 className="form-title">➕ Tambah Jenis Sampah</h1>
              <Link href="/superadmin/kelola-sampah" className="btn-back">← Kembali</Link>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label>Nama Jenis *</label>
                <input
                  type="text"
                  value={form.namaJenis}
                  onChange={(e) => setForm({ ...form, namaJenis: e.target.value })}
                  required
                  placeholder="Contoh: Botol Plastik"
                />
              </div>

              <div className="form-group">
                <label>Poin per Unit *</label>
                <input
                  type="number"
                  value={form.poinPerUnit}
                  onChange={(e) => setForm({ ...form, poinPerUnit: e.target.value })}
                  required
                  placeholder="3"
                />
              </div>

              <div className="form-group">
                <label>Berat per Unit (gram)</label>
                <input
                  type="number"
                  value={form.beratPerUnit}
                  onChange={(e) => setForm({ ...form, beratPerUnit: e.target.value })}
                  placeholder="5"
                />
              </div>

              <div className="form-group full-width">
                <label>Gambar Sampah</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="file-input"
                />
                {uploading && <small className="uploading-text">Mengupload...</small>}
                {form.gambarUrl && (
                  <div className="preview-image">
                    <img src={form.gambarUrl} alt="Preview" />
                    <button type="button" className="remove-image" onClick={removeImage}>✕</button>
                  </div>
                )}
              </div>

              <div className="form-group full-width">
                <label>Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={3}
                  placeholder="Deskripsi jenis sampah..."
                />
              </div>

              <div className="form-actions full-width">
                <Link href="/superadmin/kelola-sampah" className="btn-cancel">
                  Batal
                </Link>
                <button type="submit" className="btn-save" disabled={uploading}>
                  {uploading ? 'Mengupload...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #FFF5F5 0%, #FFEBEE 100%);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #E0E0E0;
          border-top: 4px solid #D32F2F;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 20px rgba(211, 47, 47, 0.15);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .navbar {
          background: #FFFFFF;
          box-shadow: 
            0 4px 0px 0px rgba(0, 0, 0, 0.15),
            0 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 8px 24px rgba(0, 0, 0, 0.08);
          padding: 12px 0;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 3px solid #D32F2F;
          transition: all 0.3s ease;
        }

        .navbar:hover {
          box-shadow: 
            0 6px 0px 0px rgba(0, 0, 0, 0.15),
            0 8px 0px 0px rgba(0, 0, 0, 0.08),
            0 12px 32px rgba(0, 0, 0, 0.1);
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-logo {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          filter: drop-shadow(0 2px 4px rgba(211, 47, 47, 0.15));
        }

        .nav-logo:hover {
          transform: scale(1.05) rotate(-4deg);
          filter: drop-shadow(0 4px 12px rgba(211, 47, 47, 0.25));
        }

        .navbar-brand h1 {
          font-size: 24px;
          font-weight: 800;
          color: #1B5E20;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 0px rgba(211, 47, 47, 0.08);
        }

        .navbar-brand h1 span {
          color: #D32F2F;
        }

        .navbar-menu {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .navbar-menu a {
          font-size: 13px;
          font-weight: 600;
          color: #616161;
          padding: 8px 14px;
          border-radius: 10px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          letter-spacing: 0.3px;
        }

        .navbar-menu a.active {
          background: linear-gradient(135deg, #D32F2F, #B71C1C);
          color: #FFFFFF;
          font-weight: 700;
          box-shadow: 
            0 3px 0px 0px rgba(0, 0, 0, 0.2),
            0 4px 12px rgba(211, 47, 47, 0.3);
          transform: translateY(-1px);
        }

        .navbar-menu a:not(.active):hover {
          background: #FFEBEE;
          color: #D32F2F;
          transform: translateY(-2px);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.06);
        }

        .navbar-menu a:not(.active)::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          width: 0;
          height: 2.5px;
          background: linear-gradient(90deg, #D32F2F, #B71C1C);
          border-radius: 2px;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        .navbar-menu a:not(.active):hover::after {
          width: 50%;
        }

        .navbar-menu a.active::before {
          content: '●';
          position: absolute;
          top: -4px;
          right: -4px;
          font-size: 8px;
          color: #FFC107;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .badge-role {
          background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
          color: #D32F2F;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .badge-role:hover {
          transform: scale(1.02);
        }

        .btn-logout {
          background: linear-gradient(135deg, #D32F2F, #B71C1C);
          color: #FFFFFF;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.15);
        }

        .btn-logout:hover {
          background: linear-gradient(135deg, #B71C1C, #880E4F);
          transform: translateY(-2px);
          box-shadow: 0 4px 0px 0px rgba(0, 0, 0, 0.2);
        }

        .main-content {
          min-height: calc(100vh - 200px);
          padding: 30px 0;
          background: #FAFAFA;
        }

        .form-card {
          max-width: 700px;
          margin: 0 auto;
          background: #FFFFFF;
          border-radius: 16px;
          padding: 36px;
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 12px 32px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(211, 47, 47, 0.06);
          transition: all 0.3s ease;
        }

        .form-card:hover {
          box-shadow: 
            8px 8px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .form-title {
          font-size: 26px;
          font-weight: 800;
          color: #1B5E20;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 0px rgba(211, 47, 47, 0.06);
        }

        .btn-back {
          padding: 8px 20px;
          background: #FFFFFF;
          color: #424242;
          border: 2px solid #E0E0E0;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.08);
        }

        .btn-back:hover {
          background: #F5F5F5;
          transform: translateY(-2px);
          box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 700;
          font-size: 13px;
          color: #424242;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 16px;
          border: 2.5px solid #E8E8E8;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: #FAFAFA;
          color: #1B5E20;
          font-weight: 500;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #BDBDBD;
          font-weight: 400;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #D32F2F;
          background: #FFFFFF;
          box-shadow: 
            0 0 0 4px rgba(211, 47, 47, 0.1),
            4px 4px 0px 0px rgba(0, 0, 0, 0.06);
          transform: scale(1.01);
          outline: none;
        }

        .form-group input:hover:not(:focus),
        .form-group textarea:hover:not(:focus) {
          border-color: #FFCDD2;
          background: #FFFFFF;
        }

        .file-input {
          padding: 10px !important;
          cursor: pointer;
        }

        .file-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .uploading-text {
          color: #757575;
          font-size: 12px;
          font-weight: 500;
        }

        .preview-image {
          margin-top: 10px;
          position: relative;
          display: inline-block;
        }

        .preview-image img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 10px;
          border: 2.5px solid #E8E8E8;
          box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .preview-image img:hover {
          transform: scale(1.02);
          box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.08);
        }

        .remove-image {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #D32F2F;
          color: #FFFFFF;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
          cursor: pointer;
        }

        .remove-image:hover {
          transform: scale(1.1);
          box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.2);
        }

        .form-actions {
          display: flex;
          gap: 14px;
          margin-top: 12px;
        }

        .btn-cancel {
          padding: 12px 28px;
          background: #FFFFFF;
          color: #424242;
          border: 2.5px solid #E0E0E0;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.08);
          text-align: center;
        }

        .btn-cancel:hover {
          background: #F5F5F5;
          transform: translateY(-2px);
          box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .btn-save {
          padding: 12px 32px;
          background: #FFFFFF;
          color: #D32F2F;
          border: 2.5px solid #D32F2F;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.15);
        }

        .btn-save:hover:not(:disabled) {
          background: #D32F2F;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 0.2);
        }

        .btn-save:active:not(:disabled) {
          transform: translateY(0px);
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.15);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .navbar-menu {
            display: none;
          }

          .form-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .form-card {
            padding: 24px;
          }

          .form-title {
            font-size: 22px;
          }
        }

        @media (max-width: 480px) {
          .form-card {
            padding: 18px;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-save {
            width: 100%;
            text-align: center;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}