import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Check, PaintBucket, PhoneCall, Star, Shield, Leaf, Clock, MapPin, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// -----------------------------
// Types
// -----------------------------

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
  preferredWindow: string; // e.g., "Weekdays AM"
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

// -----------------------------
// Mock data (replace with real APIs / DB later)
// -----------------------------

const NEIGHBORHOODS = [
  "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island",
  "Harlem", "Upper East Side", "Upper West Side", "Williamsburg", "Bushwick",
  "Long Island City", "Astoria", "Bed-Stuy", "Park Slope", "Washington Heights"
];

const MOCK_GALLERY: GalleryItem[] = [
  {
    id: "g1",
    title: "Sunny Studio Refresh",
    neighborhood: "Harlem",
    type: "Studio",
    style: "Minimal",
    beforeUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80",
    afterUrl: "https://images.unsplash.com/photo-1505691723518-36a5ac3b2e47?auto=format&fit=crop&w=1600&q=80",
    testimonial: { quote: "Fast, clean, zero stress. Looked brand new in a day.", name: "Tasha R.", neighborhood: "Harlem" }
  },
  {
    id: "g2",
    title: "1BR Modern Brighten",
    neighborhood: "Williamsburg",
    type: "1BR",
    style: "Modern",
    beforeUrl: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80",
    afterUrl: "https://images.unsplash.com/photo-1505692794403-34cbf1b5f3cb?auto=format&fit=crop&w=1600&q=80",
    testimonial: { quote: "They protected every surface and finished ahead of schedule.", name: "Miguel A.", neighborhood: "Williamsburg" }
  },
  {
    id: "g3",
    title: "2BR Classic Update",
    neighborhood: "Astoria",
    type: "2BR",
    style: "Classic",
    beforeUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80",
    afterUrl: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1600&q=80",
    testimonial: { quote: "Best painters we've ever hired—impeccable lines.", name: "Priya K.", neighborhood: "Astoria" }
  }
];

const AVAILABLE_TIME_SLOTS: Record<string, string[]> = {
  // key: ISO date string -> array of slots
  // In production, hydrate from PostgreSQL availability table
};

// -----------------------------
// Utility: Pricing Engine
// -----------------------------

const BASE_RATES: Record<ApartmentSize, number> = {
  Studio: 699,
  "1BR": 999,
  "2BR": 1399,
  "3BR+": 1799,
};

const ROOM_RATE = 150; // per additional room beyond common areas
const ECO_SURCHARGE = 0.12; // 12%
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

// -----------------------------
// API placeholders (wire these to your backend)
// -----------------------------

async function sendQuoteEmail(payload: any) {
  // TODO: POST to /api/send-quote (SendGrid integration)
  console.log("SendGrid payload", payload);
  return { ok: true };
}

async function createStripeCheckout(payload: any) {
  // TODO: POST to /api/stripe/checkout (Stripe deposit intent)
  console.log("Stripe payload", payload);
  return { ok: true, url: "#" };
}

async function fetchSlotsFor(dateISO: string) {
  // TODO: GET /api/availability?date=...
  return AVAILABLE_TIME_SLOTS[dateISO] || ["09:00", "12:00", "15:00", "18:00"]; // mock
}

// -----------------------------
// UI Components
// -----------------------------

const TrustBadges: React.FC = () => (
  <div className="flex flex-wrap items-center gap-3 mt-6">
    <Badge className="flex items-center gap-2 text-sm px-3 py-1"><Shield size={16}/> Licensed & Insured</Badge>
    <Badge className="flex items-center gap-2 text-sm px-3 py-1"><Star size={16}/> 5-Star Rated</Badge>
    <Badge className="flex items-center gap-2 text-sm px-3 py-1"><Leaf size={16}/> Low-VOC / Eco Options</Badge>
    <Badge className="flex items-center gap-2 text-sm px-3 py-1"><Clock size={16}/> Next-Day Starts</Badge>
  </div>
);

