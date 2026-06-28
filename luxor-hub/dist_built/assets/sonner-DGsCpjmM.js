import { j as jsxRuntimeExports } from "./index-CqA86RF3.js";
import { j } from "./AppContent-h4IlOpH8.js";
import { T as Toaster$1 } from "./index-J9_vYcP0.js";
import { t } from "./index-J9_vYcP0.js";
const Toaster = ({ ...props }) => {
  const { theme = "system" } = j();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      theme,
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
export {
  Toaster,
  t as toast
};
