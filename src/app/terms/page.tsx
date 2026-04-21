import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관",
  description:
    "셀링스(Cellings) 3D 바디스캔 맞춤 쇼핑몰 서비스 이용약관. 주식회사 현대앤노바. 시행 2026년 5월 1일.",
  openGraph: {
    title: "이용약관 · Cellings",
    description:
      "3D 바디스캔 맞춤 쇼핑몰 셀링스 서비스 이용에 관한 약관입니다.",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10 pb-20">
        <p className="text-xs text-muted-foreground">
          <Link
            href="/"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ← 홈으로
          </Link>
        </p>

        <header className="mt-6 border-b border-border pb-8">
          <p className="text-sm font-medium text-muted-foreground">
            셀링스 (Cellings)
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            3D 바디스캔 맞춤 쇼핑몰 서비스 이용약관
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            시행일: 2026년 5월 1일
            <br />
            주식회사 현대앤노바
          </p>
        </header>

        <article className="mt-10 space-y-10 text-sm leading-relaxed text-foreground">
          <section className="space-y-3" aria-labelledby="article-1">
            <h2 id="article-1" className="text-base font-semibold">
              제 1 조 (목적)
            </h2>
            <p>
              이 약관은 주식회사 현대앤노바(이하 &quot;회사&quot;)가 운영하는
              셀링스(Cellings) 서비스(이하 &quot;서비스&quot;)를 이용함에 있어
              회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로
              합니다.
            </p>
            <p>
              본 서비스는 3D 바디스캔 장비를 통해 고객의 신체를 측정하고,
              측정 데이터를 기반으로 맞춤 제작 상품(베개, 신발, 의류, 보정속옷
              등) 또는 기성품을 추천·판매하는 플랫폼입니다.
            </p>
          </section>

          <section className="space-y-3" aria-labelledby="article-2">
            <h2 id="article-2" className="text-base font-semibold">
              제 2 조 (정의)
            </h2>
            <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                &quot;서비스&quot;란 회사가 운영하는 3D 바디스캔 기반 맞춤
                쇼핑몰 플랫폼(cellings.kr) 및 이와 관련된 제반 서비스를
                의미합니다.
              </li>
              <li>
                &quot;대리점&quot;이란 회사와 계약을 체결하고 서비스를 운영하는
                가맹점을 의미합니다.
              </li>
              <li>
                &quot;고객&quot;이란 대리점을 방문하여 3D 바디스캔을 받고 상품을
                구매하는 자를 의미합니다.
              </li>
              <li>
                &quot;3D 바디스캔&quot;이란 3D 스캐너 장비를 이용하여 고객의
                전신 신체 치수를 360도로 측정하는 행위를 의미합니다.
              </li>
              <li>
                &quot;신체 측정 데이터&quot;란 3D 바디스캔을 통해 수집된 신장,
                체중, 둘레, 길이 등 신체 관련 수치 데이터를 의미합니다.
              </li>
              <li>
                &quot;맞춤 제작 상품&quot;이란 고객의 신체 측정 데이터를 기반으로
                개인 맞춤 제작되는 상품을 의미합니다.
              </li>
              <li>
                &quot;기성품 추천&quot;이란 고객의 신체 측정 데이터를 분석하여
                기존 규격 상품 중 최적의 제품을 추천하는 서비스를 의미합니다.
              </li>
            </ul>
          </section>

          <section className="space-y-3" aria-labelledby="article-3">
            <h2 id="article-3" className="text-base font-semibold">
              제 3 조 (약관의 게시와 개정)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 이 약관의 내용을 고객이 쉽게 알 수 있도록 서비스
                웹사이트(cellings.kr) 및 각 대리점 내 게시물을 통하여
                공시합니다.
              </li>
              <li>
                회사는 필요한 경우 관련 법령을 위반하지 않는 범위에서 이 약관을
                개정할 수 있습니다.
              </li>
              <li>
                약관을 개정할 경우 적용 일자 및 개정 사유를 명시하여 적용 일자
                7일 전부터 서비스 웹사이트에 공지합니다. 다만, 고객에게 불리한
                약관 개정의 경우 30일 전부터 공지합니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3" aria-labelledby="article-4">
            <h2 id="article-4" className="text-base font-semibold">
              제 4 조 (서비스 이용 계약)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                서비스 이용 계약은 고객이 대리점을 방문하여 3D 바디스캔 및
                개인정보 수집·이용 동의서에 서명(또는 동의)함으로써 성립됩니다.
              </li>
              <li>
                만 14세 미만의 고객은 법정대리인의 동의를 받아야 서비스를 이용할
                수 있습니다.
              </li>
              <li>
                회사는 다음 각 호에 해당하는 경우 서비스 제공을 거부하거나
                중단할 수 있습니다.
              </li>
            </ol>
            <ul className="list-disc space-y-2 pl-5">
              <li>허위 정보를 제공한 경우</li>
              <li>서비스 이용 목적이 법령 또는 공서양속에 반하는 경우</li>
              <li>기타 회사가 정한 이용 조건을 충족하지 못하는 경우</li>
            </ul>
          </section>

          <section className="space-y-3" aria-labelledby="article-5">
            <h2 id="article-5" className="text-base font-semibold">
              제 5 조 (개인정보 및 신체 측정 데이터의 보호)
            </h2>
            <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <strong className="text-foreground">핵심 원칙</strong>
              <br />
              신체 측정 데이터는 민감한 개인정보입니다. 회사는 수집 목적 외의
              용도로 절대 사용하지 않으며, 고객의 동의 없이 제3자에게 제공하지
              않습니다.
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 관련 법령(개인정보 보호법 등)에 따라 고객의 개인정보 및
                신체 측정 데이터를 보호합니다.
              </li>
              <li>수집하는 정보의 항목은 다음과 같습니다.</li>
            </ol>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                기본 정보: 성명, 연락처, 성별, 출생연도
              </li>
              <li>
                신체 측정 데이터: 신장, 체중, 각 부위 둘레·길이 등 3D 스캔
                측정값 (단위: mm)
              </li>
              <li>주문 정보: 상품명, 주문 금액, 주문일, 특이사항</li>
            </ul>
            <ol className="list-decimal space-y-2 pl-5" start={3}>
              <li>
                수집 목적: 맞춤 상품 제작, 기성품 추천, 재방문 시 이전 측정값
                활용, 주문 이력 관리
              </li>
              <li>
                보관 기간: 신체 측정 데이터는 최종 스캔일로부터 3년간 보관 후
                파기합니다.
              </li>
              <li>
                고객은 언제든지 자신의 개인정보 및 측정 데이터의 열람, 수정,
                삭제를 요청할 수 있습니다.
              </li>
              <li>
                고객 정보는 해당 대리점에 귀속되며, 회사는 통계 목적의 집계
                데이터만 활용합니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3" aria-labelledby="article-6">
            <h2 id="article-6" className="text-base font-semibold">
              제 6 조 (3D 바디스캔 서비스)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                3D 바디스캔은 고객이 스캐너 부스 내에 서 있는 상태에서 전신을
                360도로 촬영·측정하는 방식으로 진행됩니다.
              </li>
              <li>
                스캔 시 측정되는 항목은 신장, 체형 치수(둘레·길이), 자세 평가,
                척추 평가, 발 측정 데이터 등이 포함될 수 있습니다.
              </li>
              <li>
                측정값은 신체 상태에 따라 변화할 수 있으므로, 정확한 맞춤
                서비스를 위해 재방문 시 재스캔을 권장합니다.
              </li>
              <li>
                스캔 결과는 상품 추천 및 맞춤 제작에만 활용되며, 의료적 진단의
                목적으로 사용되지 않습니다.
              </li>
              <li>
                스캐너 장비의 측정 정확도는 장비 사양에 따르며, 회사는 측정값의
                절대적 정확성을 보증하지 않습니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3" aria-labelledby="article-7">
            <h2 id="article-7" className="text-base font-semibold">
              제 7 조 (상품 및 주문)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                상품은 중앙 관리 시스템을 통해 등록·관리되며, 전국 대리점에서
                동일하게 제공됩니다.
              </li>
              <li>상품의 종류는 다음과 같이 구분됩니다.</li>
            </ol>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                맞춤 제작 상품: 고객의 신체 측정 데이터를 기반으로 개인 맞춤
                제작. 제작 리드타임(소요 기간)이 발생합니다.
              </li>
              <li>
                기성품 추천: 신체 측정 데이터를 기반으로 최적의 규격 상품을
                추천합니다.
              </li>
              <li>
                복합 상품: 기성품 추천과 맞춤 제작을 모두 선택할 수 있는
                상품입니다.
              </li>
            </ul>
            <ol className="list-decimal space-y-2 pl-5" start={3}>
              <li>
                맞춤 제작 상품의 가격은 고객의 체형, 소재 선택 등에 따라 제시된
                가격 범위 내에서 결정됩니다.
              </li>
              <li>기성품의 가격은 사전에 확정된 금액으로 표시됩니다.</li>
              <li>
                주문은 대리점에서 직접 접수하며, 주문 확정 시 주문서가
                발행됩니다.
              </li>
              <li>
                결제는 각 대리점에서 현장 결제(현금, 카드 등)로 진행됩니다.
                별도의 온라인 결제 시스템은 운영하지 않습니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3" aria-labelledby="article-8">
            <h2 id="article-8" className="text-base font-semibold">
              제 8 조 (맞춤 제작 상품의 취소 및 환불)
            </h2>
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
              ⚠ 맞춤 제작 상품은 고객의 신체 치수에 맞게 개별 제작되므로, 제작
              착수 후에는 단순 변심에 의한 취소 및 환불이 제한될 수 있습니다.
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                주문 취소는 제작 착수 전까지 가능합니다. 대리점에 연락하여
                취소를 요청하십시오.
              </li>
              <li>제작 착수 후에는 다음의 경우에만 취소·환불이 가능합니다.</li>
            </ol>
            <ul className="list-disc space-y-2 pl-5">
              <li>상품의 하자 또는 품질 불량이 확인된 경우</li>
              <li>회사의 귀책 사유로 제작 오류가 발생한 경우</li>
              <li>주문서상 측정값과 현저히 다르게 제작된 경우</li>
            </ul>
            <ol className="list-decimal space-y-2 pl-5" start={3}>
              <li>
                기성품은 수령일로부터 7일 이내에 미사용·미개봉 상태에서 교환
                또는 환불이 가능합니다.
              </li>
              <li>환불 시 결제 수단과 동일한 방법으로 환불합니다.</li>
            </ol>
          </section>

          <section className="space-y-3" aria-labelledby="article-9">
            <h2 id="article-9" className="text-base font-semibold">
              제 9 조 (대리점의 의무)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                대리점은 고객의 개인정보 및 신체 측정 데이터를 안전하게
                관리하여야 합니다.
              </li>
              <li>
                대리점은 스캔 전 고객에게 개인정보 수집·이용 동의를 반드시
                받아야 합니다.
              </li>
              <li>
                대리점은 고객의 측정 데이터를 서비스 목적 외의 용도로 사용하여서는
                안 됩니다.
              </li>
              <li>
                대리점은 중앙 관리 시스템에서 제공하는 상품 정보를 정확하게
                고객에게 안내하여야 합니다.
              </li>
              <li>대리점은 회사가 정한 운영 정책 및 지침을 준수하여야 합니다.</li>
            </ol>
          </section>

          <section className="space-y-3" aria-labelledby="article-10">
            <h2 id="article-10" className="text-base font-semibold">
              제 10 조 (고객의 의무)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                고객은 정확한 정보를 제공하여야 하며, 허위 정보 제공으로 인한
                불이익은 고객이 부담합니다.
              </li>
              <li>
                고객은 3D 스캐너 장비 사용 시 안전 수칙을 준수하여야 합니다.
              </li>
              <li>
                고객은 타인의 개인정보 및 측정 데이터를 무단으로 열람하거나
                사용하여서는 안 됩니다.
              </li>
              <li>
                고객은 서비스를 이용하면서 알게 된 상품 정보, 기술 정보 등을
                무단으로 제3자에게 유출하여서는 안 됩니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3" aria-labelledby="article-11">
            <h2 id="article-11" className="text-base font-semibold">
              제 11 조 (회사의 의무)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 관련 법령과 이 약관을 준수하며 안정적인 서비스를 제공하기
                위해 최선을 다합니다.
              </li>
              <li>
                회사는 고객의 개인정보 및 신체 측정 데이터를 안전하게 보호하기
                위한 보안 시스템을 운영합니다.
              </li>
              <li>
                회사는 상품의 품질 기준을 유지하고 대리점을 관리·감독합니다.
              </li>
              <li>
                회사는 고객의 불만 또는 피해 구제 요청을 접수하고 신속하게
                처리합니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3" aria-labelledby="article-12">
            <h2 id="article-12" className="text-base font-semibold">
              제 12 조 (서비스의 변경 및 중단)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 운영상·기술상 필요에 따라 서비스의 내용을 변경할 수
                있습니다.
              </li>
              <li>
                회사는 시스템 점검, 설비 교체, 네트워크 장애, 천재지변 등
                부득이한 사유로 서비스를 일시 중단할 수 있습니다.
              </li>
              <li>
                대리점 폐점 또는 운영 중단의 경우, 회사는 대리점을 통해 사전에
                고객에게 안내합니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3" aria-labelledby="article-13">
            <h2 id="article-13" className="text-base font-semibold">
              제 13 조 (책임 제한)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                회사는 천재지변, 불가항력적 사유로 인한 서비스 장애에 대해서는
                책임을 지지 않습니다.
              </li>
              <li>
                3D 스캐너 측정 데이터는 참고용이며, 의료적 진단이나 건강 판정의
                근거로 사용할 수 없습니다.
              </li>
              <li>
                고객이 제공한 허위 정보로 인해 발생하는 제작 오류 및 불이익에
                대해 회사는 책임을 지지 않습니다.
              </li>
              <li>
                대리점의 귀책 사유로 발생한 문제에 대해서는 해당 대리점이 1차
                책임을 집니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3" aria-labelledby="article-14">
            <h2 id="article-14" className="text-base font-semibold">
              제 14 조 (분쟁 해결)
            </h2>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                서비스 이용과 관련한 분쟁은 당사자 간 협의를 통해 해결함을
                원칙으로 합니다.
              </li>
              <li>
                협의가 이루어지지 않는 경우, 소비자기본법 등 관련 법령에 따라
                분쟁을 해결합니다.
              </li>
              <li>
                이 약관은 대한민국 법률을 준거법으로 하며, 분쟁 발생 시
                민사소송법상의 관할 법원에 제소합니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3" aria-labelledby="article-15">
            <h2 id="article-15" className="text-base font-semibold">
              제 15 조 (개인정보처리방침)
            </h2>
            <p>
              개인정보의 수집·이용·보관·파기 등에 관한 세부 사항은 별도의
              개인정보처리방침에 따릅니다. 개인정보처리방침은 서비스
              웹사이트(cellings.kr)에서 확인할 수 있습니다.
            </p>
          </section>

          <section className="space-y-4 border-t border-border pt-10">
            <h2 className="text-base font-semibold">부칙</h2>
            <p>본 이용약관은 2026년 5월 1일부터 시행합니다.</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[280px] text-left text-sm">
                <tbody className="divide-y divide-border">
                  <tr>
                    <th className="w-28 whitespace-nowrap bg-muted/50 px-4 py-3 font-medium">
                      회사명
                    </th>
                    <td className="px-4 py-3">주식회사 현대앤노바</td>
                  </tr>
                  <tr>
                    <th className="whitespace-nowrap bg-muted/50 px-4 py-3 font-medium">
                      서비스명
                    </th>
                    <td className="px-4 py-3">셀링스 (Cellings)</td>
                  </tr>
                  <tr>
                    <th className="whitespace-nowrap bg-muted/50 px-4 py-3 font-medium">
                      서비스 URL
                    </th>
                    <td className="px-4 py-3">
                      <a
                        href="https://cellings.kr"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        https://cellings.kr
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th className="whitespace-nowrap bg-muted/50 px-4 py-3 font-medium">
                      고객 문의
                    </th>
                    <td className="px-4 py-3">대리점 또는 회사 고객센터</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
