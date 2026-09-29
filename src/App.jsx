import Preloader from "./components/Preloader";
import Navbar from "./components/NavBar";
import SoundToggle from "./components/SoundToggle";
import CustomCursor from "./components/CustomCursor";
import Hero from "./sections/Hero";
import About from "./sections/About";
import ForDevs from "./sections/ForDevs";
import Numbers from "./sections/Numbers";
import Steps from "./sections/Steps";
import Why from "./sections/Why";
import Experience from "./sections/Experience";
import TechStack from "./sections/TechStack";
import TaintLab from "./sections/TaintLab";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";

const App = () => (
  <>
    <Preloader />
    <Navbar />
    <SoundToggle />
    <main>
      <Hero />
      <About />
      <ForDevs />
      <Numbers />
      <Steps />
      <Why />
      <Experience />
      <TechStack />
      <TaintLab />
      <Contact />
    </main>
    <Footer />
    <div className="grain" aria-hidden="true" />
    <CustomCursor />
  </>
);

export default App;
