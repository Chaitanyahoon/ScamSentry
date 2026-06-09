import { cn } from "@/lib/utils";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/**
 * ScamSentry Brand Logo
 * Renders the custom cropped shield icon.
 */
export function Logo({ className, ...props }: LogoProps) {
  return (
    <img
      src="/logo-icon.png"
      alt="ScamSentry Logo"
      className={cn("object-contain", className)}
      {...props}
    />
  );
}
