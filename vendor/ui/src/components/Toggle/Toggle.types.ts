import type { InputHTMLAttributes, ReactNode } from "react";
import type { UiSize } from "../../types";

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "onChange"> {
  label: ReactNode;
  size?: UiSize;
  helperText?: ReactNode;
  statusText?: ReactNode;
  loading?: boolean;
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
  onCheckedChange?: (checked: boolean) => void;
}
