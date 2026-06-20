// Translations for the mock NPC lines + escalating hints per scene.
// In live mode a /api/translate route would cover arbitrary lines; for the
// demo this guarantees "tap to translate" always lands.

export const TRANSLATIONS: Record<string, string> = {
  // border
  "¡Bienvenido! ¿De dónde vienes hoy?": "Welcome! Where do you come from today?",
  "¡Qué bien! ¿Y a dónde vas?": "How nice! And where are you going?",
  "Perfecto. ¡Buen viaje, viajero!": "Perfect. Have a good trip, traveler!",
  "Mmm… cuéntame, ¿de dónde vienes?": "Hmm… tell me, where are you from?",
  // market
  "¿Qué le pongo, joven? Tengo naranjas muy dulces.":
    "What can I get you, young one? I have very sweet oranges.",
  "¿Cómo? ¿Cuántas naranjas, joven?": "Sorry? How many oranges, young one?",
  "¡Marchando un kilo! Son dos euros. ¿Algo más?":
    "One kilo coming up! That's two euros. Anything else?",
  "Marchando un kilo de naranjas. ¿Algo más?": "One kilo of oranges coming up. Anything else?",
  "Las naranjas están a dos euros el kilo. ¿Le pongo?":
    "The oranges are two euros a kilo. Shall I get you some?",
  "Dígame, joven, ¿qué desea?": "Tell me, young one, what would you like?",
  // cafe
  "Buenas. ¿Qué le pongo de tomar?": "Hello. What can I get you to drink?",
  "Marchando un café. ¡Gracias a ti!": "One coffee coming up. Thank you!",
  "Un café enseguida. ¿Algo más?": "A coffee right away. Anything else?",
  "¿Le apetece un café? Tengo un cortado buenísimo.":
    "Fancy a coffee? I make a great cortado.",
  // harbor
  "Buenas, viajera. ¿A dónde te llevo?": "Hello, traveler. Where shall I take you?",
  "El barco a la isla sale a las cinco. ¿Te saco billete?":
    "The boat to the island leaves at five. Shall I get you a ticket?",
  "Ah, a la isla. ¿Y a qué hora quieres ir?": "Ah, to the island. And what time do you want to go?",
  "Aquí hay muchos barcos. ¿Cuál buscas?": "There are many boats here. Which one are you looking for?",
  // platform
  "El andén está cerrando. ¿Qué ocurre?": "The platform is closing. What's the matter?",
  "Vaya… está bien, sube rápido al último. ¡Corre!":
    "Oh dear… alright, hurry onto the last one. Run!",
  "¿Su tren? Dígame qué pasó.": "Your train? Tell me what happened.",
  "Tiene que darse prisa. ¿Qué necesita?": "You need to hurry. What do you need?",
  "¿Sí? Dígame.": "Yes? Tell me.",
};

export function translate(line: string): string | undefined {
  return TRANSLATIONS[line.trim()];
}

// Escalating hints: a nudge first, then the full phrase.
export const HINTS: Record<string, string[]> = {
  border: ['Try greeting them and saying where you\'re from.', '"Hola, soy de Canadá. Voy a Madrid."'],
  market: [
    'Ask for the amount, then the price.',
    '"Quiero un kilo de naranjas. ¿Cuánto cuesta?"',
  ],
  cafe: ['Order politely and thank them.', '"Un café, por favor. Gracias."'],
  harbor: ['Ask which boat and what time.', '"¿Qué barco va a la isla? ¿A qué hora sale?"'],
  platform: [
    "Explain you missed your train, then ask to board.",
    '"Perdí mi tren. ¿Puedo subir al último, por favor?"',
  ],
};
