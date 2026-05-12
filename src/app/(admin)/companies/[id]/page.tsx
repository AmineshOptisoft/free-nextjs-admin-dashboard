import CompanyDetail from "@/components/companies/CompanyDetail";

export const metadata = { title: "Company Details" };

type PageProps = { params: Promise<{ id: string }> };

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CompanyDetail id={id} />;
}
