import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | Kandi - E-bike Delivery Admin Panel",
  description: "Admin login for Kandi delivery management dashboard.",
};

export default function AdminLoginPage() {
  return <SignInForm />;
}