const Hero: React.FC<{ onGetQuote: () => void }>= ({ onGetQuote }) => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".ubc-hero-head", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out" });
      gsap.from(".ubc-hero-sub", { y: 20, opacity: 0, duration: 0.9, delay: 0.15, ease: "power3.out" });
      gsap.from(".ubc-hero-cta", { y: 15, opacity: 0, duration: 0.8, delay: 0.3, ease: "power3.out" });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[80vh] w-full overflow-hidden rounded-2xl bg-black/80">
      <div className="absolute inset-0 -z-10">
        {/* Background carousel (simple crossfade for MVP) */}
        <div className="absolute inset-0 bg-cover bg-center animate-[fade_16s_ease-in-out_infinite]" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=2000&q=80)` }} />
        <div className="absolute inset-0 bg-cover bg-center animate-[fade2_16s_ease-in-out_infinite]" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2000&q=80)` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-16 text-white">
        <h1 className="ubc-hero-head text-4xl md:text-6xl font-extrabold tracking-tight">
          Urban Brush Co.
          <span className="block text-lg md:text-2xl font-medium mt-3 text-white/90">
            Transforming NYC apartments—fast, clean, professional.
          </span>
        </h1>
        <p className="ubc-hero-sub mt-5 max-w-2xl text-white/85">
          Licensed, insured, and community-centered. Get a same-day quote and next-day start with low-VOC options.
        </p>
        <div className="ubc-hero-cta mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={onGetQuote} className="rounded-2xl text-base">Get an instant quote</Button>
          <Button size="lg" variant="secondary" className="rounded-2xl text-base"><PhoneCall className="mr-2" size={18}/> Click to call</Button>
        </div>
        <TrustBadges />
      </div>
      <style>{`
        @keyframes fade { 0%, 45% { opacity: 1 } 55%, 100% { opacity: 0 } }
        @keyframes fade2 { 0%, 45% { opacity: 0 } 55%, 100% { opacity: 1 } }
      `}</style>
    </section>
  );
};

