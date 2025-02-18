'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(searchParams.get('message') || '');
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Form gönderiliyor:', {
        email: formData.email,
        passwordLength: formData.password.length
      });

      // Email formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Geçerli bir e-posta adresi giriniz');
      }

      // Şifre kontrolü
      if (formData.password.length < 8) {
        throw new Error('Şifre en az 8 karakter olmalıdır');
      }

      const response = await fetch('https://www.medcodes.systems/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('Sunucu yanıtı:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        throw new Error(data.error || 'Giriş başarısız');
      }

      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login hatası:', error);
      setError(error.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Hoş Geldiniz
        </h1>
        <p className="text-white/60 mt-2">
          Hesabınıza giriş yapın
        </p>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 text-green-400 p-3 rounded-lg text-sm text-center mb-6"
        >
          {message}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              E-posta
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/40"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/40"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-500" />
            <span className="relative">
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </span>
          </button>

          <p className="text-center text-white/60">
            Hesabınız yok mu?{' '}
            <Link
              href="/auth/register"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
            >
              Kayıt Olun
            </Link>
          </p>
        </motion.div>
      </form>
    </>
  );
} 