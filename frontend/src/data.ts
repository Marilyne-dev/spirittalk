import { Verse, QuizQuestion, InspirationCard, ReadingPlan } from './types';

export const VERSETS_DU_JOUR: Verse[] = [
  {
    id: 'v_matthieu_18_20',
    text: "Que la paix soit avec vous. Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux.",
    reference: "Matthieu 18:20",
    source: "Bible",
    category: "Paix"
  },
  {
    id: 'v_baqara_242',
    text: "C'est ainsi que Dieu vous facilite les signes, afin que vous raisonniez.",
    reference: "Coran, Al-Baqara 2:242",
    source: "Coran",
    category: "Sagesse"
  },
  {
    id: 'v_corinthiens_13_4',
    text: "L'amour est patient, il est plein de bonté; l'amour n'est point envieux...",
    reference: "1 Corinthiens 13:4",
    source: "Bible",
    category: "Amour"
  },
  {
    id: 'v_tawbah_40',
    text: "Ne t'afflige pas, car Dieu est avec nous.",
    reference: "Coran, At-Tawbah 9:40",
    source: "Coran",
    category: "Espoir"
  }
];

export const SCRIPTURE_LIBRARY: Verse[] = [
  // Bible
  {
    id: 'b_psalms_23_1',
    text: "L'Éternel est mon berger: je ne manquerai de rien.",
    reference: "Psaumes 23:1",
    source: "Bible",
    category: "Confiance"
  },
  {
    id: 'b_psalms_27_1',
    text: "Le Seigneur est ma lumière et mon salut; de qui aurais-je crainte ?",
    reference: "Psaumes 27:1",
    source: "Bible",
    category: "Confiance"
  },
  {
    id: 'b_matthieu_6_34',
    text: "Ne vous inquiétez donc pas du lendemain; car le lendemain aura soin de lui-même.",
    reference: "Matthieu 6:34",
    source: "Bible",
    category: "Anxiété"
  },
  {
    id: 'b_philippians_4_6',
    text: "Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières.",
    reference: "Philippiens 4:6",
    source: "Bible",
    category: "Anxiété"
  },
  {
    id: 'b_john_14_27',
    text: "Je vous laisse la paix, je vous donne ma paix. Je ne vous donne pas comme le monde donne.",
    reference: "Jean 14:27",
    source: "Bible",
    category: "Paix"
  },
  {
    id: 'b_galatians_5_22',
    text: "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bienveillance, la foi.",
    reference: "Galates 5:22",
    source: "Bible",
    category: "Amour"
  },
  {
    id: 'b_proverbs_3_5',
    text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse.",
    reference: "Proverbes 3:5",
    source: "Bible",
    category: "Sagesse"
  },
  {
    id: 'b_romans_12_21',
    text: "Ne te laisse pas vaincre par le mal, mais surmonte le mal par le bien.",
    reference: "Romains 12:21",
    source: "Bible",
    category: "Pardon"
  },
  // Coran
  {
    id: 'q_fatiha_1',
    text: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux. Louange à Allah, Seigneur de l'univers.",
    reference: "Coran, Al-Fatiha 1:1-2",
    source: "Coran",
    category: "Prière"
  },
  {
    id: 'q_baqara_153',
    text: "Ô vous qui croyez! Cherchez secours dans l'endurance et la prière. Car Allah est avec ceux qui endurent.",
    reference: "Coran, Al-Baqara 2:153",
    source: "Coran",
    category: "Patience"
  },
  {
    id: 'q_baqara_286',
    text: "Allah n'impose à aucune âme une charge supérieure à sa capacité.",
    reference: "Coran, Al-Baqara 2:286",
    source: "Coran",
    category: "Espoir"
  },
  {
    id: 'q_imran_159',
    text: "C'est par quelque miséricorde de la part d'Allah que tu as été si doux envers eux! Pardonne-leur donc.",
    reference: "Coran, Al-Imran 3:159",
    source: "Coran",
    category: "Pardon"
  },
  {
    id: 'q_rad_28',
    text: "N'est-ce point par l'évocation d'Allah que les cœurs se tranquillisent ?",
    reference: "Coran, Ar-Ra'd 13:28",
    source: "Coran",
    category: "Paix"
  },
  {
    id: 'q_ash_sharh_5',
    text: "À côté de la difficulté est certes la facilité! Oui, à côté de la difficulté est certes la facilité!",
    reference: "Coran, Ash-Sharh 94:5-6",
    source: "Coran",
    category: "Espoir"
  },
  {
    id: 'q_taha_114',
    text: "Et dis: 'Ô mon Seigneur, accrois mes connaissances!'",
    reference: "Coran, Ta-Ha 20:114",
    source: "Coran",
    category: "Sagesse"
  },
  {
    id: 'q_furqan_63',
    text: "Les serviteurs du Tout Miséricordieux sont ceux qui marchent humblement sur terre, et qui disent 'Paix' quand les ignorants s'adressent à eux.",
    reference: "Coran, Al-Furqan 25:63",
    source: "Coran",
    category: "Méditation"
  }
];

