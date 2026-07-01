import { X } from "lucide-react";
import Button from "./Button.jsx";

export default function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="text-lg font-bold text-brand-ink">{title}</h2>
          <Button variant="ghost" className="h-10 w-10 px-0" onClick={onClose} aria-label="Close dialog">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-4">{children}</div>
        {footer ? <div className="border-t border-slate-100 p-4">{footer}</div> : null}
      </div>
    </div>
  );
}
