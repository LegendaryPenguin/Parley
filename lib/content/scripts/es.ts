import type { LangScript } from "./types";

// Spanish (es). Keywords are written without accents/case — the matcher
// normalizes both sides.
const es: LangScript = {
  border: {
    opening: "¡Bienvenido! ¿De dónde vienes hoy?",
    fallback: "Mmm… cuéntame, ¿de dónde vienes?",
    rules: [
      { needs: [["voy a", "a "]], reply: "Perfecto. ¡Buen viaje, viajero!" },
      { needs: [["soy de", "vengo", "de "]], reply: "¡Qué bien! ¿Y a dónde vas?" },
    ],
    goal: [["soy de", "vengo", "de "], ["voy a", "a "]],
    translations: {
      "¡Bienvenido! ¿De dónde vienes hoy?": "Welcome! Where do you come from today?",
      "¡Qué bien! ¿Y a dónde vas?": "How nice! And where are you going?",
      "Perfecto. ¡Buen viaje, viajero!": "Perfect. Have a good trip, traveler!",
      "Mmm… cuéntame, ¿de dónde vienes?": "Hmm… tell me, where are you from?",
    },
    hints: ["Greet them and say where you're from.", '"Hola, soy de Canadá. Voy a Madrid."'],
    vocab: [
      { term: "hola", meaning: "hello" },
      { term: "soy de", meaning: "I am from" },
      { term: "voy a", meaning: "I am going to" },
      { term: "gracias", meaning: "thank you" },
    ],
  },

  market: {
    opening: "¿Qué le pongo, joven? Tengo naranjas muy dulces.",
    fallback: "Dígame, joven, ¿qué desea?",
    rules: [
      { needs: [["una kilo"]], reply: "¿Cómo? ¿Cuántas naranjas, joven?" },
      {
        needs: [["kilo", "naranja"], ["cuanto", "precio", "cuesta", "vale"]],
        reply: "¡Marchando un kilo! Son dos euros. ¿Algo más?",
      },
      { needs: [["kilo", "naranja"]], reply: "Marchando un kilo de naranjas. ¿Algo más?" },
      { needs: [["cuanto", "precio", "cuesta", "vale"]], reply: "Las naranjas están a dos euros el kilo. ¿Le pongo?" },
    ],
    goal: [["kilo", "naranja"], ["cuanto", "cuesta", "precio", "vale", "cuestan"]],
    corrections: [{ bad: "una kilo", good: "un kilo", note: "try: un kilo (kilo is masculine)" }],
    translations: {
      "¿Qué le pongo, joven? Tengo naranjas muy dulces.": "What can I get you, young one? I have very sweet oranges.",
      "¿Cómo? ¿Cuántas naranjas, joven?": "Sorry? How many oranges, young one?",
      "¡Marchando un kilo! Son dos euros. ¿Algo más?": "One kilo coming up! That's two euros. Anything else?",
      "Marchando un kilo de naranjas. ¿Algo más?": "One kilo of oranges coming up. Anything else?",
      "Las naranjas están a dos euros el kilo. ¿Le pongo?": "The oranges are two euros a kilo. Shall I get you some?",
      "Dígame, joven, ¿qué desea?": "Tell me, young one, what would you like?",
    },
    hints: ["Ask for the amount, then the price.", '"Quiero un kilo de naranjas. ¿Cuánto cuesta?"'],
    vocab: [
      { term: "naranja", meaning: "orange" },
      { term: "un kilo", meaning: "a kilo" },
      { term: "¿cuánto cuesta?", meaning: "how much does it cost?" },
      { term: "por favor", meaning: "please" },
    ],
  },

  cafe: {
    opening: "Buenas. ¿Qué le pongo de tomar?",
    fallback: "¿Le apetece un café? Tengo un cortado buenísimo.",
    rules: [
      { needs: [["cafe", "cortado"], ["gracias", "por favor"]], reply: "Marchando un café. ¡Gracias a ti!" },
      { needs: [["cafe", "cortado"]], reply: "Un café enseguida. ¿Algo más?" },
    ],
    goal: [["cafe", "cortado"]],
    translations: {
      "Buenas. ¿Qué le pongo de tomar?": "Hello. What can I get you to drink?",
      "Marchando un café. ¡Gracias a ti!": "One coffee coming up. Thank you!",
      "Un café enseguida. ¿Algo más?": "A coffee right away. Anything else?",
      "¿Le apetece un café? Tengo un cortado buenísimo.": "Fancy a coffee? I make a great cortado.",
    },
    hints: ["Order politely and thank them.", '"Un café, por favor. Gracias."'],
    vocab: [
      { term: "un café", meaning: "a coffee" },
      { term: "cortado", meaning: "coffee with a dash of milk" },
      { term: "por favor", meaning: "please" },
      { term: "la cuenta", meaning: "the bill" },
    ],
  },

  harbor: {
    opening: "Buenas, viajera. ¿A dónde te llevo?",
    fallback: "Aquí hay muchos barcos. ¿Cuál buscas?",
    rules: [
      { needs: [["isla", "barco"], ["hora"]], reply: "El barco a la isla sale a las cinco. ¿Te saco billete?" },
      { needs: [["isla", "barco"]], reply: "Ah, a la isla. ¿Y a qué hora quieres ir?" },
    ],
    goal: [["isla", "barco"], ["hora"]],
    translations: {
      "Buenas, viajera. ¿A dónde te llevo?": "Hello, traveler. Where shall I take you?",
      "El barco a la isla sale a las cinco. ¿Te saco billete?": "The boat to the island leaves at five. Shall I get you a ticket?",
      "Ah, a la isla. ¿Y a qué hora quieres ir?": "Ah, to the island. And what time do you want to go?",
      "Aquí hay muchos barcos. ¿Cuál buscas?": "There are many boats here. Which one are you looking for?",
    },
    hints: ["Ask which boat and what time.", '"¿Qué barco va a la isla? ¿A qué hora sale?"'],
    vocab: [
      { term: "el barco", meaning: "the boat" },
      { term: "la isla", meaning: "the island" },
      { term: "¿a qué hora?", meaning: "at what time?" },
      { term: "el billete", meaning: "the ticket" },
    ],
  },

  platform: {
    opening: "El andén está cerrando. ¿Qué ocurre?",
    fallback: "Tiene que darse prisa. ¿Qué necesita?",
    rules: [
      { needs: [["perdi", "perdido"], ["tren", "ultimo"]], reply: "Vaya… está bien, sube rápido al último. ¡Corre!" },
      { needs: [["tren"]], reply: "¿Su tren? Dígame qué pasó." },
    ],
    goal: [["perdi", "perdido"], ["tren", "ultimo"]],
    translations: {
      "El andén está cerrando. ¿Qué ocurre?": "The platform is closing. What's the matter?",
      "Vaya… está bien, sube rápido al último. ¡Corre!": "Oh dear… alright, hurry onto the last one. Run!",
      "¿Su tren? Dígame qué pasó.": "Your train? Tell me what happened.",
      "Tiene que darse prisa. ¿Qué necesita?": "You need to hurry. What do you need?",
    },
    hints: ["Explain you missed your train, then ask to board.", '"Perdí mi tren. ¿Puedo subir al último, por favor?"'],
    vocab: [
      { term: "el tren", meaning: "the train" },
      { term: "perdí", meaning: "I missed / lost" },
      { term: "el último", meaning: "the last one" },
      { term: "por favor", meaning: "please" },
    ],
  },
};

export default es;
