import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, roleHome } from "@/lib/auth";
import { Icon } from "@/components/ui/Icon";
import { RegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect(roleHome(session.user.role));

  return (
    <main className="w-full max-w-[1440px] min-h-screen flex flex-col md:flex-row">
      {/* Left: Brand image */}
      <div className="hidden md:flex flex-1 relative bg-surface-container overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfDIAWrx1kow4QrOTVbu9UGoUVOExWboKAsvTvEuWsaOW9YUs7L3xfF7YTzZMhAmOFrTRL1NXPDGZOXAvzYz_Pzfn8z1foMvwFoLwKGysXNk2HNqWwpRylDlqJ82ZkS2goQ4WiZ0Z8mXeycNxualEQhFzrhtYJtvUFux69JtDWVuWQdm4pu2KbGQwpWgdIib1K0kUJRH_pdAsRkrkDIrrsEigk19MJqfWGrp1AFb7hk27f4or8WRZ2DiC7N5GV6mE2Hmu3PVm4Pkg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="relative z-10 p-margin-desktop flex flex-col justify-between h-full w-full">
          <div className="flex items-center gap-2 text-on-primary">
            <Icon name="directions_car" filled className="text-[32px] text-on-primary" />
            <span className="font-headline-md text-headline-md text-on-primary">
              FleetFlow
            </span>
          </div>
          <div className="text-on-primary mb-xl">
            <h1 className="font-headline-xl text-headline-xl mb-md text-on-primary">
              Join FleetFlow
            </h1>
            <p className="font-body-lg text-body-lg max-w-md opacity-90 text-on-primary">
              Experience premium mobility in minutes. Unlock a fleet of
              executive vehicles ready for your next journey.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Register form */}
      <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-xl py-lg bg-surface">
        <div className="flex md:hidden items-center gap-2 text-primary mb-lg justify-center">
          <Icon name="directions_car" filled className="text-[32px]" />
          <span className="font-headline-md text-headline-md text-primary">
            FleetFlow
          </span>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-lg text-center md:text-left">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
              Create your account
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Enter your details to get started.
            </p>
          </div>

          <RegisterForm />

          <p className="mt-lg text-center font-body-sm text-body-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-label-md text-label-md text-primary hover:text-secondary transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
