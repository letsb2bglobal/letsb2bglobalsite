import { getToken } from "./auth";

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const handlePayment = (
  plan: { documentId: string; current_price: number; plan_name: string; tier_id: string; duration_code: string }, 
  userInfo: { id: string | number; name: string; email: string; mobile: string; profileId: string },
  onVerifying?: () => void
): Promise<{ success: boolean; subscriptionId?: string }> => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";
  const token = getToken();

  return new Promise(async (resolve, reject) => {
    try {
      // 1. Pre-Payment State (Draft Stage)
      const draftResponse = await fetch(`${BASE_URL}/api/buy-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          profileId: userInfo.profileId,
          tier: plan.tier_id,
          durationCode: plan.duration_code
        }),
      });

      if (!draftResponse.ok) {
        const errorData = await draftResponse.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || 'Failed to initialize subscription draft');
      }

      const draftData = await draftResponse.json();
      const subscriptionId = draftData?.data?.documentId || draftData?.data?.id;

      // 2. Create Order
      const orderResponse = await fetch(`${BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          plan_id: plan.documentId, 
          amount: plan.current_price,
          currency: "INR",
          user_id: userInfo.id,
          profile_id: userInfo.profileId,
          subscription_id: subscriptionId
        }),
      });

      if (!orderResponse.ok) throw new Error('Failed to create order');
      const order = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "LetsB2B Global",
        description: `Subscription for ${plan.plan_name}`,
        image: "https://letsb2b.com/logo.png",
        order_id: order.id,
        handler: async function (response: RazorpayResponse) {
          console.log(">>> RAZORPAY SUCCESS:", response);
          
          // Persistent logging for audit
          const paymentLog = {
            step: "RAZORPAY_SUCCESS",
            timestamp: new Date().toISOString(),
            razorpay_response: response,
          };
          localStorage.setItem('letsb2b_payment_audit', JSON.stringify(paymentLog));

          // Small delay to let Razorpay modal close before showing our "Verifying" state
          setTimeout(() => {
            if (onVerifying) onVerifying();
          }, 500);

          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            user_id: userInfo.id,
            subscription_id: subscriptionId
          };

          try {
            console.log(">>> VERIFY PAYLOAD:", verificationData);
            const verifyResponse = await fetch(`${BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify(verificationData),
            });

            const result = await verifyResponse.json();
            console.log("<<< VERIFY RESPONSE:", result);
            
            // Update audit log with result
            localStorage.setItem('letsb2b_payment_audit', JSON.stringify({
              ...paymentLog,
              step: "VERIFICATION_COMPLETE",
              verify_input: verificationData,
              verify_response: result
            }));
            
            resolve({ success: result.success, subscriptionId });
          } catch (err) {
            console.error("Verification error:", err);
            resolve({ success: false });
          }
        },
        modal: {
          ondismiss: function() {
            reject(new Error("Payment cancelled by user"));
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.mobile,
        },
        theme: { color: "#2563eb" },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          console.error(">>> PAYMENT FAILED:", response.error);
          // Don't reject here yet, let handler or ondismiss handle the modal close
        });
        rzp.open();
      } else {
        throw new Error("Razorpay SDK not loaded");
      }
    } catch (error) {
      reject(error);
    }
  });
};
