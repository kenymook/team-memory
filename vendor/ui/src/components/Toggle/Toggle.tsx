import { forwardRef, useId } from "react";
import { cx } from "../../utils/classNames";
import type { ToggleProps } from "./Toggle.types";

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      checked,
      className,
      disabled,
      helperText,
      id,
      label,
      loading = false,
      onCheckedChange,
      required,
      size = "m",
      statusText,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;
    const isBlocked = disabled || loading;

    return (
      <label className={cx("ui-toggle", className)} data-disabled={disabled ? "true" : undefined} data-size={size}>
        <input
          {...props}
          aria-describedby={helperText || statusText ? messageId : props["aria-describedby"]}
          aria-disabled={loading ? true : props["aria-disabled"]}
          checked={checked}
          className="ui-toggle__control"
          disabled={disabled}
          id={inputId}
          onChange={(event) => {
            if (isBlocked) {
              event.preventDefault();
              return;
            }
            onCheckedChange?.(event.currentTarget.checked);
            props.onChange?.(event);
          }}
          ref={ref}
          required={required}
          role="switch"
          type="checkbox"
        />
        <span className="ui-toggle__content">
          <span className="ui-toggle__label">
            {label}
            {required ? " *" : null}
          </span>
          {statusText || helperText ? (
            <span className="ui-field__message" id={messageId}>
              {statusText ?? helperText}
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);

Toggle.displayName = "Toggle";
