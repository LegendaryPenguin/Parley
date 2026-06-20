import type { LangScript } from "./types";

// French (fr). Keywords are written without accents/case — the matcher
// normalizes both sides (lowercases and strips accents/punctuation).
const fr: LangScript = {
  border: {
    opening: "Bonjour ! D'où venez-vous aujourd'hui ?",
    fallback: "Hmm… dites-moi, d'où venez-vous ?",
    rules: [
      {
        needs: [["je viens", "je suis de", "de "], ["je vais", "vais a", "a "]],
        reply: "Parfait. Bon voyage, voyageur !",
      },
      { needs: [["je vais", "vais a", "a "]], reply: "Très bien. Bon voyage !" },
      { needs: [["je viens", "je suis de", "de "]], reply: "Ah, très bien ! Et où allez-vous ?" },
    ],
    goal: [["je viens", "je suis de", "de "], ["je vais", "vais a", "a "]],
    corrections: [
      { bad: "je suis de la", good: "je viens de", note: "try: je viens de… (for where you're from)" },
    ],
    translations: {
      "Bonjour ! D'où venez-vous aujourd'hui ?": "Hello! Where do you come from today?",
      "Hmm… dites-moi, d'où venez-vous ?": "Hmm… tell me, where do you come from?",
      "Parfait. Bon voyage, voyageur !": "Perfect. Have a good trip, traveler!",
      "Très bien. Bon voyage !": "Very good. Have a good trip!",
      "Ah, très bien ! Et où allez-vous ?": "Ah, very good! And where are you going?",
    },
    hints: [
      "Greet them and say where you're from and where you're going.",
      '"Bonjour, je viens du Canada. Je vais à Paris."',
    ],
    vocab: [
      { term: "bonjour", meaning: "hello" },
      { term: "je viens de", meaning: "I come from" },
      { term: "je vais à", meaning: "I am going to" },
      { term: "merci", meaning: "thank you" },
    ],
  },

  market: {
    opening: "Bonjour ! Qu'est-ce que je vous sers ? J'ai des oranges bien sucrées.",
    fallback: "Dites-moi, qu'est-ce qu'il vous faut ?",
    rules: [
      { needs: [["une kilo"]], reply: "Pardon ? Combien d'oranges voulez-vous ?" },
      {
        needs: [["kilo", "orange"], ["combien", "prix", "coute", "coutent"]],
        reply: "Voilà un kilo ! Ça fait deux euros. Et avec ça ?",
      },
      { needs: [["kilo", "orange"]], reply: "Un kilo d'oranges, voilà ! Et avec ça ?" },
      { needs: [["combien", "prix", "coute", "coutent"]], reply: "Les oranges sont à deux euros le kilo. Je vous en mets ?" },
    ],
    goal: [["kilo", "orange"], ["combien", "prix", "coute", "coutent"]],
    corrections: [
      { bad: "une kilo", good: "un kilo", note: "try: un kilo (kilo is masculine)" },
    ],
    translations: {
      "Bonjour ! Qu'est-ce que je vous sers ? J'ai des oranges bien sucrées.":
        "Hello! What can I get you? I have very sweet oranges.",
      "Dites-moi, qu'est-ce qu'il vous faut ?": "Tell me, what do you need?",
      "Pardon ? Combien d'oranges voulez-vous ?": "Sorry? How many oranges do you want?",
      "Voilà un kilo ! Ça fait deux euros. Et avec ça ?": "Here's a kilo! That's two euros. Anything else?",
      "Un kilo d'oranges, voilà ! Et avec ça ?": "A kilo of oranges, here you go! Anything else?",
      "Les oranges sont à deux euros le kilo. Je vous en mets ?":
        "The oranges are two euros a kilo. Shall I get you some?",
    },
    hints: [
      "Ask for the amount, then ask the price.",
      '"Je voudrais un kilo d\'oranges. Combien ça coûte ?"',
    ],
    vocab: [
      { term: "une orange", meaning: "an orange" },
      { term: "un kilo", meaning: "a kilo" },
      { term: "combien ça coûte ?", meaning: "how much does it cost?" },
      { term: "s'il vous plaît", meaning: "please" },
    ],
  },

  cafe: {
    opening: "Bonjour. Qu'est-ce que je vous sers à boire ?",
    fallback: "Un petit café peut-être ? J'en fais un excellent.",
    rules: [
      { needs: [["cafe"], ["merci", "s'il vous plait", "sil vous plait", "plait"]], reply: "Un café tout de suite. Merci à vous !" },
      { needs: [["cafe"]], reply: "Un café, c'est parti. Et avec ça ?" },
    ],
    goal: [["cafe"]],
    corrections: [
      { bad: "une cafe", good: "un café", note: "try: un café (café is masculine)" },
    ],
    translations: {
      "Bonjour. Qu'est-ce que je vous sers à boire ?": "Hello. What can I get you to drink?",
      "Un petit café peut-être ? J'en fais un excellent.": "A little coffee perhaps? I make an excellent one.",
      "Un café tout de suite. Merci à vous !": "A coffee right away. Thank you!",
      "Un café, c'est parti. Et avec ça ?": "A coffee, coming right up. Anything else?",
    },
    hints: [
      "Order a coffee politely and say thanks.",
      '"Un café, s\'il vous plaît. Merci."',
    ],
    vocab: [
      { term: "un café", meaning: "a coffee" },
      { term: "je voudrais", meaning: "I would like" },
      { term: "s'il vous plaît", meaning: "please" },
      { term: "l'addition", meaning: "the bill" },
    ],
  },

  harbor: {
    opening: "Bonjour, voyageur. Où voulez-vous aller ?",
    fallback: "Il y a beaucoup de bateaux ici. Lequel cherchez-vous ?",
    rules: [
      {
        needs: [["bateau", "ile"], ["heure", "quand", "part"]],
        reply: "Le bateau pour l'île part à cinq heures. Je vous prends un billet ?",
      },
      { needs: [["bateau", "ile"]], reply: "Ah, pour l'île. Et à quelle heure voulez-vous partir ?" },
    ],
    goal: [["bateau", "ile"], ["heure", "quand", "part"]],
    corrections: [
      { bad: "le ile", good: "l'île", note: "try: l'île (drop the vowel before a vowel sound)" },
    ],
    translations: {
      "Bonjour, voyageur. Où voulez-vous aller ?": "Hello, traveler. Where do you want to go?",
      "Il y a beaucoup de bateaux ici. Lequel cherchez-vous ?": "There are many boats here. Which one are you looking for?",
      "Le bateau pour l'île part à cinq heures. Je vous prends un billet ?":
        "The boat to the island leaves at five. Shall I get you a ticket?",
      "Ah, pour l'île. Et à quelle heure voulez-vous partir ?": "Ah, to the island. And what time do you want to leave?",
    },
    hints: [
      "Ask which boat goes to the island and what time it leaves.",
      '"Quel bateau va à l\'île ? À quelle heure part-il ?"',
    ],
    vocab: [
      { term: "le bateau", meaning: "the boat" },
      { term: "l'île", meaning: "the island" },
      { term: "à quelle heure ?", meaning: "at what time?" },
      { term: "le billet", meaning: "the ticket" },
    ],
  },

  platform: {
    opening: "Le quai est en train de fermer. Qu'est-ce qui se passe ?",
    fallback: "Il faut vous dépêcher. De quoi avez-vous besoin ?",
    rules: [
      {
        needs: [["rate", "manque", "perdu"], ["train"], ["dernier", "monter", "prendre"]],
        reply: "Oh là… d'accord, montez vite dans le dernier. Vite !",
      },
      { needs: [["rate", "manque", "perdu"], ["train"]], reply: "Vous avez raté votre train ? Que voulez-vous faire ?" },
      { needs: [["train"]], reply: "Votre train ? Dites-moi ce qui s'est passé." },
    ],
    goal: [["rate", "manque", "perdu"], ["train"], ["dernier", "monter", "prendre"]],
    corrections: [
      { bad: "j'ai perdu mon train", good: "j'ai raté mon train", note: "try: j'ai raté mon train (you 'miss' a train, not 'lose' it)" },
    ],
    translations: {
      "Le quai est en train de fermer. Qu'est-ce qui se passe ?": "The platform is closing. What's going on?",
      "Il faut vous dépêcher. De quoi avez-vous besoin ?": "You need to hurry. What do you need?",
      "Oh là… d'accord, montez vite dans le dernier. Vite !": "Oh dear… alright, hurry onto the last one. Quick!",
      "Vous avez raté votre train ? Que voulez-vous faire ?": "You missed your train? What do you want to do?",
      "Votre train ? Dites-moi ce qui s'est passé.": "Your train? Tell me what happened.",
    },
    hints: [
      "Explain you missed your train, then ask to board the last one.",
      '"J\'ai raté mon train. Je peux monter dans le dernier, s\'il vous plaît ?"',
    ],
    vocab: [
      { term: "le train", meaning: "the train" },
      { term: "j'ai raté", meaning: "I missed" },
      { term: "le dernier", meaning: "the last one" },
      { term: "monter", meaning: "to board / get on" },
    ],
  },
};

export default fr;
