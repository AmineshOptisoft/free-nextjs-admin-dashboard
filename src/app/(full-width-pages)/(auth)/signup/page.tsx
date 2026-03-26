import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js SignUp Page | Kandi - E-bike Delivery Admin Panel",
  description: "This is Next.js SignUp Page for Kandi Admin Dashboard Template",
};

export default function SignUp() {
  return <SignUpForm />;
}
