'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FaInstagram, FaLinkedin, FaDiscord, FaSignOutAlt } from 'react-icons/fa';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/auth/');
  const currentPath = pathname || '';

  const navItems = [
    { name: 'Projeler', path: '/projects' },
    { name: 'İletişim', path: '/iletisim' },
  ];

  // Eğer kullanıcı giriş yapmışsa kurslarım sekmesini ekle
  const authNavItems = user ? [...navItems.slice(0, 1), { name: 'Kurslarım', path: '/courses' }, ...navItems.slice(1)] : navItems;

  const socialLinks = [
    { icon: FaInstagram, href: 'https://www.instagram.com/codesmedipol/', label: 'Instagram' },
    { icon: FaLinkedin, href: 'https://www.linkedin.com/company/medcodes', label: 'LinkedIn' },
    { icon: FaDiscord, href: 'https://discord.gg/rF4hQt99vz', label: 'Discord' },
  ];

  return (
    <header className="fixed top-4 left-4 right-4 z-[100]">
      <nav className="relative bg-[#10143c] border border-white/10 shadow-lg rounded-lg" style={{ backgroundColor: '#10143c' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full" style={{ height: '50px', paddingTop: '2px' }}>
              {/* Logo */}
              <div className="flex-1 flex justify-start pl-8">
                <Link href="/" className="flex items-center group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative">
                    <Image
                      src="/logo.png"
                      alt="MedCodes Logo"
                      width={45}
                      height={45}
                      className="mr-2 transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className="relative text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">
                    MedCodes
                  </span>
                </Link>
              </div>

              {/* Navigation Links */}
              {!isAuthPage && (
                <div className="flex-1 flex justify-center" style={{ paddingLeft: user ? '30px' : '200px' }}>
                  <div className="flex items-center w-[1000px] justify-evenly">
                    {authNavItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className="relative group px-8 py-2 mx-20"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/10 to-blue-600/0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-20 transition-all duration-300"></div>
                        <span className="relative text-white/80 text-lg font-medium transition-all duration-300 group-hover:text-white">
                          {item.name}
                        </span>
                        <span className="absolute bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Auth Button */}
              <div className="flex-1 flex justify-end items-center pr-8 space-x-8">
                {/* Social Links */}
                {!isAuthPage && (
                  <div className="flex space-x-8">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group px-4"
                        aria-label={link.label}
                      >
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                        <link.icon className="relative text-2xl text-white/80 transition-all duration-300 group-hover:text-blue-400 group-hover:scale-110" />
                      </a>
                    ))}
                  </div>
                )}
                {user ? (
                  <button
                    onClick={logout}
                    className="relative group p-2"
                    aria-label="Çıkış Yap"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                    <FaSignOutAlt className="relative text-2xl text-white/90 group-hover:text-red-400 transition-all duration-300 group-hover:scale-110" />
                  </button>
                ) : (
                  <div className="flex items-center space-x-4">
                    {(!isAuthPage || !currentPath.includes('login')) && (
                      <Link
                        href="/auth/login"
                        className="relative group"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                        <span className="relative px-4 py-2.5 text-white/90 font-medium text-base block border border-white/20 rounded-lg transition-all duration-300 group-hover:text-white group-hover:border-white/40 group-hover:scale-105">
                          Giriş Yap
                        </span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
} 