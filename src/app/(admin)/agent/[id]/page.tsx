import AgentDetail from "@/components/agent/AgentDetail";

export const metadata = { title: "Vendor Details" };

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  return <AgentDetail id={params.id} />;
}
