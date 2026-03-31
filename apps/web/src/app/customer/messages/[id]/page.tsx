"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MessageRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  useEffect(() => {
    if (orderId) {
      router.replace(`/customer/messages?orderId=${orderId}`);
    } else {
      router.replace("/customer/messages");
    }
  }, [orderId, router]);

  return (
    <div className="min-h-screen bg-[#f8faf7] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#00503a] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
