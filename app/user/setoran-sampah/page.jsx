'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function SetoranSampahPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [wilayahList, setWilayahList] = useState([]);
  const [selectedWilayah, setSelectedWilayah] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      loadCart();
      fetchWilayah();
    }
  }, [session]);

  const loadCart = () => {
    const saved = localStorage.getItem('setorCart');
    if (saved) {
      setCart(JSON.parse(saved));
    }
    setLoading(false);
  };

  const fetchWilayah = async () => {
    try {
      const res = await fetch('/api/user/wilayah');
      const result = await res.json();
      setWilayahList(result);
      if (result.length > 0) {
        const saved = localStorage.getItem('setorCart');
        if (saved) {
          const cartData = JSON.parse(saved);
          if (cartData.length > 0 && cartData[0].wilayahId) {
            setSelectedWilayah(cartData[0].wilayahId);
          } else {
            setSelectedWilayah(result[0].id);
          }
        } else {
          setSelectedWilayah(result[0].id);
        }
      }
    } catch (error) {
      console.error('Gagal load wilayah');
    }
  };

  const handleQtyChange = (id, newQty) => {
    if (newQty < 1) return;
    const newCart = cart.map(item =>
      item.id === id ? { ...item, kuantitas: newQty } : item
    );
    setCart(newCart);
    localStorage.setItem('setorCart', JSON.stringify(newCart));
  };

  const handleHapus = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('setorCart', JSON.stringify(newCart));
    toast.success('Item dihapus dari keranjang');
  };

  const handleSerahkan = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong!');
      return;
    }

    if (!selectedWilayah) {
      toast.error('Pilih wilayah tujuan!');
      return;
    }

    setSubmitting(true);

    try {
      const items = cart.map(item => ({
        id: item.id,
        kuantitas: item.kuantitas
      }));

      const res = await fetch('/api/user/keranjang-setor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          wilayahId: selectedWilayah
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success(result.message || `+${result.totalPoin} Poin!`);
      
      localStorage.removeItem('setorCart');
      setCart([]);
      
      // 🔥 UPDATE SESSION
      await update();
      
      // 🔥 FORCE RELOAD PAKAI WINDOW.LOCATION
      window.location.href = '/user/riwayat-setor';
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPoin = cart.reduce((sum, item) => sum + (item.poin * item.kuantitas), 0);
  const totalBerat = cart.reduce((sum, item) => sum + ((item.berat || 0) * item.kuantitas), 0);

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
            <h1>Recycle<span>fy</span></h1>
          </div>
          <div className="navbar-menu">
            <Link href="/user/home">Home</Link>
            <Link href="/user/aktivitas">Aktivitas</Link>
            <Link href="/user/toko">Toko</Link>
            <Link href="/user/setor">Setor Sampah</Link>
            <Link href="/user/setoran-sampah" className="active">Keranjang</Link>
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
          <h1 className="page-title">🛒 Keranjang Sampah</h1>

          <div className="cart-container">
            <div className="cart-left">
              <div className="wilayah-selector">
                <label>📍 Pilih Wilayah Tujuan:</label>
                <select
                  value={selectedWilayah}
                  onChange={(e) => setSelectedWilayah(e.target.value)}
                  className="wilayah-select"
                >
                  <option value="">-- Pilih Wilayah --</option>
                  {wilayahList.map((w) => (
                    <option key={w.id} value={w.id}>{w.namaWilayah}</option>
                  ))}
                </select>
              </div>

              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>Keranjang kosong. Silakan setor sampah dari halaman <Link href="/user/setor">Setor Sampah</Link></p>
                </div>
              ) : (
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        {item.gambar ? (
                          <img src={item.gambar} alt={item.nama} />
                        ) : (
                          <div className="item-placeholder">🗑️</div>
                        )}
                      </div>
                      <div className="item-info">
                        <h3>{item.nama}</h3>
                        <p className="item-poin">🪙 {item.poin} Poin/unit</p>
                      </div>
                      <div className="item-qty">
                        <button onClick={() => handleQtyChange(item.id, item.kuantitas - 1)}>−</button>
                        <span>{item.kuantitas}</span>
                        <button onClick={() => handleQtyChange(item.id, item.kuantitas + 1)}>+</button>
                      </div>
                      <div className="item-total">
                        🪙 {item.poin * item.kuantitas}
                      </div>
                      <button className="btn-hapus" onClick={() => handleHapus(item.id)}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cart-right">
              <div className="summary-card">
                <h3>Ringkasan</h3>
                <div className="summary-item">
                  <span>Total Item</span>
                  <span>{cart.length} jenis</span>
                </div>
                <div className="summary-item">
                  <span>Total Berat</span>
                  <span>{totalBerat.toFixed(1)} g</span>
                </div>
                <div className="summary-item total">
                  <span>Total Poin</span>
                  <span>🪙 {totalPoin}</span>
                </div>
                <button
                  className="btn-serahkan"
                  onClick={handleSerahkan}
                  disabled={cart.length === 0 || !selectedWilayah || submitting}
                >
                  {submitting ? 'Memproses...' : 'SERAHKAN SAMPAH'}
                </button>
              </div>
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
          background: #F5F5F5;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #E0E0E0;
          border-top: 4px solid #2E7D32;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .navbar {
          background: #FFFFFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          padding: 12px 0;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 2px solid #4CAF50;
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .navbar-brand h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1B5E20;
        }

        .navbar-brand h1 span {
          color: #FFC107;
        }

        .navbar-menu {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .navbar-menu a {
          font-size: 13px;
          font-weight: 500;
          color: #424242;
          padding: 6px 10px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .navbar-menu a:hover {
          background: #E8F5E9;
          color: #2E7D32;
        }

        .navbar-menu a.active {
          background: #E8F5E9;
          color: #2E7D32;
          font-weight: 600;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .badge-koin {
          background: #FFC107;
          padding: 4px 14px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
        }

        .btn-logout {
          background: #D32F2F;
          color: #FFFFFF;
          padding: 6px 16px;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-logout:hover {
          background: #B71C1C;
        }

        .main-content {
          min-height: calc(100vh - 200px);
          padding: 30px 0;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 24px;
        }

        .cart-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .cart-left {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .wilayah-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .wilayah-selector label {
          font-weight: 600;
          font-size: 14px;
          color: #424242;
        }

        .wilayah-select {
          padding: 10px 16px;
          border: 2px solid #E0E0E0;
          border-radius: 8px;
          font-size: 14px;
          flex: 1;
          min-width: 150px;
          transition: all 0.3s ease;
        }

        .wilayah-select:focus {
          border-color: #4CAF50;
          box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          border-bottom: 1px solid #F0F0F0;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .item-image {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          background: #F5F5F5;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-placeholder {
          font-size: 24px;
        }

        .item-info {
          flex: 1;
        }

        .item-info h3 {
          font-size: 15px;
          font-weight: 600;
          color: #1B5E20;
        }

        .item-poin {
          font-size: 13px;
          color: #757575;
        }

        .item-qty {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .item-qty button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #F5F5F5;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .item-qty button:hover {
          background: #E0E0E0;
        }

        .item-qty span {
          font-weight: 600;
          min-width: 20px;
          text-align: center;
        }

        .item-total {
          font-weight: 600;
          color: #FFC107;
          min-width: 60px;
        }

        .btn-hapus {
          padding: 4px 8px;
          background: #FFEBEE;
          color: #D32F2F;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .btn-hapus:hover {
          background: #FFCDD2;
        }

        .cart-right {
          position: sticky;
          top: 100px;
          align-self: start;
        }

        .summary-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .summary-card h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 16px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #F5F5F5;
          font-size: 14px;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item.total {
          font-size: 18px;
          font-weight: 700;
          color: #1B5E20;
          padding-top: 12px;
          border-top: 2px solid #E0E0E0;
        }

        .btn-serahkan {
          width: 100%;
          padding: 14px;
          background: #2E7D32;
          color: #FFFFFF;
          border-radius: 8px;
          font-weight: 700;
          font-size: 16px;
          transition: all 0.3s ease;
          margin-top: 16px;
        }

        .btn-serahkan:hover:not(:disabled) {
          background: #1B5E20;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(46, 125, 50, 0.3);
        }

        .btn-serahkan:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty-cart {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-cart p {
          font-size: 16px;
          color: #757575;
        }

        .empty-cart a {
          color: #2E7D32;
          font-weight: 600;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .cart-container {
            grid-template-columns: 1fr;
          }

          .cart-right {
            position: static;
          }

          .navbar-menu {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .cart-item {
            flex-wrap: wrap;
          }

          .item-qty {
            margin-left: auto;
          }
        }
      `}</style>
    </>
  );
}