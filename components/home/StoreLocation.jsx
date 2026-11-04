"use client";

import { MapPin, Clock, Phone, Navigation, ShieldCheck, HeartHandshake } from "lucide-react";
import { STORE_INFO } from "@/lib/products";

export default function StoreLocation() {
  return (
    <section className=" sm:py-12 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto">
      <div className="rounded-[2.5rem] bg-ak-icy-blue/50 border border-ak-ivory-border p-6 sm:p-10 lg:p-14 shadow-frame">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Information Column */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-ak-burgundy block mb-2">
                Visit Our Physical Store
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ak-charcoal tracking-tight">
                AK Kiosk & Asian Market
              </h2>
              <p className="text-sm text-ak-charcoal-muted mt-2 leading-relaxed">
                Experience the sights, scents, and flavors of Asia right in the heart of Oberhausen.
                Browse our fresh shelves, grab cold bubble tea or ramune, and get expert recipe tips from our friendly team.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-ak-charcoal/5">
                <div className="w-10 h-10 rounded-xl bg-ak-burgundy/10 text-ak-burgundy flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-ak-charcoal-light block">
                    Address
                  </span>
                  <span className="text-sm font-semibold text-ak-charcoal block">
                    {STORE_INFO.address.street}
                  </span>
                  <span className="text-xs text-ak-charcoal-muted block">
                    {STORE_INFO.address.postalCode} {STORE_INFO.address.city}, {STORE_INFO.address.country}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-ak-charcoal/5">
                <div className="w-10 h-10 rounded-xl bg-ak-gold/20 text-ak-charcoal flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-ak-charcoal-light block">
                    Opening Hours
                  </span>
                  {STORE_INFO.hours.map((h) => (
                    <div key={h.days} className="flex justify-between text-xs py-0.5">
                      <span className="text-ak-charcoal font-medium">{h.days}</span>
                      <span className="font-mono text-ak-charcoal-muted">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 border border-ak-charcoal/5">
                <div className="w-10 h-10 rounded-xl bg-ak-pale-grey text-ak-charcoal flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-ak-charcoal-light block">
                    Customer Care & Orders
                  </span>
                  <span className="text-sm font-semibold text-ak-charcoal block">
                    {STORE_INFO.contact.phone}
                  </span>
                  <span className="text-xs text-ak-charcoal-muted block">
                    {STORE_INFO.contact.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  STORE_INFO.address.full
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ak-charcoal text-ak-ivory hover:bg-ak-burgundy text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
              >
                <Navigation className="w-4 h-4" />
                <span>Open in Google Maps</span>
              </a>

              <a
                href={`tel:${STORE_INFO.contact.phone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ak-ivory text-ak-charcoal hover:bg-white text-xs font-semibold tracking-wider uppercase border border-ak-charcoal/10 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call Store</span>
              </a>
            </div>
          </div>

          {/* Interactive Map Visual Mockup */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden bg-ak-charcoal/5 p-4 border border-ak-charcoal/10">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200">
                {/* Stylized map canvas */}
                <iframe
                  title="AK Kiosk Oberhausen Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=Buschhausener%20Str.%2063,%2046049%20Oberhausen,%20Germany&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full grayscale contrast-125 opacity-90"
                />

                {/* Overlay Card */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-ak-charcoal/10 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-ak-burgundy text-ak-ivory flex items-center justify-center font-bold text-xs">
                      AK
                    </div>
                    <div>
                      <span className="font-serif text-xs font-bold text-ak-charcoal block">
                        AK Kiosk & Asian Market
                      </span>
                      <span className="text-[10px] text-ak-charcoal-light block">
                        Buschhausener Str. 63 • 46049 Oberhausen
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wider uppercase">
                    Open Now
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
