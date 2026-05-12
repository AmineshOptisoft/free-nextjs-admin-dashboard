import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company sign in | Tepay",
};

export default function CompanySignInPage() {
  return <SignInForm role="company" />;
}
