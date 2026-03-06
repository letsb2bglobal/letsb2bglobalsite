import Image from "next/image";
import Link from "next/link";

type AuthLayoutProps = {
  children: React.ReactNode;
  variant?: "signin" | "signup";
  header?: React.ReactNode;
  /** When true, hides the form card border/shadow so only the inner content box is visible */
  hideCardStyle?: boolean;
  /** When true, disables inner scroll so the page body scrolls (single scrollbar) */
  noInnerScroll?: boolean;
  /** When true, uses transparent page background so only the card has white bg (for single-card layout) */
  usePageBackground?: boolean;
};

export default function AuthLayout({ children, variant = "signin", header, hideCardStyle, noInnerScroll, usePageBackground }: AuthLayoutProps) {
  const hideLeftPanel = variant === "signup";
  const transparentBg = usePageBackground && hideLeftPanel;

  return (
    <div
      className={`flex flex-col w-full ${noInnerScroll && hideLeftPanel ? "min-h-0 overflow-visible" : "min-h-screen overflow-x-hidden"} ${transparentBg ? "bg-transparent" : ""}`}
      style={transparentBg ? undefined : { background: hideLeftPanel ? "#fff" : "#FFE6FBA3" }}
    >
      {/* ── Content area ───────────────────────────────────────────────── */}
      <div
        className={`flex-1 w-full ${hideLeftPanel ? "px-0 py-0" : "px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8"} ${noInnerScroll && hideLeftPanel ? "overflow-visible min-h-0" : ""} ${transparentBg ? "bg-transparent" : ""}`}
        style={transparentBg ? undefined : { background: hideLeftPanel ? "#fff" : "#FFE6FBA3" }}
      >
        <div
          className={`relative w-full flex items-center justify-center ${hideLeftPanel ? "min-h-0 overflow-visible rounded-2xl" : "min-h-screen overflow-x-hidden"} ${
            hideLeftPanel ? "" : "grid lg:grid-cols-2 grid-cols-1"
          } ${transparentBg ? "bg-transparent" : ""}`}
          style={transparentBg ? { border: "none" } : {
            background: hideLeftPanel ? "transparent" : "#FFE6FBA3",
            border: "none",
          }}
        >
          {/* ── Signup: Ellipse 36 — localized blur (per Figma) ─────────── */}
          {hideLeftPanel && !usePageBackground && (
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
          <div className={`relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 min-w-0 w-full ${noInnerScroll && hideLeftPanel ? "overflow-visible" : "overflow-x-hidden"} ${hideLeftPanel ? "w-full" : ""}`}>
            {hideLeftPanel && header && (
              <div className="w-full max-w-full sm:max-w-[540px] md:max-w-[680px] lg:max-w-[872px] mb-6 sm:mb-8">
                {header}
              </div>
            )}
            <div
              className={`w-full py-4 sm:py-6 px-4 sm:px-6 ${
                hideCardStyle
                  ? `w-full max-w-full sm:w-[872px] sm:max-w-[872px] min-h-0 ${noInnerScroll ? "overflow-visible" : "overflow-y-auto"}`
                  : hideLeftPanel
                    ? `w-full max-w-full sm:w-[872px] sm:max-w-[872px] rounded-2xl sm:rounded-[24px] bg-white shadow-lg ${noInnerScroll ? "overflow-visible overflow-y-visible" : "overflow-y-auto"}`
                    : "max-w-[460px] rounded-xl sm:rounded-[20px] overflow-y-auto"
              }`}
              style={
                hideCardStyle
                  ? { background: "transparent", boxShadow: "none" }
                  : hideLeftPanel
                    ? usePageBackground
                      ? undefined
                      : { boxShadow: "2px 5px 13px 0px #E1C0EC" }
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
