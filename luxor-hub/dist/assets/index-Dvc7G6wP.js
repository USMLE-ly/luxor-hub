import { r as reactExports } from "./index-he9NPeB4.js";
var DirectionContext = reactExports.createContext(void 0);
function useDirection(localDir) {
  const globalDir = reactExports.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}
export {
  useDirection as u
};
