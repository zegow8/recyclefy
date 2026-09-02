'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama: '',
    email: '',
    noHp: '',
    alamat: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak cocok!');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          noHp: form.noHp,
          alamat: form.alamat,
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success('Registrasi berhasil! Silakan login.');
      router.push('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-wrapper">
            <Image 
              src="/uploads/recyclefy-logo.png" 
              alt="Recyclefy Logo" 
              width={50} 
              height={50} 
              className="auth-logo"
              priority
            />
          </div>
          <h1 className="auth-title">
            Recycle<span>fy</span>
          </h1>
          <p className="auth-subtitle">Daftar akun baru</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nama" className="form-label">
              Nama Lengkap
            </label>
            <input
              id="nama"
              type="text"
              className="form-input"
              placeholder="Masukkan nama lengkap"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Masukkan email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="noHp" className="form-label">
              Nomor Telepon
            </label>
            <input
              id="noHp"
              type="tel"
              className="form-input"
              placeholder="Contoh: 081234567890"
              value={form.noHp}
              onChange={(e) => setForm({ ...form, noHp: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="alamat" className="form-label">
              Alamat
            </label>
            <textarea
              id="alamat"
              className="form-input form-textarea"
              placeholder="Masukkan alamat lengkap"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Minimal 6 karakter"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Ketik ulang password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-auth"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Sudah punya akun?{' '}
            <Link href="/login" className="auth-link">
              Login sekarang
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        /* Decorative background elements */
        .auth-container::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: rgba(102, 187, 106, 0.08);
          border-radius: 50%;
          top: -100px;
          right: -100px;
          animation: floatBubble 8s ease-in-out infinite;
        }

        .auth-container::after {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: rgba(102, 187, 106, 0.06);
          border-radius: 50%;
          bottom: -150px;
          left: -150px;
          animation: floatBubble 10s ease-in-out infinite reverse;
        }

        @keyframes floatBubble {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.05); }
        }

        .auth-card {
          background: #FFFFFF;
          border-radius: 24px;
          box-shadow: 
            8px 8px 0px 0px rgba(0, 0, 0, 0.25),
            12px 12px 0px 0px rgba(0, 0, 0, 0.15),
            0 20px 60px rgba(0, 0, 0, 0.12);
          padding: 40px 40px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          z-index: 2;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 2px solid rgba(102, 187, 106, 0.15);
        }

        .auth-card:hover {
          transform: translateY(-4px);
          box-shadow: 
            10px 10px 0px 0px rgba(0, 0, 0, 0.25),
            16px 16px 0px 0px rgba(0, 0, 0, 0.15),
            0 30px 80px rgba(0, 0, 0, 0.15);
        }

        .auth-card::-webkit-scrollbar {
          width: 6px;
        }

        .auth-card::-webkit-scrollbar-track {
          background: #F5F5F5;
          border-radius: 10px;
        }

        .auth-card::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #66BB6A, #4CAF50);
          border-radius: 10px;
        }

        .auth-card::-webkit-scrollbar-thumb:hover {
          background: #2E7D32;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .logo-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
          position: relative;
        }

        .auth-logo {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          filter: drop-shadow(0 4px 8px rgba(102, 187, 106, 0.2));
        }

        .auth-logo:hover {
          transform: scale(1.05) rotate(-4deg);
          filter: drop-shadow(0 8px 16px rgba(102, 187, 106, 0.3));
        }

        .auth-title {
          font-size: 32px;
          font-weight: 800;
          color: #1B5E20;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 0px rgba(102, 187, 106, 0.15);
          transition: all 0.3s ease;
        }

        .auth-title span {
          color: #66BB6A;
          position: relative;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .auth-title span::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #66BB6A, #4CAF50);
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.4s ease;
        }

        .auth-title:hover span::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .auth-subtitle {
          font-size: 16px;
          color: #757575;
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-label {
          font-size: 11px;
          font-weight: 700;
          color: #424242;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }

        .form-input {
          padding: 12px 16px;
          border: 2.5px solid #E8F5E9;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: #FAFAFA;
          color: #1B5E20;
          font-weight: 500;
          font-family: inherit;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .form-input::placeholder {
          color: #BDBDBD;
          font-weight: 400;
          font-size: 14px;
        }

        .form-input:focus {
          border-color: #66BB6A;
          background: #FFFFFF;
          box-shadow: 
            0 0 0 4px rgba(102, 187, 106, 0.12),
            4px 4px 0px 0px rgba(0, 0, 0, 0.08);
          transform: scale(1.01);
          outline: none;
        }

        .form-input:hover:not(:focus) {
          border-color: #A5D6A7;
          background: #FFFFFF;
          transform: scale(1.005);
        }

        .form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .btn-auth {
          padding: 16px;
          background: linear-gradient(135deg, #66BB6A 0%, #43A047 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          margin-top: 8px;
          position: relative;
          overflow: hidden;
          box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.2);
        }

        .btn-auth::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          transition: left 0.6s ease;
        }

        .btn-auth:hover:not(:disabled)::before {
          left: 100%;
        }

        .btn-auth:hover:not(:disabled) {
          background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
          transform: translateY(-3px) scale(1.01);
          box-shadow: 
            6px 6px 0px 0px rgba(0, 0, 0, 0.25),
            0 12px 24px rgba(76, 175, 80, 0.25);
        }

        .btn-auth:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.2);
        }

        .btn-auth:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: scale(0.98);
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.1);
        }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: #757575;
          padding-top: 20px;
          border-top: 2px solid #E8F5E9;
        }

        .auth-link {
          color: #66BB6A;
          font-weight: 700;
          transition: all 0.3s ease;
          position: relative;
          text-decoration: none;
          padding: 2px 0;
        }

        .auth-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2.5px;
          background: linear-gradient(90deg, #66BB6A, #4CAF50);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }

        .auth-link:hover {
          color: #2E7D32;
        }

        .auth-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 24px 16px;
            border-radius: 20px;
            max-height: 95vh;
          }

          .auth-title {
            font-size: 28px;
          }

          .auth-logo {
            width: 42px;
            height: 42px;
          }
        }
      `}</style>
    </div>
  );
}