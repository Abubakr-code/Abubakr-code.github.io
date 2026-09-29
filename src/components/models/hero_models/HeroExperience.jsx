import { useMediaQuery } from "react-responsive";

import SceneCanvas from "../../three/SceneCanvas";
import ParticleShield from "./ParticleShield";

const HeroExperience = ({ scroll }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <SceneCanvas className="w-full h-full" camera={{ position: [0, 0, 11], fov: 40 }}>
      <group scale={isMobile ? 0.82 : 1} position={[0, 0.3, 0]}>
        <ParticleShield count={isMobile ? 1800 : 2600} scroll={scroll} />
      </group>
    </SceneCanvas>
  );
};

export default HeroExperience;