const QuoteCalculator: React.FC<{ open:boolean; onOpenChange:(b:boolean)=>void }>=({ open, onOpenChange })=>{
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

  const price = useMemo(()=>calculatePriceRange(form), [form]);

  const onSubmit = async ()=>{
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
          <DialogDescription>Transparent pricing in three quick steps.</DialogDescription>
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
                  <Select value={form.size} onValueChange={(v)=> setForm(f=> ({...f, size: v as ApartmentSize}))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["Studio","1BR","2BR","3BR+"] as ApartmentSize[]).map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium"># Rooms to Paint</label>
                  <Input type="number" min={0} value={form.rooms} onChange={(e)=> setForm(f=> ({...f, rooms: Number(e.target.value)}))} className="mt-1" />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Neighborhood</label>
                  <Select value={form.neighborhood} onValueChange={(v)=> setForm(f=> ({...f, neighborhood: v}))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NEIGHBORHOODS.map(n=> <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Estimated: <span className="font-semibold text-foreground">${price.low} – ${price.high}</span></div>
                <Button onClick={()=> setStep(2)}>Next</Button>
              </div>
            </TabsContent>

            <TabsContent value="step2">
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="md:col-span-1 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Eco-Friendly (Low VOC)</div>
                    <div className="text-xs text-muted-foreground">Healthier indoor air</div>
                  </div>
                  <Switch checked={form.ecoFriendly} onCheckedChange={(b)=> setForm(f=> ({...f, ecoFriendly: b}))} />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Paint Quality</label>
                  <Select value={form.paintQuality} onValueChange={(v)=> setForm(f=> ({...f, paintQuality: v as any}))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["Standard","Premium","Designer"]).map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Preferred Window</label>
                  <Select value={form.preferredWindow} onValueChange={(v)=> setForm(f=> ({...f, preferredWindow: v}))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Weekdays AM","Weekdays PM","Weekends","Flexible"].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={form.notes} onChange={(e)=> setForm(f=> ({...f, notes: e.target.value}))} placeholder="Ceiling height, accent wall, repairs…" className="mt-1" />
              </div>
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Estimated: <span className="font-semibold text-foreground">${price.low} – ${price.high}</span></div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={()=> setStep(1)}>Back</Button>
                  <Button onClick={()=> setStep(3)}>Next</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="step3">
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input value={form.name} onChange={(e)=> setForm(f=> ({...f, name: e.target.value}))} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={form.email} onChange={(e)=> setForm(f=> ({...f, email: e.target.value}))} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input value={form.phone} onChange={(e)=> setForm(f=> ({...f, phone: e.target.value}))} className="mt-1" />
                </div>
              </div>
              <Card className="mt-6 border-dashed">
                <CardContent className="p-4 flex items-center gap-3">
                  <PaintBucket size={20}/>
                  <div className="text-sm">Your current estimate: <span className="font-semibold">${price.low} – ${price.high}</span>. Email yourself a copy and get our next available dates.</div>
                </CardContent>
              </Card>
              <div className="mt-4 flex justify-between">
                <Button variant="secondary" onClick={()=> setStep(2)}>Back</Button>
                <Button onClick={onSubmit} disabled={submitting}>{submitting ? "Sending…" : "Email my quote"}</Button>
              </div>
            </TabsContent>
          </Tabs>

          {step===4 && (
            <div className="mt-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"><Check/></div>
              <h3 className="mt-4 text-xl font-semibold">Quote sent!</h3>
              <p className="text-sm text-muted-foreground mt-1">Check your inbox for details and available start dates.</p>
              <Button className="mt-4" onClick={()=> onOpenChange(false)}>Close</Button>
            </div>
          )}
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};

const Gallery: React.FC = () => {
  const [filter, setFilter] = useState<{ hood?: string; type?: ApartmentSize; style?: GalleryItem["style"] }>({});
  const items = useMemo(()=>{
    return MOCK_GALLERY.filter(g=> (!filter.hood || g.neighborhood===filter.hood) && (!filter.type || g.type===filter.type) && (!filter.style || g.style===filter.style));
  }, [filter]);

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">Before & After</h2>
        <div className="flex flex-wrap gap-2">
          <Select onValueChange={(v)=> setFilter(f=> ({...f, hood: v==='All'? undefined : v}))}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Neighborhood"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Neighborhoods</SelectItem>
              {NEIGHBORHOODS.map(n=> <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(v)=> setFilter(f=> ({...f, type: v==='All'? undefined : v as ApartmentSize}))}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              {(["Studio","1BR","2BR","3BR+"] as ApartmentSize[]).map(n=> <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(v)=> setFilter(f=> ({...f, style: v==='All'? undefined : v as GalleryItem["style"]}))}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Style"/></SelectTrigger>
            <SelectContent>
              {["All","Modern","Minimal","Classic","Industrial"].map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <Card key={item.id} className="overflow-hidden group rounded-2xl">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={item.beforeUrl} alt={`${item.title} before`} className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:opacity-0 transition-opacity duration-500"/>
              <img src={item.afterUrl} alt={`${item.title} after`} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
              <Badge className="absolute top-3 left-3 backdrop-blur-sm bg-white/90 text-black flex items-center gap-1"><MapPin size={14}/>{item.neighborhood}</Badge>
            </div>
            <CardContent className="p-4">
              <div className="font-semibold">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.type} • {item.style}</div>
              {item.testimonial && (
                <blockquote className="mt-3 text-sm italic text-muted-foreground">“{item.testimonial.quote}” — {item.testimonial.name}, {item.testimonial.neighborhood}</blockquote>
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

  useEffect(()=>{
    (async()=>{
      if (!date) return;
      const iso = date.toISOString().slice(0,10);
      const res = await fetchSlotsFor(iso);
      setSlots(res);
    })();
  }, [date]);

  const checkout = async ()=>{
    const res = await createStripeCheckout({ date, slot: selectedSlot, deposit });
    if (res.url) window.location.href = res.url;
  };

  return (
    <section className="mt-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">Book your date</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm mb-2">Available time slots</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {slots.map(s=> (
                <Button key={s} variant={selectedSlot===s?"default":"secondary"} onClick={()=> setSelectedSlot(s)} className="rounded-xl">{s}</Button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground flex items-center gap-2"><CreditCard size={16}/> Fully refundable deposit</div>
              <div className="flex items-center gap-2">
                <Input type="number" value={deposit} onChange={(e)=> setDeposit(Number(e.target.value))} className="w-28"/>
                <Button onClick={checkout} disabled={!date || !selectedSlot}>Reserve ${deposit}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

const ServiceAreas: React.FC = () => {
  return (
    <section className="mt-16">
      <h2 className="text-2xl md:text-3xl font-bold">NYC Neighborhoods We Serve</h2>
      <p className="text-muted-foreground text-sm mt-1">Dynamic, SEO-ready pages can be generated for each neighborhood below (schema.org LocalBusiness included server-side).</p>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {NEIGHBORHOODS.map(n => (
          <Button key={n} variant="secondary" className="justify-start rounded-xl">{n}</Button>
        ))}
      </div>
    </section>
  );
};

const Footer: React.FC = () => (
  <footer className="mt-20 border-t pt-10 pb-16 text-sm text-muted-foreground">
    <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-6">
      <div>
        <div className="font-semibold text-foreground">Urban Brush Co.</div>
        <p>Fast, clean, community-first painting across NYC.</p>
      </div>
      <div>
        <div className="font-semibold text-foreground">Contact</div>
        <p>(212) 555-0199</p>
        <p>hello@urbanbrush.co</p>
      </div>
      <div>
        <div className="font-semibold text-foreground">Hours</div>
        <p>Mon–Sat: 8am – 7pm</p>
        <p>Sun: By appointment</p>
      </div>
      <div>
        <div className="font-semibold text-foreground">Commitment</div>
        <p>We hire locally and offer apprentice pathways. We use low-VOC paints and respect tenants' time and space.</p>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-6 mt-6 text-xs">© {new Date().getFullYear()} Urban Brush Co. All rights reserved.</div>
  </footer>
);

// -----------------------------
// Main App
// -----------------------------

export default function UrbanBrushCoApp(){
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Hero onGetQuote={()=> setQuoteOpen(true)} />

        {/* Quick trust strip */}
        <div className="mt-10 grid md:grid-cols-4 gap-4">
          {[{icon:Shield,label:"Licensed & Insured"},{icon:Star,label:"Hundreds of 5★ reviews"},{icon:Leaf,label:"Low-VOC options"},{icon:Clock,label:"On-time guarantee"}].map((i,idx)=> (
            <Card key={idx}>
              <CardContent className="p-4 flex items-center gap-3">
                <i.icon size={20}/> <div className="font-medium">{i.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-16">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Instant, transparent quotes</h2>
              <p className="text-sm text-muted-foreground mt-2">Answer a few questions and see your price update in real-time. No surprises, ever.</p>
              <Button className="mt-4 rounded-2xl" size="lg" onClick={()=> setQuoteOpen(true)}>Start Quote</Button>
              <ul className="mt-6 space-y-2 text-sm">
                <li className="flex items-start gap-2"><Check className="mt-0.5" size={16}/> Protection: floors, furniture, and fixtures</li>
                <li className="flex items-start gap-2"><Check className="mt-0.5" size={16}/> Precise lines, smooth finishes, fast dry times</li>
                <li className="flex items-start gap-2"><Check className="mt-0.5" size={16}/> Respectful crews and clear communication</li>
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
      <Footer />

      <QuoteCalculator open={quoteOpen} onOpenChange={setQuoteOpen} />
    </div>
  );
}

// ---------------------------------------
// IMPLEMENTATION NOTES / NEXT STEPS (MVP → PROD)
// ---------------------------------------
// 1) Scraping / Sourcing People-Free Apartment Images:
//    - Avoid raw scraping; prefer licensed APIs (Unsplash, Pexels) with "no people" query and content filters.
//    - Store image metadata in PostgreSQL (url, license, tags, neighborhood, type, style, hasPeople=false).
//    - Optional: run a lightweight face/person detection (e.g., TensorFlow.js) client-side before display as a safety check.
//
// 2) Email (SendGrid): /api/send-quote should send templated emails to both lead and operations.
//    - Persist lead to PostgreSQL: leads(id, name, email, phone, form_json, price_low, price_high, created_at).
//
// 3) Booking (PostgreSQL + Stripe):
//    - availability(date, slot, is_booked), reservations(lead_id, date, slot, deposit_amount, stripe_session_id, status).
//    - Webhook from Stripe updates reservation status and triggers SendGrid confirmations.
//
// 4) Auth (Auth0) + Customer Portal:
//    - JWT-protected endpoints for uploading room photos, messaging crew, viewing invoices, and rescheduling.
//
// 5) Local SEO:
//    - Generate static routes per neighborhood with schema.org markup server-side. Include local testimonials and gallery subsets.
//
// 6) Analytics Dashboard:
//    - Track quote→booking conversion, neighborhood profitability, color trends, LTV, referral sources.
//    - Use a /admin route secured by role-based access in Auth0.
//
// 7) PWA:
//    - Add manifest.json, service worker for offline shell, and install prompts. Ensure image lazy-loading and caching.
//
// 8) Accessibility & Performance:
//    - Alt text for images, focus states, prefers-reduced-motion check for animations, and CLS-safe image dimensions.
//
// 9) Community Trust & Equity Lens:
//    - Promote apprenticeships and fair-wage hiring. Offer sliding-scale pricing for qualifying tenants and partnerships with tenant unions and community orgs.
