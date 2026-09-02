'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    nama: '',
    noHp: '',
    alamat: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setForm({
        nama: session.user.name || '',
        noHp: session.user.noHp || '',
        alamat: session.user.alamat || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak cocok!');
      setLoading(false);
      return;
    }

    if (form.password && form.password.length < 6) {
      toast.error('Password minimal 6 karakter!');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.nama,
          noHp: form.noHp,
          alamat: form.alamat,
          password: form.password || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success('Profile berhasil diupdate!');
      await update();
      
      setForm(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

      router.refresh();
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
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
            <Link href="/user/home">Home</Link>
            <Link href="/user/aktivitas">Aktivitas</Link>
            <Link href="/user/toko">Toko</Link>
            <Link href="/user/setor">Setor Sampah</Link>
            <Link href="/user/riwayat-setor">Riwayat Setor</Link>
            <Link href="/user/riwayat-beli">Riwayat Beli</Link>
            <Link href="/user/profile" className="active">Profile</Link>
          </div>
          <div className="navbar-user">
            <span className="badge-koin">🪙 {session.user.koin || 0}</span>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <h1 className="page-title">👤 Profile Saya</h1>

          <div className="profile-card">
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="profile-grid">
                <div className="profile-left">
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input
                      type="text"
                      value={form.nama}
                      onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      required
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={session.user.email || ''}
                      disabled
                      className="disabled"
                    />
                    <small>Email tidak dapat diubah</small>
                  </div>

                  <div className="form-group">
                    <label>Nomor Telepon</label>
                    <input
                      type="tel"
                      value={form.noHp}
                      onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                      required
                      placeholder="Contoh: 081234567890"
                    />
                  </div>

                  <div className="form-group">
                    <label>Alamat</label>
                    <textarea
                      value={form.alamat}
                      onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                      required
                      rows={3}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>
                </div>

                <div className="profile-right">
                  <div className="form-divider">
                    <h3>Ganti Password</h3>
                    <p>Kosongkan jika tidak ingin mengubah password</p>
                  </div>

                  <div className="form-group">
                    <label>Password Baru</label>
                    <input
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      minLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label>Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      placeholder="Ketik ulang password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
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
          background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #E0E0E0;
          border-top: 4px solid #66BB6A;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 20px rgba(102, 187, 106, 0.2);
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
          border-bottom: 3px solid #66BB6A;
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
          filter: drop-shadow(0 2px 4px rgba(102, 187, 106, 0.2));
        }

        .nav-logo:hover {
          transform: scale(1.05) rotate(-4deg);
          filter: drop-shadow(0 4px 12px rgba(102, 187, 106, 0.3));
        }

        .navbar-brand h1 {
          font-size: 24px;
          font-weight: 800;
          color: #1B5E20;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 0px rgba(102, 187, 106, 0.1);
        }

        .navbar-brand h1 span {
          color: #66BB6A;
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
          background: linear-gradient(135deg, #66BB6A, #43A047);
          color: #FFFFFF;
          font-weight: 700;
          box-shadow: 
            0 3px 0px 0px rgba(0, 0, 0, 0.2),
            0 4px 12px rgba(102, 187, 106, 0.3);
          transform: translateY(-1px);
        }

        .navbar-menu a:not(.active):hover {
          background: #E8F5E9;
          color: #1B5E20;
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
          background: linear-gradient(90deg, #66BB6A, #4CAF50);
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

        .badge-koin {
          background: linear-gradient(135deg, #FFC107, #FFB300);
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 14px;
          color: #1B5E20;
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .badge-koin:hover {
          transform: scale(1.02);
          box-shadow: 0 3px 0px 0px rgba(0, 0, 0, 0.15);
        }

        .btn-logout {
          background: linear-gradient(135deg, #EF5350, #D32F2F);
          color: #FFFFFF;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.15);
        }

        .btn-logout:hover {
          background: linear-gradient(135deg, #D32F2F, #B71C1C);
          transform: translateY(-2px);
          box-shadow: 0 4px 0px 0px rgba(0, 0, 0, 0.2);
        }

        .main-content {
          min-height: calc(100vh - 200px);
          padding: 30px 0;
          background: #FAFAFA;
        }

        .page-title {
          font-size: 30px;
          font-weight: 800;
          color: #1B5E20;
          margin-bottom: 28px;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 0px rgba(102, 187, 106, 0.06);
        }

        .profile-card {
          max-width: 820px;
          margin: 0 auto;
          background: #FFFFFF;
          border-radius: 16px;
          padding: 36px;
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 12px 32px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(102, 187, 106, 0.06);
          transition: all 0.3s ease;
        }

        .profile-card:hover {
          box-shadow: 
            8px 8px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
        }

        .profile-left,
        .profile-right {
          display: flex;
          flex-direction: column;
          gap: 18px;
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
          font-family: inherit;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #BDBDBD;
          font-weight: 400;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #66BB6A;
          background: #FFFFFF;
          box-shadow: 
            0 0 0 4px rgba(102, 187, 106, 0.1),
            4px 4px 0px 0px rgba(0, 0, 0, 0.06);
          transform: scale(1.01);
          outline: none;
        }

        .form-group input:hover:not(:focus):not(.disabled),
        .form-group textarea:hover:not(:focus) {
          border-color: #A5D6A7;
          background: #FFFFFF;
        }

        .form-group input.disabled {
          background: #F5F5F5;
          color: #757575;
          cursor: not-allowed;
          opacity: 0.7;
          border-color: #E8E8E8;
        }

        .form-group small {
          font-size: 12px;
          color: #757575;
          font-weight: 500;
        }

        .form-divider {
          border-bottom: 2px solid #E8E8E8;
          padding-bottom: 14px;
          margin-bottom: 4px;
        }

        .form-divider h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 4px;
        }

        .form-divider p {
          font-size: 13px;
          color: #757575;
          font-weight: 500;
        }

        .btn-save {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #66BB6A, #43A047);
          color: #FFFFFF;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          margin-top: 10px;
          box-shadow: 0 3px 0px 0px rgba(0, 0, 0, 0.12);
          letter-spacing: 0.5px;
        }

        .btn-save:hover:not(:disabled) {
          background: linear-gradient(135deg, #4CAF50, #2E7D32);
          transform: translateY(-3px);
          box-shadow: 0 6px 0px 0px rgba(0, 0, 0, 0.16);
        }

        .btn-save:active:not(:disabled) {
          transform: translateY(0px);
          box-shadow: 0 3px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .navbar-menu {
            display: none;
          }

          .profile-card {
            padding: 24px;
          }

          .page-title {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .profile-card {
            padding: 18px;
          }

          .profile-left,
          .profile-right {
            gap: 14px;
          }

          .form-group input,
          .form-group textarea {
            padding: 10px 14px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}