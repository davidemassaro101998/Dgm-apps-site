import { useCallback, useState } from "react";
import { MotionConfig } from "framer-motion";
import { Header } from "./components/Header";
import { RevolverHero } from "./components/RevolverHero";
import { LanguageProvider } from "./context/LanguageContext";

/* Una schermata sola, alta esattamente quanto la finestra: nessuno
   scroll, nessuna sezione sotto. Tutto quello che il sito deve dire --
   quali app esistono, cosa fanno, come si aprono -- sta dentro il
   tamburo e nella scheda che si apre da li. */
export default function App() {
  /* Scegliere un'app dal menu deve aprirla nel tamburo, non essere un
     elenco che non fa niente. Il menu e il tamburo sono fratelli, quindi
     la richiesta passa da qui: il menu la deposita, il tamburo la
     esegue e la consuma. */
  const [requestedAppId, setRequestedAppId] = useState<string | null>(null);
  const clearRequest = useCallback(() => setRequestedAppId(null), []);

  return (
    <LanguageProvider>
      <MotionConfig reducedMotion="user">
        <div className="relative h-[100dvh] w-full overflow-hidden bg-[#08070A] font-body">
          <Header onSelectApp={setRequestedAppId} />
          <RevolverHero requestedAppId={requestedAppId} onRequestHandled={clearRequest} />
        </div>
      </MotionConfig>
    </LanguageProvider>
  );
}
