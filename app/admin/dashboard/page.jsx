'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
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
    if (session?.user?.role === 'SUPER_ADMIN') {
      router.push('/superadmin/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
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
            <Link href="/admin/dashboard" className="active">Dashboard</Link>
            <Link href="/admin/riwayat-sampah">Riwayat Sampah</Link>
            <Link href="/admin/stok-sampah">Stok Sampah</Link>
            <Link href="/admin/produksi">Produksi</Link>
            <Link href="/admin/barang-produksi">Barang Produksi</Link>
            <Link href="/admin/riwayat-produksi">Riwayat Produksi</Link>
          </div>
          <div className="navbar-user">
            <span className="badge-role">🏢 {session.user.wilayah?.namaWilayah || 'Admin'}</span>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <h1 className="page-title">👋 Halo, {session.user.name}!</h1>
          <p className="page-subtitle">Dashboard Admin Wilayah {session.user.wilayah?.namaWilayah || ''}</p>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📥</div>
              <div className="stat-info">
                <h3>Sampah Masuk Hari Ini</h3>
                <p className="stat-number">{data?.sampahHariIni?.toFixed(1) || 0} kg</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>Total Sampah</h3>
                <p className="stat-number">{data?.totalSampah?.toFixed(1) || 0} kg</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔨</div>
              <div className="stat-info">
                <h3>Barang Diproduksi</h3>
                <p className="stat-number">{data?.barangProduksi || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>Menunggu Persetujuan</h3>
                <p className="stat-number">{data?.menungguAcc || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Sudah Di-ACC</h3>
                <p className="stat-number">{data?.sudahDiAcc || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total User Setor</h3>
                <p className="stat-number">{data?.totalUserSetor || 0}</p>
              </div>
            </div>
          </div>

          {/* Top Jenis Sampah */}
          <div className="section">
            <h2 className="section-title">📊 Top 5 Jenis Sampah</h2>
            <div className="top-jenis-grid">
              {data?.topJenisSampah?.length === 0 ? (
                <div className="empty-state">Belum ada data sampah</div>
              ) : (
                data?.topJenisSampah?.map((item, index) => (
                  <div key={index} className="top-jenis-card">
                    <span className="top-rank">#{index + 1}</span>
                    <span className="top-name">{item.nama}</span>
                    <span className="top-total">{item.total} unit</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* User Setor Terbaru */}
          <div className="section">
            <h2 className="section-title">📋 User Setor Terbaru</h2>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>User</th>
                    <th>Jenis Sampah</th>
                    <th>Berat</th>
                    <th>Poin</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.userSetor?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-row">Belum ada user setor</td>
                    </tr>
                  ) : (
                    data?.userSetor?.map((item) => (
                      <tr key={item.id}>
                        <td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                        <td>{item.user}</td>
                        <td>{item.jenis}</td>
                        <td>{item.berat} g</td>
                        <td>{item.poin}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Barang Nunggu ACC */}
          <div className="section">
            <h2 className="section-title">⏳ Barang Menunggu ACC Superadmin</h2>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Nama Barang</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.barangNungguAcc?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-row">Tidak ada barang menunggu ACC</td>
                    </tr>
                  ) : (
                    data?.barangNungguAcc?.map((item) => (
                      <tr key={item.id}>
                        <td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                        <td>{item.nama}</td>
                        <td>{item.jumlah}</td>
                        <td>
                          <span className="status-badge pending">⏳ Menunggu ACC</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
          background: linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #E0E0E0;
          border-top: 4px solid #FFC107;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 20px rgba(255, 193, 7, 0.15);
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
          border-bottom: 3px solid #FFC107;
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
          filter: drop-shadow(0 2px 4px rgba(255, 193, 7, 0.15));
        }

        .nav-logo:hover {
          transform: scale(1.05) rotate(-4deg);
          filter: drop-shadow(0 4px 12px rgba(255, 193, 7, 0.25));
        }

        .navbar-brand h1 {
          font-size: 24px;
          font-weight: 800;
          color: #1B5E20;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 0px rgba(255, 193, 7, 0.08);
        }

        .navbar-brand h1 span {
          color: #FFC107;
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
          background: linear-gradient(135deg, #FFC107, #FFB300);
          color: #1B5E20;
          font-weight: 700;
          box-shadow: 
            0 3px 0px 0px rgba(0, 0, 0, 0.2),
            0 4px 12px rgba(255, 193, 7, 0.3);
          transform: translateY(-1px);
        }

        .navbar-menu a:not(.active):hover {
          background: #FFF8E1;
          color: #F57C00;
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
          background: linear-gradient(90deg, #FFC107, #FFB300);
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
          color: #1B5E20;
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
          background: linear-gradient(135deg, #FFF8E1, #FFE0B2);
          color: #F57C00;
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
          margin-bottom: 4px;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 0px rgba(255, 193, 7, 0.06);
        }

        .page-subtitle {
          font-size: 16px;
          color: #757575;
          font-weight: 500;
          margin-bottom: 28px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
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
          border: 1px solid rgba(255, 193, 7, 0.06);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 12px 32px rgba(0, 0, 0, 0.06);
          border-color: rgba(255, 193, 7, 0.12);
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
          text-shadow: 2px 2px 0px rgba(255, 193, 7, 0.06);
        }

        .top-jenis-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        .top-jenis-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 
            3px 3px 0px 0px rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(255, 193, 7, 0.06);
          transition: all 0.3s ease;
        }

        .top-jenis-card:hover {
          transform: translateY(-2px);
          box-shadow: 
            5px 5px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 20px rgba(0, 0, 0, 0.04);
          border-color: rgba(255, 193, 7, 0.12);
        }

        .top-rank {
          font-weight: 800;
          color: #FFC107;
          font-size: 18px;
          min-width: 32px;
        }

        .top-name {
          flex: 1;
          font-weight: 600;
          color: #1B5E20;
        }

        .top-total {
          color: #757575;
          font-size: 13px;
          font-weight: 500;
        }

        .table-wrapper {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 12px 32px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 193, 7, 0.06);
          overflow-x: auto;
          transition: all 0.3s ease;
        }

        .table-wrapper:hover {
          box-shadow: 
            8px 8px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th {
          text-align: left;
          padding: 14px 18px;
          background: linear-gradient(135deg, #FFF8E1, #FFE0B2);
          font-weight: 700;
          color: #424242;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #FFE0B2;
        }

        .table td {
          padding: 14px 18px;
          border-bottom: 1px solid #F0F0F0;
          font-size: 14px;
          color: #424242;
          font-weight: 500;
        }

        .table tr {
          transition: all 0.3s ease;
        }

        .table tr:hover td {
          background: #FFF8E1;
          transform: scale(1.001);
        }

        .table tr:last-child td {
          border-bottom: none;
        }

        .empty-row {
          text-align: center;
          color: #757575;
          padding: 40px !important;
          font-weight: 500;
        }

        .status-badge {
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          display: inline-block;
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.04);
        }

        .status-badge.pending {
          background: #FFF8E1;
          color: #F57C00;
          border: 2px solid #FFE0B2;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 30px;
          color: #757575;
          background: #FFFFFF;
          border-radius: 12px;
          box-shadow: 
            3px 3px 0px 0px rgba(0, 0, 0, 0.04),
            0 4px 12px rgba(0, 0, 0, 0.02);
          border: 2px dashed #FFE0B2;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .top-jenis-grid {
            grid-template-columns: 1fr 1fr;
          }

          .navbar-menu {
            display: none;
          }

          .page-title {
            font-size: 24px;
          }

          .table-wrapper {
            padding: 16px;
          }

          .table th,
          .table td {
            padding: 10px 12px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .top-jenis-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 16px 18px;
          }

          .stat-number {
            font-size: 22px;
          }

          .table th,
          .table td {
            padding: 8px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
}