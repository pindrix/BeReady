import { LocalizedPressable as Pressable } from "../components/localized-native";
import { LocalizedText as Text } from "../components/localized-text";
import { useState } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Button,
  Card,
  Screen,
  T,
  ErrorText,
  useAction,
} from "../components/ui";
import {
  Badge,
  Callout,
  Icon,
  IconButton,
  SectionTitle,
} from "../components/visual";
import { useLicense, BILLING_CONFIGURATION } from "../state/license";
import { LICENSE_TERMS } from "../domain/license";

export default function PlusScreen() {
  const action = useAction(),
    l = useLicense(),
    [details, setDetails] = useState(false);
  const active = l.state?.status === "licensed";
  return (
    <Screen
      title="Jeden plán. Celý rok."
      subtitle="14 dní online skúšania. Potom jednorazová licencia na 12 mesiacov — bez automatického obnovenia."
      eyebrow="READY · ROČNÁ LICENCIA"
      headerRight={
        <IconButton
          name="close-outline"
          label="Zavrieť licenciu"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
        />
      }
    >
      <LinearGradient
        colors={["#214B40", "#132E30"]}
        style={{ borderRadius: 30, padding: 27, gap: 22, overflow: "hidden" }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "800",
              letterSpacing: 2,
              color: "#D1EB9A",
            }}
          >
            READY / VÁŠ ROK PRÍPRAVY
          </Text>
          <Icon name="shield-checkmark-outline" size={30} color="#D1EB9A" />
        </View>
        <View>
          <Text
            style={{
              fontSize: 61,
              lineHeight: 70,
              fontWeight: "800",
              color: "white",
              letterSpacing: -3,
            }}
          >
            10 <Text style={{ fontSize: 23, letterSpacing: 0 }}>USD</Text>
          </Text>
          <Text style={{ fontSize: 15, color: "#C7DBCE" }}>
            jedna platba · 12 mesiacov prístupu
          </Text>
        </View>
        <View style={{ height: 1, backgroundColor: "#3C5C50" }} />
        {[
          "Offline návody a ilustrácie priamo v telefóne",
          "Zásoby, výpočty a vizuálny evakuačný batoh",
          "Interaktívne scenáre, misie a rodinný plán",
        ].map((label) => (
          <View
            key={label}
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
          >
            <Icon name="checkmark-circle" size={22} color="#D1EB9A" />
            <Text
              style={{ flex: 1, color: "white", fontSize: 14, lineHeight: 21 }}
            >
              {label}
            </Text>
          </View>
        ))}
        <Text style={{ color: "#BDCEC5", fontSize: 11, lineHeight: 17 }}>
          Žiadne automatické strhávanie ďalší rok. Po uplynutí licencie sa sami
          rozhodnete, či si kúpite ďalšie obdobie.
        </Text>
      </LinearGradient>
      <Card>
        <Badge
          label={
            active
              ? "LICENCIA AKTÍVNA"
              : l.connectivity === "offline"
                ? "BEZ PRIPOJENIA"
                : "ONLINE SKÚŠKA"
          }
        />
        <T large>
          {active
            ? "Offline režim je odomknutý."
            : `Zo skúšobného obdobia zostáva ${l.state?.remainingTrialDays ?? LICENSE_TERMS.trialDays} dní.`}
        </T>
        <T muted>
          Skúška trvá 14 dní od prvého spustenia. Offline funkcie sú dostupné až
          po overenej platbe. Na prvý nákup a obnovenie nákupu je potrebné
          pripojenie.
        </T>
      </Card>
      {!BILLING_CONFIGURATION.configured ? (
        <Callout icon="construct-outline" title="Platby ešte nie sú pripojené">
          <T muted>
            Táto vývojová verzia nič neúčtuje. Nákup ani overený offline prístup
            tu zatiaľ nie je možné aktivovať. Online náhľad zostáva dostupný aj
            po konci skúšky; produkčné obmedzenie sa zapne po pripojení Google
            Play Billing.
          </T>
        </Callout>
      ) : null}
      <ErrorText message={action.error} />
      <Button
        title="Kúpiť ročnú licenciu — 10 USD"
        disabled={!BILLING_CONFIGURATION.configured}
        onPress={() => void action.run(l.purchase)}
      />
      <Button
        title="Obnoviť overený nákup"
        secondary
        disabled={!BILLING_CONFIGURATION.configured}
        onPress={() => void action.run(l.restorePurchase)}
      />
      <T muted>
        Cieľová cena je 10 USD za ročné obdobie. Konečnú cenu v miestnej mene a
        prípadné dane musí pred potvrdením zobraziť Google Play. Zobrazená suma
        nie je aktívna ponuka obchodu.
      </T>
      <SectionTitle title="Jasné podmienky, žiadne prekvapenia" />
      <View style={{ gap: 12 }}>
        {[
          {
            icon: "wifi-outline" as const,
            title: "14 dní na vyskúšanie",
            text: "Počas skúšobného obdobia je pri používaní funkcií potrebný internet.",
          },
          {
            icon: "cloud-offline-outline" as const,
            title: "Offline až po zaplatení",
            text: "Po overení zaplatenej licencie zostávajú návody, výbava a údaje v zariadení. YouTube zostáva online služba.",
          },
          {
            icon: "calendar-outline" as const,
            title: "Licencia na 12 mesiacov",
            text: "Nie je to doživotná licencia ani automaticky obnovované predplatné.",
          },
          {
            icon: "lock-closed-outline" as const,
            title: "Vaše dáta zostávajú vaše",
            text: "Po skončení licencie sa údaje automaticky nemažú. Nastavenia, čítanie vlastných údajov, export a tiesňové čísla zostávajú dostupné.",
          },
        ].map((x) => (
          <Card key={x.title}>
            <View style={{ flexDirection: "row", gap: 14 }}>
              <Icon name={x.icon} />
              <View style={{ flex: 1, gap: 6 }}>
                <T large>{x.title}</T>
                <T muted>{x.text}</T>
              </View>
            </View>
          </Card>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ako funguje licencia"
        onPress={() => setDetails(!details)}
        style={{
          minHeight: 52,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <T>Ako funguje licencia</T>
        <Icon name={details ? "chevron-up" : "chevron-down"} size={18} />
      </Pressable>
      {details ? (
        <Card>
          <T>
            Platný nákup musí overiť obchod alebo dôveryhodná podpisová služba.
            Samotná zmena dátumu, import zálohy alebo stlačenie tlačidla
            licenciu neaktivuje.
          </T>
          <T muted>
            V tejto verzii je pripravená politika prístupu a lokálna evidencia
            skúšky. Bez prepojenia s obchodom nevznikne doklad o platbe ani
            aktívna licencia.
          </T>
        </Card>
      ) : null}
      <Button
        title="Nastavenia a export dát"
        secondary
        onPress={() => router.push("/settings")}
      />
    </Screen>
  );
}
