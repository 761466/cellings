export default function AdminProductEditPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">상품 수정</h1>
      <p className="mt-2 text-zinc-600">ID: {params.id}</p>
    </div>
  );
}
