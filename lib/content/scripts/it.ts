import type { LangScript } from "./types";

// Italian (it). Keywords are written without accents/case — the matcher
// normalizes both sides (lowercases and strips accents/punctuation).
const it: LangScript = {
  border: {
    opening: "Buongiorno! Da dove viene oggi?",
    fallback: "Mhm… mi dica, da dove viene?",
    rules: [
      {
        needs: [["vengo da", "sono di", "arrivo da"], ["vado a", "vado in", "vado"]],
        reply: "Perfetto. Buon viaggio, viaggiatore!",
      },
      { needs: [["vado a", "vado in", "vado"]], reply: "Benissimo. Buon viaggio!" },
      { needs: [["vengo da", "sono di", "arrivo da"]], reply: "Ah, molto bene! E dove va?" },
    ],
    goal: [["vengo da", "sono di", "arrivo da"], ["vado a", "vado in", "vado"]],
    corrections: [
      { bad: "sono da", good: "vengo da", note: "try: vengo da… (for where you're from)" },
    ],
    translations: {
      "Buongiorno! Da dove viene oggi?": "Good morning! Where do you come from today?",
      "Mhm… mi dica, da dove viene?": "Hmm… tell me, where do you come from?",
      "Perfetto. Buon viaggio, viaggiatore!": "Perfect. Have a good trip, traveler!",
      "Benissimo. Buon viaggio!": "Very good. Have a good trip!",
      "Ah, molto bene! E dove va?": "Ah, very good! And where are you going?",
    },
    hints: [
      "Greet them and say where you're from and where you're going.",
      '"Buongiorno, vengo dal Canada. Vado a Roma."',
    ],
    vocab: [
      { term: "buongiorno", meaning: "good morning / hello" },
      { term: "vengo da", meaning: "I come from" },
      { term: "vado a", meaning: "I am going to" },
      { term: "grazie", meaning: "thank you" },
    ],
  },

  market: {
    opening: "Buongiorno! Cosa le do? Ho delle arance dolcissime.",
    fallback: "Mi dica, di cosa ha bisogno?",
    rules: [
      { needs: [["una chilo"]], reply: "Come, scusi? Quante arance vuole?" },
      {
        needs: [["chilo", "arance", "arancia"], ["quanto", "costa", "costano", "prezzo"]],
        reply: "Ecco un chilo! Sono due euro. Altro?",
      },
      { needs: [["chilo", "arance", "arancia"]], reply: "Un chilo di arance, ecco! Altro?" },
      { needs: [["quanto", "costa", "costano", "prezzo"]], reply: "Le arance costano due euro al chilo. Gliene metto un po'?" },
    ],
    goal: [["chilo", "arance", "arancia"], ["quanto", "costa", "costano", "prezzo"]],
    corrections: [
      { bad: "una chilo", good: "un chilo", note: "try: un chilo (chilo is masculine)" },
    ],
    translations: {
      "Buongiorno! Cosa le do? Ho delle arance dolcissime.":
        "Good morning! What can I get you? I have very sweet oranges.",
      "Mi dica, di cosa ha bisogno?": "Tell me, what do you need?",
      "Come, scusi? Quante arance vuole?": "Sorry? How many oranges do you want?",
      "Ecco un chilo! Sono due euro. Altro?": "Here's a kilo! That's two euros. Anything else?",
      "Un chilo di arance, ecco! Altro?": "A kilo of oranges, here you go! Anything else?",
      "Le arance costano due euro al chilo. Gliene metto un po'?":
        "The oranges cost two euros a kilo. Shall I get you some?",
    },
    hints: [
      "Ask for the amount, then ask the price.",
      '"Vorrei un chilo di arance. Quanto costa?"',
    ],
    vocab: [
      { term: "un'arancia", meaning: "an orange" },
      { term: "un chilo", meaning: "a kilo" },
      { term: "quanto costa?", meaning: "how much does it cost?" },
      { term: "per favore", meaning: "please" },
    ],
  },

  cafe: {
    opening: "Buongiorno. Cosa le porto da bere?",
    fallback: "Un caffè magari? Lo faccio ottimo.",
    rules: [
      { needs: [["caffe"], ["grazie", "per favore", "per piacere", "prego"]], reply: "Un caffè subito. Grazie a lei!" },
      { needs: [["caffe"]], reply: "Un caffè, arriva subito. Altro?" },
    ],
    goal: [["caffe"]],
    corrections: [
      { bad: "una caffe", good: "un caffè", note: "try: un caffè (caffè is masculine)" },
    ],
    translations: {
      "Buongiorno. Cosa le porto da bere?": "Good morning. What can I bring you to drink?",
      "Un caffè magari? Lo faccio ottimo.": "A coffee perhaps? I make an excellent one.",
      "Un caffè subito. Grazie a lei!": "A coffee right away. Thank you!",
      "Un caffè, arriva subito. Altro?": "A coffee, coming right up. Anything else?",
    },
    hints: [
      "Order a coffee politely and say thanks.",
      '"Un caffè, per favore. Grazie."',
    ],
    vocab: [
      { term: "un caffè", meaning: "a coffee" },
      { term: "vorrei", meaning: "I would like" },
      { term: "per favore", meaning: "please" },
      { term: "il conto", meaning: "the bill" },
    ],
  },

  harbor: {
    opening: "Buongiorno, viaggiatore. Dove vuole andare?",
    fallback: "Ci sono tante barche qui. Quale cerca?",
    rules: [
      {
        needs: [["barca", "traghetto", "isola"], ["che ora", "quando", "parte", "a che ora"]],
        reply: "Il traghetto per l'isola parte alle cinque. Le prendo un biglietto?",
      },
      { needs: [["barca", "traghetto", "isola"]], reply: "Ah, per l'isola. E a che ora vuole partire?" },
    ],
    goal: [["barca", "traghetto", "isola"], ["che ora", "quando", "parte", "a che ora"]],
    corrections: [
      { bad: "la isola", good: "l'isola", note: "try: l'isola (drop the vowel before a vowel sound)" },
    ],
    translations: {
      "Buongiorno, viaggiatore. Dove vuole andare?": "Good morning, traveler. Where do you want to go?",
      "Ci sono tante barche qui. Quale cerca?": "There are many boats here. Which one are you looking for?",
      "Il traghetto per l'isola parte alle cinque. Le prendo un biglietto?":
        "The ferry to the island leaves at five. Shall I get you a ticket?",
      "Ah, per l'isola. E a che ora vuole partire?": "Ah, to the island. And what time do you want to leave?",
    },
    hints: [
      "Ask which boat goes to the island and what time it leaves.",
      '"Quale barca va all\'isola? A che ora parte?"',
    ],
    vocab: [
      { term: "la barca", meaning: "the boat" },
      { term: "l'isola", meaning: "the island" },
      { term: "a che ora?", meaning: "at what time?" },
      { term: "il biglietto", meaning: "the ticket" },
    ],
  },

  platform: {
    opening: "Il binario sta chiudendo. Cosa succede?",
    fallback: "Deve sbrigarsi. Di cosa ha bisogno?",
    rules: [
      {
        needs: [["perso", "perduto", "mancato"], ["treno"], ["ultimo", "salire", "prendere"]],
        reply: "Oddio… va bene, salga in fretta sull'ultimo. Presto!",
      },
      { needs: [["perso", "perduto", "mancato"], ["treno"]], reply: "Ha perso il treno? Cosa vuole fare?" },
      { needs: [["treno"]], reply: "Il suo treno? Mi dica cos'è successo." },
    ],
    goal: [["perso", "perduto", "mancato"], ["treno"], ["ultimo", "salire", "prendere"]],
    corrections: [
      { bad: "ho mancato il treno", good: "ho perso il treno", note: "try: ho perso il treno (you 'lose' a train in Italian, not 'miss' it)" },
    ],
    translations: {
      "Il binario sta chiudendo. Cosa succede?": "The platform is closing. What's going on?",
      "Deve sbrigarsi. Di cosa ha bisogno?": "You need to hurry. What do you need?",
      "Oddio… va bene, salga in fretta sull'ultimo. Presto!": "Oh dear… alright, hurry onto the last one. Quick!",
      "Ha perso il treno? Cosa vuole fare?": "You missed your train? What do you want to do?",
      "Il suo treno? Mi dica cos'è successo.": "Your train? Tell me what happened.",
    },
    hints: [
      "Explain you missed your train, then ask to board the last one.",
      '"Ho perso il treno. Posso salire sull\'ultimo, per favore?"',
    ],
    vocab: [
      { term: "il treno", meaning: "the train" },
      { term: "ho perso", meaning: "I missed" },
      { term: "l'ultimo", meaning: "the last one" },
      { term: "salire", meaning: "to board / get on" },
    ],
  },
};

export default it;
