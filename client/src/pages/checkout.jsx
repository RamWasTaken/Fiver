'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// @ts-nocheck
// import React, { useEffect, useState } from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import axios from "axios";
// import { CREATE_ORDER } from "../utils/constants";
// import { Elements } from "@stripe/react-stripe-js";
// import CheckoutForm from "../components/CheckoutForm";
// import { useRouter } from "next/router";
// import { useCookies } from "react-cookie"; 

// const stripePromise = loadStripe("pk_test_xeqIPdYS2PpKbHmKG4gJqpde");

function Checkout() {
//   const [clientSecret, setClientSecret] = useState("");
//   const router = useRouter();
//   const { gigId } = router.query;
//   const [cookies] = useCookies(['jwt']);
//   useEffect(() => {
//     const createOrderIntent = async () => {
//       const { data } = await axios.post(
//         CREATE_ORDER,
//         { gigId },
//         {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${cookies.jwt}`, // Add the Authorization header
//             },
//           }
//         );
//       setClientSecret(data.clientSecret);
//     };
//     if (gigId) createOrderIntent();
//   }, [gigId,cookies.jwt]);

//   const appearance = {
//     theme: "stripe",
//   };
//   const options = {
//     clientSecret,
//     appearance,
//   };

//   return (
//     <div className="min-h-[80vh] max-w-full mx-20 flex flex-col gap-10 items-center">
//       <h1 className="text-3xl">
//         Please complete the payment to place the order.
//       </h1>
//       {clientSecret && (
//         <Elements options={options} stripe={stripePromise}>
//           <CheckoutForm />
//         </Elements>
//       )}
//     </div>
//   );

// new UI instead of checkout :
const router = useRouter()
const [progress, setProgress] = useState(0)

useEffect(() => {
  // Increment progress every 100ms
  const interval = setInterval(() => {
    setProgress((old) => {
      if (old >= 100) {
        clearInterval(interval)
        return 100
      }
      return old + 5
    })
  }, 100)

  // Redirect after 3 seconds
  const timeout = setTimeout(() => {
    router.push('/meet')
  }, 3000)

  return () => {
    clearTimeout(timeout)
    clearInterval(interval)
  }
}, [router])

return (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
    <h1 className="text-2xl font-semibold mb-6">Redirecting to Meet...</h1>
    <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
    <p className="mt-4 text-sm text-gray-400">{progress}%</p>
  </div>
)
}


export default Checkout;
