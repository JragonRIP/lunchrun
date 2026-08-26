import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo/store";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "lr_admin_demo";

export async function requireAdmin(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (isDemoMode()) {
    const jar = await cookies();
    if (jar.get(ADMIN_COOKIE)?.value === "1") return { ok: true };
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Unauthorized" };

    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!admin) return { ok: false, error: "Not an admin account" };
    return { ok: true };
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
}

export { ADMIN_COOKIE };
