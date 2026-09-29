import SceneCanvas from "../../three/SceneCanvas";
import DevLaptop from "./DevLaptop";

const ContactExperience = () => (
  <SceneCanvas className="absolute inset-0" camera={{ fov: 38 }}>
    <DevLaptop />
  </SceneCanvas>
);

export default ContactExperience;
