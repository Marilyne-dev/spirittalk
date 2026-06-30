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
  },
  {
    id: 'insp_gratitude',
    title: "La Voie de la Gratitude",
    description: "Transformer le regard porté sur sa vie, un instant à la fois.",
    duration: "10 Jours",
    category: "Gratitude",
    imageUrl: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=800",
    content: "La gratitude est une discipline du cœur. Elle ne dépend pas de ce que nous possédons, mais du regard que nous posons sur ce que nous avons déjà reçu. Chaque jour de ce parcours, prenez un instant pour nommer trois bénédictions simples de votre journée, aussi modestes soient-elles. Avec le temps, ce regard reconnaissant devient un réflexe naturel qui adoucit les épreuves et illumine les joies ordinaires."
  },
  {
    id: 'insp_espoir',
    title: "Cultiver l'Espoir",
    description: "Garder une lumière allumée même dans les nuits les plus sombres.",
    duration: "7 Jours",
    category: "Espoir",
    imageUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&q=80&w=800",
    content: "L'espoir n'est pas une promesse que tout ira bien, mais la conviction que le sens persiste même dans la difficulté. 'Avec la difficulté vient la facilité', enseigne le Coran, tandis que les Psaumes répètent inlassablement la fidélité divine traversant les saisons d'épreuve. Aujourd'hui, identifiez une difficulté actuelle et écrivez une phrase d'espérance à son sujet, ancrée dans votre foi."
  },
  {
    id: 'insp_patience',
    title: "L'Art de la Patience",
    description: "Apprendre à attendre sans perdre la paix du cœur.",
    duration: "9 Jours",
    category: "Patience",
    imageUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=800",
    content: "La patience n'est pas une attente passive, mais une force active qui choisit la confiance plutôt que l'agitation. Le Coran nous invite à 'chercher secours dans l'endurance et la prière', tandis que Jacques 1:4 enseigne que la patience, menée à son terme, rend 'parfait et accompli'. Observez aujourd'hui un moment où l'impatience surgit en vous, et choisissez consciemment de respirer avant de réagir."
  },
  {
    id: 'insp_amour',
    title: "L'Amour Inconditionnel",
    description: "Aimer au-delà des différences et des frontières.",
    duration: "12 Jours",
    category: "Amour",
    imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&q=80&w=800",
    content: "L'amour véritable ne se mesure pas à ce qu'il reçoit, mais à ce qu'il donne sans condition. 1 Corinthiens 13 décrit cet amour comme 'patient', 'plein de bonté', jamais 'envieux'. Cette même tendresse traverse les enseignements coraniques sur la miséricorde envers son prochain. Aujourd'hui, posez un geste d'amour envers une personne avec qui le lien est plus difficile, sans rien en attendre en retour."
  },
  {
    id: 'insp_foi',
    title: "Renforcer sa Foi",
    description: "Ancrer sa confiance dans ce qui dépasse le visible.",
    duration: "21 Jours",
    category: "Foi",
    imageUrl: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=800",
    content: "La foi est cette confiance silencieuse qui persiste lorsque les certitudes vacillent. Hébreux 11:1 la définit comme 'une ferme assurance des choses qu'on espère'. Le Coran appelle à se 'confier en Allah' en toute circonstance. Ce parcours de 21 jours vous invite à tenir un journal de vos doutes et de vos certitudes, pour observer comment votre foi grandit jour après jour à travers l'épreuve du temps."
  },
  {
    id: 'insp_meditation',
    title: "Silence et Méditation",
    description: "Retrouver le sacré dans l'instant présent.",
    duration: "8 Jours",
    category: "Méditation",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800",
    content: "Dans le silence, la voix divine se fait souvent plus claire. 'Soyez tranquilles, et sachez que je suis Dieu' dit le Psaume 46:10, tandis que les traditions soufies cultivent le dhikr, la mémoire silencieuse du divin. Réservez chaque jour cinq minutes de silence complet, sans écran ni distraction, pour simplement être présent à vous-même et à ce qui vous dépasse."
  },
  {
    id: 'insp_confiance',
    title: "Confiance en la Providence",
    description: "Lâcher prise sur le contrôle et accueillir ce qui vient.",
    duration: "10 Jours",
    category: "Confiance",
    imageUrl: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?auto=format&fit=crop&q=80&w=800",
    content: "Faire confiance, c'est accepter de ne pas tout maîtriser. 'L'Éternel est mon berger, je ne manquerai de rien', proclame le Psaume 23, faisant écho au tawakkul islamique, cette remise confiante de son sort entre les mains d'Allah après avoir agi de son mieux. Identifiez aujourd'hui une situation que vous tentez de contrôler à l'excès et confiez-la consciemment dans la prière."
  },
  {
    id: 'insp_humilite',
    title: "La Voie de l'Humilité",
    description: "Marcher doucement et reconnaître sa juste place.",
    duration: "6 Jours",
    category: "Humilité",
    imageUrl: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&q=80&w=800",
    content: "L'humilité n'est pas se rabaisser, mais voir justement qui l'on est devant le sacré et devant les autres. Le Coran décrit les serviteurs du Tout Miséricordieux comme 'ceux qui marchent humblement sur terre'. Philippiens 2:3 invite à 'regarder les autres comme supérieurs à soi-même'. Aujourd'hui, exercez-vous à écouter davantage que parler dans vos échanges, et observez ce que cela change."
  },
  {
    id: 'insp_compassion',
    title: "Compassion Universelle",
    description: "S'ouvrir à la souffrance d'autrui avec un cœur tendre.",
    duration: "11 Jours",
    category: "Compassion",
    imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800",
    content: "La compassion est ce mouvement du cœur qui nous rapproche de la souffrance d'autrui sans détourner le regard. Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux, débute chaque sourate, rappelant cette qualité divine que nous sommes invités à incarner. Jésus, ému de compassion, guérissait et nourrissait les foules. Tendez la main aujourd'hui à quelqu'un qui traverse une épreuve, simplement par votre présence."
  },
  {
    id: 'insp_joie',
    title: "La Joie Spirituelle",
    description: "Redécouvrir une joie qui ne dépend pas des circonstances.",
    duration: "7 Jours",
    category: "Joie",
    imageUrl: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=800",
    content: "La joie spirituelle diffère du simple bonheur passager : elle puise sa source dans une présence intérieure stable, indépendante des événements extérieurs. 'Réjouissez-vous toujours dans le Seigneur', écrit Paul depuis sa prison. Cette joie profonde se cultive par la gratitude et la confiance. Identifiez aujourd'hui une source de joie durable dans votre vie, au-delà des plaisirs immédiats."
  },
  {
    id: 'insp_service',
    title: "Le Service du Prochain",
    description: "Trouver le sens à travers le don de soi.",
    duration: "9 Jours",
    category: "Service",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
    content: "Servir les autres est l'une des formes les plus pures d'adoration. 'Que celui qui veut être grand parmi vous soit votre serviteur', enseigne Jésus, tandis que l'Islam fait de la zakat un pilier de la foi, un don tourné vers le bien commun. Posez aujourd'hui un acte concret de service envers quelqu'un, sans rien attendre en retour si ce n'est la joie discrète du don."
  },
  {
    id: 'insp_renouveau',
    title: "Renouveau Spirituel",
    description: "Renaître à chaque saison, recommencer chaque matin.",
    duration: "14 Jours",
    category: "Renouveau",
    imageUrl: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&q=80&w=800",
    content: "Chaque aube est une invitation à recommencer. 'Ses compassions se renouvellent chaque matin', écrit le prophète Jérémie dans ses Lamentations. Le Ramadan, comme le Carême, sont des saisons consacrées à ce renouveau de l'âme. Ce parcours vous accompagne pour identifier une habitude que vous souhaitez transformer, un pas à la fois, avec douceur envers vous-même."
  },
  {
    id: 'insp_unite',
    title: "L'Unité dans la Diversité",
    description: "Célébrer ce qui nous rassemble au-delà des traditions.",
    duration: "8 Jours",
    category: "Unité",
    imageUrl: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=800",
    content: "Chrétiens et musulmans partagent un héritage spirituel commun fait d'amour, de justice et de compassion envers le prochain. 'Aimez-vous les uns les autres' résonne avec l'appel coranique à la fraternité humaine. Cette diversité de chemins vers le sacré est une richesse, non une division. Aujourd'hui, engagez une conversation respectueuse avec quelqu'un d'une tradition différente de la vôtre."
  },
  {
    id: 'insp_priere',
    title: "La Puissance de la Prière",
    description: "Faire de la prière un dialogue quotidien et sincère.",
    duration: "10 Jours",
    category: "Prière",
    imageUrl: "https://images.unsplash.com/photo-1544216717-3bbf52512659?auto=format&fit=crop&q=80&w=800",
    content: "La prière est ce fil ténu et puissant qui relie l'âme au divin. 'Priez sans cesse', exhorte Paul, tandis que les cinq prières quotidiennes rythment la vie du croyant musulman comme une boussole spirituelle. Au-delà des formules, la prière sincère est avant tout une conversation honnête. Prenez aujourd'hui un moment pour prier librement, avec vos propres mots, sans formalisme."
  },
  {
    id: 'insp_justice',
    title: "Justice et Droiture",
    description: "Agir avec intégrité dans un monde incertain.",
    duration: "9 Jours",
    category: "Justice",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
    content: "La justice spirituelle commence par l'intégrité de nos propres choix quotidiens. 'Soyez stricts dans l'équité', commande le Coran, tandis qu'Amos appelle à 'faire couler la justice comme un torrent'. Examinez aujourd'hui une décision en attente dans votre vie et demandez-vous si elle est guidée par la droiture plutôt que par l'intérêt personnel."
  },
  {
    id: 'insp_lacher_prise',
    title: "Lâcher Prise",
    description: "Déposer ses fardeaux pour avancer plus léger.",
    duration: "7 Jours",
    category: "Paix",
    imageUrl: "https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?auto=format&fit=crop&q=80&w=800",
    content: "Porter seul ses inquiétudes est un fardeau inutile lorsqu'une présence plus grande nous invite à déposer nos charges. 'Déchargez-vous sur lui de tous vos soucis', écrit Pierre, faisant écho à l'abandon confiant prôné dans la spiritualité soufie. Identifiez aujourd'hui un souci que vous portez seul depuis trop longtemps, et confiez-le consciemment, par la prière ou l'écriture."
  },
  {
    id: 'insp_creation',
    title: "Contempler la Création",
    description: "Retrouver l'émerveillement face à la beauté du monde.",
    duration: "6 Jours",
    category: "Méditation",
    imageUrl: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800",
    content: "La nature est souvent décrite comme le premier livre sacré, ouvert à tous. Les Psaumes chantent que 'les cieux racontent la gloire de Dieu', et le Coran invite sans cesse à méditer 'les signes' présents dans la création. Sortez aujourd'hui, même quelques minutes, et observez un élément naturel — un arbre, le ciel, une fleur — avec un regard neuf et reconnaissant."
  },

  {
    id: 'insp_resilience',
    title: "La Résilience de l'Âme",
    description: "Se relever plus fort après chaque épreuve.",
    duration: "10 Jours",
    category: "Espoir",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800",
    content: "La résilience n'est pas l'absence de blessure, mais la capacité à se relever malgré elle. Job dans la Bible, Ayoub dans le Coran — tous deux témoignent d'une foi qui résiste à la tempête sans jamais se briser. Chaque épreuve traverse nos vies comme un feu qui, loin de nous consumer, purifie ce qui est essentiel. Réfléchissez aujourd'hui à une difficulté passée que vous avez surmontée, et reconnaissez la force que vous en avez tirée."
  },
  {
    id: 'insp_lumiere',
    title: "Être une Lumière pour Autrui",
    description: "Rayonner la bonté autour de soi dans les actes simples.",
    duration: "8 Jours",
    category: "Service",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=800",
    content: "Matthieu 5:16 invite chacun à 'laisser briller sa lumière devant les hommes'. Cette lumière n'est pas celle de la perfection, mais celle de la bienveillance quotidienne. Le Prophète Muhammad, que la paix soit sur lui, disait qu'un sourire à ton frère est une aumône. Ce parcours vous invite à poser chaque jour un geste lumineux — une parole d'encouragement, une aide inattendue — et d'observer comment votre propre lumière s'intensifie en éclairant celle des autres."
  },
  {
    id: 'insp_detachement',
    title: "Le Détachement Spirituel",
    description: "Apprécier sans s'accrocher, aimer sans posséder.",
    duration: "7 Jours",
    category: "Sagesse",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    content: "Le détachement spirituel n'est pas l'indifférence, mais une liberté intérieure qui apprécie sans s'accrocher. 'Ne vous amassez pas des trésors sur la terre', enseigne Matthieu, tandis que le Coran rappelle que 'la vie de ce monde n'est que jouissance trompeuse'. Ce parcours explore la légèreté qui vient lorsqu'on place ses espoirs dans ce qui ne peut être emporté — la foi, l'amour, la paix intérieure."
  },
  {
    id: 'insp_nuit_obscure',
    title: "Traverser la Nuit Obscure",
    description: "Faire confiance même quand on ne voit plus rien.",
    duration: "12 Jours",
    category: "Foi",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
    content: "Tous les grands mystiques ont traversé des périodes de sécheresse spirituelle — ce que Jean de la Croix appelait 'la nuit obscure de l'âme'. Dans le Coran, 'Votre Seigneur ne vous a pas abandonnés' (93:3) fut révélé précisément dans un moment de silence divin ressenti par le Prophète. Ces nuits d'obscurité ne sont pas des abandons mais des transitions vers une foi plus mature et plus enracinée. Traversez-la avec courage."
  },
  {
    id: 'insp_corps_temple',
    title: "Le Corps, Temple de l'Esprit",
    description: "Prendre soin de soi comme d'un acte d'adoration.",
    duration: "9 Jours",
    category: "Gratitude",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    content: "Votre corps n'est pas un obstacle à votre vie spirituelle — il en est le temple. 'Ne savez-vous pas que votre corps est le temple du Saint-Esprit ?' demande Paul. L'Islam encourage aussi à prendre soin de sa santé comme d'une responsabilité envers Dieu. Ce parcours vous invite à réconcilier corps et âme : bien dormir, bien manger, marcher en plein air — tous ces gestes peuvent devenir des prières lorsqu'ils sont posés avec gratitude et conscience."
  },
  {
    id: 'insp_ecoute_divine',
    title: "Apprendre à Écouter Dieu",
    description: "Reconnaître la voix du divin dans le quotidien.",
    duration: "11 Jours",
    category: "Méditation",
    imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
    content: "Dieu parle souvent en murmure plutôt qu'en tonnerre. Élie dans la Bible l'a entendu dans 'le son d'un léger souffle'. Dans la tradition islamique, le cœur du croyant est décrit comme le miroir qui reflète les inspirations divines. Ce parcours propose des exercices quotidiens d'écoute intérieure — la journalisation spirituelle, la prière contemplative, le silence choisi — pour affiner cette oreille du cœur que chacun possède."
  },
  {
    id: 'insp_parole_qui_guerit',
    title: "La Parole qui Guérit",
    description: "Choisir ses mots comme on choisit un remède.",
    duration: "7 Jours",
    category: "Compassion",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
    content: "Les mots portent un pouvoir immense — celui de blesser ou de guérir, de décourager ou d'élever. Proverbes 12:18 dit : 'La langue des sages est une médecine'. Le Hadith rappelle que 'celui qui croit en Allah et au Jour dernier qu'il dise ce qui est bien, ou qu'il se taise'. Ce parcours vous invite à observer votre langage pendant sept jours : chaque soir, notez une parole bienveillante que vous avez prononcée et son effet sur votre entourage."
  },
  {
    id: 'insp_solitude_feconde',
    title: "La Solitude Féconde",
    description: "Faire de la solitude un espace de croissance et non de vide.",
    duration: "8 Jours",
    category: "Méditation",
    imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800",
    content: "Jésus se retirait souvent seul pour prier. Le Prophète Muhammad passait des heures de retraite spirituelle dans la grotte de Hirâ' avant la Révélation. La solitude choisie est différente de la solitude subie — elle est un atelier où l'âme se renouvelle, où les questions essentielles trouvent enfin l'espace pour être posées. Prévoyez un moment seul cette semaine, sans téléphone, sans distraction, juste vous et le divin."
  },
  {
    id: 'insp_generosite',
    title: "L'Âme Généreuse",
    description: "Donner ce qu'on aime et découvrir l'abondance intérieure.",
    duration: "10 Jours",
    category: "Service",
    imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800",
    content: "La vraie générosité est celle qui donne ce qu'elle chérit. Le Coran dit : 'Vous n'atteindrez la piété parfaite que si vous dépensez de ce que vous aimez'. Luc 21 raconte la veuve qui offre ses deux dernières pièces — plus que tous les riches. Ce parcours explore la générosité non comme une obligation mais comme une libération : plus on donne, plus on découvre qu'on possède l'essentiel."
  },
  {
    id: 'insp_memoire_eternelle',
    title: "Vivre pour l'Éternité",
    description: "Ancrer ses choix dans une perspective qui dépasse le temporaire.",
    duration: "9 Jours",
    category: "Foi",
    imageUrl: "https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&q=80&w=800",
    content: "Nos actes quotidiens prennent un sens nouveau lorsqu'on les inscrit dans une perspective éternelle. 'Tout ce que vous faites, faites-le comme pour le Seigneur', écrit Paul. Le Coran rappelle que 'celui qui fait le poids d'un atome de bien le verra'. Ce parcours invite à revoir nos priorités quotidiennes à la lumière de cette perspective : est-ce que mes choix d'aujourd'hui construisent quelque chose de durable ?"
  },
  {
    id: 'insp_reconciliation',
    title: "L'Art de la Réconciliation",
    description: "Reconstruire les ponts entre les cœurs blessés.",
    duration: "8 Jours",
    category: "Pardon",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800",
    content: "La réconciliation est l'un des actes les plus courageux que l'être humain puisse poser. 'Heureux les artisans de paix', proclame Jésus. Le Coran encourage à 'rétablir les liens de parenté' et valorise celui qui prend l'initiative de réconcilier. Ce n'est pas minimiser la blessure que de tendre la main — c'est choisir l'avenir plutôt que le passé. Y a-t-il une relation dans votre vie qui mériterait un premier pas de réconciliation ?"
  },
  {
    id: 'insp_courage',
    title: "Le Courage de la Foi",
    description: "Avancer même quand la peur est présente.",
    duration: "7 Jours",
    category: "Foi",
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800",
    content: "Le courage spirituel n'est pas l'absence de peur — c'est la décision d'avancer malgré elle. 'Sois fort et courageux ! Ne t'effraie pas', répète Josué. Et le Coran : 'Allah est avec ceux qui patient'. Chaque jour nous présente des occasions de courage discret — dire la vérité avec amour, défendre le faible, poursuivre notre vocation malgré le doute. Ce parcours vous accompagne dans sept décisions courageuses, une par jour."
  },
  {
    id: 'insp_enfance_spirituelle',
    title: "L'Enfance Spirituelle",
    description: "Retrouver la confiance et l'émerveillement de l'enfant.",
    duration: "6 Jours",
    category: "Joie",
    imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800",
    content: "'Si vous ne devenez pas comme les petits enfants, vous n'entrerez pas dans le royaume des cieux', dit Jésus. Cette enfance spirituelle n'est pas naïveté — c'est cette capacité à s'émerveiller, à faire confiance, à demander sans honte. Le soufisme parle de revenir à un état de pureté originelle (fitra). Ce parcours vous invite à retrouver cette légèreté : jouez, émerveillez-vous, posez des questions sans craindre de paraître ignorant."
  },
  {
    id: 'insp_temps_sacre',
    title: "Sanctifier le Temps",
    description: "Faire de chaque moment une occasion de présence divine.",
    duration: "11 Jours",
    category: "Prière",
    imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800",
    content: "Le temps est le tissu dans lequel se tisse notre vie spirituelle. Le Sabbat juif, le dimanche chrétien, le Jumu'ah islamique — toutes les traditions ont compris que certains moments méritent d'être mis à part, sanctifiés. Mais au-delà des jours consacrés, chaque instant peut devenir sacré lorsqu'on y apporte une pleine présence. Ce parcours propose de créer des petits rituels quotidiens qui transforment les moments ordinaires en oraisons vivantes."
  },
  {
    id: 'insp_traverser_deuil',
    title: "Traverser le Deuil avec Foi",
    description: "Accueillir la perte sans perdre la paix de l'âme.",
    duration: "14 Jours",
    category: "Espoir",
    imageUrl: "https://images.unsplash.com/photo-1473531761844-5a14668fc8f8?auto=format&fit=crop&q=80&w=800",
    content: "Le deuil est l'une des expériences humaines les plus universelles et les plus solitaires. 'Heureux ceux qui pleurent, car ils seront consolés', promet Jésus. Le Coran rappelle qu'à chaque épreuve, Dieu est 'proche des cœurs brisés'. Ce parcours de 14 jours n'a pas la prétention d'effacer la douleur — il propose un accompagnement spirituel doux pour traverser le deuil sans le nier, en lui permettant de devenir une transformation."
  },
  {
    id: 'insp_communaute',
    title: "La Force de la Communauté",
    description: "Grandir ensemble plutôt que seul.",
    duration: "8 Jours",
    category: "Unité",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800",
    content: "Aucune tradition spirituelle ne se vit vraiment seul. 'Là où deux ou trois sont réunis en mon nom', dit Jésus. L'Oumma islamique est fondée sur l'idée que les croyants forment un seul corps — si un membre souffre, tous souffrent. SpiritTalk est une expression moderne de cette vocation communautaire. Ce parcours explore comment être un membre actif et bienveillant d'une communauté spirituelle, en ligne ou en personne."
  },
  {
    id: 'insp_abandon_confiant',
    title: "L'Abandon Confiant",
    description: "Remettre sa vie entre des mains plus grandes que les siennes.",
    duration: "9 Jours",
    category: "Confiance",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800",
    content: "Le tawakkul islamique — l'abandon confiant à Allah après avoir fait de son mieux — rejoint l'abandon chrétien à la Providence divine. Ce n'est pas la passivité, mais la paix de celui qui a planté sa graine, arrosé sa terre, et confie la croissance à plus grand que lui. Ce parcours vous aide à identifier ce que vous pouvez contrôler et à libérer en paix ce qui ne dépend pas de vous."
  },
  {
    id: 'insp_jeune_interieur',
    title: "Le Jeûne de l'Âme",
    description: "Se purifier intérieurement au-delà du seul jeûne alimentaire.",
    duration: "7 Jours",
    category: "Prière",
    imageUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=800",
    content: "Le jeûne du Ramadan et le jeûne chrétien du Carême visent bien au-delà de la privation alimentaire — ils sont des invitations à un nettoyage intérieur profond. 'Ce genre-là ne sort que par la prière et le jeûne', dit Jésus. Le Prophète rappelait que celui qui ne cesse pas de mentir et d'agir mal, Allah n'a que faire qu'il se prive de nourriture. Ce parcours propose un jeûne de l'âme : jeûner de la plainte, de la comparaison, du jugement."
  },
  {
    id: 'insp_voir_dieu_partout',
    title: "Voir Dieu en Toutes Choses",
    description: "Cultiver un regard contemplatif sur le monde ordinaire.",
    duration: "10 Jours",
    category: "Méditation",
    imageUrl: "https://images.unsplash.com/photo-1435224654926-ecc9f7fa028c?auto=format&fit=crop&q=80&w=800",
    content: "Ignace de Loyola enseignait à 'trouver Dieu en toutes choses'. Le Coran révèle que 'où que vous vous tourniez, là est la Face d'Allah'. Cette contemplation universelle transforme le regard : le lever du soleil devient une theophanie, le repas partagé devient eucharistie, l'étranger croisé devient une occasion de servir le visage du divin. Ce parcours entraîne ce regard contemplatif au quotidien."
  },
  {
    id: 'insp_paix_avec_soi',
    title: "La Paix avec Soi-Même",
    description: "Apprendre à s'aimer avec la même tendresse qu'on donne aux autres.",
    duration: "12 Jours",
    category: "Paix",
    imageUrl: "https://images.unsplash.com/photo-1502139214982-d0ad755818d8?auto=format&fit=crop&q=80&w=800",
    content: "Nous sommes souvent nos propres juges les plus sévères. Pourtant, 'tu aimeras ton prochain comme toi-même' suppose que l'amour de soi est un fondement, non un péché. L'Islam enseigne que maltraiter son propre corps et son propre esprit est une forme d'ingratitude envers Dieu qui nous a créés. Ce parcours de 12 jours est une invitation à la douceur envers soi — à se parler comme on parlerait à un ami cher traversant une épreuve."
  },
];
