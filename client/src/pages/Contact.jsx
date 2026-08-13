import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Share2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    toast.success('Message sent! We\'ll get back to you within 24 hours.', {
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px', background: '#1a1a1a', color: '#fff' },
      duration: 4000,
    });
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <main>
      {/* Hero */}
      <div className="bg-[#f7f3ee] py-16 text-center">
        <p className="text-xs font-semibold tracking-[0.35em] uppercase text-amber-700 mb-3">Get In Touch</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
          Contact Us
        </h1>
        <p className="text-gray-500 mt-3 text-sm">We'd love to hear from you. Our team is always here to help.</p>
      </div>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Reach Out to Us
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Whether you have a question about your order, need help with sizing, or just want to say hello — we're here.
            </p>

            {[
              { Icon: MapPin, title: 'Visit Us', value: '14-F, Gulberg III, Lahore, Punjab, Pakistan' },
              { Icon: Phone, title: 'Call Us', value: '+92 300 1234 567' },
              { Icon: Mail, title: 'Email Us', value: 'hello@Fade Findclothing.pk' },
            ].map(({ Icon, title, value }) => (
              <div key={title} className="flex gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide uppercase text-gray-400 mb-0.5">{title}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              </div>
            ))}

            {/* Social */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Follow Us</p>
              <div className="flex gap-3">
                {[{ Icon: Share2, label: 'Share' }, { Icon: Globe, label: 'Website' }].map(({ Icon, label }) => (
                  <a key={label} href="#" aria-label={label} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-amber-500 hover:text-white text-gray-600 transition-all">
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden h-44 bg-gray-100 relative">
              <img
                src="https://images.unsplash.com/photo-1524813686514-a57563d77965?w=600&q=70"
                alt="Location"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 shadow-md">
                  <MapPin size={14} className="text-amber-600" />
                  <span className="text-xs font-semibold text-gray-800">Gulberg III, Lahore</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="bg-[#fafafa] rounded-3xl p-8 space-y-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Send a Message</h2>
              <p className="text-sm text-gray-500 mb-6">We typically respond within 24 hours.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Sara Ahmed" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="sara@example.com" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject</label>
                <input name="subject" value={form.subject} onChange={handleChange} placeholder="Order inquiry, return request..." className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message *</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Tell us how we can help you..." className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors resize-none" />
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors duration-200"
              >
                <Send size={15} />
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
