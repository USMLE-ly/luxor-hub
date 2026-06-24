import { r as reactExports, d as reactDomExports, j as jsxRuntimeExports } from "./index-he9NPeB4.js";
import { P as Primitive } from "./index-I47t9sL0.js";
import { b as useLayoutEffect2 } from "./index-D1leX4VH.js";
var PORTAL_NAME = "Portal";
var Portal = reactExports.forwardRef((props, forwardedRef) => {
  var _a;
  const { container: containerProp, ...portalProps } = props;
  const [mounted, setMounted] = reactExports.useState(false);
  useLayoutEffect2(() => setMounted(true), []);
  const container = containerProp || mounted && ((_a = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : _a.body);
  return container ? reactDomExports.createPortal(/* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { ...portalProps, ref: forwardedRef }), container) : null;
});
Portal.displayName = PORTAL_NAME;
export {
  Portal as P
};
