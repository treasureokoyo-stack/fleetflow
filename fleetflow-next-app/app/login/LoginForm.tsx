"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { authenticateUser } from "@/lib/actions";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await authenticateUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
    // If no error, the server action will have redirected.
  }

  return (
    <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
      {/* Email */}
      <div className="flex flex-col gap-xs">
        <label
          htmlFor="email"
          className="font-label-md text-label-md text-on-surface-variant pl-1"
        >
          Email Address
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-outline">
            <Icon name="mail" className="text-[20px]" />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@company.com"
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-outline-variant rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-secondary focus:ring-2 focus:ring-secondary/30 outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-xs">
        <label
          htmlFor="password"
          className="font-label-md text-label-md text-on-surface-variant pl-1"
        >
          Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-outline">
            <Icon name="lock" className="text-[20px]" />
          </span>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-outline-variant rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-secondary focus:ring-2 focus:ring-secondary/30 outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Forgot password */}
      <div className="flex justify-end items-center">
        <span className="font-label-sm text-label-sm text-secondary hover:text-on-secondary-fixed-variant transition-colors cursor-default opacity-60">
          Forgot Password?
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error/10 text-error font-body-sm text-body-sm px-md py-sm rounded-lg flex items-center gap-xs">
          <Icon name="error" className="text-[18px]" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-container text-on-primary py-4 rounded-xl font-label-md text-label-md flex items-center justify-center gap-sm hover:opacity-90 transition-opacity mt-sm shadow-natural hover:shadow-natural-hover active:translate-y-[1px] disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign In"}
        <Icon name="arrow_forward" className="text-[18px]" />
      </button>
    </form>
  );
}
