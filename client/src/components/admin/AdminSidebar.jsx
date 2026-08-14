import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Tag,
  Layers,
  Ticket,
  Package,
  Users,
  ShoppingCart,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Sliders,
  Store,
} from 'lucide-react';

export default function AdminSidebar({ statsCounts = {}, onCloseMobile }) {
  const location = useLocation();

  const navItems = [
    {
      name: 'Overview',
      path: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: ShoppingCart,
      count: statsCounts.orders,
      alertCount: statsCounts.cancelRequests,
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: Package,
      count: statsCounts.products,
    },
    {
      name: 'Departments',
      path: '/admin/departments',
      icon: Layers,
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: Layers,
      count: statsCounts.categories,
    },
    {
      name: 'Brands',
      path: '/admin/brands',
      icon: Tag,
      count: statsCounts.brands,
    },
    {
      name: 'Coupons',
      path: '/admin/coupons',
      icon: Ticket,
      count: statsCounts.coupons,
    },
    {
      name: 'Hero Slider',
      path: '/admin/slides',
      icon: Sliders,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: Users,
      count: statsCounts.users,
    },
  ];

  const checkIsActive = (item) => {
    if (item.exact) return location.pathname === '/admin' || location.pathname === '/admin/';
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside className="w-64 bg-gray-950 text-white flex flex-col h-full border-r border-white/5 select-none">
      {/* Brand logo & header */}
      <div className="px-5 py-5 border-b border-white/5">
        <NavLink to="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c9a96e] via-[#e0c08a] to-[#c9a96e] flex items-center justify-center text-gray-950 font-black text-sm shadow-lg shadow-[#c9a96e]/25 group-hover:shadow-[#c9a96e]/40 group-hover:scale-105 transition-all duration-200 shrink-0">
            MH
          </div>
          <div className="leading-tight">
            <h1 className="font-serif font-bold text-base text-white tracking-wide leading-none group-hover:text-[#c9a96e] transition-colors duration-200">
              Fade Find
            </h1>
            <span className="text-[10px] font-bold text-[#c9a96e]/70 uppercase tracking-[0.2em] block mt-0.5">
              Admin Portal
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto scrollbar-none">
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">
          Management
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = checkIsActive(item);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-[#c9a96e] text-gray-950 shadow-md shadow-[#c9a96e]/25'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={16}
                  className={`shrink-0 transition-colors duration-150 ${
                    isActive ? 'text-gray-950' : 'text-gray-600 group-hover:text-[#c9a96e]'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {item.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold min-w-[20px] text-center ${
                      isActive
                        ? 'bg-gray-950/20 text-gray-950'
                        : 'bg-white/8 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {/* Cancel request alert badge */}
                {item.alertCount > 0 && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-500 text-white">
                    <AlertTriangle size={8} />
                    {item.alertCount}
                  </span>
                )}
                {isActive && <ChevronRight size={12} className="text-gray-950 ml-0.5" />}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 space-y-2">
        {/* Backend status */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white/3 rounded-xl border border-white/5">
          <div className="relative shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-40" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-300 leading-none">Live Backend</p>
            <p className="text-[10px] text-gray-600 mt-0.5 truncate">MongoDB · REST API</p>
          </div>
        </div>

        <NavLink
          to="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-white/4 text-gray-400 hover:text-white hover:bg-white/8 rounded-xl text-xs font-semibold transition-all border border-white/5 group"
        >
          <Store size={13} className="group-hover:text-[#c9a96e] transition-colors" />
          <span>Return to Storefront</span>
        </NavLink>
      </div>
    </aside>
  );
}