export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'plan_peace',
    title: "La Paix Intérieure",
    progress: 65,
    category: "Paix",
    totalChapters: 7,
    currentChapter: 4
  },
  {
    id: 'plan_wisdom',
    title: "Sagesse des Anciens",
    progress: 12,
    category: "Sagesse",
    totalChapters: 10,
    currentChapter: 1
  },
  {
    id: 'plan_forgiveness',
    title: "Le chemin du Pardon",
    progress: 0,
    category: "Pardon",
    totalChapters: 5,
    currentChapter: 0
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q_1',
    text: "Dans le Sermon sur la montagne, quelle qualité est attribuée aux 'artisans de paix' ?",
    options: [
      "Ils posséderont la terre",
      "Ils seront appelés fils de Dieu",
      "Ils obtiendront miséricorde",
      "Le royaume des cieux est à eux"
    ],
    correctAnswer: 1,
    explanation: "Matthieu 5:9 déclare : 'Heureux ceux qui procurent la paix, car ils seront appelés fils de Dieu !'",
    source: "Matthieu 5:9"
  },
  {
    id: 'q_2',
    text: "Quel court chapitre du Coran est décrit comme rappelant de s'enjoindre mutuellement la vérité et la patience ?",
    options: [
      "Al-Fatiha",
      "Al-Ikhlas",
      "Al-Asr",
      "Al-Kawthar"
    ],
    correctAnswer: 2,
    explanation: "La Sourate Al-Asr (103) dit : 'Par le Temps! L'homme est certes en perdition, sauf ceux qui croient... et s'enjoignent mutuellement la patience.'",
    source: "Coran, Sourate Al-Asr"
  },
  {
    id: 'q_3',
    text: "Qui est l'auteur de la citation : 'La vérité est un miroir tombé des mains de Dieu et qui s'est brisé. Chacun en ramasse un morceau et croit détenir toute la vérité.' ?",
    options: [
      "Ibn Arabi",
      "Rûmî",
      "Saint Augustin",
      "Al-Ghazali"
    ],
    correctAnswer: 1,
    explanation: "Cette célèbre métaphore sur la tolérance et la vérité partagée est attribuée au grand poète et mystique soufi Jalal al-Din al-Rûmî.",
    source: "Sagesse soufie"
  },
  {
    id: 'q_4',
    text: "Dans 1 Corinthiens 13, quelle est présentée comme la plus grande des vertus parmi la foi, l'espérance et l'amour ?",
    options: [
      "La Foi",
      "L'Espérance",
      "L'Amour",
      "La Sagesse"
    ],
    correctAnswer: 2,
    explanation: "1 Corinthiens 13:13 dit : 'Maintenant donc ces trois choses demeurent: la foi, l'espérance, l'amour; mais la plus grande de ces choses, c'est l'amour.'",
    source: "1 Corinthiens 13:13"
  },
  {
    id: 'q_5',
    text: "Quelle sourate du Coran contient le célèbre 'Verset du Trône' (Ayat al-Kursi) qui apporte sérénité et protection ?",
    options: [
      "Al-Baqarah (La Vache)",
      "Al-Imran (La Famille d'Imran)",
      "An-Nisa (Les Femmes)",
      "Al-Ma'idah (La Table Servie)"
    ],
    correctAnswer: 0,
    explanation: "Le Verset du Trône est le verset 255 de la Sourate Al-Baqarah. Il est récité pour la sérénité divine et la confiance.",
    source: "Coran, Al-Baqara 2:255"
  }
];

export const INSPIRATIONS: InspirationCard[] = [
  {
    id: 'insp_pardon',
    title: "Le chemin du Pardon",
    description: "Libérer son cœur du poids du ressentiment et du passé.",
    duration: "7 Jours",
    category: "Pardon",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    content: "Le pardon n'est pas un acte de faiblesse, mais la marque suprême de la force spirituelle. Que ce soit dans la Bible ('Pardonnez, et vous serez pardonnés') ou dans le Coran ('Qu'ils pardonnent et absolvent ! Ne désirez-vous pas qu'Allah vous pardonne ?'), pardonner est un cadeau que l'on se fait d'abord à soi-même. C'est détacher la corde qui nous lie à notre blessure pour pouvoir enfin avancer librement. Méditez aujourd'hui sur une situation passée et choisissez de libérer cette énergie par un élan sincère de gratitude et de compassion."
  },
  {
    id: 'insp_paix',
    title: "Paix Intérieure",
    description: "Trouver un sanctuaire de calme au milieu du tumulte du monde.",
    duration: "14 Jours",
    category: "Paix",
    imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800",
    content: "La paix n'est pas l'absence de bruit ou de tempête, mais la capacité à rester calme au cœur de celle-ci. Ar-Ra'd 13:28 rappelle : 'N'est-ce pas par l'évocation de Dieu que les cœurs s'apaisent ?' et Jean 14:27 murmure : 'Je vous donne ma paix'. Cette paix est un espace sacré en vous, accessible à chaque respiration. Prenez 5 minutes aujourd'hui pour fermer les yeux, ralentir votre souffle et vous connecter à cette présence silencieuse et divine."
  },
  {
    id: 'insp_sagesse',
    title: "Sagesse des Anciens",
    description: "Apprendre de la patience et de la résilience à travers les siècles.",
    duration: "5 Jours",
    category: "Sagesse",
    imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800",
    content: "La sagesse commence par l'écoute. Les proverbes bibliques enseignent que 'l'écoute engendre le discernement', tandis que le Coran valorise 'ceux qui écoutent la parole et suivent ce qu'elle contient de meilleur'. Apprendre des anciens, c'est s'appuyer sur des millénaires d'expérience humaine pour éclairer notre quotidien moderne. Pratiquez le silence attentif aujourd'hui : écoutez sans l'intention de répondre, observez avec bienveillance et accueillez les enseignements discrets de la nature."
  }
];
