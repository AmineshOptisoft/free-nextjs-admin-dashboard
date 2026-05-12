import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent sign in | Tepay",
};

export default function AgentSignInPage() {
  return <SignInForm role="agent" />;
}
