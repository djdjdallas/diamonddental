import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Youtube } from "lucide-react";

const services = [
  {
    id: 1,
    title: "Diseño de sonrisa digital",
    image: "/service1.jpg",
    description:
      "Transformación digital completa de tu sonrisa para resultados perfectos",
  },
  {
    id: 2,
    title: "Implantes dentales",
    image: "/service2.jpg",
    description: "Soluciones permanentes para reemplazar dientes perdidos",
  },
  {
    id: 3,
    title: "Coronas dentales",
    image: "/service3.jpg",
    description: "Restauraciones de alta calidad para dientes dañados",
  },
  {
    id: 4,
    title: "Puentes dentales",
    image: "/service4.jpg",
    description: "Restauraciones fijas para múltiples dientes ausentes",
  },
  {
    id: 5,
    title: "Endodoncia",
    image: "/service5.jpg",
    description: "Tratamiento especializado del conducto radicular",
  },
  {
    id: 6,
    title: "Estética dental",
    image: "/service6.jpg",
    description: "Procedimientos cosméticos para una sonrisa perfecta",
  },
  {
    id: 7,
    title: "Blanqueamiento dental",
    image: "/service7.jpg",
    description: "Tratamientos profesionales para una sonrisa más brillante",
  },
  {
    id: 8,
    title: "Cirugía dental",
    image: "/service8.jpg",
    description: "Procedimientos quirúrgicos avanzados",
  },
  {
    id: 9,
    title: "Tratamientos faciales",
    image: "/service9.jpg",
    description: "Servicios estéticos complementarios",
  },
];

export default function ServicesPage() {
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
            <Link href="/services" className="text-[#C5A572]">
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

      {/* Services Header */}
      <div className="pt-32 pb-16 text-center">
        <h1 className="text-6xl font-bold mb-8">SERVICES</h1>
        <Button className="bg-[#C5A572] hover:bg-[#C5A572]/90 text-black px-8 py-2 rounded-full">
          JOIN US
        </Button>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative overflow-hidden rounded-lg"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <Image
                  src={service.image}
                  alt={service.title}
                  layout="fill"
                  objectFit="cover"
                  className="transform transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-[#C5A572] text-xl font-semibold mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-300">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planning Section */}
      <div className="bg-[#FFE566] py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-black text-5xl font-bold mb-8">
            ¿PLANEANDO UN EVENTO?
          </h2>
          <div className="flex gap-4 justify-center">
            <Button className="bg-black text-white hover:bg-black/90">
              Contáctanos
            </Button>
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black/10"
            >
              Nuestros eventos
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
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
