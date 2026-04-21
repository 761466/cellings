import Link from "next/link";
import { ArrowRight, BarChart3, Box, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 10%, rgba(59,130,246,.25), transparent 40%), radial-gradient(circle at 80% 20%, rgba(99,102,241,.2), transparent 35%), radial-gradient(circle at 60% 90%, rgba(236,72,153,.15), transparent 40%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[520px] max-w-6xl flex-col items-start justify-center px-6 py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-widest text-slate-300">
            CELLINGS · 3D BODY SCAN CUSTOM PLATFORM
          </span>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            전국 대리점과 본사가 <br className="hidden sm:block" /> 하나의 운영 체계로 움직입니다.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-300">
            고객의 신체 측정 데이터를 기반으로 베개·신발·의류·보정속옷 맞춤 제작까지 —
            전사 카탈로그, 주문, 통계, 고객 이력을 한 자리에서 다루는 통합 플랫폼.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              중앙관리 로그인 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/franchise/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10"
            >
              대리점 로그인
            </Link>
          </div>
        </div>
      </section>

      {/* 가치 제안 */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Feature
            icon={<Box className="h-5 w-5" />}
            title="수천 SKU, 한 번의 등록"
            desc="기성·커스텀·복합 유형과 블록 기반 상세 페이지로 모든 대리점에 즉시 반영됩니다."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="개인정보 · 측정 데이터 보호"
            desc="대리점별 격리(RLS), 3년 보관 정책, 소프트삭제로 사후 관리까지 안전하게."
          />
          <Feature
            icon={<BarChart3 className="h-5 w-5" />}
            title="실시간 매출 인사이트"
            desc="본사는 전 대리점을, 대리점은 자기 매장을 기간·카테고리별로 한눈에 확인."
          />
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link
            href="/terms"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            이용약관
          </Link>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <span>
            © {new Date().getFullYear()} Cellings · 3D Body Scan Custom Platform
          </span>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-primary-foreground">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
