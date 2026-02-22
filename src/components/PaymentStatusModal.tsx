"use client";

import React from "react";

interface PaymentStatusModalProps {
  status: "idle" | "verifying" | "success" | "error";
  errorMsg?: string;
  onClose: () => void;
}

export default function PaymentStatusModal({ status, errorMsg, onClose }: PaymentStatusModalProps) {
  const [showLogs, setShowLogs] = React.useState(false);
  const auditData = typeof window !== 'undefined' ? localStorage.getItem('letsb2b_payment_audit') : null;
  const parsedAudit = auditData ? JSON.parse(auditData) : null;

  if (status === "idle") return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>

        {status === "verifying" && (
          <div className="space-y-8 py-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-8 border-blue-50 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Verifying Payment</h2>
              <p className="text-gray-500 mt-3 font-medium text-lg">Securing your trade credentials...</p>
              <p className="text-gray-400 mt-1 text-sm">Please do not refresh or close this window.</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-8 pt-6 relative">
            <div className="confetti-container absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`confetti-piece p-${i}`}></div>
              ))}
            </div>
            
            <div className="success-checkmark w-24 h-24 mx-auto relative z-10">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Verified</h2>
              <p className="text-slate-600 font-bold mt-4 text-xl px-2">Your premium trade status is now active.</p>
              <p className="text-slate-400 mt-2 font-medium">Full access to global B2B networks unlocked.</p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={onClose}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-2xl shadow-blue-200 uppercase tracking-widest text-sm relative z-10"
              >
                Start Trading Now
              </button>
              
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                {showLogs ? "Hide Audit Logs" : "View Payment Signature & Handshake"}
              </button>

              {showLogs && parsedAudit && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl text-left border border-slate-100 overflow-x-auto max-h-48">
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Handshake Payload (Verification)</p>
                  <pre className="text-[9px] text-slate-700 font-mono">
                    {JSON.stringify(parsedAudit.verify_input, null, 2)}
                  </pre>
                  <div className="my-3 border-t border-slate-200"></div>
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Server Response</p>
                  <pre className="text-[9px] text-slate-700 font-mono">
                    {JSON.stringify(parsedAudit.verify_response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-8 py-6">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto border-4 border-red-100">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-red-900 uppercase tracking-tight">Handshake Failed</h2>
              <p className="text-slate-500 mt-3 font-medium px-4">{errorMsg || "We couldn't verify your signature. Please retry."}</p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={onClose}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-sm shadow-xl shadow-slate-200 hover:bg-black"
              >
                Retry Payment
              </button>
              
              {parsedAudit && (
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  {showLogs ? "Hide Technical Details" : "View Failure Details"}
                </button>
              )}

              {showLogs && parsedAudit && (
                <div className="mt-4 p-4 bg-red-50/50 rounded-xl text-left border border-red-100 overflow-x-auto max-h-48">
                  <pre className="text-[9px] text-red-900 font-mono">
                    {JSON.stringify(parsedAudit, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <style jsx>{`
          .success-checkmark { width: 80px; height: 80px; }
          .check-icon { width: 80px; height: 80px; position: relative; border-radius: 50%; border: 4px solid #10b981; }
          .icon-line { height: 5px; background-color: #10b981; display: block; border-radius: 2px; position: absolute; z-index: 10; }
          .line-tip { top: 46px; left: 14px; width: 25px; transform: rotate(45deg); animation: icon-line-tip 0.75s; }
          .line-long { top: 38px; right: 8px; width: 47px; transform: rotate(-45deg); animation: icon-line-long 0.75s; }
          .icon-circle { top: -4px; left: -4px; z-index: 10; width: 80px; height: 80px; border-radius: 50%; position: absolute; border: 4px solid rgba(16, 185, 129, .2); }
          .icon-fix { top: 8px; width: 5px; left: 26px; z-index: 1; height: 85px; position: absolute; transform: rotate(-45deg); background-color: #FFFFFF; }

          @keyframes icon-line-tip {
            0% { width: 0; left: 1px; top: 19px; }
            54% { width: 0; left: 1px; top: 19px; }
            100% { width: 25px; left: 14px; top: 46px; }
          }
          @keyframes icon-line-long {
            0% { width: 0; right: 46px; top: 54px; }
            65% { width: 0; right: 46px; top: 54px; }
            100% { width: 47px; right: 8px; top: 38px; }
          }

          .confetti-piece {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #2563eb;
            top: 50%;
            left: 50%;
            opacity: 0;
            border-radius: 2px;
          }
          ${[...Array(12)].map((_, i) => {
            const angle = (i / 12) * 360;
            const dist = 60 + Math.random() * 40;
            return `
              .p-${i} {
                background: ${['#2563eb', '#10b981', '#f59e0b', '#ef4444'][i % 4]};
                animation: explode-${i} 1s ease-out forwards;
                animation-delay: 0.5s;
              }
              @keyframes explode-${i} {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(calc(-50% + ${Math.cos(angle * Math.PI / 180) * dist}px), calc(-50% + ${Math.sin(angle * Math.PI / 180) * dist}px)) scale(1) rotate(${angle}deg); opacity: 0; }
              }
            `;
          }).join('')}
        `}</style>
      </div>
    </div>
  );
}
