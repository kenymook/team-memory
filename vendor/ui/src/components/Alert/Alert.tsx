import { forwardRef } from "react";
import { cx } from "../../utils/classNames";
import type { AlertProps, AlertVariant } from "./Alert.types";

const defaultIcons: Record<AlertVariant, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  error: "!",
  ai: "AI",
};

function defaultRole(variant: AlertVariant) {
  if (variant === "error") return "alert";
  if (variant === "success") return "status";
  return undefined;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      action,
      actionLabel,
      children,
      className,
      description,
      dismissible = false,
      dismissLabel,
      icon,
      onAction,
      onDismiss,
      role,
      showIcon = true,
      size = "m",
      title,
      variant = "info",
      ...props
    },
    ref,
  ) => {
    const resolvedRole = role ?? defaultRole(variant);
    const resolvedIcon = icon ?? defaultIcons[variant];

    return (
      <div
        {...props}
        className={cx("ui-alert", className)}
        data-size={size}
        data-variant={variant}
        ref={ref}
        role={resolvedRole}
      >
        {showIcon ? (
          <span aria-hidden="true" className="ui-alert__icon">
            {resolvedIcon}
          </span>
        ) : null}
        <div className="ui-alert__content">
          <div className="ui-alert__title">{title}</div>
          {description ? <div className="ui-alert__description">{description}</div> : null}
          {children ? <div className="ui-alert__body">{children}</div> : null}
          {action || actionLabel ? (
            <div className="ui-alert__actions">
              {action ?? (
                <button className="ui-alert__action" onClick={onAction} type="button">
                  {actionLabel}
                </button>
              )}
            </div>
          ) : null}
        </div>
        {dismissible || onDismiss ? (
          <button
            aria-label={dismissLabel ?? "Dismiss alert"}
            className="ui-alert__dismiss"
            onClick={onDismiss}
            type="button"
          >
            ×
          </button>
        ) : null}
      </div>
    );
  },
);

Alert.displayName = "Alert";
