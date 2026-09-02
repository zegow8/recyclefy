'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function AdminRiwayatSampah() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

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
  }, [session, search, startDate, endDate]);

  const fetchData = async () => {
    try {
      let url = '/api/admin/riwayat-sampah?';
      if (search) url += `search=${search}&`;
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;

      const res = await fetch(url);
      const result = await res.json();
      setData(result);
    } catch (error) {
      toast.error('Gagal load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = (item) => {
    setSelectedDetail(item);
    setShowModal(true);
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
            <Link href="/admin/riwayat-sampah" className="active">Riwayat Sampah</Link>
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
          <h1 className="page-title">📋 Riwayat Sampah</h1>
          <p className="page-subtitle">Data sampah yang masuk dari user</p>

          <div className="filter-section">
            <input
              type="text"
              placeholder="Cari user atau jenis sampah..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button className="btn-reset" onClick={() => {
              setSearch('');
              setStartDate('');
              setEndDate('');
            }}>
              Reset Filter
            </button>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>User</th>
                  <th>Jenis Sampah</th>
                  <th>Total Berat</th>
                  <th>Total Poin</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-row">Belum ada data riwayat sampah</td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                      <td>{item.user}</td>
                      <td>{item.jenisList}</td>
                      <td>{item.totalBerat.toFixed(1)} g</td>
                      <td>{item.totalPoin}</td>
                      <td>
                        <button className="btn-detail" onClick={() => handleDetail(item)}>
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Detail */}
      {showModal && selectedDetail && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Detail Setoran</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <p><strong>User:</strong> {selectedDetail.user}</p>
                <p><strong>Tanggal:</strong> {new Date(selectedDetail.tanggal).toLocaleDateString('id-ID')} {new Date(selectedDetail.tanggal).toLocaleTimeString('id-ID')}</p>
                <p><strong>Total Berat:</strong> {selectedDetail.totalBerat.toFixed(1)} g</p>
                <p><strong>Total Poin:</strong> {selectedDetail.totalPoin}</p>
              </div>
              <div className="modal-items">
                <h3>Daftar Sampah</h3>
                {selectedDetail.items.map((item, idx) => (
                  <div key={idx} className="modal-item">
                    <div className="item-foto">
                      {item.foto ? (
                        <img src={item.foto} alt={item.jenis} />
                      ) : (
                        <div className="item-placeholder">🗑️</div>
                      )}
                    </div>
                    <div className="item-detail">
                      <p><strong>{item.jenis}</strong></p>
                      <p>Unit: {item.kuantitas}</p>
                      <p>Berat: {item.berat.toFixed(1)} g</p>
                      <p>Poin: {item.poin}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>Tutup</button>
            </div>
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
          margin-bottom: 24px;
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

        .date-input {
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

        .date-input:focus {
          border-color: #FFC107;
          background: #FFFFFF;
          box-shadow: 
            0 0 0 4px rgba(255, 193, 7, 0.1),
            4px 4px 0px 0px rgba(0, 0, 0, 0.06);
          transform: scale(1.01);
          outline: none;
        }

        .date-input:hover:not(:focus) {
          border-color: #FFE0B2;
          background: #FFFFFF;
        }

        .btn-reset {
          padding: 12px 24px;
          background: #FFFFFF;
          color: #424242;
          border: 2.5px solid #E0E0E0;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.06);
        }

        .btn-reset:hover {
          background: #F5F5F5;
          transform: translateY(-2px);
          box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.08);
        }

        .btn-reset:active {
          transform: translateY(0px);
          box-shadow: 1px 1px 0px 0px rgba(0, 0, 0, 0.06);
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

        .btn-detail {
          padding: 6px 18px;
          background: #FFFFFF;
          color: #1976D2;
          border: 2.5px solid #1976D2;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.08);
        }

        .btn-detail:hover {
          background: #1976D2;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .btn-detail:active {
          transform: translateY(0px);
          box-shadow: 1px 1px 0px 0px rgba(0, 0, 0, 0.08);
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
          max-width: 600px;
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
          padding: 20px 24px;
          border-bottom: 2px solid #F0F0F0;
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

        .modal-body {
          padding: 20px 24px;
        }

        .modal-info {
          background: linear-gradient(135deg, #FFF8E1, #FFE0B2);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 18px;
          border: 1px solid #FFE0B2;
        }

        .modal-info p {
          font-size: 14px;
          margin: 4px 0;
          color: #424242;
          font-weight: 500;
        }

        .modal-info p strong {
          color: #1B5E20;
        }

        .modal-items h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 14px;
        }

        .modal-item {
          display: flex;
          gap: 16px;
          padding: 12px;
          border-bottom: 1px solid #F5F5F5;
          align-items: center;
          transition: all 0.3s ease;
          border-radius: 8px;
        }

        .modal-item:hover {
          background: #FAFAFA;
        }

        .modal-item:last-child {
          border-bottom: none;
        }

        .item-foto {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          background: linear-gradient(135deg, #F5F5F5, #FFF8E1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.04);
        }

        .item-foto img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-placeholder {
          font-size: 28px;
        }

        .item-detail {
          flex: 1;
        }

        .item-detail p {
          font-size: 14px;
          margin: 2px 0;
          color: #424242;
          font-weight: 500;
        }

        .item-detail p strong {
          color: #1B5E20;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 2px solid #F0F0F0;
          text-align: right;
        }

        .btn-close-modal {
          padding: 10px 28px;
          background: linear-gradient(135deg, #FFC107, #FFB300);
          color: #1B5E20;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.1);
        }

        .btn-close-modal:hover {
          background: linear-gradient(135deg, #FFB300, #F57C00);
          transform: translateY(-2px);
          box-shadow: 0 4px 0px 0px rgba(0, 0, 0, 0.15);
        }

        .btn-close-modal:active {
          transform: translateY(0px);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .filter-section {
            flex-direction: column;
          }

          .navbar-menu {
            display: none;
          }

          .modal-content {
            margin: 0 10px;
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

          .btn-reset {
            width: 100%;
            text-align: center;
          }

          .search-input,
          .date-input {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .table th,
          .table td {
            padding: 8px 10px;
            font-size: 12px;
          }

          .modal-content {
            padding: 0;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding: 16px;
          }

          .modal-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .item-foto {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </>
  );
}