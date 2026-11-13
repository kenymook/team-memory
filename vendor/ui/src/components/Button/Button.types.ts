import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { UiSize } from "../../types";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "text" | "destruction";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: UiSize;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}
