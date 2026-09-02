'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function SuperAdminManajemenStokPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [kiriman, setKiriman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      fetchAllData();
    }
  }, [session]);

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchData(), fetchKiriman()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/superadmin/stok');
      const result = await res.json();
      if (Array.isArray(result)) {
        setData(result);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error('Gagal load data stok');
      setData([]);
    }
  };

  const fetchKiriman = async () => {
    try {
      const res = await fetch('/api/superadmin/kiriman');
      const result = await res.json();
      if (Array.isArray(result)) {
        setKiriman(result);
      } else {
        setKiriman([]);
      }
    } catch (error) {
      console.error('Gagal load kiriman');
      setKiriman([]);
    }
  };

  const handleKonfirmasi = async (kirimanId, status) => {
    try {
      const res = await fetch('/api/superadmin/konfirmasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kirimanId, status })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success(result.message);
      await fetchAllData();
      router.refresh();
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
            <Link href="/superadmin/dashboard">Dashboard</Link>
            <Link href="/superadmin/user">User</Link>
            <Link href="/superadmin/kelola-sampah">Kelola Sampah</Link>
            <Link href="/superadmin/kelola-resep">Kelola Resep</Link>
            <Link href="/superadmin/kelola-wilayah">Kelola Wilayah</Link>
            <Link href="/superadmin/manajemen-stok" className="active">Stok</Link>
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
          <div className="page-header">
            <h1 className="page-title">📦 Manajemen Stok</h1>
            <button 
              className="btn-refresh" 
              onClick={fetchAllData} 
              disabled={refreshing}
            >
              {refreshing ? '🔄 Memuat...' : '🔄 Refresh'}
            </button>
          </div>

          {/* Kiriman dari Admin */}
          <div className="section">
            <h2 className="section-title">📥 Kiriman dari Admin Wilayah</h2>
            {!Array.isArray(kiriman) || kiriman.length === 0 ? (
              <div className="empty-state">Tidak ada kiriman yang menunggu konfirmasi</div>
            ) : (
              <div className="kiriman-grid">
                {kiriman.map((item) => (
                  <div key={item.id} className="kiriman-card">
                    <div className="kiriman-header">
                      <h3>🏢 {item.wilayah?.namaWilayah || 'Unknown'}</h3>
                      <span className="kiriman-date">
                        {new Date(item.tanggalKirim).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="kiriman-admin">Admin: {item.admin?.nama || 'Unknown'}</p>
                    <div className="kiriman-barang">
                      {item.barangKiriman?.length === 0 ? (
                        <div className="kiriman-item">Tidak ada barang</div>
                      ) : (
                        item.barangKiriman?.map((barang, idx) => (
                          <div key={idx} className="kiriman-item">
                            <span>{barang.resep?.namaBarang || 'Unknown'}</span>
                            <span className="kiriman-qty">x{barang.jumlah || 0}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="kiriman-actions">
                      <button
                        className="btn-setujui"
                        onClick={() => handleKonfirmasi(item.id, 'DISETUJUI')}
                      >
                        ✅ Setujui
                      </button>
                      <button
                        className="btn-tolak"
                        onClick={() => handleKonfirmasi(item.id, 'DITOLAK')}
                      >
                        ❌ Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stok Barang */}
          <div className="section">
            <h2 className="section-title">📊 Stok Barang Tersedia</h2>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Produk</th>
                    <th>Stok Tersedia</th>
                    <th>Terjual</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!Array.isArray(data) || data.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-row">Belum ada stok barang</td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {item.resep?.gambarBarang ? (
                            <img src={item.resep.gambarBarang} alt={item.resep?.namaBarang} className="table-image" />
                          ) : (
                            <div className="foto-placeholder">📦</div>
                          )}
                        </td>
                        <td>{item.resep?.namaBarang || 'Unknown'}</td>
                        <td className="stok-available">{item.jumlahStok || 0}</td>
                        <td>{item.terjual || 0}</td>
                        <td>
                          <span className={`stok-status ${item.jumlahStok > 0 ? 'available' : 'empty'}`}>
                            {item.jumlahStok > 0 ? '✅ Tersedia' : '❌ Habis'}
                          </span>
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

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .page-title {
          font-size: 30px;
          font-weight: 800;
          color: #1B5E20;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 0px rgba(211, 47, 47, 0.06);
        }

        .btn-refresh {
          padding: 10px 24px;
          background: #FFFFFF;
          color: #1976D2;
          border: 2.5px solid #1976D2;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .btn-refresh:hover:not(:disabled) {
          background: #1976D2;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 0.16);
        }

        .btn-refresh:active:not(:disabled) {
          transform: translateY(0px);
          box-shadow: 1px 1px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .btn-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
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

        .kiriman-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          margin-bottom: 16px;
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
          margin-bottom: 4px;
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
          gap: 4px;
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
          gap: 10px;
        }

        .kiriman-actions button {
          flex: 1;
          padding: 10px 0;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-align: center;
        }

        .btn-setujui {
          background: #FFFFFF;
          color: #1B5E20;
          border: 2.5px solid #2E7D32;
          box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .btn-setujui:hover {
          background: #2E7D32;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 0.16);
        }

        .btn-setujui:active {
          transform: translateY(0px);
          box-shadow: 1px 1px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .btn-tolak {
          background: #FFFFFF;
          color: #C62828;
          border: 2.5px solid #C62828;
          box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .btn-tolak:hover {
          background: #C62828;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 0.16);
        }

        .btn-tolak:active {
          transform: translateY(0px);
          box-shadow: 1px 1px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .table-wrapper {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 12px 32px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(211, 47, 47, 0.06);
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
          background: linear-gradient(135deg, #F5F5F5, #FAFAFA);
          font-weight: 700;
          color: #424242;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #E8E8E8;
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
          background: #FFF5F5;
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

        .table-image {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .table-image:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 0px 0px rgba(0, 0, 0, 0.08);
        }

        .foto-placeholder {
          font-size: 28px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.04));
        }

        .stok-available {
          font-weight: 800;
          font-size: 18px;
          color: #1B5E20;
        }

        .stok-status {
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          display: inline-block;
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.04);
        }

        .stok-status.available {
          background: #E8F5E9;
          color: #1B5E20;
          border: 2px solid #A5D6A7;
        }

        .stok-status.empty {
          background: #FFEBEE;
          color: #C62828;
          border: 2px solid #EF9A9A;
        }

        @media (max-width: 768px) {
          .kiriman-grid {
            grid-template-columns: 1fr;
          }

          .navbar-menu {
            display: none;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .page-title {
            font-size: 24px;
          }

          .btn-refresh {
            width: 100%;
            text-align: center;
            justify-content: center;
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
          .kiriman-card {
            padding: 16px;
          }

          .kiriman-actions {
            flex-direction: column;
          }

          .kiriman-actions button {
            width: 100%;
          }

          .table th,
          .table td {
            padding: 8px 10px;
            font-size: 12px;
          }

          .table-image {
            width: 34px;
            height: 34px;
          }

          .stok-available {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}