import Image from "next/image";
import Link from "next/link";

type AuthLayoutProps = { children: React.ReactNode; variant?: "signin" | "signup" };

export default function AuthLayout({ children, variant = "signin" }: AuthLayoutProps) {
  const hideLeftPanel = variant === "signup";

  return (
    /* White page background */
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">

      {/* ── Content area ───────────────────────────────────────────────── */}
      <div className="flex-1 bg-white px-3 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        <div
          className={`w-full min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] rounded-2xl flex items-center justify-center overflow-x-hidden ${
            hideLeftPanel ? "" : "grid lg:grid-cols-2 grid-cols-1"
          }`}
          style={{
            background: hideLeftPanel ? "transparent" : "#FFE6FBA3",
            border: hideLeftPanel ? "none" : "1px solid #E3BFDD",
          }}
        >

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
          <div className={`flex items-center justify-center p-3 sm:p-6 md:p-8 min-w-0 w-full overflow-x-hidden ${hideLeftPanel ? "w-full" : ""}`}>
            <div
              className={`bg-[#FFFFFF] overflow-y-auto w-full py-5 px-4 sm:py-8 sm:px-6 md:px-8 ${
                hideLeftPanel
                  ? "max-w-full sm:max-w-[540px] md:max-w-[680px] lg:max-w-[872px] min-h-0 sm:min-h-[393px] rounded-2xl sm:rounded-[24px]"
                  : "max-w-[460px] rounded-xl sm:rounded-[20px]"
              }`}
              style={
                hideLeftPanel
                  ? { boxShadow: "2px 2px 6px 0px #00000040" }
                  : { boxShadow: "0px 4px 24px 0px rgba(180,100,200,0.13)" }
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
