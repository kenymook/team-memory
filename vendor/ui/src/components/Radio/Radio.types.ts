import type { FieldsetHTMLAttributes, ReactNode } from "react";
import type { UiSize } from "../../types";

export interface RadioOption {
  value: string;
  label: ReactNode;
  helperText?: ReactNode;
  disabled?: boolean;
}

export interface RadioProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange"> {
  label: ReactNode;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  size?: UiSize;
  errorText?: ReactNode;
  helperText?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  onValueChange?: (value: string) => void;
}
