import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps extends Omit<React.ComponentPropsWithoutRef<typeof Image>, "src" | "alt"> {
  className?: string;
}

/**
 * ScamSentry Brand Logo
 * Renders the custom cropped shield icon.
 */
export function Logo({ className, ...props }: LogoProps) {
  return (
    <Image
      src="/logo-icon.png"
      alt="ScamSentry Logo"
      width={24}
      height={24}
      className={cn("object-contain", className)}
      {...props}
    />
  );
}
