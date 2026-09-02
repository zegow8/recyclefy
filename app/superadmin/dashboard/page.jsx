'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter }from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
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
      const res = await fetch('/api/superadmin/dashboard');
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

  if (!session || !data) return null;

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
            <Link href="/superadmin/dashboard" className="active">Dashboard</Link>
            <Link href="/superadmin/user">User</Link>
            <Link href="/superadmin/kelola-sampah">Kelola Sampah</Link>
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
          <h1 className="page-title">👑 Dashboard Super Admin</h1>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total User</h3>
                <p className="stat-number">{data.totalUser || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-info">
                <h3>Total Admin</h3>
                <p className="stat-number">{data.totalAdmin || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>Barang Nunggu ACC</h3>
                <p className="stat-number">{data.menungguAcc || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>Total Stok</h3>
                <p className="stat-number">{data.totalStok || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <h3>Total Transaksi</h3>
                <p className="stat-number">{data.totalTransaksi || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🪙</div>
              <div className="stat-info">
                <h3>Total Koin</h3>
                <p className="stat-number">{data.totalKoin || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🗑️</div>
              <div className="stat-info">
                <h3>Jenis Sampah</h3>
                <p className="stat-number">{data.totalJenisSampah || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <h3>Total Resep</h3>
                <p className="stat-number">{data.totalResep || 0}</p>
              </div>
            </div>
          </div>

          {/* Status Pesanan */}
          <div className="section">
            <h2 className="section-title">📊 Status Pesanan</h2>
            <div className="status-grid">
              <div className="status-card dipesan">
                <span className="status-label">🟡 DIPESAN</span>
                <span className="status-value">{data.statusCount?.DIPESAN || 0}</span>
              </div>
              <div className="status-card dikirim">
                <span className="status-label">🔵 DIKIRIM</span>
                <span className="status-value">{data.statusCount?.DIKIRIM || 0}</span>
              </div>
              <div className="status-card selesai">
                <span className="status-label">✅ SELESAI</span>
                <span className="status-value">{data.statusCount?.SELESAI || 0}</span>
              </div>
            </div>
          </div>

          {/* Kiriman dari Admin Wilayah */}
          <div className="section">
            <h2 className="section-title">📥 Kiriman dari Admin Wilayah</h2>
            {data.kirimanPerWilayah?.length === 0 ? (
              <div className="empty-state">Tidak ada kiriman yang menunggu konfirmasi</div>
            ) : (
              <div className="kiriman-grid">
                {data.kirimanPerWilayah?.map((item, index) => (
                  <div key={index} className="kiriman-card">
                    <div className="kiriman-header">
                      <h3>🏢 {item.wilayah}</h3>
                      <span className="kiriman-date">
                        {new Date(item.tanggalKirim).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="kiriman-admin">Admin: {item.admin}</p>
                    <div className="kiriman-barang">
                      {item.barang.map((barang, idx) => (
                        <div key={idx} className="kiriman-item">
                          <span>{barang.nama}</span>
                          <span className="kiriman-qty">x{barang.jumlah}</span>
                        </div>
                      ))}
                    </div>
                    <div className="kiriman-actions">
                      <Link href="/superadmin/manajemen-stok" className="btn-acc">
                        ✅ Buka Manajemen Stok
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          margin-bottom: 28px;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 0px rgba(211, 47, 47, 0.06);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 36px;
        }

        .stat-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(211, 47, 47, 0.06);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 12px 32px rgba(0, 0, 0, 0.06);
          border-color: rgba(211, 47, 47, 0.12);
        }

        .stat-icon {
          font-size: 36px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.04));
        }

        .stat-info h3 {
          font-size: 13px;
          color: #757575;
          font-weight: 600;
          margin-bottom: 2px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .stat-number {
          font-size: 26px;
          font-weight: 800;
          color: #1B5E20;
        }

        .section {
          margin-bottom: 36px;
        }

        .section-title {
          font-size: 22px;
          font-weight: 800;
          color: #1B5E20;
          margin-bottom: 18px;
          letter-spacing: -0.3px;
          text-shadow: 2px 2px 0px rgba(211, 47, 47, 0.06);
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .status-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 18px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.04);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .status-card:hover {
          transform: translateY(-2px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 12px 32px rgba(0, 0, 0, 0.06);
        }

        .status-label {
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.3px;
        }

        .status-value {
          font-size: 26px;
          font-weight: 800;
        }

        .status-card.dipesan { border-left: 4px solid #E65100; }
        .status-card.dipesan .status-value { color: #E65100; }
        .status-card.dikirim { border-left: 4px solid #0D47A1; }
        .status-card.dikirim .status-value { color: #0D47A1; }
        .status-card.selesai { border-left: 4px solid #1B5E20; }
        .status-card.selesai .status-value { color: #1B5E20; }

        .kiriman-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .kiriman-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 22px 24px;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border-left: 4px solid #FFC107;
          border: 1px solid rgba(255, 193, 7, 0.15);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .kiriman-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
          border-color: rgba(255, 193, 7, 0.25);
        }

        .kiriman-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .kiriman-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1B5E20;
        }

        .kiriman-date {
          font-size: 13px;
          color: #757575;
          font-weight: 500;
          background: #F5F5F5;
          padding: 2px 12px;
          border-radius: 12px;
        }

        .kiriman-admin {
          font-size: 14px;
          color: #424242;
          margin-bottom: 10px;
          font-weight: 500;
        }

        .kiriman-barang {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .kiriman-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #424242;
          padding: 6px 0;
          border-bottom: 1px solid #F5F5F5;
        }

        .kiriman-item:last-child {
          border-bottom: none;
        }

        .kiriman-qty {
          font-weight: 700;
          color: #1B5E20;
          background: #E8F5E9;
          padding: 0 10px;
          border-radius: 12px;
        }

        .kiriman-actions {
          display: flex;
          gap: 8px;
        }

        .btn-acc {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
          color: #1B5E20;
          border-radius: 10px;
          font-weight: 700;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.04);
        }

        .btn-acc:hover {
          background: linear-gradient(135deg, #C8E6C9, #A5D6A7);
          transform: translateY(-2px);
          box-shadow: 0 4px 0px 0px rgba(0, 0, 0, 0.06);
        }

        .empty-state {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 36px;
          text-align: center;
          color: #757575;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 2px dashed #E0E0E0;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .kiriman-grid {
            grid-template-columns: 1fr;
          }

          .navbar-menu {
            display: none;
          }

          .page-title {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .status-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 16px 18px;
          }

          .stat-number {
            font-size: 22px;
          }
        }
      `}</style>
    </>
  );
}