import Image from "next/image";
import Link from "next/link";
import { FaRocket, FaGraduationCap, FaCode } from "react-icons/fa";
import Scene from "../components/Scene";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a1e] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      {/* Scene */}
      <div className="absolute inset-0 -z-20">
        <Scene isLoggedIn={false} />
      </div>

      {/* Main Content */}
      <main className="relative min-h-screen z-10">
        {/* Content Container */}
        <div className="relative min-h-screen flex flex-col">
          {/* Hero Section */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                MedCodes ile Geleceğe Adım At
              </h1>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                Tıp ve teknoloji dünyasının kesişiminde, geleceğin sağlık teknolojilerini
                birlikte inşa ediyoruz.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link
                  href="/projects"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-500" />
                  <span className="relative flex items-center gap-2">
                    <FaRocket className="text-xl" />
                    Projeleri Keşfet
                  </span>
                </Link>
                <Link
                  href="/courses"
                  className="group relative px-8 py-4 bg-transparent border border-white/20 rounded-lg hover:border-white/40 hover:scale-105 transition-all duration-300"
                >
                  <span className="relative flex items-center gap-2">
                    <FaGraduationCap className="text-xl" />
                    Kurslara Göz At
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="relative max-w-7xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: FaCode,
                  title: "Modern Teknolojiler",
                  description: "En güncel teknolojilerle geliştirilen projeler ve kurslar."
                },
                {
                  icon: FaGraduationCap,
                  title: "Kapsamlı Eğitim",
                  description: "Detaylı ve interaktif eğitim içerikleri."
                },
                {
                  icon: FaRocket,
                  title: "Sürekli Gelişim",
                  description: "Düzenli güncellenen içerik ve projeler."
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  <feature.icon className="text-3xl mb-4 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
