"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLoginAction } from "@/lib/actions";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="w-full max-w-md space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await adminLoginAction(email, password);
          if (!result.ok) {
            toast.error(result.error || "Login failed");
            return;
          }
          toast.success("Welcome back");
          const next = params.get("next");
          const safeNext =
            next && next.startsWith("/admin") && !next.startsWith("//")
              ? next
              : "/admin";
          router.push(safeNext);
          router.refresh();
        });
      }}
    >
      <div>
        <h1 className="text-2xl font-black">Admin login</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Sign in with your Lunch Run admin email and password.
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu"
          required
          autoComplete="username"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-lr-black px-4">
      <div className="mb-8">
        <Logo light size="lg" />
        <p className="mt-2 text-center text-sm text-lr-yellow">
          Snacks delivered. You relax.
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
