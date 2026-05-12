import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin sign in | Tepay",
};

export default function AdminSignInPage() {
  return <SignInForm role="admin" />;
}
