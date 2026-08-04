import { useEffect } from "react";
import { CalendarDays } from "lucide-react";
import logo from "@/assets/logo.png"; // update path

export default function OpeningSoon() {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-hidden bg-[#070707]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#120b08] via-[#2b1610] to-[#070707]" />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-red-600/20 blur-[100px] sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-yellow-500/20 blur-[100px] sm:h-96 sm:w-96" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Content Container - fits tightly inside 100dvh */}
      <div className="relative flex h-full w-full flex-col justify-center px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-h-full max-w-lg flex-col items-center text-center">

          {/* Logo with max height relative to screen height */}
          <img
            src={logo}
            alt="Himalchuli"
            className="h-auto max-h-[18dvh] w-auto object-contain drop-shadow-2xl sm:max-h-[22dvh]"
          />

          {/* Header Section */}
          <div className="mt-3 sm:mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-amber-400 sm:text-xs md:text-sm">
              Soft Opening
            </p>

            <h1 className="mt-1 text-3xl font-black uppercase leading-tight text-white sm:text-5xl md:text-6xl">
              Opening
              <br />
              <span className="text-amber-500">August 8</span>
            </h1>

            <div className="mx-auto mt-2 h-px w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent sm:mt-4 sm:w-32" />
          </div>

          {/* Description */}
          <p className="mt-3 text-xs leading-relaxed text-gray-300 sm:text-sm md:text-base">
            We are putting the finishing touches on{" "}
            <span className="font-semibold text-white">
              Himalchuli Bar & Grill
            </span>
            .<br className="hidden sm:inline" />
            {" "}Join us on{" "}
            <span className="font-bold text-amber-400">August 8</span> for an
            unforgettable Himalayan dining experience.
          </p>

          {/* Badge */}
          <div className="mt-4 inline-flex rounded-full border border-amber-400/40 bg-white/10 px-5 py-2 backdrop-blur sm:px-6 sm:py-2.5">
            <span className="text-xs font-semibold text-white sm:text-sm">
              Opening on Saturday • August 8
            </span>
          </div>

          {/* Contact Details Section */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-300 sm:gap-4 sm:text-sm">
            <a
              href="tel:+11234567890"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-amber-300 backdrop-blur transition hover:bg-white/20 hover:text-amber-400"
            >
              <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+1 (978) 241-4259</span>
            </a>

            <a
              href="mailto:contact@himalchuli.com"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-amber-300 backdrop-blur transition hover:bg-white/20 hover:text-amber-400"
            >
              <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>himalchuli2026@gmail.com</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}