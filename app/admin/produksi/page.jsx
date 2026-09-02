'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function AdminProduksiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedResep, setSelectedResep] = useState(null);
  const [jumlahProduksi, setJumlahProduksi] = useState(1);

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
      const res = await fetch(`/api/admin/produksi?search=${search}&page=${page}&limit=12`);
      const result = await res.json();
      setData(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error('Gagal load data');
    } finally {
      setLoading(false);
    }
  };

  const handleProduksi = async (e) => {
    e.preventDefault();
    if (!selectedResep || !jumlahProduksi || jumlahProduksi < 1) {
      toast.error('Jumlah produksi tidak valid');
      return;
    }

    try {
      const res = await fetch('/api/admin/produksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resepId: selectedResep.id,
          jumlah: jumlahProduksi
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success(result.message || 'Produksi berhasil!');
      setShowModal(false);
      setSelectedResep(null);
      setJumlahProduksi(1);
      fetchData();
    } catch (error) {
      toast.error(error.message);
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
            <Link href="/admin/stok-sampah">Stok Sampah</Link>
            <Link href="/admin/produksi" className="active">Produksi</Link>
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
          <h1 className="page-title">🔨 Produksi</h1>
          <p className="page-subtitle">Produksi barang daur ulang dari sampah</p>

          <div className="filter-section">
            <input
              type="text"
              placeholder="Cari resep..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="resep-grid">
            {data.length === 0 ? (
              <div className="empty-state">Belum ada resep yang tersedia</div>
            ) : (
              data.map((item) => (
                <div key={item.id} className="resep-card">
                  <div className="resep-image">
                    {item.gambarBarang ? (
                      <img src={item.gambarBarang} alt={item.namaBarang} />
                    ) : (
                      <div className="resep-placeholder">📦</div>
                    )}
                  </div>
                  <div className="resep-info">
                    <h3>{item.namaBarang}</h3>
                    <div className="resep-bahan">
                      <p className="bahan-label">Bahan:</p>
                      {item.bahanInfo?.map((b, idx) => (
                        <div key={idx} className={`bahan-item ${b.cukup ? 'cukup' : 'kurang'}`}>
                          <span>{b.nama}</span>
                          <span>{b.tersedia} / {b.dibutuhkan}</span>
                          <span>{b.cukup ? '✅' : '❌'}</span>
                        </div>
                      ))}
                    </div>
                    <p className="resep-harga">🪙 {item.hargaKoin} Poin</p>
                    <button
                      className={`btn-produksi ${!item.canProduce ? 'disabled' : ''}`}
                      disabled={!item.canProduce}
                      onClick={() => {
                        setSelectedResep(item);
                        setJumlahProduksi(1);
                        setShowModal(true);
                      }}
                    >
                      {item.canProduce ? 'BUAT BARANG' : 'Stok Kurang'}
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

      {/* Modal Konfirmasi Produksi */}
      {showModal && selectedResep && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Konfirmasi Produksi</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleProduksi} className="modal-form">
              <div className="modal-info">
                <p><strong>Nama Barang:</strong> {selectedResep.namaBarang}</p>
                <div className="modal-bahan">
                  <p><strong>Bahan yang dibutuhkan per unit:</strong></p>
                  {selectedResep.bahanInfo?.map((b, idx) => (
                    <div key={idx} className="modal-bahan-item">
                      <span>{b.nama}</span>
                      <span>{b.dibutuhkan} unit</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Jumlah Produksi</label>
                <input
                  type="number"
                  min="1"
                  value={jumlahProduksi}
                  onChange={(e) => setJumlahProduksi(parseInt(e.target.value) || 1)}
                  required
                />
                <small>Stok bahan akan berkurang sesuai jumlah produksi</small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn-produksi-confirm">Produksi Sekarang</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

        .filter-section {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
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

        .resep-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 28px;
        }

        .resep-card {
          background: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 193, 7, 0.06);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .resep-card:hover {
          transform: translateY(-6px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
          border-color: rgba(255, 193, 7, 0.12);
        }

        .resep-image {
          height: 130px;
          background: linear-gradient(135deg, #F5F5F5, #FFF8E1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .resep-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .resep-placeholder {
          font-size: 52px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.04));
        }

        .resep-info {
          padding: 18px 20px 20px;
        }

        .resep-info h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 10px;
        }

        .resep-bahan {
          margin-bottom: 10px;
        }

        .bahan-label {
          font-size: 13px;
          font-weight: 700;
          color: #424242;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .bahan-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 4px 0;
          border-bottom: 1px solid #F5F5F5;
          font-weight: 500;
        }

        .bahan-item:last-child {
          border-bottom: none;
        }

        .bahan-item.cukup {
          color: #1B5E20;
        }

        .bahan-item.kurang {
          color: #D32F2F;
        }

        .resep-harga {
          font-size: 16px;
          font-weight: 700;
          color: #FFC107;
          margin-bottom: 14px;
        }

        .btn-produksi {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: linear-gradient(135deg, #FFC107, #FFB300);
          color: #1B5E20;
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.08);
        }

        .btn-produksi:hover:not(.disabled) {
          background: linear-gradient(135deg, #FFB300, #F57C00);
          transform: translateY(-2px);
          box-shadow: 0 4px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .btn-produksi:active:not(.disabled) {
          transform: translateY(0px);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.08);
        }

        .btn-produksi.disabled {
          background: #F5F5F5;
          color: #757575;
          cursor: not-allowed;
          border: 2px solid #E0E0E0;
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.04);
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 32px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 
            8px 8px 0px 0px rgba(0, 0, 0, 0.12),
            0 20px 60px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 193, 7, 0.1);
          animation: modalSlide 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes modalSlide {
          from { 
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          to { 
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        .modal-content::-webkit-scrollbar {
          width: 6px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #F5F5F5;
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #FFC107;
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #FFB300;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          font-size: 22px;
          font-weight: 800;
          color: #1B5E20;
        }

        .modal-close {
          font-size: 28px;
          color: #757575;
          transition: all 0.3s ease;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #F5F5F5;
        }

        .modal-close:hover {
          color: #D32F2F;
          background: #FFEBEE;
          transform: rotate(90deg);
        }

        .modal-info {
          margin-bottom: 20px;
        }

        .modal-info p {
          font-size: 14px;
          margin-bottom: 8px;
          color: #424242;
          font-weight: 500;
        }

        .modal-info p strong {
          color: #1B5E20;
        }

        .modal-bahan {
          background: linear-gradient(135deg, #FFF8E1, #FFE0B2);
          border-radius: 12px;
          padding: 14px 18px;
          margin-top: 8px;
          border: 1px solid #FFE0B2;
        }

        .modal-bahan p {
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 6px;
          font-size: 13px;
        }

        .modal-bahan-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          padding: 4px 0;
          color: #424242;
          font-weight: 500;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }

        .form-group label {
          font-weight: 700;
          font-size: 13px;
          color: #424242;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .form-group input {
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

        .form-group input:focus {
          border-color: #FFC107;
          background: #FFFFFF;
          box-shadow: 
            0 0 0 4px rgba(255, 193, 7, 0.1),
            4px 4px 0px 0px rgba(0, 0, 0, 0.06);
          transform: scale(1.01);
          outline: none;
        }

        .form-group input:hover:not(:focus) {
          border-color: #FFE0B2;
          background: #FFFFFF;
        }

        .form-group small {
          font-size: 12px;
          color: #757575;
          font-weight: 500;
        }

        .modal-actions {
          display: flex;
          gap: 14px;
        }

        .btn-cancel {
          flex: 1;
          padding: 12px;
          background: #FFFFFF;
          color: #424242;
          border: 2.5px solid #E0E0E0;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.06);
        }

        .btn-cancel:hover {
          background: #F5F5F5;
          transform: translateY(-2px);
          box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.08);
        }

        .btn-produksi-confirm {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #FFC107, #FFB300);
          color: #1B5E20;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .btn-produksi-confirm:hover {
          background: linear-gradient(135deg, #FFB300, #F57C00);
          transform: translateY(-2px);
          box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 0.16);
        }

        .btn-produksi-confirm:active {
          transform: translateY(0px);
          box-shadow: 1px 1px 0px 0px rgba(0, 0, 0, 0.12);
        }

        @media (max-width: 768px) {
          .resep-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .navbar-menu {
            display: none;
          }

          .page-title {
            font-size: 24px;
          }

          .filter-section {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .resep-grid {
            grid-template-columns: 1fr;
          }

          .resep-card {
            max-width: 100%;
          }

          .resep-image {
            height: 110px;
          }

          .modal-content {
            padding: 24px 20px;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}