import type { Metadata } from "next";

import { ExcelTestPage } from "@/features/excel-test/pages/excel-test-page";

export const metadata: Metadata = {
  title: "Excel Assignment Test",
};

export default function Page() {
  return <ExcelTestPage />;
}
