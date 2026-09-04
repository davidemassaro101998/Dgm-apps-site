import { MotionConfig } from "framer-motion";
import { Header } from "./components/Header";
import { RevolverHero } from "./components/RevolverHero";
import { LanguageProvider } from "./context/LanguageContext";

/* Una schermata sola, alta esattamente quanto la finestra: nessuno
   scroll, nessuna sezione sotto. Tutto quello che il sito deve dire --
   quali app esistono, cosa fanno, come si aprono -- sta dentro il
   tamburo e nella scheda che si apre da li. */
export default function App() {
  return (
    <LanguageProvider>
      <MotionConfig reducedMotion="user">
        <div className="relative h-[100dvh] w-full overflow-hidden bg-[#08070A] font-body">
          <Header />
          <RevolverHero />
        </div>
      </MotionConfig>
    </LanguageProvider>
  );
}
