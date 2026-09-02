'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function AktivitasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/user/aktivitas');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal load data');
      }
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Gagal load data');
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
            <Link href="/user/home">Home</Link>
            <Link href="/user/aktivitas" className="active">
              Aktivitas
            </Link>
            <Link href="/user/toko">Toko</Link>
            <Link href="/user/setor">Setor Sampah</Link>
            <Link href="/user/setoran-sampah">Keranjang</Link>
            <Link href="/user/riwayat-setor">Riwayat Setor</Link>
            <Link href="/user/riwayat-beli">Riwayat Beli</Link>
            <Link href="/user/profile">Profile</Link>
          </div>
          <div className="navbar-user">
            <span className="badge-koin">🪙 {session.user.koin || 0}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="btn-logout"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <h1 className="page-title">📊 Aktivitas Saya</h1>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🪙</div>
              <div className="stat-info">
                <h3>Total Poin</h3>
                <p className="stat-number">{data?.totalPoin ?? 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💸</div>
              <div className="stat-info">
                <h3>Poin Terpakai</h3>
                <p className="stat-number">{data?.poinTerpakai ?? 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <h3>Total Setor</h3>
                <p className="stat-number">{data?.totalSetor ?? 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>Total Unit Sampah</h3>
                <p className="stat-number">{data?.totalUnitSampah ?? 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚖️</div>
              <div className="stat-info">
                <h3>Total Berat</h3>
                <p className="stat-number">{data?.totalBerat ?? 0} kg</p>
              </div>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">📦 Status Pesanan</h2>
            <div className="status-grid">
              <div className="status-card dipesan">
                <span className="status-label">🛒 DIPESAN</span>
                <span className="status-value">
                  {data?.statusCount?.DIPESAN ?? 0}
                </span>
              </div>
              <div className="status-card dikirim">
                <span className="status-label">📦 DIKIRIM</span>
                <span className="status-value">
                  {data?.statusCount?.DIKIRIM ?? 0}
                </span>
              </div>
              <div className="status-card selesai">
                <span className="status-label">✅ SELESAI</span>
                <span className="status-value">
                  {data?.statusCount?.SELESAI ?? 0}
                </span>
              </div>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">🔄 Recent Aktivitas</h2>
            <div className="recent-list">
              {data?.recentAktivitas?.length === 0 ? (
                <div className="empty-state">Belum ada aktivitas</div>
              ) : (
                data?.recentAktivitas?.map((item, index) => (
                  <div key={index} className="recent-item">
                    <div className="recent-icon">🗑️</div>
                    <div className="recent-info">
                      <p className="recent-title">
                        Menyetor <strong>{item.jenis}</strong> x{item.kuantitas}
                      </p>
                      <p className="recent-detail">
                        {item.berat}g · 🪙 {item.poin} · 📍 {item.wilayah}
                      </p>
                      <p className="recent-date">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')} ·{' '}
                        {new Date(item.tanggal).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))
              )}
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
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
          border: 1px solid rgba(102, 187, 106, 0.06);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 12px 32px rgba(0, 0, 0, 0.06);
          border-color: rgba(102, 187, 106, 0.12);
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
          text-shadow: 2px 2px 0px rgba(102, 187, 106, 0.06);
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

        .recent-list {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(102, 187, 106, 0.06);
          transition: all 0.3s ease;
        }

        .recent-list:hover {
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.06),
            0 12px 32px rgba(0, 0, 0, 0.06);
        }

        .recent-item {
          display: flex;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid #F5F5F5;
          transition: all 0.3s ease;
        }

        .recent-item:last-child {
          border-bottom: none;
        }

        .recent-item:hover {
          padding-left: 8px;
          background: #FAFAFA;
          border-radius: 8px;
        }

        .recent-icon {
          font-size: 32px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recent-info {
          flex: 1;
        }

        .recent-title {
          font-size: 15px;
          font-weight: 500;
          color: #424242;
          margin-bottom: 2px;
        }

        .recent-title strong {
          color: #1B5E20;
          font-weight: 700;
        }

        .recent-detail {
          font-size: 13px;
          color: #757575;
          margin-bottom: 2px;
          font-weight: 500;
        }

        .recent-date {
          font-size: 12px;
          color: #BDBDBD;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 30px;
          color: #757575;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .status-grid {
            grid-template-columns: 1fr;
          }
          .navbar-menu {
            display: none;
          }

          .page-title {
            font-size: 24px;
          }

          .stat-number {
            font-size: 22px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 16px 18px;
          }

          .stat-number {
            font-size: 20px;
          }

          .recent-list {
            padding: 14px 16px;
          }

          .recent-item {
            padding: 10px 0;
          }
        }
      `}</style>
    </>
  );
}