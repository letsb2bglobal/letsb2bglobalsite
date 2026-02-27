import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    /* White page background */
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Row 1: Top Bar (white, full width) ───────────────────────────── */}
      <div className="w-full bg-white h-20 flex items-center px-8 shrink-0 border-b border-gray-100 z-10">
        <div className="flex items-center">
          <Image src="/headerB2B_logo.png" alt="LetsB2B" width={202} height={62} className="object-contain" />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="https://play.google.com/store"
            target="_blank"
            className="px-5 py-2 text-sm font-bold rounded-full transition-all flex items-center gap-2"
            style={{ background: "#612178", color: "#FFFFFF" }}
          >
            <Image src="/androidLogo.png" alt="Android" width={18} height={18} className="object-contain" />
            Download App
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-sm font-bold rounded-full transition-all"
            style={{ background: "#FEA40C", color: "#FFFFFF" }}
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* ── Row 2: Pink card ─────────────────────────────────────────────── */}
      <div className="flex-1 bg-white px-6 pb-6 pt-4">
        <div
          className="w-full h-full grid lg:grid-cols-2 grid-cols-1"
          style={{
            background: "#FFE6FBA3",
            border: "1px solid #E3BFDD",
            borderRadius: "24px",
            minHeight: "calc(100vh - 80px - 40px)",
          }}
        >

          {/* ── Left Panel ─────────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col justify-between p-10">
            {/* Text block — top left */}
            <div className="flex flex-col gap-1 pt-2">
              <h2
                style={{
                  color: "#612178",
                  fontFamily: "'Inter Display', 'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "28px",
                  lineHeight: "34px",
                  letterSpacing: "-0.01em",
                }}
              >Lets B2B</h2>
              <p className="text-sm font-normal leading-relaxed" style={{ color: "#000000" }}>
                Where tourism &amp; hospitality professionals connect the right way.
              </p>
              <Link
                href="/pricing"
                className="text-sm font-semibold mt-0.5 hover:underline w-fit"
                style={{ color: "#000000" }}
              >
                List Your Business
              </Link>
            </div>
            {/* Illustration — bottom, fills remaining space */}
            <div className="flex items-end justify-center flex-1 pt-6">
              <Image
                src="/B2Bframe.png"
                alt="B2B Illustration"
                width={560}
                height={420}
                className="object-contain w-full h-auto max-h-[420px]"
              />
            </div>
          </div>

          {/* ── Right Panel (Login Card) ──────────────────────────────── */}
          <div className="flex items-center justify-center p-8">
            <div
              className="bg-[#FFFEFE] overflow-y-auto w-full"
              style={{
                maxWidth: "460px",
                borderRadius: "20px",
                padding: "36px 40px",
                boxShadow: "0px 4px 24px 0px rgba(180,100,200,0.13)",
              }}
            >
              {children}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
