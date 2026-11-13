import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import type { UiSize } from "../../types";

export type AlertVariant = "info" | "success" | "warning" | "error" | "ai";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  variant?: AlertVariant;
  size?: UiSize;
  icon?: ReactNode;
  showIcon?: boolean;
  action?: ReactNode;
  actionLabel?: ReactNode;
  onAction?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
}
