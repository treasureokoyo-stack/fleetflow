"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { registerUser } from "@/lib/actions";

export function RegisterForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form className="space-y-gutter" onSubmit={handleSubmit}>
      {/* Full Name */}
      <div>
        <label
          htmlFor="first_name"
          className="block font-label-md text-label-md text-on-surface mb-xs"
        >
          Full Name
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-sm flex items-center text-outline pointer-events-none">
            <Icon name="person" className="text-[20px]" />
          </span>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            placeholder="John Doe"
            className="w-full pl-10 pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-shadow"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="reg_email"
          className="block font-label-md text-label-md text-on-surface mb-xs"
        >
          Email Address
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-sm flex items-center text-outline pointer-events-none">
            <Icon name="mail" className="text-[20px]" />
          </span>
          <input
            id="reg_email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="john@example.com"
            className="w-full pl-10 pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-shadow"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block font-label-md text-label-md text-on-surface mb-xs"
        >
          Phone Number
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-sm flex items-center text-outline pointer-events-none">
            <Icon name="call" className="text-[20px]" />
          </span>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+1 (555) 000-0000"
            className="w-full pl-10 pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-shadow"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="reg_password"
          className="block font-label-md text-label-md text-on-surface mb-xs"
        >
          Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-sm flex items-center text-outline pointer-events-none">
            <Icon name="lock" className="text-[20px]" />
          </span>
          <input
            id="reg_password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-shadow"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-sm flex items-center text-outline hover:text-on-surface transition-colors"
          >
            <Icon
              name={showPassword ? "visibility" : "visibility_off"}
              className="text-[20px]"
            />
          </button>
        </div>
      </div>

      {/* Hidden confirm (auto-set server-side — but schema needs it) */}
      {/* We use a hidden field that mirrors password via JS for simplicity */}
      <input type="hidden" name="confirmPassword" id="confirmPassword" />

      {/* Terms */}
      <div className="flex items-start gap-sm">
        <div className="flex items-center h-5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest"
          />
        </div>
        <label
          htmlFor="terms"
          className="font-body-sm text-body-sm text-on-surface-variant"
        >
          I agree to the{" "}
          <span className="text-primary hover:text-secondary underline transition-colors">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-primary hover:text-secondary underline transition-colors">
            Privacy Policy
          </span>
          .
        </label>
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
        className="w-full py-sm px-md bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-surface-tint hover:shadow-natural transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Sign Up"}
        <Icon name="arrow_forward" className="text-[18px]" />
      </button>
    </form>
  );
}
