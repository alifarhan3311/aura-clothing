import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
    <aside className="w-64 bg-gray-950 text-white flex flex-col h-full border-r border-gray-800 select-none">
      {/* Brand logo & header */}
      <div className="p-6 border-b border-gray-800/80 flex items-center justify-between">
        <NavLink to="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#c9a96e] to-[#f0e4cc] flex items-center justify-center text-gray-950 font-black shadow-md shadow-[#c9a96e]/20 group-hover:scale-105 transition-transform">
            MH
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-white tracking-wide leading-tight group-hover:text-[#c9a96e] transition-colors">
              Fade Find
            </h1>
            <span className="text-[10px] font-bold text-[#c9a96e] uppercase tracking-widest block">
              Admin Portal
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = checkIsActive(item);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-[#c9a96e] text-gray-950 shadow-md shadow-[#c9a96e]/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={17}
                  className={`transition-colors ${
                    isActive ? 'text-gray-950' : 'text-gray-400 group-hover:text-[#c9a96e]'
                  }`}
                />
                <span>{item.name}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-gray-950/20 text-gray-950'
                        : 'bg-gray-800 text-gray-300 group-hover:bg-gray-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {/* Cancel request alert badge */}
                {item.alertCount > 0 && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-500 text-white animate-pulse">
                    <AlertTriangle size={9} />
                    {item.alertCount}
                  </span>
                )}
                {isActive && <ChevronRight size={13} className="text-gray-950" />}
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800/80 space-y-3">
        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 flex items-center gap-2.5">
          <Sparkles size={16} className="text-[#c9a96e]" />
          <div>
            <p className="text-[11px] font-semibold text-gray-200">Live Backend Connected</p>
            <p className="text-[10px] text-gray-500">localhost:5000 · MongoDB</p>
          </div>
        </div>

        <NavLink
          to="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-gray-900 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl text-xs font-semibold transition-all border border-gray-800"
        >
          <ArrowLeft size={14} />
          <span>Return to Store Front</span>
        </NavLink>
      </div>
    </aside>
  );
}
