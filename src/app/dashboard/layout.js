// app/dashboard/layout.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Calendar,
  Settings,
  BarChart2,
  FileText,
  LogOut,
  Calendar1,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart2 },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar1 },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Treatment Plans", href: "/dashboard/treatments", icon: FileText },
  { name: "Staff", href: "/dashboard/staff", icon: Users2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold">Dental CMS</h2>
        </div>
        <nav className="mt-6">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-6 py-3 text-sm hover:bg-gray-800",
                  pathname === link.href && "bg-gray-800"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="flex items-center px-6 py-3 text-sm hover:bg-gray-800 mt-auto"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-gray-100">{children}</main>
    </div>
  );
}
