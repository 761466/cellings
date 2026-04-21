"use client";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "NotoSansKR",
  fonts: [
    {
      src: "https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Regular.otf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Bold.otf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "NotoSansKR",
    fontSize: 10,
    color: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1 solid #0f172a",
    paddingBottom: 14,
    marginBottom: 18,
  },
  title: { fontSize: 20, fontWeight: "bold", letterSpacing: -0.3 },
  subtitle: { fontSize: 10, color: "#64748b", marginTop: 4 },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#64748b", width: 90 },
  value: { flex: 1, color: "#0f172a" },
  table: {
    marginTop: 6,
    border: "1 solid #e2e8f0",
    borderRadius: 4,
  },
  tr: { flexDirection: "row", borderBottom: "1 solid #e2e8f0" },
  th: {
    backgroundColor: "#f1f5f9",
    padding: 6,
    fontWeight: "bold",
    fontSize: 9,
  },
  td: { padding: 6, fontSize: 9 },
  total: {
    marginTop: 14,
    alignItems: "flex-end",
  },
  totalLine: {
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
  },
});

export type OrderPdfProps = {
  order: {
    id: string;
    price: number;
    quantity: number;
    status: string;
    product_type_selected: string;
    ordered_at: string;
    memo?: string | null;
  };
  franchise: { name: string; code: string; phone: string; address: string };
  customer: { name: string; phone: string | null; email?: string | null };
  product: { name: string; category: string };
  measurements: { key: string; label: string; value: string }[];
};

export function OrderPdf({
  order,
  franchise,
  customer,
  product,
  measurements,
}: OrderPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>주문 제작 의뢰서</Text>
            <Text style={styles.subtitle}>
              Cellings · 3D Body Scan Custom Order
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9 }}>
              주문번호 {order.id.slice(0, 8).toUpperCase()}
            </Text>
            <Text style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>
              {order.ordered_at}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 24 }}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>대리점</Text>
            <View style={styles.row}>
              <Text style={styles.label}>대리점</Text>
              <Text style={styles.value}>
                {franchise.name} ({franchise.code})
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>연락처</Text>
              <Text style={styles.value}>{franchise.phone}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>주소</Text>
              <Text style={styles.value}>{franchise.address}</Text>
            </View>
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>고객</Text>
            <View style={styles.row}>
              <Text style={styles.label}>이름</Text>
              <Text style={styles.value}>{customer.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>연락처·이메일</Text>
              <Text style={styles.value}>
                {customer.phone ?? customer.email ?? "-"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>상품</Text>
          <View style={styles.table}>
            <View style={styles.tr}>
              <View style={[styles.th, { flex: 3 }]}>
                <Text>상품명</Text>
              </View>
              <View style={[styles.th, { flex: 1 }]}>
                <Text>카테고리</Text>
              </View>
              <View style={[styles.th, { flex: 1 }]}>
                <Text>유형</Text>
              </View>
              <View style={[styles.th, { flex: 1, textAlign: "right" }]}>
                <Text>수량</Text>
              </View>
              <View style={[styles.th, { flex: 1.2, textAlign: "right" }]}>
                <Text>금액</Text>
              </View>
            </View>
            <View style={styles.tr}>
              <View style={[styles.td, { flex: 3 }]}>
                <Text>{product.name}</Text>
              </View>
              <View style={[styles.td, { flex: 1 }]}>
                <Text>{product.category}</Text>
              </View>
              <View style={[styles.td, { flex: 1 }]}>
                <Text>{order.product_type_selected}</Text>
              </View>
              <View style={[styles.td, { flex: 1, textAlign: "right" }]}>
                <Text>{order.quantity}</Text>
              </View>
              <View style={[styles.td, { flex: 1.2, textAlign: "right" }]}>
                <Text>{order.price.toLocaleString("ko-KR")}원</Text>
              </View>
            </View>
          </View>
          <View style={styles.total}>
            <Text style={{ fontSize: 9, color: "#64748b" }}>합계</Text>
            <Text style={styles.totalLine}>
              {(order.price * order.quantity).toLocaleString("ko-KR")}원
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>측정값</Text>
          <View style={styles.table}>
            <View style={styles.tr}>
              <View style={[styles.th, { flex: 2 }]}>
                <Text>항목</Text>
              </View>
              <View style={[styles.th, { flex: 1, textAlign: "right" }]}>
                <Text>값</Text>
              </View>
            </View>
            {measurements.map((m) => (
              <View key={m.key} style={styles.tr}>
                <View style={[styles.td, { flex: 2 }]}>
                  <Text>{m.label}</Text>
                </View>
                <View style={[styles.td, { flex: 1, textAlign: "right" }]}>
                  <Text>{m.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {order.memo ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>메모</Text>
            <Text style={{ lineHeight: 1.5 }}>{order.memo}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          Cellings · 본 의뢰서는 제작 지침 전달 용도로 발행되었습니다.
        </Text>
      </Page>
    </Document>
  );
}
