import { useState } from "react";
import type { ReactNode } from "react";

import { LuX } from "react-icons/lu";

interface AlertProps {
  icon?: ReactNode;
  message: string | ReactNode;
  ctaText?: string;
  ctaHref?: string;
  ctaIcon?: ReactNode;
  dismissible?: boolean;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
}

export default function Alert({
  icon,
  message,
  ctaText,
  ctaHref,
  ctaIcon,
  dismissible = true,
  variant = "info",
  className = "",
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const variantClasses = {
    info: "alert-info",
    success: "alert-success",
    warning: "alert-warning",
    error: "alert-error",
  };

  return (
    <div
      role="alert"
      className={`alert ${variantClasses[variant]} flex items-center justify-between lg:flex-col xl:flex-row ${className}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {icon && <span className="mx-2 flex-shrink-0 text-3xl">{icon}</span>}
        <span className="text-lg break-words">{message}</span>
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        {ctaText && ctaHref && (
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-lg btn-warning gap-4"
          >
            {ctaText}
            {ctaIcon && <span>{ctaIcon}</span>}
          </a>
        )}
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="btn btn-ghost btn-lg btn-circle"
            aria-label="Dismiss"
          >
            <LuX className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
