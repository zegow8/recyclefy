'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function SuperAdminRiwayatTransaksiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transaksi, setTransaksi] = useState([]);
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
      const res = await fetch('/api/superadmin/transaksi');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransaksi(data);
      } else {
        setTransaksi([]);
      }
    } catch (error) {
      toast.error('Gagal load data');
      setTransaksi([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch('/api/superadmin/transaksi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success(result.message);
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusOptions = (currentStatus) => {
    const allStatus = ['DIPESAN', 'DIKIRIM', 'SELESAI'];
    const currentIndex = allStatus.indexOf(currentStatus);
    return allStatus.slice(currentIndex);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'DIPESAN': return 'dipesan';
      case 'DIKIRIM': return 'dikirim';
      case 'SELESAI': return 'selesai';
      default: return '';
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
            <Link href="/superadmin/manajemen-stok">Stok</Link>
            <Link href="/superadmin/riwayat-transaksi" className="active">Transaksi</Link>
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
          <h1 className="page-title">💰 Riwayat Transaksi</h1>
          <p className="page-subtitle">Kelola status transaksi pembelian user</p>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>User</th>
                  <th>Produk</th>
                  <th>Jumlah</th>
                  <th>Total Poin</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-row">Belum ada transaksi</td>
                  </tr>
                ) : (
                  transaksi.map((item) => {
                    const options = getStatusOptions(item.status);
                    return (
                      <tr key={item.id}>
                        <td>{item.tanggal}</td>
                        <td>{item.user}</td>
                        <td>
                          <div className="produk-cell">
                            {item.gambar && item.gambar.startsWith('/uploads/') ? (
                              <img 
                                src={item.gambar} 
                                alt={item.produk} 
                                className="produk-gambar"
                              />
                            ) : (
                              <span className="produk-placeholder">📦</span>
                            )}
                            <span className="produk-nama">{item.produk}</span>
                          </div>
                        </td>
                        <td>{item.jumlah}</td>
                        <td>{item.total}</td>
                        <td>
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className={`status-select ${getStatusColor(item.status)}`}
                            disabled={item.status === 'SELESAI'}
                          >
                            {options.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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

        .produk-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .produk-gambar {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #E8E8E8;
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .produk-gambar:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 0px 0px rgba(0, 0, 0, 0.08);
        }

        .produk-placeholder {
          font-size: 28px;
          width: 44px;
          text-align: center;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.04));
        }

        .produk-nama {
          font-weight: 600;
          color: #1B5E20;
        }

        .status-select {
          padding: 8px 14px;
          border: 2.5px solid #E8E8E8;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: #FAFAFA;
          color: #424242;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
          min-width: 120px;
        }

        .status-select:focus {
          border-color: #D32F2F;
          background: #FFFFFF;
          box-shadow: 
            0 0 0 4px rgba(211, 47, 47, 0.1),
            4px 4px 0px 0px rgba(0, 0, 0, 0.06);
          transform: scale(1.01);
          outline: none;
        }

        .status-select:hover:not(:disabled) {
          border-color: #FFCDD2;
          background: #FFFFFF;
          transform: scale(1.01);
        }

        .status-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .status-select.dipesan {
          border-color: #E65100;
          color: #E65100;
          background: #FFF8E1;
        }

        .status-select.dikirim {
          border-color: #0D47A1;
          color: #0D47A1;
          background: #E3F2FD;
        }

        .status-select.selesai {
          border-color: #1B5E20;
          color: #1B5E20;
          background: #E8F5E9;
        }

        @media (max-width: 768px) {
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

          .status-select {
            min-width: 100px;
            padding: 6px 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .table th,
          .table td {
            padding: 8px 10px;
            font-size: 12px;
          }

          .produk-gambar {
            width: 34px;
            height: 34px;
          }

          .produk-placeholder {
            font-size: 22px;
            width: 34px;
          }

          .status-select {
            min-width: 80px;
            padding: 4px 8px;
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
}