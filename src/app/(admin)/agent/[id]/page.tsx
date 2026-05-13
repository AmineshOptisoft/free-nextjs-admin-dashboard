import AgentDetail from "@/components/agent/AgentDetail";

export const metadata = { title: "Vendor Details" };

type PageProps = { params: Promise<{ id: string }> };

export default async function AgentDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AgentDetail id={id} />;
}
