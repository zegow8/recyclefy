'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layouts/Footer';
import toast from 'react-hot-toast';

export default function UserHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
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
      const res = await fetch('/api/user/home');
      const result = await res.json();
      setData(result);
    } catch (error) {
      toast.error('Gagal load data');
    } finally {
      setLoading(false);
    }
  };

  const navLinks = [
    { href: '/user/home', label: 'Home' },
    { href: '/user/aktivitas', label: 'Aktivitas' },
    { href: '/user/toko', label: 'Toko' },
    { href: '/user/setor', label: 'Setor Sampah' },
    { href: '/user/setoran-sampah', label: 'Keranjang' },
    { href: '/user/riwayat-setor', label: 'Riwayat Setor' },
    { href: '/user/riwayat-beli', label: 'Riwayat Beli' },
    { href: '/user/profile', label: 'Profile' },
  ];

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
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={pathname === link.href ? 'active' : ''}
              >
                {link.label}
              </Link>
            ))}
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
          <section className="hero">
            <div className="hero-content">
              <h1>Selamat Datang di <span>Recyclefy</span></h1>
              <p>Platform pengelolaan sampah berbasis komunitas untuk Jakarta Pusat</p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="stat-number">{data?.totalUser || 0}</span>
                  <span className="stat-label">User Aktif</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">{(data?.totalSampah || 0).toFixed(1)} kg</span>
                  <span className="stat-label">Sampah Dikelola</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">{data?.totalBarang || 0}</span>
                  <span className="stat-label">Produk Daur Ulang</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">{data?.totalWilayah || 0}</span>
                  <span className="stat-label">Wilayah</span>
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">📖 Sejarah Recyclefy</h2>
            <div className="card">
              <p>
                Recyclefy lahir dari keprihatinan terhadap masalah sampah di Jakarta Pusat, 
                khususnya di wilayah <strong>Sumur Batu</strong>, <strong>Kemayoran</strong>, dan <strong>Cempaka Putih</strong>. 
                Aplikasi ini bertujuan untuk mengubah kebiasaan masyarakat dalam mengelola sampah 
                dengan pendekatan ekonomi sirkular.
              </p>
              <p>
                Dengan sistem <strong>tukar sampah jadi poin</strong>, masyarakat didorong untuk 
                memilah dan menyetorkan sampahnya ke admin wilayah. Sampah-sampah ini kemudian 
                didaur ulang menjadi produk bernilai ekonomis.
              </p>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">🎯 Visi & Misi</h2>
            <div className="visi-misi-grid">
              <div className="visi-card">
                <h3>Visi</h3>
                <p>Menjadi platform terdepan dalam pengelolaan sampah berbasis komunitas di Indonesia</p>
              </div>
              <div className="misi-card">
                <h3>Misi</h3>
                <ul>
                  <li>Mengedukasi masyarakat tentang pentingnya pengelolaan sampah</li>
                  <li>Menciptakan ekonomi sirkular melalui daur ulang sampah</li>
                  <li>Memberikan nilai tambah bagi masyarakat melalui sistem poin</li>
                  <li>Membangun kesadaran lingkungan sejak dini</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">⚡ Cara Kerja Recyclefy</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Pilih Wilayah</h3>
                <p>Tentukan wilayah tujuan setor sampah</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Setor Sampah</h3>
                <p>Pilih jenis sampah dan kuantitasnya</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Dapatkan Poin</h3>
                <p>Setiap setor sampah mendapat poin</p>
              </div>
              <div className="step-card">
                <div className="step-number">4</div>
                <h3>Tukar Produk</h3>
                <p>Kumpulkan poin dan tukarkan dengan produk daur ulang</p>
              </div>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">🌟 Mengapa Memilih Menukar Sampah di Recyclefy?</h2>
            <div className="reason-grid">
              <div className="reason-card">
                <span className="reason-icon">♻️</span>
                <h3>Ramah Lingkungan</h3>
                <p>Mengurangi sampah dan membantu menjaga kebersihan lingkungan</p>
              </div>
              <div className="reason-card">
                <span className="reason-icon">💰</span>
                <h3>Dapatkan Poin</h3>
                <p>Setiap sampah yang disetor akan mendapatkan poin yang bisa ditukar</p>
              </div>
              <div className="reason-card">
                <span className="reason-icon">🎁</span>
                <h3>Produk Berkualitas</h3>
                <p>Produk daur ulang berkualitas dari sampah yang sudah diolah</p>
              </div>
              <div className="reason-card">
                <span className="reason-icon">🤝</span>
                <h3>Komunitas</h3>
                <p>Bergabung dengan komunitas peduli lingkungan di wilayah Anda</p>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <h2 className="section-title">🗑️ Jenis Sampah yang Diterima</h2>
              <Link href="/user/setor" className="btn-view-all">Lihat Semua →</Link>
            </div>
            <div className="top-grid">
              {data?.topJenis?.length === 0 ? (
                <div className="empty-state">Belum ada jenis sampah</div>
              ) : (
                data?.topJenis?.slice(0, 3).map((item, index) => (
                  <div key={index} className="top-card">
                    <div className="top-image">
                      {item.gambarUrl ? (
                        <img src={item.gambarUrl} alt={item.namaJenis} />
                      ) : (
                        <div className="top-placeholder">🗑️</div>
                      )}
                    </div>
                    <div className="top-info">
                      <h3>{item.namaJenis}</h3>
                      <p className="top-desc">{item.deskripsi || 'Jenis sampah yang diterima'}</p>
                      <p className="top-poin">🪙 {item.poinPerUnit} Poin/unit</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <h2 className="section-title">🛍️ Produk Daur Ulang</h2>
              <Link href="/user/toko" className="btn-view-all">Lihat Semua →</Link>
            </div>
            <div className="top-grid">
              {data?.topProduk?.length === 0 ? (
                <div className="empty-state">Belum ada produk</div>
              ) : (
                data?.topProduk?.slice(0, 3).map((item, index) => (
                  <div key={index} className="top-card">
                    <div className="top-image">
                      {item.gambarBarang ? (
                        <img src={item.gambarBarang} alt={item.namaBarang} />
                      ) : (
                        <div className="top-placeholder">📦</div>
                      )}
                    </div>
                    <div className="top-info">
                      <h3>{item.namaBarang}</h3>
                      <p className="top-desc">{item.deskripsi || 'Produk daur ulang berkualitas'}</p>
                      <p className="top-price">🪙 {item.hargaKoin} Poin</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">🌿 Manfaat Menukar Sampah di Recyclefy</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <span className="benefit-icon">🌍</span>
                <h3>Lingkungan Bersih</h3>
                <p>Mengurangi sampah berakhir di TPA</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">💰</span>
                <h3>Nilai Ekonomi</h3>
                <p>Sampah berubah jadi poin dan produk bermanfaat</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">♻️</span>
                <h3>Daur Ulang</h3>
                <p>Sampah diolah menjadi produk baru bernilai jual</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">🤝</span>
                <h3>Komunitas</h3>
                <p>Bergotong royong menjaga kebersihan lingkungan</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">🏆</span>
                <h3>Penghargaan</h3>
                <p>Dapatkan poin dan naik peringkat di leaderboard</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">🔄</span>
                <h3>Ekonomi Sirkular</h3>
                <p>Mendukung ekonomi sirkular dengan mengubah sampah</p>
              </div>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">👨‍💻 Developer</h2>
            <div className="developer-card">
              <div className="developer-avatar">
                <Image 
                  src="/uploads/lytacv.png" 
                  alt="Earlyta Dwi Anggraeni" 
                  width={100} 
                  height={100} 
                  className="developer-photo"
                />
              </div>
              <div className="developer-info">
                <h3>Earlyta Dwi Anggraeni</h3>
                <p>Full Stack Developer | Recyclefy Creator</p>
                <p className="developer-quote">"Membangun masa depan yang lebih hijau, satu sampah pada satu waktu."</p>
                <div className="developer-social">
                  <a href="https://github.com/zegow8" target="_blank" rel="noopener noreferrer">🐙 GitHub</a>
                  <a href="https://instagram.com/eddlyaa__" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
                  <a href="https://wa.me/6281547184307" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
                </div>
              </div>
            </div>
          </section>
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

        /* Active state with gradient background */
        .navbar-menu a.active {
          background: linear-gradient(135deg, #66BB6A, #43A047);
          color: #FFFFFF;
          font-weight: 700;
          box-shadow: 
            0 3px 0px 0px rgba(0, 0, 0, 0.2),
            0 4px 12px rgba(102, 187, 106, 0.3);
          transform: translateY(-1px);
        }

        /* Hover effect for non-active links */
        .navbar-menu a:not(.active):hover {
          background: #E8F5E9;
          color: #1B5E20;
          transform: translateY(-2px);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.06);
        }

        /* Active indicator underline for non-active links on hover */
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

        /* Active link decorative dot */
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

        .hero {
          background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
          border-radius: 20px;
          padding: 48px 40px;
          text-align: center;
          margin-bottom: 40px;
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.12),
            10px 10px 0px 0px rgba(0, 0, 0, 0.06),
            0 20px 40px rgba(0, 0, 0, 0.06);
          border: 2px solid rgba(102, 187, 106, 0.2);
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          background: rgba(102, 187, 106, 0.05);
          border-radius: 50%;
          top: -100px;
          right: -100px;
        }

        .hero h1 {
          font-size: 32px;
          font-weight: 800;
          color: #1B5E20;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .hero h1 span {
          color: #66BB6A;
          position: relative;
        }

        .hero h1 span::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #66BB6A, #4CAF50);
          border-radius: 2px;
        }

        .hero p {
          font-size: 18px;
          color: #424242;
          margin-bottom: 24px;
          font-weight: 500;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .hero-stat {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 14px;
          padding: 20px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(102, 187, 106, 0.1);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.04);
        }

        .hero-stat:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(102, 187, 106, 0.15);
          background: rgba(255, 255, 255, 0.9);
        }

        .hero-stat .stat-number {
          display: block;
          font-size: 30px;
          font-weight: 800;
          color: #1B5E20;
        }

        .hero-stat .stat-label {
          font-size: 14px;
          color: #424242;
          font-weight: 500;
        }

        .section {
          margin-bottom: 44px;
        }

        .section-title {
          font-size: 26px;
          font-weight: 800;
          color: #1B5E20;
          margin-bottom: 18px;
          letter-spacing: -0.3px;
          text-shadow: 2px 2px 0px rgba(102, 187, 106, 0.08);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .btn-view-all {
          padding: 10px 20px;
          background: linear-gradient(135deg, #66BB6A, #43A047);
          color: #FFFFFF;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 3px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .btn-view-all:hover {
          background: linear-gradient(135deg, #4CAF50, #2E7D32);
          transform: translateY(-2px);
          box-shadow: 0 5px 0px 0px rgba(0, 0, 0, 0.15);
        }

        .card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 28px 32px;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(102, 187, 106, 0.08);
          transition: all 0.3s ease;
        }

        .card:hover {
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.06),
            0 12px 32px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .card p {
          font-size: 16px;
          color: #424242;
          line-height: 1.8;
          margin-bottom: 12px;
        }

        .card p strong {
          color: #1B5E20;
        }

        .visi-misi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .visi-card,
        .misi-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 28px 30px;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(102, 187, 106, 0.08);
          transition: all 0.3s ease;
        }

        .visi-card:hover,
        .misi-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.06),
            0 12px 32px rgba(0, 0, 0, 0.06);
        }

        .visi-card h3,
        .misi-card h3 {
          font-size: 20px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 10px;
        }

        .visi-card p {
          font-size: 16px;
          color: #424242;
          line-height: 1.8;
        }

        .misi-card ul {
          list-style: none;
          padding: 0;
        }

        .misi-card ul li {
          font-size: 15px;
          color: #424242;
          padding: 8px 0;
          padding-left: 28px;
          position: relative;
          border-bottom: 1px solid #F5F5F5;
        }

        .misi-card ul li:last-child {
          border-bottom: none;
        }

        .misi-card ul li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #66BB6A;
          font-weight: 700;
          font-size: 18px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .step-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 28px 20px;
          text-align: center;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(102, 187, 106, 0.08);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .step-card:hover {
          transform: translateY(-8px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
          border-color: rgba(102, 187, 106, 0.2);
        }

        .step-number {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #66BB6A, #43A047);
          color: #FFFFFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
          margin: 0 auto 14px;
          box-shadow: 0 4px 0px 0px rgba(0, 0, 0, 0.12);
          transition: all 0.3s ease;
        }

        .step-card:hover .step-number {
          transform: scale(1.05);
        }

        .step-card h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 6px;
        }

        .step-card p {
          font-size: 13px;
          color: #757575;
          font-weight: 500;
        }

        .reason-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .reason-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 24px 20px;
          text-align: center;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(102, 187, 106, 0.08);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .reason-card:hover {
          transform: translateY(-6px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
          border-color: rgba(102, 187, 106, 0.2);
        }

        .reason-icon {
          font-size: 40px;
          display: block;
          margin-bottom: 10px;
        }

        .reason-card h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 6px;
        }

        .reason-card p {
          font-size: 13px;
          color: #757575;
          font-weight: 500;
        }

        .top-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .top-card {
          background: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(102, 187, 106, 0.08);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .top-card:hover {
          transform: translateY(-6px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
          border-color: rgba(102, 187, 106, 0.15);
        }

        .top-image {
          height: 130px;
          background: linear-gradient(135deg, #F5F5F5, #E8F5E9);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .top-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .top-placeholder {
          font-size: 52px;
        }

        .top-info {
          padding: 18px 20px;
        }

        .top-info h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 4px;
        }

        .top-desc {
          font-size: 13px;
          color: #757575;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-weight: 500;
        }

        .top-poin,
        .top-price {
          font-size: 16px;
          font-weight: 700;
          background: linear-gradient(135deg, #FFC107, #FFB300);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .benefit-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 24px 20px;
          text-align: center;
          box-shadow: 
            4px 4px 0px 0px rgba(0, 0, 0, 0.06),
            0 8px 24px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(102, 187, 106, 0.08);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .benefit-card:hover {
          transform: translateY(-6px);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 16px 40px rgba(0, 0, 0, 0.06);
          border-color: rgba(102, 187, 106, 0.2);
        }

        .benefit-icon {
          font-size: 40px;
          display: block;
          margin-bottom: 10px;
        }

        .benefit-card h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1B5E20;
          margin-bottom: 6px;
        }

        .benefit-card p {
          font-size: 13px;
          color: #757575;
          font-weight: 500;
        }

        .developer-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 36px;
          display: flex;
          gap: 36px;
          align-items: center;
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.08),
            0 12px 32px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(102, 187, 106, 0.08);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .developer-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            8px 8px 0px 0px rgba(0, 0, 0, 0.08),
            0 20px 48px rgba(0, 0, 0, 0.06);
          border-color: rgba(102, 187, 106, 0.15);
        }

        .developer-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 4px solid #66BB6A;
          box-shadow: 0 4px 0px 0px rgba(0, 0, 0, 0.1);
        }

        .developer-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .developer-info h3 {
          font-size: 24px;
          font-weight: 800;
          color: #1B5E20;
        }

        .developer-info p {
          font-size: 15px;
          color: #424242;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .developer-quote {
          font-style: italic;
          color: #757575 !important;
          margin: 10px 0 !important;
          font-weight: 400 !important;
          padding: 12px 20px;
          background: #F5F5F5;
          border-radius: 10px;
          border-left: 4px solid #66BB6A;
        }

        .developer-social {
          display: flex;
          gap: 14px;
          margin-top: 14px;
        }

        .developer-social a {
          padding: 8px 20px;
          background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
          color: #1B5E20;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 0px 0px rgba(0, 0, 0, 0.06);
        }

        .developer-social a:hover {
          background: linear-gradient(135deg, #66BB6A, #43A047);
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 4px 0px 0px rgba(0, 0, 0, 0.12);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 30px;
          color: #757575;
          background: #FFFFFF;
          border-radius: 12px;
          font-weight: 500;
          border: 2px dashed #E8F5E9;
        }

        @media (max-width: 768px) {
          .hero-stats {
            grid-template-columns: 1fr 1fr;
          }

          .visi-misi-grid {
            grid-template-columns: 1fr;
          }

          .steps-grid {
            grid-template-columns: 1fr 1fr;
          }

          .reason-grid {
            grid-template-columns: 1fr 1fr;
          }

          .top-grid {
            grid-template-columns: 1fr 1fr;
          }

          .benefits-grid {
            grid-template-columns: 1fr 1fr;
          }

          .developer-card {
            flex-direction: column;
            text-align: center;
            padding: 28px 20px;
          }

          .navbar-menu {
            display: none;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .hero {
            padding: 32px 20px;
          }

          .hero h1 {
            font-size: 28px;
          }
        }

        @media (max-width: 480px) {
          .hero-stats {
            grid-template-columns: 1fr;
          }

          .steps-grid {
            grid-template-columns: 1fr;
          }

          .reason-grid {
            grid-template-columns: 1fr;
          }

          .top-grid {
            grid-template-columns: 1fr;
          }

          .benefits-grid {
            grid-template-columns: 1fr;
          }

          .hero h1 {
            font-size: 24px;
          }

          .hero p {
            font-size: 16px;
          }

          .developer-social {
            flex-direction: column;
            align-items: center;
          }

          .developer-social a {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}