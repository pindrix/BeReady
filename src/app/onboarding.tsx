import { Screen, T } from "../components/ui";
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
      <T>
        READY funguje bez účtu. Vaše zásoby, kontakty a plán sa ukladajú iba v
        tomto zariadení.
      </T>
      <ProfileForm initial={defaultHousehold} onSave={s.profile} first />
    </Screen>
  );
}
