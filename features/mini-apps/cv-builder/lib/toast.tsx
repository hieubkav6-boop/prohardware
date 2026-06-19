/**
 * toast wrapper — same API as sonner but click-anywhere-to-dismiss is automatic.
 * Import this instead of "sonner" throughout the app.
 *
 * Sonner's ExternalToast does NOT expose an onClick prop, so we achieve
 * click-to-dismiss by rendering a custom JSX wrapper that calls toast.dismiss(id).
 */
import React from "react";
import { toast as _toast, ExternalToast } from "sonner";

type ToastOptions = Omit<ExternalToast, "id">;

function ToastBody({
  message,
  id,
}: {
  message: string;
  id: string | number;
}) {
  return (
    <span
      style={{ display: "block", width: "100%", cursor: "pointer" }}
      onClick={() => _toast.dismiss(id)}
    >
      {message}
    </span>
  );
}

function makeId(opts?: ToastOptions): string | number {
  return (opts as ExternalToast)?.id ?? Math.random().toString(36).slice(2);
}

function makeOpts(id: string | number, opts?: ToastOptions): ExternalToast {
  return {
    ...opts,
    id,
    duration: opts?.duration ?? 3500,
  };
}

export const toast = {
  success: (message: string, opts?: ToastOptions) => {
    const id = makeId(opts);
    return _toast.success(
      React.createElement(ToastBody, { message, id }),
      makeOpts(id, opts)
    );
  },
  error: (message: string, opts?: ToastOptions) => {
    const id = makeId(opts);
    return _toast.error(
      React.createElement(ToastBody, { message, id }),
      makeOpts(id, opts)
    );
  },
  info: (message: string, opts?: ToastOptions) => {
    const id = makeId(opts);
    return _toast.info(
      React.createElement(ToastBody, { message, id }),
      makeOpts(id, opts)
    );
  },
  warning: (message: string, opts?: ToastOptions) => {
    const id = makeId(opts);
    return _toast.warning(
      React.createElement(ToastBody, { message, id }),
      makeOpts(id, opts)
    );
  },
  message: (message: string, opts?: ToastOptions) => {
    const id = makeId(opts);
    return _toast.message(
      React.createElement(ToastBody, { message, id }),
      makeOpts(id, opts)
    );
  },
  dismiss: _toast.dismiss,
  promise: _toast.promise,
};
