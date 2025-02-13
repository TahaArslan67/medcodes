'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaInstagram, FaLinkedin, FaDiscord, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.error || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      console.error('Form gönderimi sırasında hata:', error);
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: 'E-posta',
      value: 'info@medcodes.org',
      href: 'mailto:info@medcodes.org'
    }
  ];

  const socialLinks = [
    { 
      icon: FaInstagram, 
      href: 'https://www.instagram.com/codesmedipol/', 
      label: 'Instagram',
      description: 'Etkinliklerimizi ve güncel gelişmeleri takip edin'
    },
    { 
      icon: FaLinkedin, 
      href: 'https://www.linkedin.com/company/medcodes', 
      label: 'LinkedIn',
      description: 'Profesyonel ağımıza katılın ve kariyer fırsatlarını keşfedin'
    },
    { 
      icon: FaDiscord, 
      href: 'https://discord.gg/medcodes', 
      label: 'Discord',
      description: 'Topluluğumuza katılın ve diğer üyelerle etkileşime geçin'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1e] text-white pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
        >
          Bizimle İletişime Geçin
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/50"
                  placeholder="Adınız Soyadınız"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/50"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                  Konu
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/50"
                  placeholder="Mesajınızın konusu"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                  Mesaj
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/50 resize-none"
                  placeholder="Mesajınız..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-500" />
                <span className="relative">
                  {loading ? 'Gönderiliyor...' : 'Gönder'}
                </span>
              </button>

              {success && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 text-center mt-4"
                >
                  Mesajınız başarıyla gönderildi!
                </motion.p>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-center mt-4"
                >
                  {error}
                </motion.p>
              )}
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Contact Cards */}
            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <a
                  key={info.title}
                  href={info.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg">
                      <info.icon className="text-2xl text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white/90">{info.title}</h3>
                      <p className="text-white/70">{info.value}</p>
                    </div>
                  </motion.div>
                </a>
              ))}
            </div>

            {/* Social Links */}
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
              <h3 className="text-2xl font-semibold mb-6 text-white/90">Sosyal Medya</h3>
              <div className="grid gap-6">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="group flex items-center space-x-4 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300"
                    aria-label={link.label}
                  >
                    <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg group-hover:from-blue-600/30 group-hover:to-purple-600/30 transition-all duration-300">
                      <link.icon className="text-2xl text-white/80 group-hover:text-blue-400 transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors duration-300">
                        {link.label}
                      </h4>
                      <p className="text-white/60 group-hover:text-white/80 transition-colors duration-300">
                        {link.description}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 h-[300px] relative overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d195884.63449307535!2d32.61279664761033!3d39.90329559177069!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d347d520732db1%3A0xbdc57b0c0842b8d!2sAnkara!5e0!3m2!1str!2str!4v1710164892244!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 