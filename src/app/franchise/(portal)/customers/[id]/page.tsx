export default function FranchiseCustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">고객 상세</h1>
      <p className="mt-2 text-slate-600">ID: {params.id}</p>
    </div>
  );
}
