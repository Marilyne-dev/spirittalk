import { Religion } from '../types';

interface ScriptureQuote {
  text: string;
  reference: string;
  source: 'Bible' | 'Coran';
}

interface LocalResponse {
  text: string;
  scriptureQuote?: ScriptureQuote;
}

// Highly detailed thematic insights for the local spiritual helper
const INSPIRATIONAL_DATABASE: Record<string, {
  reflections: {
    Chrétienne: string;
    Musulmane: string;
    Mixte: string;
  };
  quote: {
    Chrétienne: ScriptureQuote;
    Musulmane: ScriptureQuote;
  };
}> = {
  paix: {
    reflections: {
      Chrétienne: "La paix que le Christ propose n'est pas l'absence de conflits extérieurs, mais une tranquillité intérieure inébranlable fondée sur la confiance absolue en la présence divine. Face aux tempêtes du quotidien, se tourner vers l'Esprit Saint permet de calmer les troubles de l'âme.",
      Musulmane: "Dans la tradition islamique, la paix intérieure (As-Sakina) est un don divin accordé au cœur du croyant. Elle se cultive à travers le souvenir constant d'Allah (Dhikr) et l'abandon confiant à Sa volonté suprême (Tawakkul).",
      Mixte: "La recherche de la paix est le fil conducteur qui unit nos traditions. Qu'elle soit trouvée dans la communion intime avec le Christ ou dans l'apaisement par le souvenir constant du Très-Haut, cette quiétude sacrée est un refuge céleste contre les agitations mondaines."
    },
    quote: {
      Chrétienne: {
        text: "Je vous laisse la paix, je vous donne ma paix. Je ne vous donne pas comme le monde donne. Que votre cœur ne se trouble point, et ne s'alarme point.",
        reference: "Jean 14:27",
        source: "Bible"
      },
      Musulmane: {
        text: "C'est Lui qui a fait descendre la quiétude dans les cœurs des croyants afin qu'ils ajoutent une foi à leur foi.",
        reference: "Sourate Al-Fath (48:4)",
        source: "Coran"
      }
    }
  },
  anxiété: {
    reflections: {
      Chrétienne: "L'anxiété est une tempête humaine bien naturelle. Les Écritures nous encouragent à déposer nos fardeaux aux pieds de Dieu. En lui confiant nos craintes à travers des prières confiantes, nous remplaçons l'inquiétude par Sa grâce bienveillante.",
      Musulmane: "L'anxiété naît souvent de notre attachement au futur que nous ne contrôlons pas. Le Saint Coran nous enseigne que Dieu est le Seul Garant de notre subsistance et de notre destin. Déposer sa confiance en Lui libère le cœur du poids du lendemain.",
      Mixte: "Tant la Bible que le Coran s'accordent à dire que l'inquiétude ne peut ajouter une coudée à la durée de notre vie. En remettant humblement nos soucis au Créateur de toute vie, nous apprenons l'art divin du détachement et de la sérénité au jour le jour."
    },
    quote: {
      Chrétienne: {
        text: "Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.",
        reference: "Philippiens 4:6",
        source: "Bible"
      },
      Musulmane: {
        text: "Et quiconque place sa confiance en Allah, Il lui suffit. Certes, Allah atteint Ses objectifs.",
        reference: "Sourate At-Talaq (65:3)",
        source: "Coran"
      }
    }
  },
  pardon: {
    reflections: {
      Chrétienne: "Le pardon chrétien est au cœur de l'Évangile. Il imite la grâce inconditionnelle que nous recevons du Père à la croix. Pardonner à ceux qui nous ont offensés, c'est briser les chaînes de l'amertume pour libérer notre propre cœur.",
      Musulmane: "Le pardon (Al-Afrw) est un attribut divin majeur de l'Islam. Allah aime ceux qui pardonnent aux hommes et qui répriment leur colère. C'est un acte de force spirituelle qui élève l'âme au-dessus des rancunes terrestres.",
      Mixte: "Le pardon est l'une des plus grandes victoires de l'esprit humain sur son ego. En choisissant d'excuser les offenses, nous ouvrons les portes de notre âme aux bénédictions divines et à la réconciliation fraternelle."
    },
    quote: {
      Chrétienne: {
        text: "Soyez bons les uns envers les autres, compatissants, vous pardonnant réciproquement, comme Dieu vous a pardonné en Christ.",
        reference: "Éphésiens 4:32",
        source: "Bible"
      },
      Musulmane: {
        text: "Qu'ils pardonnent et absolvent. N'aimez-vous pas qu'Allah vous pardonne ? Et Allah est Pardonneur et Miséricordieux !",
        reference: "Sourate An-Nur (24:22)",
        source: "Coran"
      }
    }
  },
  amour: {
    reflections: {
      Chrétienne: "L'amour (Agapè) est la nature même de Dieu. C'est un don total de soi qui cherche le bien de l'autre sans rien attendre en retour. Aimer son prochain, c'est rendre la présence invisible de Dieu pleinement visible aux yeux du monde.",
      Musulmane: "L'amour en Islam commence par l'amour profond du Créateur, qui se manifeste par la bonté envers Sa création. Être miséricordieux envers les créatures de la terre est la condition essentielle pour recevoir l'amour du Tout Miséricordieux (Al-Wadud).",
      Mixte: "L'amour est le pont de lumière jeté entre le Ciel et la Terre. Nos deux traditions s'accordent à dire que l'amour sincère pour autrui, manifesté par la charité, la douceur et l'aide fraternelle, est l'expression la plus pure d'une foi authentique."
    },
    quote: {
      Chrétienne: {
        text: "L'amour est patient, il est plein de bonté; l'amour n'est point envieux; l'amour ne se vante point, il ne s'enfle point d'orgueil...",
        reference: "1 Corinthiens 13:4",
        source: "Bible"
      },
      Musulmane: {
        text: "Et parmi Ses signes, Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité auprès d'elles et Il a mis entre vous de l'amour et de la bonté.",
        reference: "Sourate Ar-Rum (30:21)",
        source: "Coran"
      }
    }
  },
  patience: {
    reflections: {
      Chrétienne: "La patience est un fruit de l'Esprit Saint. Elle nous permet d'attendre l'action de Dieu avec une joyeuse persévérance et de faire confiance à Son timing parfait, sachant que l'épreuve de notre foi produit la maturité.",
      Musulmane: "La patience (As-Sabr) est l'une des vertus les plus célébrées de l'Islam. Elle est perçue comme une lumière éclatante au milieu des difficultés. Allah déclare être aux côtés de ceux qui endurent avec constance et dignité.",
      Mixte: "La patience est le sceau des grandes âmes. Que ce soit pour attendre l'accomplissement des promesses divines en Christ ou pour traverser l'épreuve avec sérénité sous le regard d'Allah, endurer avec dignité purifie le cœur."
    },
    quote: {
      Chrétienne: {
        text: "Mais si nous espérons ce que nous ne voyons pas, nous l'attendons avec persévérance.",
        reference: "Romains 8:25",
        source: "Bible"
      },
      Musulmane: {
        text: "Ô vous qui croyez ! Cherchez secours dans l'endurance et la prière. Car Allah est avec ceux qui endurent.",
        reference: "Sourate Al-Baqarah (2:153)",
        source: "Coran"
      }
    }
  }
};

