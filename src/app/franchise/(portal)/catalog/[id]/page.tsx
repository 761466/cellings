export default function FranchiseCatalogDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">상품 브로셔</h1>
      <p className="mt-2 text-slate-600">ID: {params.id}</p>
    </div>
  );
}
