"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CiClock2, CiLocationOn, CiMail } from "react-icons/ci";
import { FaFacebook, FaInstagram, FaLinkedin, FaSearch, FaTwitter } from "react-icons/fa";
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from "react-icons/io";
import HeroActionButton from "@/components/user/landing/HeroActionButton";
import SecondaryTitle from "@/components/user/landing/SecondaryTitle";
import MarqueeStrip from "@/components/user/landing/MarqueeStrip";

const ASSET_BASE = "https://html.themehour.net/takci/demo/assets/img";

const bookingTabs = ["STANDARD", "BUSINESS", "ECONOMY", "VIP", "MINIVAN", "COMFORT"];
const bookingCars = [
  "booking_1_1.png",
  "booking_1_2.png",
  "booking_1_3.png",
  "booking_1_4.png",
  "booking_1_5.png",
  "booking_1_6.png",
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function RootLandingPage() {
  const [activeBooking, setActiveBooking] = useState(0);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const heroSlides = ["hero_bg_1_1.jpg", "hero_bg_1_2.jpg"];
  const experienceText = "Years Of Experience * Years Of Experience * ";
  const experienceChars = experienceText.split("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const serviceCards = useMemo(
    () => [
      { title: "City Transfer", img: "service_card_1_1.jpg" },
      { title: "Airport Transfer", img: "service_card_1_2.jpg" },
      { title: "Regular Transport", img: "service_card_1_3.jpg" },
      { title: "Online Booking", img: "service_card_1_4.jpg" },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section id="hero" className="px-4 pt-4 md:px-6 md:pt-6">
        <div className="mx-auto mb-1 flex flex-wrap items-center justify-between gap-3 rounded-full bg-brand-500 px-2 py-3 text-[14px] text-white md:px-8">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand-500">
              <CiLocationOn size={18} />
            </span>
            <span>156 Main Street, 2nd Floor. USA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand-500">
              <CiClock2  size={18} />
            </span>
            <span>Working Hours: Mon to Fri - 8:00am - 16:00pm</span>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand-500">
              <CiMail size={18} />
            </span>
            <span>info@takci.com</span>
          </div>
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1">
              {[<FaFacebook/>, <FaTwitter/>, <FaInstagram/>, <FaLinkedin/>].map((social, index) => (
                <span key={`social-${index}`} className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 hover:bg-white">
                  <Link href={`https://www.facebook.com/PimjoHQ`} className="grid h-8 w-8 place-items-center rounded-full text-white hover:text-brand-500">
                    {social}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div
          className="relative min-h-screen overflow-hidden rounded-[22px] mt-5 bg-slate-950 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.75)] flex items-center"
          style={{
            backgroundImage: `linear-gradient(180deg, #171717 7.56%, rgba(23, 23, 23, 0.708861) 13.56%, rgba(23, 23, 23, 0) 25.11%), linear-gradient(100.59deg, #171717 11.9%, rgba(23, 23, 23, 0.959756) 21.5%, rgba(23, 23, 23, 0.900227) 33.46%, rgba(23, 23, 23, 0) 69.16%), url(${ASSET_BASE}/hero/${heroSlides[activeHeroSlide]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="mx-auto flex items-center justify-between px-4 py-5 md:px-8 absolute top-0 w-full">
            <img src="/images/takci/logo2.svg" alt="Takci" className="h-15 w-auto" />
            {/* <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
              <a href="#hero" className="hover:text-brand-500">
                Home
              </a>
              <a href="#about-sec" className="hover:text-brand-500">
                About Us
              </a>
              <a href="#service-sec" className="hover:text-brand-500">
                Services
              </a>
              <a href="#blog-sec" className="hover:text-brand-500">
                Blog
              </a>
              <a href="#contact" className="hover:text-brand-500">
                Contact Us
              </a>
            </nav> */}
            <div className="flex items-center gap-2">
              <button className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-brand-500 text-white"><FaSearch size={14} /></button>
              <HeroActionButton
                href="/user/book-ride"
                variant="primary"
              >
                BOOK A TAXI
              </HeroActionButton>
            </div>
          </div>

          <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-24 pt-8 md:px-8 lg:grid-cols-2 lg:pt-14">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="space-y-6 lg:pl-4"
          >
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-white">
              <span className="mr-1 inline-flex items-center gap-0">
                <span
                  className="inline-block h-[15px] w-4 bg-brand-500"
                  style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                />
                <span
                  className="inline-block h-[15px] w-3 bg-brand-500"
                  style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                />
                <span
                  className="inline-block h-[15px] w-[12px] bg-white"
                  style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)" }}
                />
              </span>
              WELCOME TO KADI
            </p>
            <h1 className="text-5xl font-black leading-[0.95] text-white md:text-7xl">Fast & Affordable Taxi Service!</h1>
            <p className="max-w-xl text-xs text-slate-200 md:text-sm">
              Online taxi service is a convenient and affordable way to travel within a city or to nearby destinations.
            </p>
            <div className="flex flex-wrap gap-3">
              <HeroActionButton href="/user/book-ride" variant="primary">
                DISCOVER MORE
              </HeroActionButton>
              <HeroActionButton href="#service-sec" variant="outline">
                OUR SERVICES
              </HeroActionButton>
            </div>
          </motion.div>

          <div className="hidden lg:block" />
          </div>

          <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-3">
            <button
              onClick={() =>
                setActiveHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
              }
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-black"
              aria-label="Previous hero slide"
            >
              <IoIosArrowRoundBack size={18} />
            </button>
            <button
              onClick={() => setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-black"
              aria-label="Next hero slide"
            >
              <IoIosArrowRoundForward size={18} />
            </button>
          </div>

          <div
            className="hero-wave absolute bottom-0 h-[34px] w-full"
            style={{
              backgroundImage: "url('/images/takci/shape/shape3.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
            }}
          />
        </div>
      </section>
      <style jsx>{`
        @keyframes wave {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 3000px 0;
          }
        }
        .hero-wave {
          width: 100%;
          height: 34px;
          background-size: 105px 34px;
          -webkit-animation: wave 70s linear infinite;
          animation: wave 70s linear infinite;
        }
        @keyframes spinExp {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .about-circle-text {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          animation: spinExp 20s linear infinite;
        }
        .about-circle-char {
          position: absolute;
          left: 50%;
          top: 50%;
          transform-origin: 0 0;
          font-size: 11px;
          color: #50535f;
          line-height: 1;
        }
      `}</style>

      <main className="space-y-16 px-4 py-14 md:px-6">
        <motion.section
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-3xl bg-white p-5 shadow-sm md:p-7"
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 text-center text-2xl font-bold">Booking a Ride Your Standard Taxi</h2>
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {bookingTabs.map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveBooking(index)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    activeBooking === index ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid items-center gap-6 lg:grid-cols-2">
              <div className="relative mx-auto w-full max-w-xl overflow-visible pt-8">
                <div className="h-[220px] rounded-[24px] bg-linear-to-br from-[#ebe9e3] to-[#4db74d] shadow-[0_25px_55px_-35px_rgba(0,0,0,0.45)] sm:h-[250px] md:h-[300px]" />
                <img
                  src={`/images/takci/normal/${bookingCars[activeBooking]}`}
                  alt="Booking taxi"
                  className="pointer-events-none absolute -bottom-1 left-1/2 z-10 w-[108%] max-w-none -translate-x-1/2 drop-shadow-[0_22px_24px_rgba(0,0,0,0.35)] sm:w-[112%] md:-bottom-3 md:left-0 md:w-[124%] md:-translate-x-[20%]"
                />
              </div>
              <form className="grid gap-3 sm:grid-cols-2">
                {["Write Your Name", "End Destination", "Phone Number", "Select Date", "Passengers", "Select Time"].map(
                  (field) => (
                    <input
                      key={field}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-brand-500 focus:ring"
                      placeholder={field}
                    />
                  ),
                )}
                <input
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-brand-500 focus:ring sm:col-span-2"
                  placeholder="Start Destination"
                />
                <HeroActionButton variant="primary" href="/user/book-ride">
                  BOOK A TAXI NOW
                </HeroActionButton>
              </form>
            </div>
          </div>
        </motion.section>

        <section
          id="about-sec"
          className="rounded-3xl bg-[#f4f5f7] bg-cover bg-center bg-no-repeat p-5"
          style={{ backgroundImage: "url('/images/bg/bg-shape1.png')" }}
        >
          <div className="grid items-center gap-8  mx-auto max-w-7xl md:grid-cols-2 md:p-8">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              className="relative grid grid-cols-[minmax(0,1fr)_130px] grid-rows-[auto_auto] items-end gap-3 md:grid-cols-[minmax(0,1fr)_150px] md:gap-4"
            >
              <div className="row-span-2 overflow-hidden rounded-2xl">
                <img
                  src="/images/takci/normal/about-thumb1-1.jpg"
                  alt="About"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative mx-auto grid h-[130px] w-[130px] place-items-center md:h-[150px] md:w-[150px]">
                <div className="about-circle-text">
                  {experienceChars.map((char, index) => (
                    <span
                      key={`${char}-${index}`}
                      className="about-circle-char"
                      style={{
                        transform: `rotate(${index * (360 / experienceChars.length)}deg) translateY(-62px)`,
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </div>
                <div className="grid h-[78px] w-[78px] place-items-center rounded-full bg-brand-500 text-4xl font-black text-white md:h-[90px] md:w-[90px]">
                  16+
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl">
                <img
                  src="/images/takci/normal/about-thumb1-2.jpg"
                  alt="About detail"
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>
            <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              <SecondaryTitle title="ABOUT OUR COMPANY" className="mb-2 text-sm" />
              <h3 className="text-3xl font-bold">Fast & Easy Taxi Booking at Your Fingertips</h3>
              <p className="mt-3 text-slate-600">
                Our Taxi Booking Service is designed to make your travel experience fast, safe, and convenient.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>Instant & Advance Booking Options</li>
                <li>Real-Time Ride Tracking</li>
                <li>Professional & Verified Drivers</li>
                <li>Affordable & Transparent Pricing</li>
              </ul>
              <div className="mt-6">
                <HeroActionButton variant="primary" href="/about">
                  MORE ABOUT US
                </HeroActionButton>
              </div>
            </motion.div>
          </div>
        </section>

        <MarqueeStrip />

        <section id="service-sec" className="rounded-3xl bg-slate-950 p-6 text-white md:p-8">
          <div className="mb-8 text-center">
            <SecondaryTitle title="OUR SERVICES" className="text-sm text-brand-500" lastShapeClassName="bg-white" />
            <h3 className="text-3xl font-bold">Our Best Taxi Service For You</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map((card, i) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -6 }}
                className="overflow-hidden rounded-2xl bg-white text-slate-900"
              >
                <img src={`${ASSET_BASE}/service/${card.img}`} alt={card.title} className="h-44 w-full object-cover" />
                <div className="space-y-2 p-4">
                  <h4 className="text-lg font-bold">{card.title}</h4>
                  <p className="text-sm text-slate-600">Quick and affordable transportation within the city for work.</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="testi-sec" className="grid gap-6 md:grid-cols-2">
          <img src={`${ASSET_BASE}/testimonial/testi-thumb1-1.jpg`} alt="Testimonial" className="rounded-2xl" />
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <h3 className="mb-3 text-2xl font-bold">What Riders Say</h3>
            <p className="text-slate-600">
              Quick and easy booking. Driver arrived on time, clean car, smooth ride. Definitely my go-to taxi service.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <img src={`${ASSET_BASE}/testimonial/testi1-1.jpg`} alt="Alex James" className="h-12 w-12 rounded-full" />
              <div>
                <p className="font-semibold">Alex James</p>
                <p className="text-sm text-slate-500">Co-founder</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="blog-sec">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h3 className="text-3xl font-bold">Our Latest News & Blogs</h3>
            <a className="text-sm font-semibold text-brand-600" href="#">
              VIEW ALL POST
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {["blog-s-1-1.jpg", "blog-s-1-2.jpg", "blog-s-1-3.jpg"].map((img, i) => (
              <motion.article
                key={img}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08 }}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <img src={`${ASSET_BASE}/blog/${img}`} alt="Blog" className="h-52 w-full object-cover" />
                <div className="p-4">
                  <p className="mb-2 text-xs text-slate-500">by admin</p>
                  <h4 className="text-lg font-semibold">Track your ride in real time and share your trip with loved ones.</h4>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 py-10 text-slate-200">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3 md:px-6">
          <div>
            <img src={`${ASSET_BASE}/logo2.svg`} alt="Takci" className="mb-4 h-9 w-auto" />
            <p className="text-sm text-slate-300">
              Our Taxi Booking Service is designed to make your travel experience fast, safe, and convenient.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Useful Links</h4>
            <ul className="space-y-2 text-sm">
              <li>Home</li>
              <li>About Us</li>
              <li>Get a Taxi</li>
              <li>Latest News</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-white">Call Any Time</h4>
            <p className="text-2xl font-bold text-brand-500">+(256)-5469-87452</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
