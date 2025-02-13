'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register } = useAuth();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  // Şifre gücünü kontrol eden fonksiyon
  const checkPasswordStrength = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // reCAPTCHA doğrulaması
      const recaptchaToken = recaptchaRef.current?.getValue();
      if (!recaptchaToken) {
        throw new Error('Lütfen robot olmadığınızı doğrulayın');
      }

      // E-posta formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Geçerli bir e-posta adresi giriniz');
      }

      // Şifre kontrolü
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Şifreler eşleşmiyor');
      }

      // Şifre uzunluğu ve gücü kontrolü
      if (formData.password.length < 8) {
        throw new Error('Şifre en az 8 karakter olmalıdır');
      }

      if (!checkPasswordStrength(formData.password)) {
        throw new Error('Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir');
      }

      await register(formData.name, formData.email, formData.password, recaptchaToken);
      router.push('/auth/login?message=Kayıt başarılı. Lütfen giriş yapın.');
      
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
          Aramıza Katılın
        </h1>
        <p className="text-white/60 mt-2">
          Yeni bir hesap oluşturun
        </p>
      </motion.div>

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
              Ad Soyad
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/40"
                placeholder="Adınız Soyadınız"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
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
            transition={{ duration: 0.5, delay: 0.3 }}
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
                minLength={6}
                className="block w-full pl-10 px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/40"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Şifre Tekrar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                className="block w-full pl-10 px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/40"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-4"
        >
          <div className="flex justify-center mb-4">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={(value) => {
                if (value) {
                  setIsVerified(true);
                  setError('');
                } else {
                  setIsVerified(false);
                  setError('Lütfen robot olmadığınızı doğrulayın');
                }
              }}
              onExpired={() => {
                setIsVerified(false);
                setError('reCAPTCHA süresi doldu, lütfen tekrar doğrulayın');
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isVerified}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-500" />
            <span className="relative">
              {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </span>
          </button>

          <p className="text-center text-white/60">
            Zaten hesabınız var mı?{' '}
            <Link
              href="/auth/login"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
            >
              Giriş Yapın
            </Link>
          </p>
        </motion.div>
      </form>
    </>
  );
} 