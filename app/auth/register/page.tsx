'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';

export const dynamic = 'force-dynamic';

function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // İsim kontrolü
      if (!formData.name.trim()) {
        throw new Error('Ad Soyad alanı zorunludur');
      }

      if (formData.name.trim().length < 2) {
        throw new Error('Ad Soyad en az 2 karakter olmalıdır');
      }

      // Email formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Geçerli bir e-posta adresi giriniz');
      }

      // Şifre kontrolü
      if (formData.password.length < 8) {
        throw new Error('Şifre en az 8 karakter olmalıdır');
      }

      // Şifre karmaşıklık kontrolü
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(formData.password)) {
        throw new Error('Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir');
      }

      // reCAPTCHA doğrulaması
      const recaptchaToken = recaptchaRef.current?.getValue();
      if (!recaptchaToken) {
        throw new Error('Lütfen robot olmadığınızı doğrulayın');
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name: formData.name.trim(), 
          email: formData.email.trim(), 
          password: formData.password, 
          recaptchaToken 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt olurken bir hata oluştu');
      }

      if (data) {
        const loginUrl = `/auth/login?${new URLSearchParams({
          message: 'Kayıt başarılı. Lütfen giriş yapın.',
          email: formData.email
        })}`;
        router.push(loginUrl);
      }
    } catch (error: any) {
      setError(error.message || 'Kayıt olurken bir hata oluştu');
      recaptchaRef.current?.reset();
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
          Kayıt Ol
        </h1>
        <p className="text-white/60 mt-2">
          Hesap oluşturun ve hemen başlayın
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm text-center mb-4"
        >
          {error}
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Ad Soyad
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaUser />
            </span>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ad Soyad"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            E-posta
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaEnvelope />
            </span>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ornek@mail.com"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Şifre
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <FaLock />
            </span>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <p className="mt-2 text-sm text-gray-400">
            En az 8 karakter, bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir
          </p>
        </div>

        <div className="flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            theme="dark"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </div>

        <div className="text-center text-sm">
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
            Zaten hesabınız var mı? Giriş yapın
          </Link>
        </div>
      </motion.form>
    </>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
        <RegisterForm />
      </div>
    </div>
  );
}