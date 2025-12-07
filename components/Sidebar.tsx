'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileVideo,
  Calendar,
  CheckSquare,
  BarChart3,
  Settings,
  Palmtree,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Content', href: '/content', icon: FileVideo },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Review Queue', href: '/review', icon: CheckSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-900 to-emerald-950 text-white">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-emerald-800">
        <Palmtree className="h-8 w-8 text-emerald-400" />
        <div>
          <h1 className="font-bold text-lg">Aloha Content</h1>
          <p className="text-xs text-emerald-400">Factory Dashboard</p>
        </div>
      </div>

      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-700 text-white'
                      : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-800">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
