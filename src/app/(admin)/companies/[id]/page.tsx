import CompanyDetail from "@/components/companies/CompanyDetail";

export const metadata = { title: "Company Details" };

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  return <CompanyDetail id={params.id} />;
}
