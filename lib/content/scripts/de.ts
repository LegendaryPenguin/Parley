import type { LangScript } from "./types";

// German (de). Keywords are written without accents/case — the matcher
// normalizes both sides (lowercases and strips accents/punctuation). Umlauts
// are folded too, so keywords use ASCII-folded forms (e.g. "mochte", "wofur").
const de: LangScript = {
  border: {
    opening: "Guten Tag! Woher kommen Sie heute?",
    fallback: "Hmm… sagen Sie, woher kommen Sie?",
    rules: [
      {
        needs: [["ich komme", "komme aus", "ich bin aus", "aus "], ["ich fahre", "ich gehe", "ich reise", "nach "]],
        reply: "Perfekt. Gute Reise, Reisende!",
      },
      { needs: [["ich fahre", "ich gehe", "ich reise", "nach "]], reply: "Sehr gut. Gute Reise!" },
      { needs: [["ich komme", "komme aus", "ich bin aus", "aus "]], reply: "Ah, sehr gut! Und wohin reisen Sie?" },
    ],
    goal: [["ich komme", "komme aus", "ich bin aus", "aus "], ["ich fahre", "ich gehe", "ich reise", "nach "]],
    corrections: [
      { bad: "ich komme von", good: "ich komme aus", note: "try: ich komme aus… (for a country or city)" },
    ],
    translations: {
      "Guten Tag! Woher kommen Sie heute?": "Good day! Where do you come from today?",
      "Hmm… sagen Sie, woher kommen Sie?": "Hmm… tell me, where do you come from?",
      "Perfekt. Gute Reise, Reisende!": "Perfect. Have a good trip, traveler!",
      "Sehr gut. Gute Reise!": "Very good. Have a good trip!",
      "Ah, sehr gut! Und wohin reisen Sie?": "Ah, very good! And where are you going?",
    },
    hints: [
      "Greet them and say where you're from and where you're going.",
      '"Guten Tag, ich komme aus Kanada. Ich fahre nach Berlin."',
    ],
    vocab: [
      { term: "guten Tag", meaning: "good day / hello" },
      { term: "ich komme aus", meaning: "I come from" },
      { term: "ich fahre nach", meaning: "I am going to" },
      { term: "danke", meaning: "thank you" },
    ],
  },

  market: {
    opening: "Guten Tag! Was darf es sein? Ich habe schöne süße Orangen.",
    fallback: "Sagen Sie, was brauchen Sie?",
    rules: [
      { needs: [["ein kilo"]], avoid: ["orange", "orangen"], reply: "Wie bitte? Ein Kilo wovon?" },
      {
        needs: [["kilo", "orange", "orangen"], ["wie viel", "wieviel", "was kostet", "kostet", "kosten", "preis"]],
        reply: "Hier, ein Kilo! Das macht zwei Euro. Sonst noch etwas?",
      },
      { needs: [["kilo", "orange", "orangen"]], reply: "Ein Kilo Orangen, bitte schön! Sonst noch etwas?" },
      { needs: [["wie viel", "wieviel", "was kostet", "kostet", "kosten", "preis"]], reply: "Die Orangen kosten zwei Euro das Kilo. Möchten Sie welche?" },
    ],
    goal: [["kilo", "orange", "orangen"], ["wie viel", "wieviel", "was kostet", "kostet", "kosten", "preis"]],
    corrections: [
      { bad: "eine kilo", good: "ein kilo", note: "try: ein Kilo (Kilo is neuter: ein Kilo)" },
    ],
    translations: {
      "Guten Tag! Was darf es sein? Ich habe schöne süße Orangen.":
        "Good day! What can I get you? I have lovely sweet oranges.",
      "Sagen Sie, was brauchen Sie?": "Tell me, what do you need?",
      "Wie bitte? Ein Kilo wovon?": "Sorry? A kilo of what?",
      "Hier, ein Kilo! Das macht zwei Euro. Sonst noch etwas?": "Here, a kilo! That's two euros. Anything else?",
      "Ein Kilo Orangen, bitte schön! Sonst noch etwas?": "A kilo of oranges, here you go! Anything else?",
      "Die Orangen kosten zwei Euro das Kilo. Möchten Sie welche?":
        "The oranges cost two euros a kilo. Would you like some?",
    },
    hints: [
      "Ask for the amount, then ask the price.",
      '"Ich möchte ein Kilo Orangen. Wie viel kostet das?"',
    ],
    vocab: [
      { term: "die Orange", meaning: "the orange" },
      { term: "ein Kilo", meaning: "a kilo" },
      { term: "wie viel kostet das?", meaning: "how much does it cost?" },
      { term: "bitte", meaning: "please" },
    ],
  },

  cafe: {
    opening: "Guten Tag. Was möchten Sie trinken?",
    fallback: "Vielleicht einen kleinen Kaffee? Ich mache einen ausgezeichneten.",
    rules: [
      { needs: [["kaffee"], ["bitte", "danke"]], reply: "Einen Kaffee, sofort. Danke schön!" },
      { needs: [["kaffee"]], reply: "Einen Kaffee, kommt sofort. Sonst noch etwas?" },
    ],
    goal: [["kaffee"]],
    corrections: [
      { bad: "eine kaffee", good: "einen Kaffee", note: "try: einen Kaffee (Kaffee is masculine, accusative: einen)" },
    ],
    translations: {
      "Guten Tag. Was möchten Sie trinken?": "Good day. What would you like to drink?",
      "Vielleicht einen kleinen Kaffee? Ich mache einen ausgezeichneten.": "Perhaps a little coffee? I make an excellent one.",
      "Einen Kaffee, sofort. Danke schön!": "A coffee, right away. Thank you!",
      "Einen Kaffee, kommt sofort. Sonst noch etwas?": "A coffee, coming right up. Anything else?",
    },
    hints: [
      "Order a coffee politely and say please.",
      '"Einen Kaffee, bitte. Danke."',
    ],
    vocab: [
      { term: "der Kaffee", meaning: "the coffee" },
      { term: "ich möchte", meaning: "I would like" },
      { term: "bitte", meaning: "please" },
      { term: "die Rechnung", meaning: "the bill" },
    ],
  },

  harbor: {
    opening: "Guten Tag, Reisende. Wohin möchten Sie?",
    fallback: "Hier liegen viele Boote. Welches suchen Sie?",
    rules: [
      {
        needs: [["boot", "schiff", "fahre", "fahrt"], ["insel"], ["wann", "uhr", "wie spat", "abfahrt", "ab "]],
        reply: "Das Boot zur Insel fährt um fünf Uhr ab. Soll ich Ihnen ein Ticket geben?",
      },
      { needs: [["boot", "schiff", "fahre", "fahrt"], ["insel"]], reply: "Ah, zur Insel. Und um wie viel Uhr möchten Sie fahren?" },
    ],
    goal: [["boot", "schiff", "fahre", "fahrt"], ["insel"], ["wann", "uhr", "wie spat", "abfahrt", "ab "]],
    corrections: [
      { bad: "welcher boot", good: "welches Boot", note: "try: welches Boot (Boot is neuter: welches)" },
    ],
    translations: {
      "Guten Tag, Reisende. Wohin möchten Sie?": "Good day, traveler. Where would you like to go?",
      "Hier liegen viele Boote. Welches suchen Sie?": "There are many boats here. Which one are you looking for?",
      "Das Boot zur Insel fährt um fünf Uhr ab. Soll ich Ihnen ein Ticket geben?":
        "The boat to the island leaves at five o'clock. Shall I get you a ticket?",
      "Ah, zur Insel. Und um wie viel Uhr möchten Sie fahren?": "Ah, to the island. And what time would you like to leave?",
    },
    hints: [
      "Ask which boat goes to the island and what time it leaves.",
      '"Welches Boot fährt zur Insel? Um wie viel Uhr fährt es ab?"',
    ],
    vocab: [
      { term: "das Boot", meaning: "the boat" },
      { term: "die Insel", meaning: "the island" },
      { term: "um wie viel Uhr?", meaning: "at what time?" },
      { term: "das Ticket", meaning: "the ticket" },
    ],
  },

  platform: {
    opening: "Der Bahnsteig schließt gleich. Was ist denn los?",
    fallback: "Sie müssen sich beeilen. Was brauchen Sie?",
    rules: [
      {
        needs: [["verpasst", "verpasse", "verloren"], ["zug"], ["letzten", "letzte", "einsteigen", "mitfahren", "nehmen"]],
        reply: "Oh je… also gut, steigen Sie schnell in den letzten ein. Schnell!",
      },
      { needs: [["verpasst", "verpasse", "verloren"], ["zug"]], reply: "Sie haben Ihren Zug verpasst? Was möchten Sie tun?" },
      { needs: [["zug"]], reply: "Ihr Zug? Erzählen Sie, was passiert ist." },
    ],
    goal: [["verpasst", "verpasse", "verloren"], ["zug"], ["letzten", "letzte", "einsteigen", "mitfahren", "nehmen"]],
    corrections: [
      { bad: "ich habe meinen zug verloren", good: "ich habe meinen Zug verpasst", note: "try: ich habe meinen Zug verpasst (you 'miss' a train, not 'lose' it)" },
    ],
    translations: {
      "Der Bahnsteig schließt gleich. Was ist denn los?": "The platform is closing soon. What's going on?",
      "Sie müssen sich beeilen. Was brauchen Sie?": "You need to hurry. What do you need?",
      "Oh je… also gut, steigen Sie schnell in den letzten ein. Schnell!": "Oh dear… alright, hurry and get on the last one. Quick!",
      "Sie haben Ihren Zug verpasst? Was möchten Sie tun?": "You missed your train? What do you want to do?",
      "Ihr Zug? Erzählen Sie, was passiert ist.": "Your train? Tell me what happened.",
    },
    hints: [
      "Explain you missed your train, then ask to board the last one.",
      '"Ich habe meinen Zug verpasst. Kann ich in den letzten einsteigen, bitte?"',
    ],
    vocab: [
      { term: "der Zug", meaning: "the train" },
      { term: "ich habe verpasst", meaning: "I missed" },
      { term: "der letzte", meaning: "the last one" },
      { term: "einsteigen", meaning: "to board / get on" },
    ],
  },
};

export default de;
