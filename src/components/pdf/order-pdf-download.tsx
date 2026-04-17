"use client";

import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { OrderPdf, type OrderPdfProps } from "./order-pdf";
import { Button } from "@/components/ui/button";

export function OrderPdfDownload(props: OrderPdfProps) {
  return (
    <PDFDownloadLink
      document={<OrderPdf {...props} />}
      fileName={`order-${props.order.id.slice(0, 8)}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" loading={loading} type="button">
          <Download className="h-4 w-4" /> PDF 다운로드
        </Button>
      )}
    </PDFDownloadLink>
  );
}
