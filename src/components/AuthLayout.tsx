import Image from "next/image";
import Link from "next/link";

type AuthLayoutProps = { children: React.ReactNode; variant?: "signin" | "signup" };

export default function AuthLayout({ children, variant = "signin" }: AuthLayoutProps) {
  const hideLeftPanel = variant === "signup";

  return (
    <div
      className={`flex flex-col overflow-x-hidden ${hideLeftPanel ? "h-screen overflow-y-auto" : "min-h-screen"}`}
      style={{ background: hideLeftPanel ? "#fff" : "#FFE6FBA3" }}
    >
      {/* ── Content area ───────────────────────────────────────────────── */}
      <div
        className={`flex-1 px-3 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 ${hideLeftPanel ? "min-h-0" : ""}`}
        style={{ background: hideLeftPanel ? "#fff" : "#FFE6FBA3" }}
      >
        <div
          className={`relative w-full flex items-center justify-center ${hideLeftPanel ? "min-h-full overflow-visible rounded-2xl" : "min-h-screen overflow-x-hidden"} ${
            hideLeftPanel ? "" : "grid lg:grid-cols-2 grid-cols-1"
          }`}
          style={{
            background: hideLeftPanel ? "transparent" : "#FFE6FBA3",
            border: "none",
          }}
        >
          {/* ── Signup: Ellipse 36 — localized blur (per Figma) ─────────── */}
          {hideLeftPanel && (
            <div
              className="absolute pointer-events-none"
              style={{
                width: 728.83,
                height: 728.83,
                top: 147.59,
                left: 355.59,
                borderRadius: "50%",
                background: "#F8EBFF",
                filter: "blur(104px)",
                WebkitFilter: "blur(104px)",
              }}
              aria-hidden
            />
          )}

          {/* ── Left Panel (signin only) ───────────────────────────────── */}
          {!hideLeftPanel && (
          <div className="hidden lg:flex flex-col justify-between p-10">
            {/* Text block — top left */}
            <div className="flex flex-col gap-0 pt-2">
              {/* 1. Lets B2B — Bold, Display Medium, #612178 */}
              <h2
                style={{
                  color: "#612178",
                  fontFamily: "'Inter Display', 'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "36px",
                  lineHeight: "44px",
                  letterSpacing: "-0.02em",
                  width: "185px",
                  height: "52px",
                  display: "flex",
                  alignItems: "center",
                }}
              >Lets B2B</h2>

              {/* 2. Subtitle — Regular, Body Large, #000000 */}
              <p
                style={{
                  color: "#000000",
                  fontFamily: "'Inter Display', 'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "0em",
                  marginTop: "6px",
                }}
              >
                Where tourism &amp; hospitality professionals connect the right way.
              </p>

              {/* 3. List Your Business — Regular, Body Large, #000000 */}
              <Link
                href="/pricing"
                style={{
                  color: "#000000",
                  fontFamily: "'Inter Display', 'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "0em",
                  marginTop: "4px",
                  width: "fit-content",
                }}
                className="hover:underline"
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
          )}

          {/* ── Right Panel (Form Card) ────────────────────────────────── */}
          <div className={`relative z-10 flex items-center justify-center p-3 sm:p-6 md:p-8 min-w-0 w-full overflow-x-hidden ${hideLeftPanel ? "w-full" : ""}`}>
            <div
              className={`w-full py-5 px-4 sm:py-8 sm:px-6 md:px-8 ${
                hideLeftPanel
                  ? "max-w-full sm:max-w-[540px] md:max-w-[680px] lg:max-w-[872px] min-h-0 sm:min-h-[393px] rounded-2xl sm:rounded-[24px] bg-[#FFFFFF]"
                  : "max-w-[460px] rounded-xl sm:rounded-[20px] overflow-y-auto"
              }`}
              style={
                hideLeftPanel
                  ? { boxShadow: "2px 2px 6px 0px #00000040" }
                  : { background: "#FFFFFF", boxShadow: "0px 4px 24px 0px rgba(180,100,200,0.13)" }
              }
            >
              {children}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
