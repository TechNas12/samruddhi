"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { api, getImageUrl } from "@/lib/api";
import { LuChevronLeft, LuChevronRight, LuStar, LuArrowRight, LuLeaf, LuSprout, LuShieldCheck, LuTruck, LuQuote, LuHeart } from "react-icons/lu";
import ProductCard from "@/components/ProductCard";


// Default fallback slide in case DB is empty
const defaultSlide = {
  title: "Welcome to\nSamruddhi Organics",
  subtitle: "Premium organic products for your urban garden",
  cta_text: "Shop Now",
  cta_link: "/products",
  bg_gradient: "from-green-800 via-green-700 to-emerald-600",
  emoji: "🌿",
};

const initialTestimonials = [
  { name: "Priya Deshmukh", rating: 5, text: "Samruddhi's vermicompost transformed my balcony garden. My herbs are thriving like never before!", location: "Pune" },
  { name: "Amit Kulkarni", rating: 5, text: "The organic Alphonso mangoes were incredible — sweet, aromatic, and delivered fresh. Will order again!", location: "Mumbai" },
  { name: "Sneha Patil", rating: 4, text: "The kitchen herb seed pack was a great start. 5 out of 6 varieties germinated within a week.", location: "Bangalore" },
  { name: "Rajesh Joshi", rating: 5, text: "Best cold-pressed groundnut oil I've ever bought. Pure taste, no chemicals. My family loves it!", location: "Nagpur" },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [carouselInterval, setCarouselInterval] = useState(5);
  const [dynamicTestimonials, setDynamicTestimonials] = useState(initialTestimonials);

  useEffect(() => {
    api.getCarouselItems().then(setSlides).catch(console.error);
    api.getProducts("featured=true&limit=8").then(setFeatured).catch(console.error);

    // Fetch Global Carousel Setting
    api.getSetting("product_carousel_timer").then(s => {
      if (s && s.value) setCarouselInterval(parseInt(s.value));
    }).catch(console.error);

    api.getTestimonials().then(data => {
      if (data && data.length > 0) setDynamicTestimonials(data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (dynamicTestimonials.length <= 1) return;
    const timer = setInterval(() => setTestimonialIdx((s) => (s + 1) % dynamicTestimonials.length), 4000);
    return () => clearInterval(timer);
  }, [dynamicTestimonials.length]);

  const activeSlides = slides.length > 0 ? slides : [defaultSlide];
  const slide = activeSlides[currentSlide] || activeSlides[0];

  return (
    <div className="min-h-screen bg-[#fcfcf9] relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-200/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[60%] bg-amber-50/40 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
        <div className="absolute middle-[50%] left-[50%] w-[30%] h-[30%] bg-green-50/20 rounded-full blur-[80px] animate-blob"></div>
      </div>

      <div className="relative z-10 bg-gradient-to-b from-transparent via-white/50 to-transparent">
        {/* ── Hero Carousel ── */}
        <section
          className={`relative min-h-[90vh] flex items-center text-white overflow-hidden transition-all duration-1000 bg-center`}
        >
          {/* Background Image / Gradient */}
          {slide.image ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={getImageUrl(slide.image)}
                alt={slide.title || "Hero Image"}
                fill
                priority
                className="object-cover transition-opacity duration-1000"
                sizes="100vw"
              />
            </div>
          ) : (
            <div
              className="absolute inset-0 z-0 transition-all duration-1000"
              style={{ background: `linear-gradient(135deg, #064e3b 0%, #2a9d8f 100%)` }}
            ></div>
          )}

          {/* Modern Glassy Overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-brightness-90 z-0"></div>

          {/* Decorative Floating Elements */}

          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32 relative z-10 w-full">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in-up">
                Samruddhi Organics
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-8  whitespace-pre-line animate-fade-in-up tracking-tight">
                {slide.title.replace(/\\n/g, '\n')}
              </h1>

              <p className="text-lg md:text-2xl text-white/90 mb-10 animate-fade-in-up whitespace-pre-line leading-relaxed max-w-xl font-medium" style={{ animationDelay: "0.15s" }}>
                {slide.subtitle ? slide.subtitle.replace(/\\n/g, '\n') : ""}
              </p>

              <div className="flex flex-wrap gap-5 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <Link href={slide.cta_link || "/products"} className="btn-primary">
                  {slide.cta_text || "Shop Collection"} <LuArrowRight size={20} />
                </Link>
                <Link href="#about" className="px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-bold hover:bg-white/10 transition-all backdrop-blur-sm whitespace-nowrap">
                  Discover Our Story
                </Link>
              </div>
            </div>

            {/* New Modern Slide Indicators */}
            {activeSlides.length > 1 && (
              <div className="absolute bottom-12 left-6 lg:left-8 flex items-center gap-6">
                <div className="flex gap-2">
                  {activeSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? "w-12 bg-white" : "w-3 bg-white/30 hover:bg-white/50"}`}
                    />
                  ))}
                </div>
                <div className="text-white/40 text-xs font-black tracking-widest uppercase">
                  {String(currentSlide + 1).padStart(2, '0')} / {String(activeSlides.length).padStart(2, '0')}
                </div>
              </div>
            )}
          </div>

          {/* Minimalist Nav Arrows */}
          {activeSlides.length > 1 && (
            <div className="hidden lg:flex absolute right-8 bottom-12 gap-3 z-20">
              <button onClick={() => setCurrentSlide((s) => (s - 1 + activeSlides.length) % activeSlides.length)} className="w-14 h-14 border border-white/20 rounded-2xl flex items-center justify-center hover:bg-white hover:text-green-900 transition-all group">
                <LuChevronLeft className="text-2xl group-hover:-translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setCurrentSlide((s) => (s + 1) % activeSlides.length)} className="w-14 h-14 border border-white/20 rounded-2xl flex items-center justify-center hover:bg-white hover:text-green-900 transition-all group">
                <LuChevronRight className="text-2xl group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </section>

        {/* ── Trust Badges ── */}
        <section className="py-10 md:py-16 border-b border-gray-100/50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
              {[
                { icon: <LuLeaf />, text: "Pure Organic", sub: "Certified sources" },
                { icon: <LuShieldCheck />, text: "Quality Tested", sub: "Homemade Products" },
                { icon: <LuTruck />, text: "Direct Delivery", sub: "Farm to door" },
                { icon: <LuHeart />, text: "Ethical Sourcing", sub: "Local farmers" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-green-600 transition-all duration-500 group-hover:bg-green-600 group-hover:text-white group-hover:rotate-12 shadow-sm group-hover:shadow-lg group-hover:shadow-green-900/10 border border-gray-100 pointer-events-none">
                    <span className="text-2xl transition-transform duration-500 group-hover:scale-110">{b.icon}</span>
                  </div>
                  <div className="flex-1 pointer-events-none">
                    <div className="text-gray-900 font-bold tracking-tight text-sm md:text-base transition-colors group-hover:text-green-800">{b.text}</div>
                    <div className="text-gray-400 text-[10px] md:text-xs font-medium">{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl text-left">
              <span className="text-green-600 font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Handpicked Collection</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900  tracking-tight mb-4">Featured Products</h2>
              <p className="text-gray-500 text-lg">Experience the purest organic essentials, loved by our community.</p>
            </div>
            <Link href="/products" className="group flex items-center gap-2 text-green-700 font-bold text-sm uppercase tracking-widest hover:text-green-800 transition-colors">
              View full shop <LuArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} interval={carouselInterval} />
            ))}
          </div>
        </section>

        {/* ── Customer Reviews ── */}
        <section className="py-32 border-y border-gray-100/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <span className="text-green-600 font-black text-xs uppercase tracking-[0.2em] mb-4 block">Testimonials</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900  tracking-tight">Voices of Our Community</h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-10 md:p-20 text-center relative overflow-hidden">
                {/* Modern accent quote */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>

                <LuQuote className="text-6xl text-green-100 mx-auto mb-10" />
                <p className="text-2xl md:text-3xl text-gray-800 font-medium italic mb-12 leading-[1.6]">
                  &ldquo;{dynamicTestimonials[testimonialIdx]?.text}&rdquo;
                </p>

                <div className="flex flex-col items-center">
                  <div className="flex justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                      <LuStar key={s} size={18} className={`${s <= dynamicTestimonials[testimonialIdx]?.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="font-black text-xl text-gray-900  tracking-tight">{dynamicTestimonials[testimonialIdx]?.name}</p>
                  <p className="text-sm font-bold text-green-600 uppercase tracking-widest mt-1">{dynamicTestimonials[testimonialIdx]?.location}</p>
                </div>

                <div className="flex justify-center gap-3 mt-12">
                  {dynamicTestimonials.map((_, i) => (
                    <button key={i} onClick={() => setTestimonialIdx(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === testimonialIdx ? "w-10 bg-[#064e3b]" : "w-3 bg-gray-200 hover:bg-gray-300"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── About Us ── */}
        <section id="about" className="max-w-7xl mx-auto px-6 lg:px-8 py-32 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-square bg-[#064e3b] rounded-[40px] flex items-center justify-center relative shadow-2xl overflow-hidden group">
                {/* Static Brand Asset */}
                <img
                  src="/about_design.webp"
                  alt="Samruddhi Organics Design"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Floating Promotional Badge */}
                <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md text-[#064e3b] px-8 py-3.5 rounded-full font-black text-sm tracking-widest shadow-2xl z-20 border border-white/50 animate-bounce-subtle">
                  SAVE 25%
                </div>

                {/* Bottom Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 pointer-events-none"></div>

              </div>
            </div>

            <div>
              <span className="text-green-600 font-black text-xs uppercase tracking-[0.2em] mb-6 block">Our Legacy</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-8  tracking-tight leading-tight">Rooted in Nature,<br />Driven by Passion.</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Samruddhi Organics was born from a simple vision: to reunite urban dwellers with the profound joy of the earth. We believe every balcony has the potential to be a thriving sanctuary.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-12">
                {[
                  { label: "Community", val: "5,000+", sub: "Users" },
                  { label: "Products", val: "50+", sub: "Essentials" },
                ].map((s, i) => (
                  <div key={i} className="p-8 bg-gray-50 rounded-[24px] border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-500">
                    <div className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">{s.label}</div>
                    <div className="text-4xl font-black text-gray-900 ">{s.val}</div>
                    <div className="text-xs font-bold text-gray-400 mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>

              <Link href="/products" className="btn-primary">
                Experience the Magic <LuArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Modern CTA ── */}
        <section className="px-6 py-12 md:py-24">
          <div className="max-w-7xl mx-auto bg-[#064e3b] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden relative min-h-[450px] md:min-h-[500px] flex items-center justify-center text-center px-6 py-16 md:py-0">
            {/* Modern Mesh/Noise Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#10b981,_transparent)] opacity-20"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#022c22,_transparent)]"></div>

            <div className="relative z-10 max-w-3xl">
              <h2 className="text-3xl md:text-6xl font-black text-white mb-6 md:mb-8 tracking-tight leading-tight">Ready to Start Your<br />Green Masterpiece?</h2>
              <p className="text-green-100/70 text-base md:text-lg mb-10 md:mb-12 max-w-xl mx-auto font-medium">
                Join the urban farming revolution today. We provide the tools, the knowledge, and the love to help you grow.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link href="/products" className="px-10 py-5 bg-white text-[#064e3b] rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3">
                  Shop Now <LuArrowRight />
                </Link>
                <Link href="/auth/register" className="px-10 py-5 bg-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all backdrop-blur-md flex items-center justify-center">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
