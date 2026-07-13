import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, roleHome } from "@/lib/auth";
import { Icon } from "@/components/ui/Icon";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (session) {
    redirect(roleHome(session.user.role));
  }

  return (
    <div className="h-screen w-full flex bg-surface-container-lowest font-body-md text-on-surface antialiased overflow-hidden">
      {/* Left: Brand image (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-surface-variant flex-col justify-between items-start overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-2YeAdO9N8FxBwiwbgJm5y_8P5ke-Rz_bvlNIRls9FUvrp9pQ0EVZZTTwat_3xmcUuA361MYyF5tR06MjKZNfhQAeJL_pQiN8D0iMtLaDeBy182ROJHUioKun99-Z5iqxmfF5xITXpH1O6trUBu7P12s1x1gYVR8RiXfLco8fXSevqlJqE3ywhAoK0vgDU-Vox3myXqluYdxFyBZ5a0IK2x2biqtGFBFN7HI7nWQ3JGksXg7t3P0UGPuq1JGg9NLVGbjYycG2eMQ')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-container/80 via-primary-container/20 to-transparent" />

        {/* Brand top-left */}
        <div className="relative z-10 p-margin-desktop w-full flex items-center gap-xs text-on-primary">
          <Icon
            name="directions_car"
            filled
            className="text-[28px] text-on-primary"
          />
          <span className="font-headline-md text-headline-md tracking-tight text-on-primary">
            FleetFlow
          </span>
        </div>

        {/* Welcome bottom-left */}
        <div className="relative z-10 p-margin-desktop w-full text-on-primary max-w-lg mb-xl">
          <h1 className="font-headline-xl text-headline-xl mb-sm text-on-primary drop-shadow-md">
            Welcome Back
          </h1>
          <p className="font-body-lg text-body-lg text-on-primary/90">
            Continue your journey with FleetFlow. Access your premium fleet and
            manage your rentals with seamless precision.
          </p>
        </div>
      </div>

      {/* Right: Sign In form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface-container-lowest overflow-y-auto px-margin-mobile md:px-margin-desktop relative">
        {/* Mobile logo */}
        <div className="absolute top-0 left-0 p-margin-mobile lg:hidden flex items-center gap-xs text-primary-container">
          <Icon
            name="directions_car"
            filled
            className="text-[24px] text-primary"
          />
          <span className="font-headline-md text-headline-md tracking-tight text-primary">
            FleetFlow
          </span>
        </div>

        <div className="w-full max-w-md flex flex-col gap-lg py-xl">
          {/* Header */}
          <div className="flex flex-col gap-sm text-center lg:text-left">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              Sign In
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Enter your credentials to access your account.
            </p>
          </div>

          {sp.registered === "1" && (
            <div className="bg-secondary/10 text-secondary font-body-sm text-body-sm px-md py-sm rounded-lg flex items-center gap-xs">
              <Icon name="check_circle" filled className="text-[18px]" />
              Account created successfully. Please sign in.
            </div>
          )}

          {sp.error && (
            <div className="bg-error/10 text-error font-body-sm text-body-sm px-md py-sm rounded-lg flex items-center gap-xs">
              <Icon name="error" className="text-[18px]" />
              {String(sp.error)}
            </div>
          )}

          <LoginForm />

          <div className="text-center mt-sm">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-label-md text-label-md text-secondary hover:text-on-secondary-fixed-variant transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
