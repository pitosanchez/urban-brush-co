import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Check,
  PaintBucket,
  PhoneCall,
  Star,
  Shield,
  Leaf,
  Clock,
  MapPin,
  CreditCard,
  ArrowRight,
  Home,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ApartmentSize = "Studio" | "1BR" | "2BR" | "3BR+";

type QuoteFormState = {
  name: string;
  email: string;
  phone: string;
  neighborhood: string;
  size: ApartmentSize;
  rooms: number;
  ecoFriendly: boolean;
  paintQuality: "Standard" | "Premium" | "Designer";
  preferredWindow: string;
  notes: string;
};

type GalleryItem = {
  id: string;
  title: string;
  neighborhood: string;
  type: ApartmentSize;
  style: "Modern" | "Minimal" | "Classic" | "Industrial";
  beforeUrl: string;
  afterUrl: string;
  testimonial?: { quote: string; name: string; neighborhood: string };
};

const NEIGHBORHOODS = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
  "Harlem",
  "Upper East Side",
  "Upper West Side",
  "Williamsburg",
  "Bushwick",
  "Long Island City",
  "Astoria",
  "Bed-Stuy",
  "Park Slope",
  "Washington Heights",
];

const MOCK_GALLERY: GalleryItem[] = [
  {
    id: "g1",
    title: "Sunny Studio Refresh",
    neighborhood: "Harlem",
    type: "Studio",
    style: "Minimal",
    beforeUrl:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80",
    afterUrl:
      "https://images.unsplash.com/photo-1505691723518-36a5ac3b2e47?auto=format&fit=crop&w=1600&q=80",
    testimonial: {
      quote: "Fast, clean, zero stress. Looked brand new in a day.",
      name: "Tasha R.",
      neighborhood: "Harlem",
    },
  },
  {
    id: "g2",
    title: "1BR Modern Brighten",
    neighborhood: "Williamsburg",
    type: "1BR",
    style: "Modern",
    beforeUrl:
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80",
    afterUrl:
      "https://images.unsplash.com/photo-1505692794403-34cbf1b5f3cb?auto=format&fit=crop&w=1600&q=80",
    testimonial: {
      quote: "They protected every surface and finished ahead of schedule.",
      name: "Miguel A.",
      neighborhood: "Williamsburg",
    },
  },
  {
    id: "g3",
    title: "2BR Classic Update",
    neighborhood: "Astoria",
    type: "2BR",
    style: "Classic",
    beforeUrl:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80",
    afterUrl:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1600&q=80",
    testimonial: {
      quote: "Best painters we've ever hired—impeccable lines.",
      name: "Priya K.",
      neighborhood: "Astoria",
    },
  },
];

const AVAILABLE_TIME_SLOTS: Record<string, string[]> = {};

const BASE_RATES: Record<ApartmentSize, number> = {
  Studio: 699,
  "1BR": 999,
  "2BR": 1399,
  "3BR+": 1799,
};

const ROOM_RATE = 150;
const ECO_SURCHARGE = 0.12;
const QUALITY_MULTIPLIER: Record<QuoteFormState["paintQuality"], number> = {
  Standard: 1,
  Premium: 1.18,
  Designer: 1.35,
};

const NEIGHBORHOOD_ADJUST: Partial<Record<string, number>> = {
  Manhattan: 1.15,
  Brooklyn: 1.07,
  Queens: 1.04,
  Bronx: 1.0,
  "Staten Island": 1.0,
  "Upper East Side": 1.2,
  "Upper West Side": 1.15,
  Williamsburg: 1.1,
  Bushwick: 1.05,
  "Long Island City": 1.08,
  Astoria: 1.05,
  "Bed-Stuy": 1.04,
  "Park Slope": 1.12,
  "Washington Heights": 1.02,
  Harlem: 1.02,
};

function calculatePriceRange(form: QuoteFormState) {
  const base = BASE_RATES[form.size] || 999;
  const roomsCost = Math.max(0, form.rooms) * ROOM_RATE;
  const quality = QUALITY_MULTIPLIER[form.paintQuality];
  const eco = form.ecoFriendly ? 1 + ECO_SURCHARGE : 1;
  const hood = NEIGHBORHOOD_ADJUST[form.neighborhood] || 1.0;
  const subtotal = (base + roomsCost) * quality * eco * hood;
  const low = Math.round(subtotal * 0.95);
  const high = Math.round(subtotal * 1.15);
  return { low, high };
}

