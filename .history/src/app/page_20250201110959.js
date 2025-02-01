// app/page.js
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex-1">
            <Image
              src="/logo.png"
              alt="Diamond Smile Logo"
              width={150}
              height={50}
              className="object-contain"
            />
          </div>
          <div className="flex gap-8">
            <Link href="/" className="hover:text-[#C5A572] transition-colors">
              HOME
            </Link>
            <Link
              href="/services"
              className="hover:text-[#C5A572] transition-colors"
            >
              Services
            </Link>
            <Link
              href="/items"
              className="hover:text-[#C5A572] transition-colors"
            >
              Items
            </Link>
            <Link
              href="/login"
              className="hover:text-[#C5A572] transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="min-h-screen relative flex items-center justify-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(/hero.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-light">Be part of the</h2>
          <h1 className="text-6xl md:text-7xl font-bold tracking-wider">
            DIAMOND <span className="text-[#C5A572]">SMILE</span>
            <br />
            FAMILY
          </h1>

          <Link href="/login">
            <div
              className="w-48 h-48 mx-auto relative cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Image
                src="/BOTON-DIAMOND-SMILE-DM.png"
                alt="Diamond Smile Button"
                layout="fill"
                className={`object-contain transform transition-transform duration-300 ${
                  isHovered ? "scale-110" : "scale-100"
                }`}
              />
            </div>
          </Link>

          <p className="text-xl">
            Click on the diamond and
            <br />
            live the experience
          </p>
        </div>
      </div>

      {/* Promotion Section */}
      <div className="bg-black py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <p className="text-xl">
            Write us the code: <span className="font-bold">DS2024</span> and
            get:
          </p>
          <h2 className="text-4xl font-bold">
            1 DAY OF SPA WHEN YOU BUY YOUR DIAMOND SMILE
          </h2>
          <Button
            className="mt-6 bg-[#C5A572] hover:bg-[#C5A572]/90 text-black"
            size="lg"
          >
            Shop Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#C5A572] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center space-x-8">
            <Link
              href="#"
              className="text-black hover:text-white transition-colors"
            >
              <Facebook size={24} />
            </Link>
            <Link
              href="#"
              className="text-black hover:text-white transition-colors"
            >
              <Instagram size={24} />
            </Link>
            <Link
              href="#"
              className="text-black hover:text-white transition-colors"
            >
              <Youtube size={24} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
