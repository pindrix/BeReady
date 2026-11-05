import { router } from "expo-router";
import { LanguagePicker } from "../components/language-picker";
import { Image } from "expo-image";
import { Badge } from "../components/visual";
import { Screen, T, Button } from "../components/ui";
import { ProfileForm } from "../components/profile-form";
import { defaultHousehold } from "../types/model";
import { useStore } from "../state/store";
export default function Onboarding() {
  const s = useStore();
  return (
    <Screen
      title="Pokoj začína prípravou."
      subtitle="Malé kroky pre lepšie pripravenú domácnosť."
    >
      <LanguagePicker />
      <Image
        source={require("../../assets/images/ready-world.webp")}
        style={{ width: "100%", height: 210, borderRadius: 28 }}
        contentFit="cover"
      />
      <Badge label="OFFLINE · BEZ ÚČTU · VO VAŠICH RUKÁCH" />
      <T>
        READY funguje bez účtu. Vaše zásoby, kontakty a plán sa ukladajú iba v
        tomto zariadení.
      </T>
      <Button
        title="Potrebujem pomoc teraz"
        secondary
        onPress={() => router.push("/now")}
      />
      <ProfileForm initial={defaultHousehold} onSave={s.profile} first />
    </Screen>
  );
}
