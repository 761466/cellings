import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gradient-to-b from-zinc-50 to-zinc-100 px-6">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
          Cellings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
          3D 바디스캔 맞춤 쇼핑몰
        </h1>
        <p className="mt-3 max-w-md text-zinc-600">
          중앙관리와 대리점 포털을 선택하세요.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/admin/login"
          className="rounded-xl border border-zinc-300 bg-white px-8 py-3 text-center text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
        >
          중앙관리 로그인
        </Link>
        <Link
          href="/franchise/login"
          className="rounded-xl bg-zinc-900 px-8 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
        >
          대리점 로그인
        </Link>
      </div>
    </div>
  );
}
