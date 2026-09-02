'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resepId = searchParams.get('resepId');
  const jumlah = parseInt(searchParams.get('jumlah')) || 1;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    namaPenerima: '',
    noHpPenerima: '',
    alamatKirim: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (!resepId) {
      router.push('/user/toko');
    }
  }, [status, router, resepId]);

  useEffect(() => {
    if (session?.user) {
      setForm({
        namaPenerima: session.user.name || '',
        noHpPenerima: session.user.noHp || '',
        alamatKirim: session.user.alamat || ''
      });
      fetchProduct();
    }
  }, [session]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/user/toko/product?id=${resepId}`);
      const result = await res.json();
      setProduct(result);
    } catch (error) {
      toast.error('Gagal load produk');
      router.push('/user/toko');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.namaPenerima || !form.noHpPenerima || !form.alamatKirim) {
      toast.error('Semua field wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resepId,
          jumlah,
          namaPenerima: form.namaPenerima,
          noHpPenerima: form.noHpPenerima,
          alamatKirim: form.alamatKirim
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success(result.message || 'Pembelian berhasil!');
      
      // 🔥 UPDATE SESSION
      await update();
      
      // 🔥 FORCE RELOAD
      window.location.href = '/user/riwayat-beli';
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
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

  if (!session || !product) return null;

  const totalHarga = product.hargaKoin * jumlah;

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
          <h1 className="page-title">💳 Checkout</h1>
          <p className="page-subtitle">Konfirmasi pembelian produk daur ulang</p>

          <div className="checkout-container">
            <div className="checkout-left">
              <div className="product-summary">
                <div className="product-image">
                  {product.gambarBarang ? (
                    <img src={product.gambarBarang} alt={product.namaBarang} />
                  ) : (
                    <div className="product-placeholder">📦</div>
                  )}
                </div>
                <div className="product-detail">
                  <h3>{product.namaBarang}</h3>
                  <p>{product.deskripsi || 'Produk daur ulang berkualitas'}</p>
                  <p className="product-price">🪙 {product.hargaKoin} Poin × {jumlah}</p>
                  <p className="product-total">Total: 🪙 {totalHarga}</p>
                  <p className="product-stock">Stok: {product.stok} unit</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="form-group">
                  <label>Nama Penerima *</label>
                  <input
                    type="text"
                    value={form.namaPenerima}
                    onChange={(e) => setForm({ ...form, namaPenerima: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nomor Telepon *</label>
                  <input
                    type="tel"
                    value={form.noHpPenerima}
                    onChange={(e) => setForm({ ...form, noHpPenerima: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Alamat Pengiriman *</label>
                  <textarea
                    value={form.alamatKirim}
                    onChange={(e) => setForm({ ...form, alamatKirim: e.target.value })}
                    required
                    rows={3}
                  />
                </div>
              </form>
            </div>

            <div className="checkout-right">
              <div className="summary-card">
                <h3>Ringkasan Pesanan</h3>
                <div className="summary-item">
                  <span>Produk</span>
                  <span>{product.namaBarang}</span>
                </div>
                <div className="summary-item">
                  <span>Jumlah</span>
                  <span>{jumlah} unit</span>
                </div>
                <div className="summary-item">
                  <span>Harga per unit</span>
                  <span>🪙 {product.hargaKoin}</span>
                </div>
                <div className="summary-item total">
                  <span>Total</span>
                  <span>🪙 {totalHarga}</span>
                </div>
                <div className="summary-item">
                  <span>Poin Anda</span>
                  <span>🪙 {session.user.koin}</span>
                </div>
                <button
                  className="btn-checkout"
                  onClick={handleSubmit}
                  disabled={submitting || session.user.koin < totalHarga}
                >
                  {submitting ? 'Memproses...' : session.user.koin < totalHarga ? 'Poin Tidak Cukup' : 'Konfirmasi Pesanan'}
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
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 16px;
          color: #757575;
          margin-bottom: 24px;
        }

        .checkout-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .checkout-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .product-summary {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          gap: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .product-image {
          width: 120px;
          height: 120px;
          border-radius: 8px;
          background: #F5F5F5;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-placeholder {
          font-size: 48px;
        }

        .product-detail {
          flex: 1;
        }

        .product-detail h3 {
          font-size: 20px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 4px;
        }

        .product-detail p {
          font-size: 14px;
          color: #757575;
          margin-bottom: 4px;
        }

        .product-price {
          font-weight: 600;
          color: #424242 !important;
        }

        .product-total {
          font-size: 18px !important;
          font-weight: 700;
          color: #FFC107 !important;
        }

        .product-stock {
          font-size: 13px !important;
        }

        .checkout-form {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .checkout-form .form-group {
          margin-bottom: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-group label {
          font-weight: 600;
          font-size: 14px;
          color: #424242;
        }

        .form-group input,
        .form-group textarea {
          padding: 10px 14px;
          border: 2px solid #E0E0E0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #4CAF50;
          box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
        }

        .checkout-right {
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

        .btn-checkout {
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

        .btn-checkout:hover:not(:disabled) {
          background: #1B5E20;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(46, 125, 50, 0.3);
        }

        .btn-checkout:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .checkout-container {
            grid-template-columns: 1fr;
          }

          .checkout-right {
            position: static;
          }

          .product-summary {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .product-image {
            width: 150px;
            height: 150px;
          }

          .navbar-menu {
            display: none;
          }
        }
      `}</style>
    </>
  );
}