// PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const billingId = new URLSearchParams(window.location.search).get("billing_id");
      if (!billingId) return setStatus("No billing ID found.");

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3000/billings/${billingId}/verify_payment`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.status === "paid") {
          setStatus("Payment successful! ✅ Your billing has been updated.");
        } else {
          setStatus(`Payment status: ${data.status}`);
        }
      } catch (err) {
        console.error(err);
        setStatus("Payment verification failed.");
      }

      // Redirect back to billing page after 3 seconds
      setTimeout(() => navigate("/dashboard/billing"), 3000);
    };

    verifyPayment();
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <CheckCircle size={48} className="text-green-600 mx-auto" />
        <h2 className="text-xl font-bold mt-4">{status}</h2>
        <p className="text-gray-600 mt-2">
          Redirecting to billing page...
        </p>
      </div>
    </div>
  );
}