export const generateLocalAiResponse = async (
  userMessage: string,
  userReligion: Religion = 'Mixte'
): Promise<LocalResponse> => {
  const cleanMessage = userMessage.toLowerCase();
  
  // Detect active religion theme or use user's preference
  let faith: 'Chrétienne' | 'Musulmane' | 'Mixte' = 'Mixte';
  if (userReligion === 'Chrétienne' || cleanMessage.includes('bible') || cleanMessage.includes('christ') || cleanMessage.includes('jesus')) {
    faith = 'Chrétienne';
  } else if (userReligion === 'Musulmane' || cleanMessage.includes('coran') || cleanMessage.includes('allah') || cleanMessage.includes('prophete')) {
    faith = 'Musulmane';
  } else if (userReligion === 'Mixte') {
    faith = 'Mixte';
  }

  // Find a matching theme keyword
  let matchedTheme = 'paix'; // default theme
  for (const theme of Object.keys(INSPIRATIONAL_DATABASE)) {
    if (cleanMessage.includes(theme)) {
      matchedTheme = theme;
      break;
    }
  }

  const themeData = INSPIRATIONAL_DATABASE[matchedTheme];
  const reflectionText = themeData.reflections[faith];

  // Pick a relevant scripture quote
  let quote: ScriptureQuote;
  if (faith === 'Chrétienne') {
    quote = themeData.quote.Chrétienne;
  } else if (faith === 'Musulmane') {
    quote = themeData.quote.Musulmane;
  } else {
    // For mixed, pick alternating or matching the theme
    quote = Math.random() > 0.5 ? themeData.quote.Chrétienne : themeData.quote.Musulmane;
  }

  // Artificial delay for realism
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    text: `### 🕊️ Réflexion de Sagesse Spirituelle\n\n${reflectionText}\n\n*Notre esprit se réjouit de méditer ensemble sur ces questions existentielles. Puisses-tu trouver le repos dans les textes sacrés.*`,
    scriptureQuote: quote
  };
};
