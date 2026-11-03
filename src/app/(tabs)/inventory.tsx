import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Field, Screen, T, confirm } from "../../components/ui";
import {
  Badge,
  Icon,
  IconButton,
  type IconName,
} from "../../components/visual";
import { useStore } from "../../state/store";
import { categories, categoryLabels } from "../../types/model";
import { expiryStatus } from "../../domain/readiness";
import { useTheme } from "../../theme/theme";
const icons: Record<(typeof categories)[number], IconName> = {
  jedlo: "nutrition-outline",
  voda: "water-outline",
  hygiena: "sparkles-outline",
  lieky: "medkit-outline",
  energia: "flashlight-outline",
  ostatné: "cube-outline",
};
export default function InventoryScreen() {
  const s = useStore(),
    c = useTheme(),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState<string>("všetko"),
    [expanded, setExpanded] = useState<string | null>(null);
  const all = s.data?.inventory ?? [],
    items = all.filter(
      (x) =>
        (category === "všetko" || x.category === category) &&
        `${x.name} ${x.note}`
          .toLocaleLowerCase("sk")
          .includes(query.toLocaleLowerCase("sk")),
    );
  const soon = all.filter((x) => expiryStatus(x) !== "ok").length;
  return (
    <Screen
      title="Dobré zásoby. Menej starostí."
      subtitle="Viete, čo máte. Doplníte, čo chýba."
      eyebrow="DOMÁCA ŠPAJZA"
      headerRight={
        <IconButton
          name="add-outline"
          label="Pridať zásobu"
          onPress={() => router.push("/item")}
        />
      }
    >
      <View style={{ flexDirection: "row", gap: 12 }}>
        {[
          {
            value: all.length,
            label: "položiek doma",
            icon: "cube-outline" as const,
            bg: c.sage,
          },
          {
            value: soon,
            label: "na kontrolu dátumu",
            icon: "time-outline" as const,
            bg: c.peach,
          },
        ].map((x) => (
          <View
            key={x.label}
            style={{
              flex: 1,
              borderRadius: 24,
              padding: 20,
              gap: 8,
              backgroundColor: x.bg,
            }}
          >
            <Icon name={x.icon} />
            <Text
              style={{
                fontSize: 34,
                fontWeight: "800",
                letterSpacing: -1,
                color: c.text,
              }}
            >
              {x.value}
            </Text>
            <Text style={{ fontSize: 12, color: c.muted }}>{x.label}</Text>
          </View>
        ))}
      </View>
      <Field
        label="Vyhľadávanie zásob"
        value={query}
        onChange={setQuery}
        placeholder="Názov alebo poznámka"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {["všetko", ...categories].map((x) => (
          <Pressable
            key={x}
            accessibilityRole="radio"
            accessibilityState={{ checked: category === x }}
            accessibilityLabel={
              x === "všetko"
                ? "Všetko"
                : categoryLabels[x as (typeof categories)[number]]
            }
            onPress={() => setCategory(x)}
            style={{
              paddingHorizontal: 17,
              paddingVertical: 13,
              minHeight: 48,
              borderRadius: 24,
              backgroundColor: category === x ? c.primary : c.card,
              borderWidth: 1,
              borderColor: category === x ? c.primary : c.border,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color:
                  category === x ? (c.dark ? "#142E25" : "white") : c.muted,
              }}
            >
              {x === "všetko"
                ? "Všetko"
                : categoryLabels[x as (typeof categories)[number]]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "800", color: c.text }}>
          Vaša evidencia
        </Text>
        <Badge label={`${items.length} POLOŽIEK`} tone="neutral" />
      </View>
      {!items.length ? (
        <Card>
          <View style={{ alignItems: "center", paddingVertical: 18, gap: 14 }}>
            <View
              style={{
                height: 84,
                width: 84,
                borderRadius: 29,
                backgroundColor: c.tint,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="basket-outline" size={43} />
            </View>
            <T large>
              {all.length ? "Nič sme nenašli." : "Začnite tým, čo už máte."}
            </T>
            <T muted>
              {all.length
                ? "Skúste iný názov alebo kategóriu."
                : "Ryža v skrinke, voda v komore, baterka v zásuvke. Aj malý začiatok sa počíta."}
            </T>
            <Button
              title="Zaevidovať prvú položku"
              onPress={() => router.push("/item")}
            />
          </View>
        </Card>
      ) : null}
      {items.map((item) => {
        const status = expiryStatus(item),
          open = expanded === item.id;
        return (
          <Card key={item.id} style={{ padding: 17 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  width: 57,
                  height: 62,
                  borderRadius: 19,
                  backgroundColor:
                    item.category === "voda"
                      ? c.blue
                      : item.category === "jedlo"
                        ? c.sage
                        : item.category === "lieky"
                          ? c.peach
                          : c.tint,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon name={icons[item.category]} size={29} />
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "800", color: c.text }}
                >
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12, color: c.muted }}>
                  {categoryLabels[item.category]}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 5 }}>
                <Text
                  style={{ fontSize: 20, fontWeight: "800", color: c.text }}
                >
                  {item.quantity}{" "}
                  <Text style={{ fontSize: 12, fontWeight: "500" }}>
                    {item.unit}
                  </Text>
                </Text>
                <Text style={{ fontSize: 10, color: c.muted }}>
                  {item.kcal === null
                    ? "kcal neznáme"
                    : `${item.quantity * item.kcal} kcal`}
                </Text>
              </View>
            </View>
            {item.expiry ? (
              <Badge
                label={`${status === "past" ? "PO DÁTUME" : status === "soon" ? "SKONTROLUJTE" : "DÁTUM"} · ${item.expiry}`}
                tone={status === "ok" ? "neutral" : "orange"}
              />
            ) : null}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${open ? "Skryť" : "Zobraziť"} detail: ${item.name}`}
                onPress={() => setExpanded(open ? null : item.id)}
                style={{
                  minHeight: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: c.primary }}
                >
                  Podrobnosti
                </Text>
                <Icon name={open ? "chevron-up" : "chevron-down"} size={15} />
              </Pressable>
              <View style={{ flexDirection: "row", gap: 7 }}>
                <IconButton
                  name="create-outline"
                  label={`Upraviť: ${item.name}`}
                  onPress={() =>
                    router.push({ pathname: "/item", params: { id: item.id } })
                  }
                />
                <IconButton
                  name="trash-outline"
                  label={`Vymazať: ${item.name}`}
                  onPress={() => {
                    if (!s.busy)
                      confirm("Vymazať zásobu?", item.name, () =>
                        s.remove("inventory", item.id),
                      );
                  }}
                />
              </View>
            </View>
            {open ? (
              <View
                style={{
                  gap: 9,
                  borderTopWidth: 1,
                  borderColor: c.border,
                  paddingTop: 12,
                }}
              >
                <T muted>
                  {item.kcal === null
                    ? "Energia: neznáme — nezapočítava sa do energetického súčtu."
                    : `Energia: ${item.kcal} kcal/${item.unit}. ${item.category !== "jedlo" ? "Do dní jedla sa počíta iba kategória Jedlo." : ""}`}
                </T>
                {item.expiry ? (
                  <T muted>
                    {item.expiryType === "spotreba"
                      ? "Spotrebujte do"
                      : "Minimálna trvanlivosť"}
                    : {item.expiry}
                    {status === "past" ? " · bez započítania do krytia" : ""}
                  </T>
                ) : null}
                {item.expiryType === "trvanlivosť" && status === "past" ? (
                  <T>
                    Po minimálnej trvanlivosti nemusí byť potravina nebezpečná.
                    Skontrolujte obal, skladovanie a stav podľa pokynov výrobcu.
                  </T>
                ) : null}
                {item.purchased ? <T muted>Nákup: {item.purchased}</T> : null}
                {item.note ? <T>{item.note}</T> : null}
              </View>
            ) : null}
          </Card>
        );
      })}
      <Button
        title="Vytvoriť nákupný zoznam"
        secondary
        onPress={() => router.push("/shopping")}
      />
      <T muted>
        Kalórie zadávajte podľa obalu na zvolenú jednotku. Neznáme hodnoty
        neodhadujeme.
      </T>
    </Screen>
  );
}
