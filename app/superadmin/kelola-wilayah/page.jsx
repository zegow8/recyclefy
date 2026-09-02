'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function SuperAdminKelolaWilayahPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (session?.user?.role === 'SUPER_ADMIN') {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/superadmin/wilayah');
      const result = await res.json();
      setData(result);
    } catch (error) {
      toast.error('Gagal load data');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
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
            <Link href="/superadmin/kelola-sampah">Kelola Sampah</Link>
            <Link href="/superadmin/kelola-resep">Kelola Resep</Link>
            <Link href="/superadmin/kelola-wilayah" className="active">Kelola Wilayah</Link>
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
          <h1 className="page-title">📍 Kelola Wilayah</h1>
          <p className="page-subtitle">Statistik data per wilayah</p>

          <div className="wilayah-grid">
            {data.length === 0 ? (
              <div className="empty-state">Belum ada data wilayah</div>
            ) : (
              data.map((item) => (
                <div key={item.id} className="wilayah-card">
                  <div className="wilayah-header">
                    <h3>🏢 {item.namaWilayah}</h3>
                    <span className={`status-pending ${item.totalPending > 0 ? 'has-pending' : ''}`}>
                      {item.totalPending > 0 ? `🟡 ${item.totalPending} Pending` : '✅ Tidak Ada Pending'}
                    </span>
                  </div>
                  <div className="wilayah-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total Admin</span>
                      <span className="stat-value">{item.totalAdmin}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Produksi</span>
                      <span className="stat-value">{item.totalProduksi}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Sampah</span>
                      <span className="stat-value">{item.totalSampah} g</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Kiriman</span>
                      <span className="stat-value">{item.totalKiriman}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="info-box">
            <p>💡 Admin wilayah hanya bisa dihapus melalui database. Superadmin hanya memantau statistik.</p>
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

        .page-title {
          font-size: 30px;
          font-weight: 800;
          color: #1B5E20;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 0px rgba(211, 47, 47, 0.06);
        }

        .page-subtitle {
          font-size: 16px;
          color: #757575;
          font-weight: 500;
          margin-bottom: 28px;
        }

        .wilayah-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 28px;
        }

        .wilayah-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(211, 47, 47, 0.06);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .wilayah-card:hover {
          transform: translateY(-6px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
          border-color: rgba(211, 47, 47, 0.12);
        }

        .wilayah-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .wilayah-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1B5E20;
        }

        .status-pending {
          font-size: 13px;
          font-weight: 600;
          padding: 4px 14px;
          border-radius: 20px;
          background: #E8F5E9;
          color: #1B5E20;
          border: 2px solid #A5D6A7;
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.04);
        }

        .status-pending.has-pending {
          background: #FFF8E1;
          color: #F57C00;
          border-color: #FFE082;
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.06);
        }

        .wilayah-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stat-item {
          background: linear-gradient(135deg, #F5F5F5, #FAFAFA);
          border-radius: 10px;
          padding: 14px 12px;
          text-align: center;
          border: 1px solid #E8E8E8;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          background: #FFFFFF;
          border-color: #FFCDD2;
          transform: scale(1.02);
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.04);
        }

        .stat-label {
          display: block;
          font-size: 11px;
          color: #757575;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          display: block;
          font-size: 22px;
          font-weight: 800;
          color: #1B5E20;
          margin-top: 2px;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 48px;
          color: #757575;
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 2px dashed #E0E0E0;
          font-weight: 500;
        }

        .info-box {
          background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
          border-left: 4px solid #1976D2;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 
            3px 3px 0px 0px rgba(0, 0, 0, 0.06),
            0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .info-box p {
          font-size: 14px;
          color: #424242;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .wilayah-grid {
            grid-template-columns: 1fr 1fr;
          }

          .navbar-menu {
            display: none;
          }

          .page-title {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .wilayah-grid {
            grid-template-columns: 1fr;
          }

          .wilayah-card {
            padding: 18px;
          }

          .wilayah-stats {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .stat-value {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  );
}