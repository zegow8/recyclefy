'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function SetorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wilayah, setWilayah] = useState('');
  const [wilayahList, setWilayahList] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
      fetchWilayah();
    }
  }, [session, search, page]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/user/setor-sampah?search=${search}&page=${page}&limit=12`);
      const result = await res.json();
      setData(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error('Gagal load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWilayah = async () => {
    try {
      const res = await fetch('/api/user/wilayah');
      const result = await res.json();
      setWilayahList(result);
      if (result.length > 0) setWilayah(result[0].id);
    } catch (error) {
      console.error('Gagal load wilayah');
    }
  };

  const handleSetor = (item) => {
    if (!wilayah) {
      toast.error('Pilih wilayah tujuan terlebih dahulu!');
      return;
    }

    // Simpan ke localStorage sementara (keranjang)
    const cart = JSON.parse(localStorage.getItem('setorCart') || '[]');
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      existing.kuantitas += 1;
    } else {
      cart.push({
        id: item.id,
        nama: item.namaJenis,
        gambar: item.gambarUrl,
        berat: item.beratPerUnit || 0,
        poin: item.poinPerUnit,
        kuantitas: 1,
        wilayahId: wilayah
      });
    }
    localStorage.setItem('setorCart', JSON.stringify(cart));

    toast.success(`${item.namaJenis} berhasil ditambahkan ke keranjang!`);
    // ✅ TETAP DI HALAMAN SETOR, GA KEREDIRECT
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
            <Link href="/user/aktivitas">Aktivitas</Link>
            <Link href="/user/toko">Toko</Link>
            <Link href="/user/setor" className="active">Setor Sampah</Link>
            <Link href="/user/setoran-sampah">Keranjang</Link>
            <Link href="/user/riwayat-setor">Riwayat Setor</Link>
            <Link href="/user/riwayat-beli">Riwayat Beli</Link>
            <Link href="/user/profile">Profile</Link>
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
          <h1 className="page-title">🗑️ Setor Sampah</h1>
          <p className="page-subtitle">Pilih jenis sampah yang ingin disetor</p>

          <div className="filter-section">
            <select
              className="wilayah-select"
              value={wilayah}
              onChange={(e) => setWilayah(e.target.value)}
            >
              <option value="">Pilih Wilayah Tujuan</option>
              {wilayahList.map((w) => (
                <option key={w.id} value={w.id}>{w.namaWilayah}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Cari jenis sampah..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sampah-grid">
            {data.length === 0 ? (
              <div className="empty-state">Belum ada jenis sampah</div>
            ) : (
              data.map((item) => (
                <div key={item.id} className="sampah-card">
                  <div className="sampah-image">
                    {item.gambarUrl ? (
                      <img src={item.gambarUrl} alt={item.namaJenis} />
                    ) : (
                      <div className="sampah-placeholder">🗑️</div>
                    )}
                  </div>
                  <div className="sampah-info">
                    <h3>{item.namaJenis}</h3>
                    <p className="sampah-desc">{item.deskripsi || '-'}</p>
                    <p className="sampah-berat">⚖️ {item.beratPerUnit || 0}g</p>
                    <p className="sampah-poin">🪙 {item.poinPerUnit} Poin</p>
                    <button
                      className="btn-setor"
                      onClick={() => handleSetor(item)}
                    >
                      Setor
                    </button>
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
          margin-bottom: 4px;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 0px rgba(102, 187, 106, 0.06);
        }

        .page-subtitle {
          font-size: 16px;
          color: #757575;
          font-weight: 500;
          margin-bottom: 28px;
        }

        .filter-section {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .wilayah-select {
          padding: 12px 18px;
          border: 2.5px solid #E8E8E8;
          border-radius: 12px;
          font-size: 14px;
          min-width: 200px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: #FAFAFA;
          color: #1B5E20;
          font-weight: 500;
          cursor: pointer;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .wilayah-select:focus {
          border-color: #66BB6A;
          background: #FFFFFF;
          box-shadow: 
            0 0 0 4px rgba(102, 187, 106, 0.1),
            4px 4px 0px 0px rgba(0, 0, 0, 0.06);
          outline: none;
        }

        .wilayah-select:hover:not(:focus) {
          border-color: #A5D6A7;
          background: #FFFFFF;
        }

        .search-input {
          flex: 1;
          min-width: 200px;
          padding: 12px 18px;
          border: 2.5px solid #E8E8E8;
          border-radius: 12px;
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
          border-color: #66BB6A;
          background: #FFFFFF;
          box-shadow: 
            0 0 0 4px rgba(102, 187, 106, 0.1),
            4px 4px 0px 0px rgba(0, 0, 0, 0.06);
          transform: scale(1.01);
          outline: none;
        }

        .search-input:hover:not(:focus) {
          border-color: #A5D6A7;
          background: #FFFFFF;
        }

        .sampah-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 28px;
        }

        .sampah-card {
          background: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(102, 187, 106, 0.06);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .sampah-card:hover {
          transform: translateY(-6px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
          border-color: rgba(102, 187, 106, 0.12);
        }

        .sampah-image {
          height: 130px;
          background: linear-gradient(135deg, #F5F5F5, #E8F5E9);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .sampah-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sampah-placeholder {
          font-size: 52px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.04));
        }

        .sampah-info {
          padding: 18px 20px 20px;
        }

        .sampah-info h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 4px;
        }

        .sampah-desc {
          font-size: 13px;
          color: #757575;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-weight: 500;
          min-height: 36px;
        }

        .sampah-berat {
          font-size: 13px;
          color: #757575;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .sampah-poin {
          font-size: 16px;
          font-weight: 700;
          color: #FFC107;
          margin-bottom: 14px;
        }

        .btn-setor {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #66BB6A, #43A047);
          color: #FFFFFF;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.1);
        }

        .btn-setor:hover {
          background: linear-gradient(135deg, #4CAF50, #2E7D32);
          transform: translateY(-2px);
          box-shadow: 0 4px 0px 0px rgba(0, 0, 0, 0.15);
        }

        .btn-setor:active {
          transform: translateY(0px);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.1);
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
          background: #E8F5E9;
          border-color: #66BB6A;
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
          border: 2px dashed #E0E0E0;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .sampah-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .navbar-menu {
            display: none;
          }

          .filter-section {
            flex-direction: column;
          }

          .page-title {
            font-size: 24px;
          }

          .wilayah-select {
            min-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .sampah-grid {
            grid-template-columns: 1fr;
          }

          .sampah-card {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}