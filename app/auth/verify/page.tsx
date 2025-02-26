'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Doğrulama başarısız');
      }

      // Başarılı doğrulama sonrası login sayfasına yönlendir
      router.push(`/auth/login?message=E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.&email=${email}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="text-center text-red-400">
            Geçersiz doğrulama bağlantısı
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            E-posta Doğrulama
          </h2>
          <p className="mt-2 text-white/60">
            {email} adresine gönderilen 6 haneli doğrulama kodunu giriniz
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          <div>
            <label htmlFor="code" className="sr-only">
              Doğrulama Kodu
            </label>
            <input
              id="code"
              type="text"
              maxLength={6}
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading || verificationCode.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Doğrulanıyor...' : 'Doğrula'}
            </button>
          </div>
        </motion.form>

        <div className="text-center text-sm text-gray-400">
          <p>Doğrulama kodunu almadınız mı?</p>
          <button
            onClick={() => router.push('/auth/register')}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Tekrar kayıt olun
          </button>
        </div>
      </div>
    </div>
  );
}
