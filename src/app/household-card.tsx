import { ExplanationCard } from "../components/explanation";
import { LocalizedAlert as Alert } from "../components/localized-native";
import { LocalizedText as Text, useLocale } from "../components/localized-text";
import { translateText as t } from "../i18n";
import { useState } from "react";
import { Share, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Button,
  Card,
  Check,
  ErrorText,
  Row,
  Screen,
  T,
  useAction,
} from "../components/ui";
import { numbersForCountry } from "../data/countries";
import { useCountry } from "../components/country-picker";
import { householdCard, householdCardText } from "../domain/household-card";
import { useStore } from "../state/store";
import { useTheme } from "../theme/theme";

export default function HouseholdCardScreen() {
  const country = useCountry(),
    emergencyNumbers = numbersForCountry(country?.code);
  useLocale();
  const { data } = useStore(),
    c = useTheme(),
    action = useAction();
  const [personal, setPersonal] = useState(false),
    [notice, setNotice] = useState("");
  const card = householdCard(
    data?.household ?? null,
    data?.contacts ?? [],
    personal,
  );
  const shareText = householdCardText(card, t);
  function share() {
    Alert.alert(
      personal ? "Zdieľať aj osobné údaje?" : "Zdieľať núdzovú kartu?",
      personal
        ? "Náhľad nižšie obsahuje názov domácnosti, miesto stretnutia a kontakty. V systémovom dialógu sami vyberiete príjemcu alebo miesto uloženia."
        : "Zdieľa sa presný text náhľadu nižšie, bez vašich kontaktov a miesta stretnutia. Príjemcu si zvolíte v systémovom dialógu.",
      [
        { text: "Zrušiť", style: "cancel" },
        {
          text: "Otvoriť zdieľanie",
          onPress: () =>
            void action.run(async () => {
              const result = await Share.share({
                title: card.title,
                message: shareText,
              });
              setNotice(
                result.action === Share.dismissedAction
                  ? "Zdieľanie bolo zrušené."
                  : "Systémový dialóg bol dokončený. Skontrolujte zvoleného príjemcu alebo uloženie.",
              );
            }),
        },
      ],
    );
  }
  return (
    <Screen
      title="Karta, ktorú máte poruke"
      subtitle="Dôležité čísla a dohoda domácnosti na jednom mieste."
    >
      <Button title="Späť" secondary onPress={() => router.back()} />
      <View
        style={{
          borderRadius: 28,
          backgroundColor: "#14283B",
          padding: 24,
          gap: 23,
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -42,
            top: -42,
            width: 190,
            height: 190,
            borderRadius: 95,
            borderWidth: 30,
            borderColor: "#224353",
          }}
        />
        <Row>
          <Ionicons name="shield-checkmark" size={30} color="#67D8C6" />
          <Text
            style={{
              color: "#67D8C6",
              fontSize: 13,
              letterSpacing: 2.4,
              fontWeight: "800",
            }}
          >
            READY / VŽDY PORUKE
          </Text>
        </Row>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 29,
            lineHeight: 35,
            fontWeight: "800",
          }}
        >
          {card.title}
        </Text>
        <Text
          style={{ color: "#B9CBD5", fontSize: 14, fontWeight: "600" }}
          translate={!card.personal}
        >
          {card.household}
        </Text>
        <View style={{ gap: 10 }}>
          <Text
            style={{
              color: "#9AB2BE",
              fontSize: 12,
              letterSpacing: 1.6,
              fontWeight: "700",
            }}
          >
            KEĎ IDE O POMOC
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {emergencyNumbers.map((item) => (
              <View
                key={item.name}
                style={{
                  flexBasis: "45%",
                  flexGrow: 1,
                  backgroundColor: "#203B4E",
                  borderRadius: 16,
                  padding: 15,
                  gap: 5,
                }}
              >
                <Text
                  style={{ color: "#FFFFFF", fontSize: 34, fontWeight: "800" }}
                >
                  {item.number}
                </Text>
                <Text
                  style={{ color: "#B9CBD5", fontSize: 12, lineHeight: 17 }}
                >
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#355060",
            paddingTop: 18,
            gap: 8,
          }}
        >
          <Row>
            <Ionicons
              name={personal ? "location-outline" : "lock-closed-outline"}
              size={20}
              color="#67D8C6"
            />
            <Text style={{ color: "#B9CBD5", fontSize: 13, fontWeight: "700" }}>
              MIESTO STRETNUTIA
            </Text>
          </Row>
          <Text
            style={{ color: "#FFFFFF", fontSize: 17, lineHeight: 25 }}
            translate={!card.personal}
          >
            {card.meeting}
          </Text>
        </View>
        {personal && card.contacts.length ? (
          <View style={{ gap: 12 }}>
            <Text style={{ color: "#B9CBD5", fontSize: 13, fontWeight: "700" }}>
              BLÍZKE OSOBY
            </Text>
            {card.contacts.map((contact, i) => (
              <View key={i} style={{ gap: 3 }}>
                <Text
                  style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}
                  translate={false}
                >
                  {contact.name}
                </Text>
                <Text
                  style={{ color: "#B9CBD5", fontSize: 15, lineHeight: 22 }}
                  translate={false}
                >
                  {contact.details}
                </Text>
              </View>
            ))}
            {card.omittedContacts ? (
              <Text style={{ color: "#B9CBD5", fontSize: 13 }}>
                Ďalších {card.omittedContacts} kontaktov nájdete v aplikácii.
              </Text>
            ) : null}
          </View>
        ) : null}
        <Text style={{ color: "#91ACBA", fontSize: 12, lineHeight: 18 }}>
          Pri volaní povedzte, čo sa stalo, kde ste a kto potrebuje pomoc.
          Riaďte sa operátorom.
        </Text>
      </View>
      <Card>
        <Check
          label="Zobraziť a zahrnúť osobné údaje"
          done={personal}
          onPress={() => {
            setPersonal(!personal);
            setNotice("");
          }}
        />
        <T muted>
          Osobné údaje sú predvolene skryté. Zapnutím zahrniete aj názov
          domácnosti, miesto stretnutia a najviac 6 kontaktov. READY ich nikam
          automaticky neodosiela.
        </T>
        <Button
          title="Upraviť miesto a kontakty v Pláne"
          secondary
          onPress={() => router.push("/plan")}
        />
      </Card>
      <Card>
        <T large>Presný text na zdieľanie</T>
        <T muted>
          Text môžete skopírovať do dokumentu a vytlačiť. PDF export zatiaľ nie
          je súčasťou aplikácie.
        </T>
        <Text
          selectable
          style={{
            color: c.text,
            fontSize: 14,
            lineHeight: 23,
            backgroundColor: c.bg,
            padding: 16,
            borderRadius: 14,
          }}
        >
          {shareText}
        </Text>
        <Button
          title={
            personal
              ? "Zdieľať kartu s osobnými údajmi"
              : "Zdieľať kartu bez osobných údajov"
          }
          disabled={action.busy}
          onPress={share}
        />
        <ErrorText message={action.error} />
        {notice ? <T muted>{notice}</T> : null}
      </Card>
      <ExplanationCard topic="plan" />
    </Screen>
  );
}
