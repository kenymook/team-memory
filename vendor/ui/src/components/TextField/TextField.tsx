import { forwardRef, useId } from "react";
import { cx } from "../../utils/classNames";
import type { TextFieldProps } from "./TextField.types";

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      disabled,
      errorText,
      filled,
      helperText,
      id,
      label,
      prefix,
      required,
      size = "m",
      state = "default",
      suffix,
      value,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;
    const resolvedState = disabled ? "disabled" : errorText ? "error" : state;
    const isFilled = filled ?? (value != null && String(value).length > 0);

    return (
      <label className={cx("ui-field", className)} data-disabled={disabled ? "true" : undefined} data-state={resolvedState}>
        <span className="ui-field__label">
          {label}
          {required ? " *" : null}
        </span>
        <span className="ui-field__control" data-filled={isFilled ? "true" : undefined} data-size={size}>
          {prefix ? <span className="ui-field__affix">{prefix}</span> : null}
          <input
            {...props}
            aria-describedby={helperText || errorText ? messageId : props["aria-describedby"]}
            aria-invalid={resolvedState === "error" || undefined}
            className="ui-field__input"
            disabled={disabled}
            id={inputId}
            ref={ref}
            required={required}
            value={value}
          />
          {suffix ? <span className="ui-field__affix">{suffix}</span> : null}
        </span>
        {errorText || helperText ? (
          <span className="ui-field__message" data-tone={errorText ? "error" : undefined} id={messageId}>
            {errorText ?? helperText}
          </span>
        ) : null}
      </label>
    );
  },
);

TextField.displayName = "TextField";
