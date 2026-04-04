"use client";
import React, { useState, useEffect, useContext } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import Autocomplete from "react-google-autocomplete";
import UserAuthModal from "@/components/user/layout/UserAuthModal";
import dynamic from "next/dynamic";

const BookingMap = dynamic(() => import("@/components/user/booking/BookingMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center font-bold text-gray-400">Loading Map & Nearby Riders...</div>,
});

// ─── Client-side Haversine ──────────────────────────────────────────────────
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcFare(km: number): number {
  return Math.round(50 + 15 * km);
}

function calcTime(km: number): number {
  return Math.round((km / 20) * 60);
}

export default function BookRidePage() {
  const router = useRouter();
  const { user: activeUser } = useContext(UserContext);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [openAuth, setOpenAuth] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState("");

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [activeRideOrder, setActiveRideOrder] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    pickupLoc: "",
    pickupLat: "",
    pickupLng: "",
    dropLoc: "",
    dropLat: "",
    dropLng: "",
    paymentMode: "Cash",
    saveAsHome: false,
    saveAsWork: false,
  });

  const [saveAs, setSaveAs] = useState<"home" | "work" | null>(null);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      saveAsHome: saveAs === "home",
      saveAsWork: saveAs === "work"
    }));
  }, [saveAs]);

  // Handlers for address selection
  const handlePickupSelected = (place: any) => {
    if (!place.geometry) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setFormData(prev => ({
      ...prev,
      pickupLoc: place.formatted_address,
      pickupLat: lat.toString(),
      pickupLng: lng.toString()
    }));
  };

  const handleDropSelected = (place: any) => {
    if (!place.geometry) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setFormData(prev => ({
      ...prev,
      dropLoc: place.formatted_address,
      dropLat: lat.toString(),
      dropLng: lng.toString()
    }));
  };

  // Sync with Global User Context
  useEffect(() => {
    if (activeUser) {
      setFormData(prev => ({
        ...prev,
        firstName: activeUser.firstName,
        lastName: activeUser.lastName,
        email: activeUser.email,
        phone: activeUser.phone,
      }));
      setStep(2);

      // Check if user already has an active ride
      fetch(`/api/customers/${activeUser.id}/active-order`, {
        cache: 'no-store'
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          // Always sync local state with server response to avoid stale "active ride" UI.
          setActiveRideOrder(data?.activeOrder ?? null);
        })
        .catch(() => {});
    } else {
      setStep(0);
    }
  }, [activeUser]);

  // Fetch customers
  useEffect(() => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedCustomerId(cid);
    const customer = customers.find(c => c.id.toString() === cid);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      }));
      setStep(2);
    }
  };

  const [estimate, setEstimate] = useState<{
    distance: number;
    fare: number;
    timeMin: number;
  } | null>(null);

  useEffect(() => {
    const pLat = parseFloat(formData.pickupLat);
    const pLng = parseFloat(formData.pickupLng);
    const dLat = parseFloat(formData.dropLat);
    const dLng = parseFloat(formData.dropLng);

    if (!isNaN(pLat) && !isNaN(pLng) && !isNaN(dLat) && !isNaN(dLng)) {
      const dist = calcDistance(pLat, pLng, dLat, dLng);
      setEstimate({
        distance: parseFloat(dist.toFixed(2)),
        fare: calcFare(dist),
        timeMin: calcTime(dist),
      });
    } else {
      setEstimate(null);
    }
  }, [formData.pickupLat, formData.pickupLng, formData.dropLat, formData.dropLng]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLocation({ lat, lng });
        // Pre-fill pickup with current location by default.
        // User can still edit pickup manually anytime.
        setFormData((prev) => ({
          ...prev,
          pickupLat: prev.pickupLat || String(lat),
          pickupLng: prev.pickupLng || String(lng),
          pickupLoc: prev.pickupLoc || `Current Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        }));
        setGeoError("");
      },
      () => {
        setGeoError("Unable to fetch your location. Please enable location permission.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!currentLocation || !apiKey) return;
    // If user already selected/typed a concrete pickup, do not override it.
    setFormData((prev) => {
      if (
        prev.pickupLoc &&
        !prev.pickupLoc.startsWith("Current Location (")
      ) {
        return prev;
      }
      return prev;
    });

    const controller = new AbortController();
    const loadAddress = async () => {
      try {
        const { lat, lng } = currentLocation;
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        const formatted = data?.results?.[0]?.formatted_address;
        if (!formatted) return;

        setFormData((prev) => {
          // Keep user-entered value intact.
          if (
            prev.pickupLoc &&
            !prev.pickupLoc.startsWith("Current Location (")
          ) {
            return prev;
          }
          return {
            ...prev,
            pickupLoc: formatted,
          };
        });
      } catch {
        // Silent fallback to coordinate label already set above.
      }
    };
    loadAddress();
    return () => controller.abort();
  }, [currentLocation, apiKey]);

  const useCurrentLocationAsPickup = () => {
    if (!currentLocation) return;
    setFormData((prev) => ({
      ...prev,
      pickupLat: String(currentLocation.lat),
      pickupLng: String(currentLocation.lng),
      pickupLoc: prev.pickupLoc || "Current Location",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const res = await fetch("/api/book-ride", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.status === 409 && data.error === 'active_ride') {
        setActiveRideOrder(data.activeOrder);
        return;
      }
      if (!res.ok) setError(data.error || "Failed to place ride request.");
      else setSuccess(data);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ── Active Ride Block Screen ─────────────────────────────────────────────
  if (!activeUser) {
    return (
      <>
        <div className="max-w-md mx-auto mt-8 space-y-4">
          <div className="rounded-2xl border border-brand-200 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-700 p-6 text-center">
            <div className="mx-auto mb-3 text-4xl">🔐</div>
            <h2 className="text-xl font-bold text-brand-800 dark:text-brand-300">Login Required</h2>
            <p className="mt-1 text-sm text-brand-700 dark:text-brand-400">
              Please log in as a customer before booking a ride.
            </p>
          </div>
          <button
            onClick={() => setOpenAuth(true)}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all"
          >
            Login To Continue
          </button>
        </div>
        <UserAuthModal
          mode="login"
          open={openAuth}
          onClose={() => setOpenAuth(false)}
          pendingPath="/user/book-ride"
        />
      </>
    );
  }

  if (activeRideOrder) {
    return (
      <div className="max-w-md mx-auto mt-8 space-y-4">
        <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700 p-6 text-center">
          <div className="mx-auto mb-3 text-4xl">🛵</div>
          <h2 className="text-xl font-bold text-orange-800 dark:text-orange-300">Ride Already Active!</h2>
          <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
            You already have an active ride. Please complete or cancel it before booking a new one.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Order</span>
            <span className="text-xs font-bold text-brand-600">#ORD-{activeRideOrder.id.toString().padStart(3,'0')}</span>
          </div>
          <div className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
            {activeRideOrder.status}
          </div>
          {activeRideOrder.pickupLoc && <p className="text-xs text-gray-500">📍 {activeRideOrder.pickupLoc}</p>}
          {activeRideOrder.dropLoc && <p className="text-xs text-gray-500">🏁 {activeRideOrder.dropLoc}</p>}
        </div>
        <button
          onClick={() => router.push(`/user/track/${activeRideOrder.id}`)}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all"
        >
          Track Active Ride 🛰️
        </button>
        <button
          onClick={() => setActiveRideOrder(null)}
          className="w-full py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (success) {
    const { order, nearbyRiders } = success;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-2xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl text-white shadow-md">✅</div>
          <h2 className="text-xl font-bold text-green-800 dark:text-green-300">Ride Request Placed!</h2>
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">A rider will be assigned to you shortly.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-gray-800 dark:text-white/90">Trip Summary</h3>
          <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white text-center shadow-lg">
            <p className="text-sm opacity-80 mb-1">Estimated Fare</p>
            <p className="text-5xl font-extrabold tracking-tight">₹{order.amount}</p>
            <div className="mt-4 flex justify-center gap-6 text-sm opacity-90 font-bold uppercase tracking-tighter">
              <span>📍 {order.distance} km</span>
              <span>⏱ ~{calcTime(order.distance)} min</span>
              <span>💳 {order.paymentMode}</span>
            </div>
          </div>

          <div className="rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 p-6 text-center shadow-inner">
            <p className="text-xs text-brand-500 uppercase font-black tracking-[0.2em] mb-3">Your Security OTP</p>
            <p className="text-6xl font-mono font-black text-brand-600 dark:text-brand-300 tracking-[0.4em]">{order.otp}</p>
          </div>

          <button onClick={() => router.push(`/user/track/${order.id}`)} className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all">Track Order Live 🛰️</button>
        </div>
      </div>
    );
  }

  const pickupLatNum = parseFloat(formData.pickupLat);
  const pickupLngNum = parseFloat(formData.pickupLng);
  const dropLatNum = parseFloat(formData.dropLat);
  const dropLngNum = parseFloat(formData.dropLng);

  const hasPickup = !isNaN(pickupLatNum) && !isNaN(pickupLngNum);
  const hasDrop = !isNaN(dropLatNum) && !isNaN(dropLngNum);

  const mapUrl = hasPickup && hasDrop && apiKey
    ? `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${pickupLatNum},${pickupLngNum}&destination=${dropLatNum},${dropLngNum}&mode=driving`
    : hasPickup
      ? `https://www.google.com/maps?q=${pickupLatNum},${pickupLngNum}&z=15&output=embed`
      : currentLocation
        ? `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}&z=15&output=embed`
        : "https://www.google.com/maps?q=26.9124,75.7873&z=12&output=embed";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Book Your Kadi Ride</h2>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400 font-medium">Fast, eco-friendly e-bikes at your doorstep.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
            {error && (
              <div className="m-6 p-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-2xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center font-bold text-sm">1</div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Your Info</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</Label>
                      <Input id="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" className="bg-gray-50 dark:bg-gray-800 border-transparent rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</Label>
                      <Input id="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" className="bg-gray-50 dark:bg-gray-800 border-transparent rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="9876543210" className="bg-gray-50 dark:bg-gray-800 border-transparent rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email (Optional)</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="bg-gray-50 dark:bg-gray-800 border-transparent rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Create Password</Label>
                    <Input id="password" type="password" value={formData.password} onChange={handleChange} required placeholder="minimum 6 chars" className="bg-gray-50 dark:bg-gray-800 border-transparent rounded-xl" />
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="w-full mt-4 py-4 bg-brand-500 text-white font-black text-lg rounded-2xl shadow-lg shadow-brand-500/30 hover:bg-brand-600 hover:-translate-y-0.5 transition-all">Next Step →</button>
                </div>
              )}

              {step === 2 && (
                <div className="p-6 space-y-6">
                   <div className="space-y-4">
                      {/* Pick up */}
                      <div className="relative">
                        <div className="absolute left-4 top-4 w-2.5 h-2.5 bg-gray-900 dark:bg-white rounded-full z-10 animate-pulse"></div>
                        <div className="absolute left-[1.15rem] top-8 w-0.5 h-8 bg-gray-200 dark:bg-gray-700 z-10"></div>
                        <Autocomplete
                          key={`pickup-${formData.pickupLoc}`}
                          apiKey={apiKey}
                          onPlaceSelected={handlePickupSelected}
                          defaultValue={formData.pickupLoc}
                          options={{ types: ["geocode", "establishment"], componentRestrictions: { country: "in" } }}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                          placeholder="Current Location"
                        />
                      </div>
                      
                      {/* Drop */}
                      <div className="relative">
                        <div className="absolute left-4 top-4 w-2.5 h-2.5 bg-brand-500 rounded-sm z-10 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                        <Autocomplete
                          apiKey={apiKey}
                          onPlaceSelected={handleDropSelected}
                          defaultValue={formData.dropLoc}
                          options={{ types: ["geocode", "establishment"], componentRestrictions: { country: "in" } }}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                          placeholder="Where to?"
                        />
                      </div>
                   </div>

                   <button
                      type="button"
                      onClick={useCurrentLocationAsPickup}
                      disabled={!currentLocation}
                      className="inline-flex flex-row items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Use my current location as pickup
                    </button>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment</Label>
                          <select
                            id="paymentMode"
                            value={formData.paymentMode}
                            onChange={handleChange as any}
                            className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-800 dark:text-gray-200 focus:border-brand-500 outline-none"
                          >
                            <option value="Cash">💵 Cash</option>
                            <option value="UPI">📱 UPI</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Save Address</Label>
                          <select 
                            value={saveAs || ""}
                            onChange={(e) => setSaveAs(e.target.value as "home" | "work" | null || null)}
                            className="w-full h-11 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-800 dark:text-gray-200 focus:border-brand-500 outline-none"
                          >
                             <option value="">Don&apos;t save</option>
                             <option value="home">🏠 Save as Home</option>
                             <option value="work">💼 Save as Work</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {estimate && (
                      <div className="mt-2 flex items-center justify-between p-4 bg-gray-900 dark:bg-black rounded-2xl shadow-inner text-white">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Fare Estimate</p>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-3xl font-black">₹{estimate.fare}</span>
                            <span className="text-xs font-semibold text-gray-400 line-through">₹{Math.round(estimate.fare * 1.2)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{estimate.distance} KM</p>
                          <p className="text-xs text-gray-400 font-medium">~{estimate.timeMin} mins away</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                       {!activeUser && (
                          <button type="button" onClick={() => setStep(1)} className="px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Back</button>
                       )}
                       <button 
                         type="submit" 
                         disabled={loading || !formData.pickupLoc || !formData.dropLoc} 
                         className="flex-1 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-brand-500/30 transition-all disabled:opacity-40 disabled:hover:translate-y-0 hover:-translate-y-0.5 flex justify-center items-center gap-2"
                        >
                          {loading ? (
                             <span className="animate-pulse">Booking...</span>
                          ) : (
                             <>Confirm Ride <span className="text-xl">🚀</span></>
                          )}
                        </button>
                    </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Map Panel */}
        <div className="lg:col-span-7 h-[500px] lg:h-[700px] w-full bg-gray-100 dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl relative mt-8 lg:mt-0 z-0">
           {step === 2 ? (
             <div className="absolute inset-0 w-full h-full">
                <BookingMap 
                  pickupLat={pickupLatNum} 
                  pickupLng={pickupLngNum} 
                  dropLat={dropLatNum} 
                  dropLng={dropLngNum} 
                />
             </div>
           ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8 text-center bg-gray-50 dark:bg-gray-900">
                <svg className="w-16 h-16 mb-4 opacity-50 block mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                <p className="font-semibold text-lg">Enter your details to view map</p>
                <p className="text-xs max-w-xs mx-auto mt-2">The map will update magically once you choose your pickup and drop locations in the next step.</p>
             </div>
           )}
           {/* Gradient overlay for aesthetic map borders */}
           <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-inset ring-black/10 dark:ring-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]"></div>
        </div>
      </div>
    </div>
  );
}