async function sendQuoteEmail(payload: {
  form: QuoteFormState;
  price: { low: number; high: number };
}) {
  console.log("SendGrid payload", payload);
  return { ok: true };
}

async function createStripeCheckout(payload: {
  date: Date | undefined;
  slot: string;
  deposit: number;
}) {
  console.log("Stripe payload", payload);
  return { ok: true, url: "#" };
}

async function fetchSlotsFor(dateISO: string) {
  return AVAILABLE_TIME_SLOTS[dateISO] || ["09:00", "12:00", "15:00", "18:00"];
}

type Page = "home" | "services" | "portfolio" | "pricing" | "contact";

// Enhanced Navigation Component
const Navigation: React.FC<{
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onGetQuote: () => void;
}> = ({ currentPage, onNavigate, onGetQuote }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { key: "home" as Page, label: "Home" },
    { key: "services" as Page, label: "Services" },
    { key: "portfolio" as Page, label: "Portfolio" },
    { key: "pricing" as Page, label: "Pricing" },
    { key: "contact" as Page, label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || currentPage !== "home"
          ? "bg-white/95 backdrop-blur-xl shadow-2xl py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center transition-transform hover:scale-110 ${
              scrolled || currentPage !== "home" ? "" : "shadow-2xl"
            }`}
          >
            <PaintBucket className="w-5 h-5 text-white" />
          </div>
          <span
            className={`font-bold text-xl tracking-tight ${
              scrolled || currentPage !== "home"
                ? "text-gray-900"
                : "text-white"
            }`}
          >
            Urban Brush
          </span>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`font-medium transition-all duration-300 hover:text-indigo-600 relative ${
                currentPage === item.key
                  ? "text-indigo-600 font-semibold"
                  : scrolled || currentPage !== "home"
                  ? "text-gray-700"
                  : "text-white/90"
              }`}
            >
              {item.label}
              {currentPage === item.key && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
          <Button
            onClick={onGetQuote}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:shadow-xl transition-all hover:scale-105 rounded-full px-6 font-semibold"
          >
            Get Quote
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden ${
            scrolled || currentPage !== "home" ? "text-gray-900" : "text-white"
          }`}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-2xl">
          <div className="px-6 py-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`block py-2 w-full text-left transition-colors ${
                  currentPage === item.key
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-700 hover:text-indigo-600"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Button
              onClick={() => {
                onGetQuote();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold"
            >
              Get Quote
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

// Reimagined Hero Section
const Hero: React.FC<{ onGetQuote: () => void }> = ({ onGetQuote }) => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      before:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2000&q=80",
      after:
        "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&w=2000&q=80",
      title: "Manhattan Luxury",
      subtitle: "Upper East Side Transformation",
    },
    {
      before:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=2000&q=80",
      after:
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80",
      title: "Brooklyn Chic",
      subtitle: "Williamsburg Loft Revival",
    },
    {
      before:
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=2000&q=80",
      after:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80",
      title: "Queens Modern",
      subtitle: "Astoria Studio Refresh",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Initial animations
      gsap.fromTo(
        ".hero-title",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power4.out", delay: 0.3 }
      );

      gsap.fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.5 }
      );

      gsap.fromTo(
        ".hero-cta",
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 0.7,
        }
      );

      gsap.fromTo(
        ".hero-badge",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          delay: 1,
        }
      );

      // Parallax effect
      gsap.to(".parallax-layer", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Floating animation for decorative elements
      gsap.to(".float-element", {
        y: "random(-20, 20)",
        x: "random(-10, 10)",
        duration: "random(3, 5)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: {
          amount: 2,
          from: "random",
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={heroRef}
        className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900"
      >
        {/* Animated Background Layers */}
        <div className="absolute inset-0">
          {/* Base Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10" />

          {/* Color Grading Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-600/15 z-[11]" />

          {/* Noise Texture Layer */}
          <div
            className="absolute inset-0 opacity-20 z-[12]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: "256px 256px",
            }}
          />

          {/* Vignette Effect */}
          <div
            className="absolute inset-0 z-[13]"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 100%)",
            }}
          />

          {/* Dynamic Light Rays */}
          <div className="absolute inset-0 z-[14] opacity-30">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent transform -rotate-12" />
            <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-orange-400/15 to-transparent transform rotate-12" />
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-300/10 to-transparent transform -rotate-45" />
          </div>

          {/* Atmospheric Haze */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent z-[15]" />

          {/* Sliding Images */}
          <div className="absolute inset-0 parallax-layer">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Before Image */}
                <div className="absolute inset-0 w-1/2">
                  <img
                    src={slide.before}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                  <div className="absolute bottom-10 left-10 text-white">
                    <span className="text-sm font-semibold tracking-wider uppercase opacity-80">
                      Before
                    </span>
                  </div>
                </div>

                {/* After Image */}
                <div className="absolute inset-0 w-1/2 left-1/2">
                  <img
                    src={slide.after}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-transparent" />
                  <div className="absolute bottom-10 right-10 text-white">
                    <span className="text-sm font-semibold tracking-wider uppercase opacity-80">
                      After
                    </span>
                  </div>
                </div>

                {/* Center Divider */}
                {/* Removed circular element that was appearing behind text */}
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-30 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-full text-white text-sm font-medium mb-8 border border-white/30 shadow-2xl">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>NYC's #1 Rated Apartment Painters</span>
            </div>

            {/* Main Title */}
            <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Transform Your
              <span className="block bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
                NYC Apartment
              </span>
              With Premium Paint
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-xl">
              Professional painting services that bring magazine-worthy
              transformations to Manhattan, Brooklyn, Queens & beyond. Licensed,
              insured, and obsessed with perfect finishes.
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={onGetQuote}
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full font-semibold group"
              >
                Get Instant Quote
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white border-2 border-white/50 hover:bg-white/10 backdrop-blur-xl text-lg px-8 py-6 rounded-full"
              >
                <PhoneCall className="mr-2 w-5 h-5" />
                (212) 555-0199
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="hero-badge flex flex-wrap justify-center gap-6 mt-12">
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium">Same Day Quotes</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Leaf className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium">
                  Eco-Friendly Options
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Home className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium">
                  5000+ Homes Transformed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/60" />
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Feature Strip */}
      <section className="relative bg-white py-8 shadow-xl z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">24hr</div>
              <div className="text-sm text-gray-600 mt-1">Turnaround Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">5000+</div>
              <div className="text-sm text-gray-600 mt-1">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600 mt-1">
                Satisfaction Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10yr</div>
              <div className="text-sm text-gray-600 mt-1">
                Warranty Available
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const QuoteCalculator: React.FC<{
  open: boolean;
  onOpenChange: (b: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<QuoteFormState>({
    name: "",
    email: "",
    phone: "",
    neighborhood: "Manhattan",
    size: "1BR",
    rooms: 1,
    ecoFriendly: true,
    paintQuality: "Standard",
    preferredWindow: "Weekdays AM",
    notes: "",
  });

  const price = useMemo(() => calculatePriceRange(form), [form]);

  const onSubmit = async () => {
    setSubmitting(true);
    await sendQuoteEmail({ form, price });
    setSubmitting(false);
    setStep(4);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Instant Quote</DialogTitle>
          <DialogDescription>
            Transparent pricing in three quick steps.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <Tabs value={`step${step}`}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="step1">1. Basics</TabsTrigger>
              <TabsTrigger value="step2">2. Preferences</TabsTrigger>
              <TabsTrigger value="step3">3. Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="step1">
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Apartment Size</label>
                  <Select
                    value={form.size}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, size: v as ApartmentSize }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        ["Studio", "1BR", "2BR", "3BR+"] as ApartmentSize[]
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">
                    # Rooms to Paint
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form.rooms}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, rooms: Number(e.target.value) }))
                    }
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Neighborhood</label>
                  <Select
                    value={form.neighborhood}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, neighborhood: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NEIGHBORHOODS.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Estimated:{" "}
                  <span className="font-semibold text-foreground">
                    ${price.low} – ${price.high}
                  </span>
                </div>
                <Button onClick={() => setStep(2)}>Next</Button>
              </div>
            </TabsContent>

            <TabsContent value="step2">
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="md:col-span-1 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      Eco-Friendly (Low VOC)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Healthier indoor air
                    </div>
                  </div>
                  <Switch
                    checked={form.ecoFriendly}
                    onCheckedChange={(b) =>
                      setForm((f) => ({ ...f, ecoFriendly: !!b }))
                    }
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Paint Quality</label>
                  <Select
                    value={form.paintQuality}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        paintQuality: v as QuoteFormState["paintQuality"],
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Standard", "Premium", "Designer"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">
                    Preferred Window
                  </label>
                  <Select
                    value={form.preferredWindow}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, preferredWindow: v }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Weekdays AM",
                        "Weekdays PM",
                        "Weekends",
                        "Flexible",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Ceiling height, accent wall, repairs…"
                  className="mt-1"
                />
              </div>
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Estimated:{" "}
                  <span className="font-semibold text-foreground">
                    ${price.low} – ${price.high}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)}>Next</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="step3">
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <Card className="mt-6 border-dashed">
                <CardContent className="p-4 flex items-center gap-3">
                  <PaintBucket size={20} />
                  <div className="text-sm">
                    Your current estimate:{" "}
                    <span className="font-semibold">
                      ${price.low} – ${price.high}
                    </span>
                    . Email yourself a copy and get our next available dates.
                  </div>
                </CardContent>
              </Card>
              <div className="mt-4 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={onSubmit} disabled={submitting}>
                  {submitting ? "Sending…" : "Email my quote"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {step === 4 && (
            <div className="mt-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Quote sent!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Check your inbox for details and available start dates.
              </p>
              <Button className="mt-4" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          )}
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};

