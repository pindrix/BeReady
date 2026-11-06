import { useState, useSyncExternalStore } from "react";
import { Modal, ScrollView, View } from "react-native";
import { emergencyCountries, countryByCode } from "../data/countries";
import {
  getCountryCode,
  getRegionRevision,
  subscribeRegion,
  setCountryCode,
} from "../state/region";
import { Button, T, ErrorText, useAction } from "./ui";
import { LocalizedPressable as Pressable } from "./localized-native";
import { useTheme } from "../theme/theme";
export function useCountry() {
  useSyncExternalStore(subscribeRegion, getRegionRevision, getRegionRevision);
  return countryByCode(getCountryCode());
}
export function CountryPicker() {
  const country = useCountry(),
    c = useTheme(),
    a = useAction(),
    [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <T large>Krajina pobytu</T>
      <T muted>
        Tiesňové čísla podľa krajiny, nie podľa jazyka. Pri cestovaní krajinu
        zmeňte.
      </T>
      <Button
        title={country?.name ?? "Vyberte krajinu."}
        secondary
        onPress={() => setOpen(true)}
      />
      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: c.bg,
            padding: 24,
            paddingTop: 52,
            gap: 14,
          }}
        >
          <T large>Krajina pobytu</T>
          <T muted>
            Ak krajina nie je v zozname, overte miestne tiesňové čísla.
          </T>
          <Button title="Zavrieť" secondary onPress={() => setOpen(false)} />
          <ErrorText message={a.error} />
          <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 32 }}>
            {emergencyCountries.map((item) => (
              <Pressable
                key={item.code}
                accessibilityRole="radio"
                accessibilityLabel={item.name}
                translateLabel={false}
                accessibilityState={{ checked: item.code === country?.code }}
                onPress={() =>
                  void a.run(async () => {
                    await setCountryCode(item.code);
                    setOpen(false);
                  })
                }
                style={{
                  padding: 18,
                  borderRadius: 18,
                  backgroundColor:
                    item.code === country?.code ? c.tint : c.card,
                  borderWidth: 1,
                  borderColor:
                    item.code === country?.code ? c.primary : c.border,
                }}
              >
                <T translate={false}>
                  {item.name} · {item.primary}
                </T>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
