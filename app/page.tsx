// app/page.tsx
// Root page — redirect to /auth
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/auth");
}
