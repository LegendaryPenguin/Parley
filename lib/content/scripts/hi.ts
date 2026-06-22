import type { LangScript } from "./types";

// Hindi (hi). NPC lines are in Devanagari. The matcher lowercases and strips
// Latin accents/punctuation but does NOT transliterate, so every keyword group
// includes both Devanagari and common romanized ("Hinglish") spellings.
const hi: LangScript = {
  border: {
    opening: "नमस्ते! आज आप कहाँ से आ रहे हैं?",
    fallback: "हम्म… बताइए, आप कहाँ से हैं?",
    rules: [
      {
        needs: [
          ["से हूं", "से हूँ", "से आया", "से आई", "से आ रहा", "se hoon", "se hun", "se aaya", "se aayi", "from"],
          ["जा रहा", "जा रही", "जाना", "जाऊँगा", "ja raha", "ja rahi", "jaa raha", "jaana", "jaunga", "going", "to "],
        ],
        reply: "बहुत बढ़िया। आपकी यात्रा मंगलमय हो, यात्री!",
      },
      {
        needs: [["से हूं", "से हूँ", "से आया", "से आई", "से आ रहा", "se hoon", "se hun", "se aaya", "se aayi", "from"]],
        reply: "अच्छा! और आप कहाँ जा रहे हैं?",
      },
    ],
    goal: [
      ["से हूं", "से हूँ", "से आया", "से आई", "से आ रहा", "se hoon", "se hun", "se aaya", "se aayi", "from"],
      ["जा रहा", "जा रही", "जाना", "जाऊँगा", "ja raha", "ja rahi", "jaa raha", "jaana", "jaunga", "going", "to "],
    ],
    translations: {
      "नमस्ते! आज आप कहाँ से आ रहे हैं?": "Hello! Where are you coming from today?",
      "अच्छा! और आप कहाँ जा रहे हैं?": "Nice! And where are you going?",
      "बहुत बढ़िया। आपकी यात्रा मंगलमय हो, यात्री!": "Excellent. Have a wonderful journey, traveler!",
      "हम्म… बताइए, आप कहाँ से हैं?": "Hmm… tell me, where are you from?",
    },
    readings: {
      "नमस्ते! आज आप कहाँ से आ रहे हैं?": "Namaste! Aaj aap kahaan se aa rahe hain?",
      "अच्छा! और आप कहाँ जा रहे हैं?": "Achchha! Aur aap kahaan jaa rahe hain?",
      "बहुत बढ़िया। आपकी यात्रा मंगलमय हो, यात्री!": "Bahut badhiya. Aapki yaatra mangalmay ho, yaatri!",
      "हम्म… बताइए, आप कहाँ से हैं?": "Hmm… bataaiye, aap kahaan se hain?",
    },
    hints: ["Greet them and say where you're from.", '"नमस्ते, मैं कनाडा से हूँ। मैं दिल्ली जा रहा हूँ।"'],
    vocab: [
      { term: "नमस्ते", reading: "namaste", meaning: "hello" },
      { term: "से हूँ", reading: "se hoon", meaning: "I am from" },
      { term: "जा रहा हूँ", reading: "jaa raha hoon", meaning: "I am going to" },
      { term: "धन्यवाद", reading: "dhanyavaad", meaning: "thank you" },
    ],
  },

  market: {
    opening: "क्या लूँ, बाबू? बहुत मीठे संतरे हैं।",
    fallback: "बताइए साहब, क्या चाहिए?",
    rules: [
      {
        needs: [
          ["किलो", "kilo"],
          ["संतरा", "संतरे", "santra", "santre", "orange"],
          ["कितने", "कितना", "दाम", "कीमत", "भाव", "kitne", "kitna", "daam", "keemat", "bhav", "price"],
        ],
        reply: "लीजिए एक किलो! चालीस रुपये हुए। और कुछ?",
      },
      {
        needs: [
          ["किलो", "kilo"],
          ["संतरा", "संतरे", "santra", "santre", "orange"],
        ],
        reply: "एक किलो संतरे तैयार। और कुछ चाहिए?",
      },
      {
        needs: [["कितने", "कितना", "दाम", "कीमत", "भाव", "kitne", "kitna", "daam", "keemat", "bhav", "price"]],
        reply: "संतरे चालीस रुपये किलो हैं। तौल दूँ?",
      },
    ],
    goal: [
      ["किलो", "kilo"],
      ["संतरा", "संतरे", "santra", "santre", "orange"],
      ["कितने", "कितना", "दाम", "कीमत", "भाव", "kitne", "kitna", "daam", "keemat", "bhav", "price"],
    ],
    corrections: [{ bad: "एक किलो संतरा", good: "एक किलो संतरे", note: "try: एक किलो संतरे (plural for a kilo)" }],
    translations: {
      "क्या लूँ, बाबू? बहुत मीठे संतरे हैं।": "What can I get you, sir? The oranges are very sweet.",
      "लीजिए एक किलो! चालीस रुपये हुए। और कुछ?": "Here's one kilo! That's forty rupees. Anything else?",
      "एक किलो संतरे तैयार। और कुछ चाहिए?": "One kilo of oranges ready. Anything else?",
      "संतरे चालीस रुपये किलो हैं। तौल दूँ?": "The oranges are forty rupees a kilo. Shall I weigh some?",
      "बताइए साहब, क्या चाहिए?": "Tell me, sir, what would you like?",
    },
    readings: {
      "क्या लूँ, बाबू? बहुत मीठे संतरे हैं।": "Kya loon, babu? Bahut meethe santre hain.",
      "लीजिए एक किलो! चालीस रुपये हुए। और कुछ?": "Lijiye ek kilo! Chaalees rupaye hue. Aur kuchh?",
      "एक किलो संतरे तैयार। और कुछ चाहिए?": "Ek kilo santre taiyaar. Aur kuchh chaahiye?",
      "संतरे चालीस रुपये किलो हैं। तौल दूँ?": "Santre chaalees rupaye kilo hain. Taul doon?",
      "बताइए साहब, क्या चाहिए?": "Bataaiye saahab, kya chaahiye?",
    },
    hints: ["Ask for the amount, then the price.", '"मुझे एक किलो संतरे चाहिए। कितने के हैं?"'],
    vocab: [
      { term: "संतरे", reading: "santre", meaning: "oranges" },
      { term: "एक किलो", reading: "ek kilo", meaning: "a kilo" },
      { term: "कितने के हैं?", reading: "kitne ke hain?", meaning: "how much do they cost?" },
      { term: "कृपया", reading: "kripya", meaning: "please" },
    ],
  },

  cafe: {
    opening: "नमस्ते। क्या पिएँगे आप?",
    fallback: "एक चाय हो जाए? बढ़िया कॉफ़ी भी है।",
    rules: [
      {
        needs: [
          ["चाय", "कॉफ़ी", "कॉफी", "chai", "chaay", "coffee", "kofi"],
          ["कृपया", "धन्यवाद", "शुक्रिया", "kripya", "dhanyavaad", "shukriya", "please", "thanks", "thank"],
        ],
        reply: "जी ज़रूर, अभी लाया। धन्यवाद आपका!",
      },
      {
        needs: [["चाय", "कॉफ़ी", "कॉफी", "chai", "chaay", "coffee", "kofi"]],
        reply: "एक चाय अभी लाया। और कुछ?",
      },
    ],
    goal: [["चाय", "कॉफ़ी", "कॉफी", "chai", "chaay", "coffee", "kofi"]],
    translations: {
      "नमस्ते। क्या पिएँगे आप?": "Hello. What will you drink?",
      "जी ज़रूर, अभी लाया। धन्यवाद आपका!": "Yes, of course, coming right up. Thank you!",
      "एक चाय अभी लाया। और कुछ?": "One tea coming right up. Anything else?",
      "एक चाय हो जाए? बढ़िया कॉफ़ी भी है।": "Fancy a tea? We have great coffee too.",
    },
    readings: {
      "नमस्ते। क्या पिएँगे आप?": "Namaste. Kya piyenge aap?",
      "जी ज़रूर, अभी लाया। धन्यवाद आपका!": "Ji zaroor, abhi laaya. Dhanyavaad aapka!",
      "एक चाय अभी लाया। और कुछ?": "Ek chai abhi laaya. Aur kuchh?",
      "एक चाय हो जाए? बढ़िया कॉफ़ी भी है।": "Ek chai ho jaaye? Badhiya coffee bhi hai.",
    },
    hints: ["Order politely and thank them.", '"एक चाय दीजिए, कृपया। धन्यवाद।"'],
    vocab: [
      { term: "चाय", reading: "chai", meaning: "tea" },
      { term: "कॉफ़ी", reading: "coffee", meaning: "coffee" },
      { term: "कृपया", reading: "kripya", meaning: "please" },
      { term: "बिल", reading: "bil", meaning: "the bill" },
    ],
  },

  harbor: {
    opening: "नमस्ते, यात्री। आपको कहाँ ले चलूँ?",
    fallback: "यहाँ बहुत नावें हैं। कौन-सी चाहिए?",
    rules: [
      {
        needs: [
          ["नाव", "नौका", "किश्ती", "naav", "nav", "nauka", "kishti", "boat"],
          ["द्वीप", "टापू", "dweep", "dwip", "tapu", "island"],
          ["समय", "बजे", "कब", "टाइम", "samay", "baje", "kab", "time"],
        ],
        reply: "द्वीप वाली नाव पाँच बजे जाती है। टिकट दे दूँ?",
      },
      {
        needs: [
          ["नाव", "नौका", "किश्ती", "naav", "nav", "nauka", "kishti", "boat"],
          ["द्वीप", "टापू", "dweep", "dwip", "tapu", "island"],
        ],
        reply: "अच्छा, द्वीप के लिए। और किस समय जाना है?",
      },
    ],
    goal: [
      ["नाव", "नौका", "किश्ती", "naav", "nav", "nauka", "kishti", "boat"],
      ["द्वीप", "टापू", "dweep", "dwip", "tapu", "island"],
      ["समय", "बजे", "कब", "टाइम", "samay", "baje", "kab", "time"],
    ],
    translations: {
      "नमस्ते, यात्री। आपको कहाँ ले चलूँ?": "Hello, traveler. Where shall I take you?",
      "द्वीप वाली नाव पाँच बजे जाती है। टिकट दे दूँ?": "The boat to the island leaves at five. Shall I get you a ticket?",
      "अच्छा, द्वीप के लिए। और किस समय जाना है?": "Ah, to the island. And what time do you want to go?",
      "यहाँ बहुत नावें हैं। कौन-सी चाहिए?": "There are many boats here. Which one do you want?",
    },
    readings: {
      "नमस्ते, यात्री। आपको कहाँ ले चलूँ?": "Namaste, yaatri. Aapko kahaan le chaloon?",
      "द्वीप वाली नाव पाँच बजे जाती है। टिकट दे दूँ?": "Dweep waali naav paanch baje jaati hai. Ticket de doon?",
      "अच्छा, द्वीप के लिए। और किस समय जाना है?": "Achchha, dweep ke liye. Aur kis samay jaana hai?",
      "यहाँ बहुत नावें हैं। कौन-सी चाहिए?": "Yahaan bahut naaven hain. Kaun-si chaahiye?",
    },
    hints: ["Ask which boat and what time.", '"द्वीप को कौन-सी नाव जाती है? वह किस समय जाती है?"'],
    vocab: [
      { term: "नाव", reading: "naav", meaning: "the boat" },
      { term: "द्वीप", reading: "dweep", meaning: "the island" },
      { term: "किस समय?", reading: "kis samay?", meaning: "at what time?" },
      { term: "टिकट", reading: "ticket", meaning: "the ticket" },
    ],
  },

  platform: {
    opening: "प्लेटफ़ॉर्म बंद हो रहा है। क्या हुआ?",
    fallback: "जल्दी कीजिए। क्या चाहिए आपको?",
    rules: [
      {
        needs: [
          ["छूट गई", "छूट गयी", "मिस", "खो गई", "chhoot gayi", "chhut gayi", "miss", "missed"],
          ["आख़िरी", "आखिरी", "अंतिम", "aakhiri", "akhiri", "antim", "last"],
        ],
        reply: "अरे… ठीक है, जल्दी आख़िरी वाली में चढ़ जाइए। दौड़िए!",
      },
      {
        needs: [["ट्रेन", "गाड़ी", "रेल", "train", "gaadi", "gadi", "rail"]],
        reply: "आपकी ट्रेन? बताइए क्या हुआ।",
      },
    ],
    goal: [
      ["छूट गई", "छूट गयी", "मिस", "खो गई", "chhoot gayi", "chhut gayi", "miss", "missed"],
      ["आख़िरी", "आखिरी", "अंतिम", "aakhiri", "akhiri", "antim", "last"],
    ],
    translations: {
      "प्लेटफ़ॉर्म बंद हो रहा है। क्या हुआ?": "The platform is closing. What's the matter?",
      "अरे… ठीक है, जल्दी आख़िरी वाली में चढ़ जाइए। दौड़िए!": "Oh dear… alright, hurry and board the last one. Run!",
      "आपकी ट्रेन? बताइए क्या हुआ।": "Your train? Tell me what happened.",
      "जल्दी कीजिए। क्या चाहिए आपको?": "Please hurry. What do you need?",
    },
    readings: {
      "प्लेटफ़ॉर्म बंद हो रहा है। क्या हुआ?": "Platform band ho raha hai. Kya hua?",
      "अरे… ठीक है, जल्दी आख़िरी वाली में चढ़ जाइए। दौड़िए!": "Are… theek hai, jaldi aakhiri waali mein chadh jaaiye. Daudiye!",
      "आपकी ट्रेन? बताइए क्या हुआ।": "Aapki train? Bataaiye kya hua.",
      "जल्दी कीजिए। क्या चाहिए आपको?": "Jaldi kijiye. Kya chaahiye aapko?",
    },
    hints: [
      "Explain you missed your train, then ask to board.",
      '"मेरी ट्रेन छूट गई। क्या मैं आख़िरी वाली में चढ़ सकता हूँ, कृपया?"',
    ],
    vocab: [
      { term: "ट्रेन", reading: "train", meaning: "the train" },
      { term: "छूट गई", reading: "chhoot gayi", meaning: "(it) was missed" },
      { term: "आख़िरी", reading: "aakhiri", meaning: "the last one" },
      { term: "कृपया", reading: "kripya", meaning: "please" },
    ],
  },
};

export default hi;
