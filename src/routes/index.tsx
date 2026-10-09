import { createFileRoute } from "@tanstack/react-router";
import { ReceiptPrinter } from "@/components/receipt-printer";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Receipt Studio — A moment. On paper." },
    { name: "description", content: "A tactile virtual receipt studio. Print, tear, and enjoy the little moments with The Roast & Bean." },
    { property: "og:title", content: "Receipt Studio — A moment. On paper." },
    { property: "og:description", content: "A premium interactive thermal receipt printer with tactile paper and sound." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

function Index() {
  return <ReceiptPrinter />;
}