const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<{
    hood?: string;
    type?: ApartmentSize;
    style?: GalleryItem["style"];
  }>({});
  const items = useMemo(() => {
    return MOCK_GALLERY.filter(
      (g) =>
        (!filter.hood || g.neighborhood === filter.hood) &&
        (!filter.type || g.type === filter.type) &&
        (!filter.style || g.style === filter.style)
    );
  }, [filter]);

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">Before & After</h2>
        <div className="flex flex-wrap gap-2">
          <Select
            onValueChange={(v) =>
              setFilter((f) => ({ ...f, hood: v === "All" ? undefined : v }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Neighborhood" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Neighborhoods</SelectItem>
              {NEIGHBORHOODS.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(v) =>
              setFilter((f) => ({
                ...f,
                type: v === "All" ? undefined : (v as ApartmentSize),
              }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              {(["Studio", "1BR", "2BR", "3BR+"] as ApartmentSize[]).map(
                (n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(v) =>
              setFilter((f) => ({
                ...f,
                style: v === "All" ? undefined : (v as GalleryItem["style"]),
              }))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              {["All", "Modern", "Minimal", "Classic", "Industrial"].map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden group rounded-2xl">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={item.beforeUrl}
                alt={`${item.title} before`}
                className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:opacity-0 transition-opacity duration-500"
              />
              <img
                src={item.afterUrl}
                alt={`${item.title} after`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              <Badge className="absolute top-3 left-3 backdrop-blur-sm bg-white/90 text-black flex items-center gap-1">
                <MapPin size={14} />
                {item.neighborhood}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="font-semibold">{item.title}</div>
              <div className="text-xs text-muted-foreground">
                {item.type} • {item.style}
              </div>
              {item.testimonial && (
                <blockquote className="mt-3 text-sm italic text-muted-foreground">
                  "{item.testimonial.quote}" — {item.testimonial.name},{" "}
                  {item.testimonial.neighborhood}
                </blockquote>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

const Booking: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [deposit, setDeposit] = useState(199);

  useEffect(() => {
    (async () => {
      if (!date) return;
      const iso = date.toISOString().slice(0, 10);
      const res = await fetchSlotsFor(iso);
      setSlots(res);
    })();
  }, [date]);

  const checkout = async () => {
    const res = await createStripeCheckout({
      date,
      slot: selectedSlot,
      deposit,
    });
    if (res.url) window.location.href = res.url;
  };

  return (
    <section className="mt-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Book your date</h2>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Enhanced Calendar Card */}
        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-lg">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date: Date) =>
                  date < new Date() || date.getDay() === 0
                } // Disable past dates and Sundays
                className="min-h-[400px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Time Slots and Booking Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {date
                  ? `Available times for ${date.toLocaleDateString()}`
                  : "Select a date to see available times"}
              </h3>
              {!date && (
                <p className="text-sm text-gray-500">
                  Choose a date from the calendar to view available time slots.
                </p>
              )}
            </div>

            {date && (
              <>
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Available time slots
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map((s) => (
                      <Button
                        key={s}
                        variant={selectedSlot === s ? "default" : "secondary"}
                        onClick={() => setSelectedSlot(s)}
                        className={`rounded-xl py-3 text-sm font-medium transition-all ${
                          selectedSlot === s
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                            : "hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 flex items-center gap-2 mb-3">
                      <CreditCard size={16} />
                      <span>Secure, fully refundable deposit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">
                        Deposit amount:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-gray-900">
                          $
                        </span>
                        <Input
                          type="number"
                          value={deposit}
                          onChange={(e) => setDeposit(Number(e.target.value))}
                          className="w-24 text-center font-semibold"
                          min="50"
                          max="500"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={checkout}
                    disabled={!date || !selectedSlot}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 font-semibold py-3 rounded-xl transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
                  >
                    {!date || !selectedSlot
                      ? "Select date & time"
                      : `Reserve for $${deposit}`}
                  </Button>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Your deposit will be applied to the final invoice. Full
                    refund available up to 24 hours before scheduled service.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

const ServiceAreas: React.FC = () => {
  return (
    <section className="mt-16">
      <h2 className="text-2xl md:text-3xl font-bold">
        NYC Neighborhoods We Serve
      </h2>
      <p className="text-muted-foreground text-sm mt-1">
        Dynamic, SEO-ready pages can be generated for each neighborhood below
        (schema.org LocalBusiness included server-side).
      </p>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {NEIGHBORHOODS.map((n) => (
          <Button
            key={n}
            variant="secondary"
            className="justify-start rounded-xl"
          >
            {n}
          </Button>
        ))}
      </div>
    </section>
  );
};

// Services Page Component
const ServicesPage: React.FC = () => {
  const services = [
    {
      title: "Interior Painting",
      description:
        "Transform your living spaces with premium interior painting services.",
      features: [
        "Walls & Ceilings",
        "Trim & Moldings",
        "Doors & Windows",
        "Color Consultation",
      ],
      icon: Home,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Apartment Prep & Move-In",
      description:
        "Get your new apartment move-in ready with our comprehensive painting service.",
      features: [
        "Full Apartment Refresh",
        "Touch-Up Services",
        "Same-Day Turnaround",
        "Move-In Ready Guarantee",
      ],
      icon: Shield,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Commercial Spaces",
      description:
        "Professional painting for offices, retail spaces, and commercial properties.",
      features: [
        "Office Painting",
        "Retail Spaces",
        "After-Hours Service",
        "Minimal Disruption",
      ],
      icon: MapPin,
      gradient: "from-purple-500 to-violet-600",
    },
    {
      title: "Specialty Finishes",
      description:
        "Premium decorative finishes and specialized painting techniques.",
      features: [
        "Textured Walls",
        "Accent Walls",
        "Faux Finishes",
        "Wallpaper Removal",
      ],
      icon: Star,
      gradient: "from-orange-500 to-red-600",
    },
  ];

  const process = [
    {
      step: "01",
      title: "Consultation & Quote",
      description:
        "We assess your space, discuss your vision, and provide an instant transparent quote.",
    },
    {
      step: "02",
      title: "Preparation & Protection",
      description:
        "We protect your furniture and floors, then prep all surfaces for optimal paint adhesion.",
    },
    {
      step: "03",
      title: "Professional Application",
      description:
        "Our skilled painters apply premium paints with precision, ensuring perfect lines and finishes.",
    },
    {
      step: "04",
      title: "Final Inspection & Cleanup",
      description:
        "We conduct a thorough quality check and leave your space spotless and ready to enjoy.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Professional
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
              Painting Services
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            From single rooms to full apartments, we deliver exceptional results
            with premium materials and expert craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105 transition-all px-8 py-6 rounded-full font-semibold"
            >
              Get Free Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-white border-2 border-white/50 hover:bg-white/10 px-8 py-6 rounded-full"
            >
              View Portfolio
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're refreshing a single room or transforming your
              entire space, we have the expertise and tools to bring your vision
              to life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white shadow-lg overflow-hidden"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've refined our process over thousands of projects to ensure
              consistent, high-quality results every time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 transform translate-x-10" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Guarantee */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-orange-400/10" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Quality Guarantee
              </h2>
              <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
                We stand behind our work with a comprehensive warranty and 100%
                satisfaction guarantee.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-2">Licensed & Insured</h3>
                  <p className="text-gray-300">
                    Fully licensed and insured for your peace of mind.
                  </p>
                </div>
                <div className="text-center">
                  <Star className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-2">5-Star Service</h3>
                  <p className="text-gray-300">
                    Rated 5 stars by hundreds of satisfied customers.
                  </p>
                </div>
                <div className="text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-2">On-Time Promise</h3>
                  <p className="text-gray-300">
                    We respect your schedule and deliver on time, every time.
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105 transition-all px-8 py-6 rounded-full font-semibold"
              >
                Get Your Quote Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Footer: React.FC<{
  currentPage: Page;
  onNavigate: (page: Page) => void;
}> = ({ currentPage, onNavigate }) => (
  <footer className="mt-20 border-t pt-10 pb-16 text-sm text-muted-foreground bg-gray-50">
    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-6">
      <div>
        <div className="font-semibold text-foreground">Urban Brush Co.</div>
        <p>Fast, clean, community-first painting across NYC.</p>
      </div>
      <div>
        <div className="font-semibold text-foreground">Quick Links</div>
        <div className="space-y-1 mt-2">
          {[
            { key: "home" as Page, label: "Home" },
            { key: "services" as Page, label: "Services" },
            { key: "portfolio" as Page, label: "Portfolio" },
            { key: "pricing" as Page, label: "Pricing" },
            { key: "contact" as Page, label: "Contact" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`block hover:text-indigo-600 transition-colors ${
                currentPage === item.key ? "text-indigo-600" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="font-semibold text-foreground">Contact</div>
        <p>(212) 555-0199</p>
        <p>hello@urbanbrush.co</p>
        <div className="font-semibold text-foreground mt-4">Hours</div>
        <p>Mon–Sat: 8am – 7pm</p>
        <p>Sun: By appointment</p>
      </div>
      <div>
        <div className="font-semibold text-foreground">Commitment</div>
        <p>
          We hire locally and offer apprentice pathways. We use low-VOC paints
          and respect tenants' time and space.
        </p>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-6 mt-6 text-xs">
      © {new Date().getFullYear()} Urban Brush Co. All rights reserved.
    </div>
  </footer>
);

// Portfolio Page Component
const PortfolioPage: React.FC = () => {
  const [filter, setFilter] = useState<{
    hood?: string;
    type?: ApartmentSize;
    style?: GalleryItem["style"];
  }>({});
  const items = useMemo(() => {
    return MOCK_GALLERY.filter(
      (g) =>
        (!filter.hood || g.neighborhood === filter.hood) &&
        (!filter.type || g.type === filter.type) &&
        (!filter.style || g.style === filter.style)
    );
  }, [filter]);

  return (
    <div className="min-h-screen bg-white">
      {/* Portfolio Hero */}
      <section className="relative pt-24 pb-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Our
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
              Portfolio
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Explore our gallery of transformed spaces across NYC. Every project
            tells a story of quality craftsmanship and attention to detail.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Before & After Gallery
            </h2>
            <div className="flex flex-wrap gap-3">
              <Select
                onValueChange={(v) =>
                  setFilter((f) => ({
                    ...f,
                    hood: v === "All" ? undefined : v,
                  }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Neighborhood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Neighborhoods</SelectItem>
                  {NEIGHBORHOODS.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(v) =>
                  setFilter((f) => ({
                    ...f,
                    type: v === "All" ? undefined : (v as ApartmentSize),
                  }))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  {(["Studio", "1BR", "2BR", "3BR+"] as ApartmentSize[]).map(
                    (n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(v) =>
                  setFilter((f) => ({
                    ...f,
                    style:
                      v === "All" ? undefined : (v as GalleryItem["style"]),
                  }))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  {["All", "Modern", "Minimal", "Classic", "Industrial"].map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.beforeUrl}
                    alt={`${item.title} before`}
                    className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:opacity-0 transition-opacity duration-500"
                  />
                  <img
                    src={item.afterUrl}
                    alt={`${item.title} after`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <Badge className="absolute top-3 left-3 backdrop-blur-sm bg-white/90 text-black flex items-center gap-1">
                    <MapPin size={14} />
                    {item.neighborhood}
                  </Badge>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="text-xs opacity-80">
                      {item.type} • {item.style}
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="font-semibold text-lg text-gray-900 mb-2">
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {item.type} • {item.style} • {item.neighborhood}
                  </div>
                  {item.testimonial && (
                    <blockquote className="text-sm italic text-gray-600 border-l-4 border-indigo-200 pl-4">
                      "{item.testimonial.quote}"
                      <footer className="text-xs text-gray-500 mt-2 not-italic">
                        — {item.testimonial.name},{" "}
                        {item.testimonial.neighborhood}
                      </footer>
                    </blockquote>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Pricing Page Component
const PricingPage: React.FC<{ onGetQuote: () => void }> = ({ onGetQuote }) => {
  const packages = [
    {
      name: "Essential",
      price: "699",
      subtitle: "Perfect for studios and small spaces",
      features: [
        "Single room or studio apartment",
        "Premium standard paint",
        "Professional prep work",
        "Clean lines and edges",
        "Furniture protection",
        "Same-day completion",
        "1-year warranty",
      ],
      popular: false,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      name: "Premium",
      price: "1,299",
      subtitle: "Most popular for 1-2 bedroom apartments",
      features: [
        "Up to 2 bedrooms + living area",
        "Premium paint with primer",
        "Detailed trim and molding work",
        "Minor wall repairs included",
        "Eco-friendly paint options",
        "2-day completion",
        "2-year warranty",
        "Free color consultation",
      ],
      popular: true,
      gradient: "from-indigo-600 to-purple-600",
    },
    {
      name: "Luxury",
      price: "2,199",
      subtitle: "Complete transformation for larger spaces",
      features: [
        "Entire apartment (up to 3BR+)",
        "Designer paint collection",
        "Specialty finishes available",
        "Crown molding and trim details",
        "Minor drywall repair",
        "Accent walls and textures",
        "3-day completion",
        "5-year warranty",
        "Design consultation included",
      ],
      popular: false,
      gradient: "from-purple-600 to-pink-600",
    },
  ];

  const addOns = [
    {
      name: "Ceiling Painting",
      price: "150/room",
      description: "Professional ceiling coverage",
    },
    {
      name: "Accent Wall",
      price: "75/wall",
      description: "Single feature wall in contrasting color",
    },
    {
      name: "Eco-Friendly Paint",
      price: "+12%",
      description: "Low-VOC, environmentally safe options",
    },
    {
      name: "Same-Day Service",
      price: "200",
      description: "Rush completion for urgent projects",
    },
    {
      name: "Color Consultation",
      price: "100",
      description: "Professional color matching and advice",
    },
    {
      name: "Minor Repairs",
      price: "50/hour",
      description: "Small holes, cracks, and touch-ups",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Pricing Hero */}
      <section className="relative pt-24 pb-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Transparent
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            No hidden fees, no surprises. Choose the package that fits your
            space and budget, with options to customize as needed.
          </p>
          <Button
            onClick={onGetQuote}
            size="lg"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105 transition-all px-8 py-6 rounded-full font-semibold"
          >
            Get Custom Quote
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Package
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All packages include professional preparation, premium materials,
              and our quality guarantee.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {packages.map((pkg, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden ${
                  pkg.popular ? "ring-2 ring-indigo-600 scale-105" : ""
                } hover:shadow-2xl transition-all duration-500`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardContent className={`p-8 ${pkg.popular ? "pt-12" : ""}`}>
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pkg.gradient} flex items-center justify-center mb-6`}
                  >
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {pkg.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{pkg.subtitle}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      ${pkg.price}
                    </span>
                    <span className="text-gray-600 ml-2">starting from</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={onGetQuote}
                    className={`w-full ${
                      pkg.popular
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    } font-semibold py-3 rounded-full transition-all hover:scale-105`}
                  >
                    Get This Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add-ons Section */}
          <div className="bg-gray-50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Add-On Services
              </h3>
              <p className="text-xl text-gray-600">
                Customize your package with additional services
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addOns.map((addon, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {addon.name}
                    </h4>
                    <span className="text-indigo-600 font-bold">
                      ${addon.price}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{addon.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing and services
            </p>
          </div>
          <div className="space-y-6">
            {[
              {
                q: "What's included in the base price?",
                a: "All packages include labor, premium paint, professional prep work, furniture protection, cleanup, and our quality guarantee. The only additional costs are for add-on services you choose.",
              },
              {
                q: "Do you offer payment plans?",
                a: "Yes! We offer flexible payment options including 50% deposit and 50% on completion, or monthly payment plans for larger projects. Contact us to discuss options.",
              },
              {
                q: "What if I need additional rooms painted?",
                a: "Additional rooms can be added to any package at $150 per room. We'll provide a custom quote based on your specific needs.",
              },
              {
                q: "Is there a warranty on your work?",
                a: "Absolutely! All packages include warranty coverage (1-5 years depending on package) against peeling, fading, or other paint defects under normal conditions.",
              },
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Contact Page Component
const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    // Handle form submission
  };

  const contactMethods = [
    {
      icon: PhoneCall,
      title: "Phone",
      value: "(212) 555-0199",
      description: "Call us for immediate assistance",
      href: "tel:+12125550199",
    },
    {
      icon: MapPin,
      title: "Service Areas",
      value: "All 5 NYC Boroughs",
      description: "Manhattan, Brooklyn, Queens, Bronx, Staten Island",
      href: "#",
    },
    {
      icon: Clock,
      title: "Business Hours",
      value: "Mon-Sat: 8AM-7PM",
      description: "Sunday by appointment",
      href: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Contact Hero */}
      <section className="relative pt-24 pb-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Get In
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Ready to transform your space? Contact us today for a free
            consultation and instant quote.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subject: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Inquiry">
                          General Inquiry
                        </SelectItem>
                        <SelectItem value="Quote Request">
                          Quote Request
                        </SelectItem>
                        <SelectItem value="Schedule Service">
                          Schedule Service
                        </SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="w-full"
                    placeholder="Tell us about your project..."
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 transition-all px-8 py-6 rounded-full font-semibold"
                >
                  Send Message
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Get in Touch
              </h2>
              <div className="space-y-8 mb-12">
                {contactMethods.map((method, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {method.title}
                      </h3>
                      <p className="text-gray-900 font-medium mb-1">
                        {method.value}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {method.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Start?</h3>
                <p className="text-gray-200 mb-6">
                  Get an instant quote in under 3 minutes, or call us for
                  immediate assistance.
                </p>
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105 transition-all font-semibold">
                    Get Instant Quote
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-white border-white/30 hover:bg-white/10"
                  >
                    <PhoneCall className="mr-2 w-5 h-5" />
                    Call (212) 555-0199
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default function UrbanBrushCoApp() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [quoteOpen, setQuoteOpen] = useState(false);

  const handleGetQuote = () => setQuoteOpen(true);
  const handleNavigation = (page: Page) => setCurrentPage(page);

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigation}
        onGetQuote={handleGetQuote}
      />

      {currentPage === "home" && (
        <>
          <Hero onGetQuote={handleGetQuote} />
          <main className="max-w-6xl mx-auto px-6 py-8">
            <div className="mt-10 grid md:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: "Licensed & Insured" },
                { icon: Star, label: "Hundreds of 5★ reviews" },
                { icon: Leaf, label: "Low-VOC options" },
                { icon: Clock, label: "On-time guarantee" },
              ].map((i, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <i.icon size={20} />{" "}
                    <div className="font-medium">{i.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <section className="mt-16">
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Instant, transparent quotes
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Answer a few questions and see your price update in
                    real-time. No surprises, ever.
                  </p>
                  <Button
                    className="mt-4 rounded-2xl"
                    size="lg"
                    onClick={handleGetQuote}
                  >
                    Start Quote
                  </Button>
                  <ul className="mt-6 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5" size={16} /> Protection: floors,
                      furniture, and fixtures
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5" size={16} /> Precise lines,
                      smooth finishes, fast dry times
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5" size={16} /> Respectful crews
                      and clear communication
                    </li>
                  </ul>
                </div>
                <div>
                  <Gallery />
                </div>
              </div>
            </section>

            <Booking />
            <ServiceAreas />
          </main>
        </>
      )}

      {currentPage === "services" && <ServicesPage />}
      {currentPage === "portfolio" && <PortfolioPage />}
      {currentPage === "pricing" && <PricingPage onGetQuote={handleGetQuote} />}
      {currentPage === "contact" && <ContactPage />}

      <Footer currentPage={currentPage} onNavigate={handleNavigation} />
      <QuoteCalculator open={quoteOpen} onOpenChange={setQuoteOpen} />
    </div>
  );
}
