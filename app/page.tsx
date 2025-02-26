'use client';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Scene = dynamic(() => import('@/src/components/Scene'), {
  ssr: false
});

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a2e]">
      <div className="flex-grow flex items-center justify-center relative">
        <div className="absolute inset-0">
          <Suspense fallback={<div>Yükleniyor...</div>}>
            <Scene isLoggedIn={false} />
          </Suspense>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold text-white mb-6"
          >
            MedCodes
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Yazılım alanında kendini geliştirmek isteyen öğrenciler
            için eğitimler, ve projeler düzenliyoruz.
          </motion.p>
          
          {!user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center space-x-4"
            >
              <Link
                href="/projects"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Projelerimiz
              </Link>
              <Link
                href="/auth/register"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-colors font-medium"
              >
                Bize Katıl
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}