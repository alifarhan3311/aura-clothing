import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, Globe, Video, Mail, MapPin, Phone } from 'lucide-react';

const footerLinks = {
  Shop: [
    { label: 'Women', to: '/women' },
    { label: 'Men', to: '/men' },
    { label: 'Kids', to: '/kids' },
    { label: 'New Arrivals', to: '/women' },
    { label: 'Sale', to: '/women' },
  ],
  Help: [
    { label: 'Shipping Policy', to: '/contact' },
    { label: 'Returns & Exchanges', to: '/contact' },
    { label: 'Size Guide', to: '/contact' },
    { label: 'FAQ', to: '/contact' },
    { label: 'Track Order', to: '/contact' },
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
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Brand column */}
        <div className="lg:col-span-2">
          <Link to="/">
            <span className="text-2xl font-black tracking-[0.25em] text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              MH Clothing
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-gray-400 max-w-xs">
            Elevating everyday style with thoughtfully crafted clothing. Premium quality, accessible luxury.
          </p>

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
              <span>hello@MH Clothingclothing.pk</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            {[
              { Icon: Share2, label: 'Share' },
              { Icon: Globe, label: 'Website' },
              { Icon: Video, label: 'Media' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all duration-200"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-white font-semibold text-sm tracking-widest uppercase mb-4">
              {title}
            </h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200"
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
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} MH Clothing Clothing. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
          {/* Payment icons placeholder */}
          <div className="flex items-center gap-2 text-gray-600">
            <span className="bg-white/10 rounded px-2 py-1 text-xs">VISA</span>
            <span className="bg-white/10 rounded px-2 py-1 text-xs">MC</span>
            <span className="bg-white/10 rounded px-2 py-1 text-xs">JCB</span>
            <span className="bg-white/10 rounded px-2 py-1 text-xs">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
