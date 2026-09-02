'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-section">
          <div className="footer-brand-wrapper">
            <Image 
              src="/uploads/recyclefy-logo.png" 
              alt="Recyclefy Logo" 
              width={40} 
              height={40} 
              className="footer-logo"
            />
            <h2 className="footer-brand">
              Recycle<span>fy</span>
            </h2>
          </div>
          <p className="footer-desc">
            Platform pengelolaan sampah berbasis komunitas untuk menciptakan lingkungan yang lebih bersih dan berkelanjutan.
          </p>
          <div className="footer-social">
            <a href="https://wa.me/6281547184307" target="_blank" rel="noopener noreferrer" className="social-link wa">
              💬 WhatsApp
            </a>
            <a href="https://instagram.com/eddlyaa__" target="_blank" rel="noopener noreferrer" className="social-link ig">
              📸 Instagram
            </a>
            <a href="https://github.com/zegow8" target="_blank" rel="noopener noreferrer" className="social-link gh">
              💻 GitHub
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Menu</h3>
          <ul className="footer-links">
            <li><Link href="/user/home">Beranda</Link></li>
            <li><Link href="/user/toko">Toko Barang</Link></li>
            <li><Link href="/user/setor">Setor Sampah</Link></li>
            <li><Link href="/user/riwayat-setor">Riwayat Setor</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Informasi</h3>
          <ul className="footer-links">
            <li><a href="#">Tentang Kami</a></li>
            <li><a href="#">Cara Kerja</a></li>
            <li><a href="#">Syarat & Ketentuan</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Kontak</h3>
          <div className="footer-contact">
            <p>📧 earlytadwi7@email.com</p>
            <p>📍 Sumur Batu, Jakarta Pusat</p>
            <p>🕐 Senin - Jumat: 08.00 - 17.00</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Recyclefy. Earlyta Dwi Anggraeni</p>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #1B5E20 0%, #0D3B0E 100%);
          color: #FFFFFF;
          padding: 48px 0 16px;
          margin-top: 40px;
          position: relative;
          overflow: hidden;
          border-top: 4px solid #66BB6A;
          box-shadow: 0 -8px 0px 0px rgba(0, 0, 0, 0.1);
        }

        /* Decorative background elements */
        .footer::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: rgba(102, 187, 106, 0.04);
          border-radius: 50%;
          bottom: -150px;
          right: -100px;
        }

        .footer::after {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          background: rgba(255, 193, 7, 0.03);
          border-radius: 50%;
          top: -100px;
          left: -50px;
        }

        .footer-container {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          position: relative;
          z-index: 2;
        }

        .footer-brand-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .footer-logo {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          filter: drop-shadow(0 2px 8px rgba(102, 187, 106, 0.2));
        }

        .footer-logo:hover {
          transform: scale(1.05) rotate(-4deg);
          filter: drop-shadow(0 4px 16px rgba(102, 187, 106, 0.3));
        }

        .footer-brand {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .footer-brand span {
          color: #66BB6A;
          position: relative;
        }

        .footer-brand span::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #66BB6A, #4CAF50);
          border-radius: 2px;
        }

        .footer-desc {
          font-size: 14px;
          opacity: 0.9;
          line-height: 1.8;
          margin-bottom: 20px;
          max-width: 400px;
          font-weight: 400;
        }

        .footer-social {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .social-link {
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.06);
          color: #FFFFFF;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .social-link:hover {
          transform: translateY(-3px) scale(1.02);
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 6px 0px 0px rgba(0, 0, 0, 0.15);
        }

        .social-link.wa:hover { 
          background: #25D366; 
          border-color: #25D366;
          box-shadow: 0 6px 0px 0px rgba(37, 211, 102, 0.3);
        }
        
        .social-link.ig:hover { 
          background: #E4405F; 
          border-color: #E4405F;
          box-shadow: 0 6px 0px 0px rgba(228, 64, 95, 0.3);
        }
        
        .social-link.gh:hover { 
          background: #333333; 
          border-color: #333333;
          box-shadow: 0 6px 0px 0px rgba(51, 51, 51, 0.3);
        }

        .footer-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 18px;
          color: #66BB6A;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          position: relative;
          padding-bottom: 10px;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #66BB6A, #4CAF50);
          border-radius: 2px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
        }

        .footer-links li {
          margin-bottom: 10px;
        }

        .footer-links a {
          font-size: 14px;
          opacity: 0.8;
          transition: all 0.3s ease;
          position: relative;
          padding-left: 0;
        }

        .footer-links a::before {
          content: '›';
          position: absolute;
          left: -12px;
          opacity: 0;
          transition: all 0.3s ease;
          color: #66BB6A;
          font-weight: 700;
        }

        .footer-links a:hover {
          opacity: 1;
          color: #66BB6A;
          padding-left: 16px;
        }

        .footer-links a:hover::before {
          opacity: 1;
          left: 0;
        }

        .footer-contact p {
          font-size: 14px;
          opacity: 0.85;
          margin-bottom: 8px;
          transition: all 0.3s ease;
          padding: 6px 0;
        }

        .footer-contact p:hover {
          opacity: 1;
          transform: translateX(4px);
          color: #66BB6A;
        }

        .footer-bottom {
          border-top: 1.5px solid rgba(255, 255, 255, 0.08);
          padding-top: 18px;
          text-align: center;
          margin-top: 32px;
          position: relative;
          z-index: 2;
        }

        .footer-bottom p {
          font-size: 13px;
          opacity: 0.6;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .footer-bottom p:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }

          .footer-desc {
            max-width: 100%;
          }

          .footer-title::after {
            width: 30px;
          }
        }

        @media (max-width: 480px) {
          .footer {
            padding: 32px 0 16px;
          }

          .footer-container {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .footer-brand {
            font-size: 24px;
          }

          .footer-social {
            justify-content: flex-start;
          }

          .social-link {
            padding: 8px 14px;
            font-size: 12px;
          }

          .footer-title {
            font-size: 14px;
          }

          .footer-title::after {
            width: 25px;
          }
        }
      `}</style>
    </footer>
  );
}