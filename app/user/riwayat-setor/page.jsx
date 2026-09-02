'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function RiwayatSetorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tanggal, setTanggal] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session, tanggal]);

  const fetchData = async () => {
    try {
      let url = '/api/user/riwayat-setor?';
      if (tanggal) url += `tanggal=${tanggal}&`;

      const res = await fetch(url);
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
            <Link href="/user/home">Home</Link>
            <Link href="/user/aktivitas">Aktivitas</Link>
            <Link href="/user/toko">Toko</Link>
            <Link href="/user/setor">Setor Sampah</Link>
            <Link href="/user/setoran-sampah">Keranjang</Link>
            <Link href="/user/riwayat-setor" className="active">Riwayat Setor</Link>
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
          <h1 className="page-title">📋 Riwayat Setor</h1>
          <p className="page-subtitle">Riwayat sampah yang sudah kamu setorkan</p>

          <div className="filter-section">
            <input
              type="date"
              className="date-input"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
            <button className="btn-reset" onClick={() => setTanggal('')}>
              Reset Filter
            </button>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID Setoran</th>
                  <th>Tanggal & Waktu</th>
                  <th>Foto</th>
                  <th>Jenis Sampah</th>
                  <th>Unit</th>
                  <th>Berat</th>
                  <th>Poin</th>
                  <th>Wilayah</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-row">Belum ada riwayat setor</td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="id-badge">#{item.id}</span>
                      </td>
                      <td>
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                        <br />
                        <small>{new Date(item.tanggal).toLocaleTimeString('id-ID')}</small>
                      </td>
                      <td>
                        {item.gambar ? (
                          <img src={item.gambar} alt={item.jenis} className="table-image" />
                        ) : (
                          <div className="foto-placeholder">🗑️</div>
                        )}
                      </td>
                      <td>{item.jenis}</td>
                      <td>{item.kuantitas}</td>
                      <td>{item.berat.toFixed(1)} g</td>
                      <td>{item.poin}</td>
                      <td>{item.wilayah}</td>
                    </tr>
                  ))
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
          margin-bottom: 24px;
          padding: 20px 24px;
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(102, 187, 106, 0.06);
          transition: all 0.3s ease;
        }

        .filter-section:hover {
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.06),
            0 12px 32px rgba(0, 0, 0, 0.06);
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
          border-color: #66BB6A;
          background: #FFFFFF;
          box-shadow: 
            0 0 0 4px rgba(102, 187, 106, 0.1),
            4px 4px 0px 0px rgba(0, 0, 0, 0.06);
          transform: scale(1.01);
          outline: none;
        }

        .date-input:hover:not(:focus) {
          border-color: #A5D6A7;
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
          border: 1px solid rgba(102, 187, 106, 0.06);
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
          background: #E8F5E9;
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

        .id-badge {
          display: inline-block;
          background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
          color: #1B5E20;
          padding: 4px 14px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13px;
          border: 2px solid #A5D6A7;
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.04);
        }

        .table td small {
          color: #757575;
          font-size: 12px;
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

        @media (max-width: 768px) {
          .navbar-menu {
            display: none;
          }

          .page-title {
            font-size: 24px;
          }

          .filter-section {
            padding: 16px;
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

          .table-image {
            width: 34px;
            height: 34px;
          }

          .id-badge {
            font-size: 11px;
            padding: 2px 10px;
          }

          .foto-placeholder {
            font-size: 22px;
          }
        }
      `}</style>
    </>
  );
}