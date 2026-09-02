'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      toast.success('Login berhasil!');
      
      // Redirect berdasarkan role
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      
      if (session?.user?.role === 'SUPER_ADMIN') {
        router.push('/superadmin/dashboard');
      } else if (session?.user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/home');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
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
              width={60} 
              height={60} 
              className="auth-logo"
              priority
            />
          </div>
          <h1 className="auth-title">
            Recycle<span>fy</span>
          </h1>
          <p className="auth-subtitle">Selamat datang kembali!</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Masukkan email Anda"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
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
              placeholder="Masukkan password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-auth"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Belum punya akun?{' '}
            <Link href="/register" className="auth-link">
              Daftar sekarang
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
          padding: 48px 40px;
          width: 100%;
          max-width: 440px;
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

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
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
          font-size: 36px;
          font-weight: 800;
          color: #1B5E20;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
          transition: all 0.3s ease;
          text-shadow: 2px 2px 0px rgba(102, 187, 106, 0.15);
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
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 700;
          color: #424242;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          font-size: 11px;
          transition: all 0.3s ease;
        }

        .form-input {
          padding: 14px 18px;
          border: 2.5px solid #E8F5E9;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: #FAFAFA;
          color: #1B5E20;
          font-weight: 500;
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
          margin-top: 28px;
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

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, transparent, #E0E0E0, transparent);
          border-radius: 2px;
        }

        .auth-divider span {
          font-size: 12px;
          color: #BDBDBD;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .auth-demo {
          background: linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%);
          border-radius: 12px;
          padding: 16px 20px;
          border: 2px solid #E8F5E9;
          transition: all 0.3s ease;
        }

        .auth-demo:hover {
          border-color: #A5D6A7;
          box-shadow: 0 4px 12px rgba(102, 187, 106, 0.08);
        }

        .demo-title {
          font-size: 11px;
          font-weight: 700;
          color: #757575;
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }

        .demo-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .demo-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          padding: 6px 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.5);
        }

        .demo-item:hover {
          background: #FFFFFF;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transform: translateX(4px);
        }

        .demo-role {
          background: linear-gradient(135deg, #66BB6A 0%, #43A047 100%);
          color: #FFFFFF;
          padding: 2px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          min-width: 70px;
          text-align: center;
          letter-spacing: 0.3px;
          box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.08);
        }

        .demo-email {
          color: #424242;
          font-family: 'SF Mono', 'Courier New', monospace;
          font-size: 12px;
          font-weight: 500;
        }

        .demo-pass {
          background: #E8F5E9;
          padding: 2px 10px;
          border-radius: 6px;
          font-family: 'SF Mono', 'Courier New', monospace;
          font-size: 11px;
          color: #2E7D32;
          font-weight: 600;
          border: 1px solid #A5D6A7;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 32px 20px;
            border-radius: 20px;
          }

          .auth-title {
            font-size: 30px;
          }

          .demo-item {
            flex-wrap: wrap;
            padding: 8px;
          }

          .demo-email {
            font-size: 11px;
          }

          .auth-logo {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </div>
  );
}