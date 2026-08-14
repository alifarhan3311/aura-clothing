import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, Send, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

const footerLinks = {
  Shop: [
    { label: 'Women', to: '/shop?section=women' },
    { label: 'Men', to: '/shop?section=men' },
    { label: 'Kids', to: '/shop?section=kids' },
    { label: 'New Arrivals', to: '/shop' },
    { label: 'Sale', to: '/shop' },
  ],
  Help: [
    { label: 'Shipping Policy', to: '/contact' },
    { label: 'Returns & Exchanges', to: '/contact' },
    { label: 'Size Guide', to: '/contact' },
    { label: 'FAQ', to: '/contact' },
    { label: 'Track Order', to: '/track' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Careers', to: '/about' },
    { label: 'Press', to: '/about' },
    { label: 'Sustainability', to: '/about' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Brand column */}
        <div className="lg:col-span-2">
          <Link to="/">
            <span className="text-2xl font-black tracking-[0.25em] text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Fade Find
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-gray-400 max-w-xs">
            Elevating everyday style with thoughtfully crafted clothing. Premium quality, accessible luxury.
          </p>

          {/* Contact info */}
          <div className="mt-6 space-y-2.5 text-sm text-gray-400">
            <div className="flex items-center gap-2.5">
              <MapPin size={14} className="text-amber-500 shrink-0" />
              <span>14-F, Gulberg III, Lahore, Pakistan</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={14} className="text-amber-500 shrink-0" />
              <span>+92 300 1234 567</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-amber-500 shrink-0" />
              <span>hello@fadefind.pk</span>
            </div>
          </div>

          {/* Social / Connect icons */}
          <div className="mt-6 flex items-center gap-3">
            {[
              { Icon: Globe, label: 'Website' },
              { Icon: Share2, label: 'Share' },
              { Icon: Send, label: 'Contact' },
              { Icon: Mail, label: 'Email' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all duration-200"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>

          {/* Shop CTA */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 mt-8 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group"
          >
            Explore Collection <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-white font-black text-xs tracking-widest uppercase mb-5">
              {title}
            </h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-500 hover:text-amber-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Fade Find Clothing. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          </div>
          {/* Payment icons */}
          <div className="flex items-center gap-1.5 text-gray-600">
            {['VISA', 'MC', 'JCB', 'COD'].map((m) => (
              <span key={m} className="bg-white/6 border border-white/10 rounded-md px-2 py-1 text-[10px] font-bold">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
