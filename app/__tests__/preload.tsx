import { configure } from "enzyme";
import Portal from "@material-ui/core/Portal";
import Modal from "@material-ui/core/Modal/Modal";

const Adapter = require("enzyme-adapter-react-16");

(Portal as any).defaultProps.disablePortal = true;
(Modal as any).defaultProps = {
  ...(Modal as any).defaultProps,
  disablePortal: true
};

configure({ adapter: new Adapter() });

if (typeof window !== "undefined") {
  require("intersection-observer");
}
