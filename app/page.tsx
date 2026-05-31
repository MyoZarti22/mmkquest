// app/page.tsx
// Root page — redirects to auth (login/register)
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/auth");
}
