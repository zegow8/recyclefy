'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function AdminStokSampah() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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
  }, [session, search, page]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/stok-sampah?search=${search}&page=${page}&limit=12`);
      const result = await res.json();
      setData(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
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
            <Link href="/admin/dashboard">Dashboard</Link>
            <Link href="/admin/riwayat-sampah">Riwayat Sampah</Link>
            <Link href="/admin/stok-sampah" className="active">Stok Sampah</Link>
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
          <h1 className="page-title">📦 Stok Sampah</h1>
          <p className="page-subtitle">Data stok sampah yang tersedia</p>

          <div className="filter-section">
            <input
              type="text"
              placeholder="Cari jenis sampah..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="total-stok">Total {total} jenis sampah</span>
          </div>

          <div className="stok-grid">
            {data.length === 0 ? (
              <div className="empty-state">Belum ada stok sampah</div>
            ) : (
              data.map((item) => (
                <div key={item.id} className="stok-card">
                  <div className="stok-image">
                    {item.gambarUrl ? (
                      <img src={item.gambarUrl} alt={item.nama} />
                    ) : (
                      <div className="stok-placeholder">🗑️</div>
                    )}
                  </div>
                  <div className="stok-info">
                    <h3>{item.nama}</h3>
                    <p className="stok-qty">Stok: {item.stok} unit</p>
                    <p className="stok-berat">Total Berat: {item.totalBerat.toFixed(1)} g</p>
                    <p className="stok-poin">🪙 {item.poinPerUnit} Poin/unit</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ← Sebelumnya
              </button>
              <span className="page-info">Halaman {page} dari {totalPages}</span>
              <button
                className="page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Selanjutnya →
              </button>
            </div>
          )}
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

        .filter-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 28px;
          padding: 20px 24px;
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 193, 7, 0.06);
          transition: all 0.3s ease;
        }

        .filter-section:hover {
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.06),
            0 12px 32px rgba(0, 0, 0, 0.06);
        }

        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 12px 18px;
          border: 2.5px solid #E8E8E8;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: #FAFAFA;
          color: #1B5E20;
          font-weight: 500;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .search-input::placeholder {
          color: #BDBDBD;
          font-weight: 400;
        }

        .search-input:focus {
          border-color: #FFC107;
          background: #FFFFFF;
          box-shadow: 
            0 0 0 4px rgba(255, 193, 7, 0.1),
            4px 4px 0px 0px rgba(0, 0, 0, 0.06);
          transform: scale(1.01);
          outline: none;
        }

        .search-input:hover:not(:focus) {
          border-color: #FFE0B2;
          background: #FFFFFF;
        }

        .total-stok {
          font-size: 14px;
          color: #757575;
          font-weight: 600;
          padding: 8px 16px;
          background: #FFF8E1;
          border-radius: 20px;
          border: 2px solid #FFE0B2;
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.04);
        }

        .stok-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 28px;
        }

        .stok-card {
          background: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 193, 7, 0.06);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .stok-card:hover {
          transform: translateY(-6px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
          border-color: rgba(255, 193, 7, 0.12);
        }

        .stok-image {
          height: 130px;
          background: linear-gradient(135deg, #F5F5F5, #FFF8E1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .stok-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stok-placeholder {
          font-size: 52px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.04));
        }

        .stok-info {
          padding: 18px 20px 20px;
        }

        .stok-info h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 4px;
        }

        .stok-info p {
          font-size: 13px;
          color: #757575;
          margin: 3px 0;
          font-weight: 500;
        }

        .stok-qty {
          font-weight: 700;
          color: #1B5E20 !important;
        }

        .stok-berat {
          color: #757575 !important;
        }

        .stok-poin {
          color: #FFC107 !important;
          font-weight: 700;
          font-size: 15px !important;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 28px;
        }

        .page-btn {
          padding: 10px 24px;
          background: #FFFFFF;
          border: 2.5px solid #E8E8E8;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.04);
          color: #424242;
        }

        .page-btn:hover:not(:disabled) {
          background: #FFF8E1;
          border-color: #FFC107;
          transform: translateY(-2px);
          box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.06);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .page-info {
          font-size: 14px;
          color: #757575;
          font-weight: 500;
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
          border: 2px dashed #FFE0B2;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .stok-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .navbar-menu {
            display: none;
          }

          .filter-section {
            flex-direction: column;
            align-items: stretch;
          }

          .page-title {
            font-size: 24px;
          }

          .total-stok {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .stok-grid {
            grid-template-columns: 1fr;
          }

          .stok-card {
            max-width: 100%;
          }

          .stok-image {
            height: 110px;
          }
        }
      `}</style>
    </>
  );
}