import PublicPayPage from "@/components/pay/PublicPayPage";

type PageProps = {
  params: Promise<{ companyKey: string }> | { companyKey: string };
};

export default async function PayByCompanyKeyPage({ params }: PageProps) {
  const { companyKey } = await Promise.resolve(params);
  return <PublicPayPage companyKey={companyKey} />;
}
