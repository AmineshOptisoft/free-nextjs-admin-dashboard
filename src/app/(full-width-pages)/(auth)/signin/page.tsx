import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | Kandi - E-bike Delivery Admin Panel",
  description: "This is Next.js SignIn Page for Kandi Admin Dashboard Template",
};

export default function SignIn() {
  return <SignInForm />;
}
