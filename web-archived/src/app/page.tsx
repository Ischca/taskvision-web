export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function Home() {
  // ルートページを/jaにリダイレクト
  redirect("/ja");
}
