/* =========================================================
   Stage en officine : contenu de la Journée 1
   Chaque patient mélange plusieurs cours.
   zone : comptoir | preparatoire | phyto | bureau
   types : qcm (r = index de la bonne réponse), vf (r = true/false),
           calc (r = nombre, tol = tolérance absolue, u = unité)
   src : où revoir la notion (cours du dépôt ou source officielle)
   ========================================================= */
export const COURS = {
  biochimie: { nom: 'Biochimie humaine', coul: '#e0414b' },
  physio:    { nom: 'Physiologie', coul: '#5fd4e6' },
  chipha:    { nom: 'Chimie pharmaceutique', coul: '#a78bfa' },
  calc:      { nom: 'Méthodes de calcul (MPHAB287)', coul: '#f5c451' },
  galenique: { nom: 'Galénique', coul: '#f39a5b' },
  phyto:     { nom: 'Phytochimie (MPHAB310)', coul: '#5fd38d' },
  officine:  { nom: 'Pratique officinale', coul: '#7fb3ff' }
};

export const ZONES = {
  comptoir:     { nom: 'Le comptoir', desc: 'Délivrance et conseil' },
  preparatoire: { nom: 'Le préparatoire', desc: 'Préparations magistrales' },
  phyto:        { nom: 'Le coin phyto', desc: 'Plantes et huiles essentielles' },
  bureau:       { nom: 'Le bureau', desc: 'Dossiers patients et analyses' }
};

export const JOURNEES = [{
  id: 'j1',
  titre: 'Journée 1 · Premier jour de stage',
  intro: "Bienvenue à la Pharmacie du Confluent ! Je suis Mme Dubois, ta maîtresse de stage. Aujourd'hui, tu reçois les patients au comptoir. Certains te demanderont d'aller au préparatoire, au coin phyto ou au bureau. Prends le temps de réfléchir : chaque patient mobilise plusieurs de tes cours. Je te fais un retour en fin de journée.",
  patients: [
  {
    id: 'renard', nom: 'M. Jacques Renard', age: 71, look: { peau: '#e8c4a0', haut: '#4a6fa5', cheveux: '#d9d9d9' },
    arrive: "Bonjour mademoiselle. J'ai mal au dos depuis que j'ai bêché le jardin. Vous me donnez de l'ibuprofène ? Ah, et je prends du Sintrom pour mon cœur.",
    contexte: "Le Sintrom® (acénocoumarol) est un antivitamine K (AVK).",
    etapes: [
      { zone: 'comptoir', qs: [
        { t: 'qcm', c: 'officine', q: "Il demande de l'ibuprofène. Que fais-tu ?",
          o: ["Je délivre l'ibuprofène, c'est sans ordonnance", "Je propose plutôt du paracétamol, car un AINS augmente le risque de saignement sous anticoagulant", "Je lui dis d'arrêter son Sintrom pendant 3 jours", "Je double la dose pour soulager plus vite"],
          r: 1, x: "Les AINS renforcent le risque hémorragique des anticoagulants. Le paracétamol est l'antalgique de choix ici.", src: 'CBIP, « Usual suspects » (interactions des AINS)' },
        { t: 'qcm', c: 'officine', q: "Quelle posologie de paracétamol lui donnes-tu (adulte de plus de 50 kg) ?",
          o: ["500 mg à 1 g par prise, sans dépasser en général 3 g par jour (maximum absolu 4 g)", "2 g par prise, 4 fois par jour", "1 g toutes les 2 heures", "Pas de limite, c'est sans danger"],
          r: 0, x: "La notice belge précise qu'il n'est généralement pas nécessaire de dépasser 3 g par jour, avec un maximum de 4 g, à cause du risque d'atteinte hépatique grave.", src: 'Notice AFMPS paracétamol 500 mg, rubrique 4.2' }
      ]},
      { zone: 'bureau', qs: [
        { t: 'qcm', c: 'biochimie', q: "Son dossier montre un INR élevé. Sous AVK, quels facteurs de coagulation diminuent ?",
          o: ["Les facteurs II, VII, IX et X", "Le facteur V et le fibrinogène", "Le facteur de von Willebrand", "Les plaquettes"],
          r: 0, x: "Les AVK bloquent la carboxylation des facteurs vitamine K-dépendants : II, VII, IX, X. Le facteur V et le fibrinogène restent normaux.", src: 'Biochimie · Séminaire maladies hémorragiques, hémostase secondaire (dias 71-93)' },
        { t: 'vf', c: 'biochimie', q: "Vrai ou faux : le facteur V permet de distinguer une carence en vitamine K d'une insuffisance hépatique.",
          r: true, x: "Le facteur V est fabriqué par le foie mais ne dépend pas de la vitamine K : normal dans la carence en vitamine K, diminué dans l'insuffisance hépatique.", src: 'Biochimie · Séminaire maladies hémorragiques' },
        { t: 'qcm', c: 'biochimie', q: "En cas de surdosage en AVK, quel est le traitement ?",
          o: ["La vitamine K (Konakion®), correction en 6 à 12 h ; concentrés de facteurs (PPSB) en urgence", "L'héparine", "L'aspirine", "La protamine"],
          r: 0, x: "La vitamine K corrige en 6 à 12 h. En urgence, on donne des concentrés de facteurs (PPSB).", src: 'Biochimie · Séminaire maladies hémorragiques' }
      ]}
    ]
  },
  {
    id: 'diallo', nom: 'Mme Fatou Diallo', age: 58, look: { peau: '#6b4226', haut: '#c2185b', cheveux: '#1a1a1a' },
    arrive: "Bonjour ! Mon médecin vient de me découvrir un diabète. Il m'a prescrit de la metformine et il m'a donné ma prise de sang. Vous pouvez m'expliquer ?",
    contexte: "Ordonnance : metformine 500 mg, 1 comprimé 2 fois par jour. Bilan : glycémie à jeun 1,38 g/L, HbA1c 7,2 %.",
    etapes: [
      { zone: 'bureau', qs: [
        { t: 'qcm', c: 'biochimie', q: "Que reflète son HbA1c de 7,2 % ?",
          o: ["Sa glycémie moyenne des 2 à 3 derniers mois", "Sa glycémie de ce matin", "Sa réserve d'insuline", "Sa fonction rénale"],
          r: 0, x: "Le glucose se fixe sans enzyme sur l'hémoglobine (base de Schiff puis Amadori). Le globule rouge vit 120 jours, donc l'HbA1c reflète les 2 à 3 derniers mois.", src: 'Biochimie · Séminaire diabète, dias 26-28' },
        { t: 'qcm', c: 'biochimie', q: "Quels sont les seuils diagnostiques du diabète (ADA 2026) ?",
          o: ["Glycémie à jeun ≥ 1,26 g/L ou HbA1c ≥ 6,5 %", "Glycémie à jeun ≥ 1,00 g/L ou HbA1c ≥ 5,7 %", "Glycémie à jeun ≥ 2,00 g/L uniquement", "HbA1c ≥ 10 %"],
          r: 0, x: "À jeun ≥ 1,26 g/L, HbA1c ≥ 6,5 %, HGPO à 2 h ≥ 2,00 g/L, ou glycémie aléatoire ≥ 2,00 g/L avec symptômes. Les valeurs 1,00-1,25 g/L et 5,7-6,4 % définissent le prédiabète.", src: 'Biochimie · Séminaire diabète, dia 22' },
        { t: 'vf', c: 'biochimie', q: "Vrai ou faux : une hémolyse ou un saignement peut donner une HbA1c faussement basse.",
          r: true, x: "L'HbA1c dépend de la durée de vie des globules rouges : si elle diminue, l'HbA1c est faussement basse. Une carence en fer peut au contraire l'augmenter.", src: 'Biochimie · Séminaire diabète' },
        { t: 'qcm', c: 'physio', q: "Au-delà de quelle glycémie le glucose apparaît-il dans les urines ?",
          o: ["Environ 1,80 g/L (seuil de réabsorption rénale, SGLT2 et SGLT1)", "0,70 g/L", "1,00 g/L", "Il n'y passe jamais"],
          r: 0, x: "Le glucose filtré est réabsorbé par SGLT2 (environ 90 %) et SGLT1. Au-delà d'environ 1,80 g/L, les transporteurs sont saturés : glucosurie puis diurèse osmotique (polyurie).", src: 'Biochimie · Séminaire diabète, dia 29' }
      ]},
      { zone: 'comptoir', qs: [
        { t: 'qcm', c: 'officine', q: "Quand doit-elle prendre sa metformine ?",
          o: ["Au cours ou à la fin des repas", "À jeun, 1 h avant de manger", "Au coucher uniquement", "Peu importe, même avec de l'alcool"],
          r: 0, x: "La metformine se prend au cours ou à la fin des repas, ce qui limite les troubles digestifs du début de traitement.", src: 'RCP metformine (ANSM), rubrique 4.2' },
        { t: 'qcm', c: 'officine', q: "Quel effet indésirable lui annonces-tu comme fréquent au début ?",
          o: ["Des troubles digestifs (nausées, diarrhées), qui diminuent souvent avec le temps", "Des hypoglycémies sévères", "Une prise de poids rapide", "Une chute de cheveux"],
          r: 0, x: "Les troubles digestifs sont fréquents et dépendent de la dose ; on augmente progressivement et on prend les comprimés pendant les repas.", src: 'MSF Guide des médicaments essentiels, metformine' },
        { t: 'qcm', c: 'officine', q: "À long terme, de quelle carence faut-il se méfier sous metformine ?",
          o: ["Vitamine B12 (risque d'anémie macrocytaire)", "Vitamine C", "Vitamine K", "Iode"],
          r: 0, x: "La metformine diminue l'absorption de la vitamine B12, avec un risque d'anémie mégaloblastique.", src: 'RCP metformine, effets indésirables' }
      ]}
    ]
  },
  {
    id: 'lea', nom: 'Léa Moreau', age: 19, look: { peau: '#f1d1b5', haut: '#7c4dff', cheveux: '#8d5524' },
    arrive: "Salut ! Le dermato m'a donné de la doxycycline pour mon acné. Je peux la prendre avec mon bol de lait le matin ?",
    contexte: "Ordonnance : doxycycline 100 mg, 1 comprimé par jour pendant 3 mois.",
    etapes: [
      { zone: 'comptoir', qs: [
        { t: 'qcm', c: 'chipha', q: "Pourquoi ne pas la prendre avec du lait ?",
          o: ["Le calcium forme avec la tétracycline un chélate stable non résorbé : l'antibiotique n'agit plus", "Le lait détruit la molécule par hydrolyse", "Le lait provoque une allergie croisée", "Le lait augmente trop son absorption"],
          r: 0, x: "Les tétracyclines forment des chélates stables et peu résorbables avec les cations di- et trivalents (Ca²⁺, Fe³⁺, Zn²⁺…).", src: 'Chimie pharmaceutique · Antibactériens, tétracyclines' },
        { t: 'qcm', c: 'officine', q: "Quel délai conseilles-tu entre la doxycycline et le calcium, le fer ou un pansement gastrique ?",
          o: ["Au moins 2 heures", "10 minutes", "Aucun délai", "Une semaine"],
          r: 0, x: "Le calcium, le fer, le zinc et les pansements gastriques diminuent son efficacité : à prendre au moins 2 heures d'écart.", src: 'Sante.fr (Antibio\'Malin), doxycycline' },
        { t: 'qcm', c: 'officine', q: "Quels conseils ajoutes-tu à la délivrance ?",
          o: ["Ne pas s'allonger dans l'heure qui suit (risque d'œsophagite) et se protéger du soleil", "La prendre couchée avant de dormir", "S'exposer au soleil, ça aide l'acné", "Arrêter dès que les boutons disparaissent"],
          r: 0, x: "La doxycycline peut irriter l'œsophage si on s'allonge après la prise, et elle est photosensibilisante.", src: 'Sante.fr (Antibio\'Malin), doxycycline' },
        { t: 'vf', c: 'chipha', q: "Vrai ou faux : les tétracyclines sont contre-indiquées chez l'enfant de moins de 8 ans.",
          r: true, x: "Elles chélatent le calcium et se fixent sur l'os et les dents en formation : dyschromies dentaires et hypoplasie de l'émail.", src: 'Chimie pharmaceutique · Antibactériens, tétracyclines' }
      ]}
    ]
  },
  {
    id: 'peeters', nom: 'Dr Peeters (prescription)', age: null, look: { peau: '#f1d1b5', haut: '#ffffff', cheveux: '#5a3e2b' },
    arrive: "Mme Dubois : « Une prescription magistrale vient d'arriver. Tu peux t'en occuper au préparatoire ? »",
    contexte: "Prescription : 10 suppositoires contenant chacun 0,3 g de principe actif. Ton moule a été étalonné : E = 2,93 g. Le facteur de déplacement du PA est f = 0,61.",
    etapes: [
      { zone: 'preparatoire', qs: [
        { t: 'qcm', c: 'calc', q: "Que représente le facteur de déplacement f ?",
          o: ["La masse d'excipient déplacée par 1 g de principe actif", "La masse de PA dans un suppositoire", "Le pourcentage de PA dans la masse", "La température de fusion de la masse"],
          r: 0, x: "f = (E − M) ÷ S : masse d'excipient déplacée par 1 g de PA.", src: 'MPHAB287 · Séance 2, le facteur de déplacement' },
        { t: 'calc', c: 'calc', q: "Quelle masse d'excipient faut-il par suppositoire (M) ?", r: 2.747, tol: 0.006, u: 'g',
          x: "M = E − f × S = 2,93 − 0,61 × 0,3 = 2,747 g.", src: 'MPHAB287 · Séance 2, masse d\'excipient' },
        { t: 'calc', c: 'calc', q: "Quelle masse totale d'excipient pèses-tu pour la préparation ?", r: 30.217, tol: 0.06, u: 'g',
          x: "On prévoit toujours 1 suppositoire supplémentaire : 11 × 2,747 = 30,217 g (et 11 × 0,3 = 3,3 g de PA).", src: 'MPHAB287 · Séance 2 (piège : oublier le suppositoire supplémentaire)' },
        { t: 'qcm', c: 'calc', q: "Pourquoi prévoit-on un suppositoire de plus ?",
          o: ["Une partie de la masse reste dans le récipient et les ustensiles", "Pour en garder un en échantillon obligatoire", "Parce que le moule a toujours une alvéole cassée", "Pour compenser l'évaporation du PA"],
          r: 0, x: "Sans marge, le dernier suppositoire serait incomplet.", src: 'MPHAB287 · Séance 2, coulée des suppositoires' }
      ]}
    ]
  },
  {
    id: 'martin', nom: 'Mme Sarah Martin', age: 31, look: { peau: '#c68642', haut: '#43a047', cheveux: '#3b2314' },
    arrive: "Bonjour, je suis enceinte de deux mois et j'ai un gros rhume. Une amie m'a dit de faire des inhalations à l'huile essentielle d'eucalyptus ou de menthe. Lesquelles je prends ?",
    contexte: "Premier trimestre de grossesse.",
    etapes: [
      { zone: 'phyto', qs: [
        { t: 'qcm', c: 'officine', q: "Que lui réponds-tu ?",
          o: ["Aucune huile essentielle pendant le premier trimestre : je propose du sérum physiologique pour le nez", "L'eucalyptus mentholé, c'est naturel", "La menthe poivrée en diffusion toute la nuit", "Un mélange de toutes les HE pour être efficace"],
          r: 0, x: "Les huiles essentielles sont déconseillées aux femmes enceintes à cause de substances neurotoxiques ou toxiques pour l'embryon ; pendant les 3 premiers mois, aucune ne doit être utilisée.", src: 'ANSES, huiles essentielles ; RTBF (grossesse)' },
        { t: 'qcm', c: 'phyto', q: "Quels constituants d'HE sont neurotoxiques et convulsivants ?",
          o: ["Les cétones bicycliques (camphre, thuyone, pinocamphone)", "Les esters acycliques", "Les sesquiterpènes", "Les monoterpènes hydrocarbonés"],
          r: 0, x: "Camphre, thuyone et pinocamphone sont des cétones bicycliques neurotoxiques et convulsivantes.", src: 'MPHAB310 · Huiles essentielles (ch8)' },
        { t: 'qcm', c: 'phyto', q: "Pourquoi l'HE de sauge officinale n'est-elle pas utilisée ?",
          o: ["Elle est riche en thuyone, neurotoxique", "Elle est trop chère", "Elle est riche en menthol", "Elle n'a aucune odeur"],
          r: 0, x: "La thuyone est neurotoxique.", src: 'MPHAB310 · Huiles essentielles (ch8)' },
        { t: 'qcm', c: 'phyto', q: "Son mari prend de la simvastatine et boit du jus de pamplemousse. Quel est le mécanisme de l'interaction ?",
          o: ["Les furocoumarines inhibent le CYP3A4 intestinal : la biodisponibilité du médicament augmente", "Le pamplemousse induit le CYP2D6", "Une chélation dans l'estomac", "Une alcalinisation gastrique"],
          r: 0, x: "Furocoumarines (prénylées ou dimérisées) et flavonoïdes inhibent le CYP3A4 intestinal → plus de médicament absorbé.", src: 'MPHAB310 · Voie des shikimates, coumarines (ch4b)' }
      ]}
    ]
  },
  {
    id: 'lemaire', nom: 'M. Kevin Lemaire', age: 45, look: { peau: '#e0ac69', haut: '#6d4c41', cheveux: '#2b2b2b' },
    arrive: "J'ai une rage de dents. Je prends du paracétamol, mais ça ne passe pas. Je peux en prendre plus ? Ah, et mon médecin m'a dit que mes tests du foie n'étaient pas terribles… Je bois pas mal, faut dire.",
    contexte: "Consommation chronique d'alcool. Son dernier bilan montre des ALAT élevées.",
    etapes: [
      { zone: 'bureau', qs: [
        { t: 'qcm', c: 'biochimie', q: "Quel marqueur de cytolyse est le plus spécifique du foie ?",
          o: ["Les ALAT (enzyme cytoplasmique)", "Les ASAT", "Les phosphatases alcalines", "La LDH"],
          r: 0, x: "Les ALAT sont cytoplasmiques et spécifiques du foie ; les ASAT existent aussi dans le cœur et le muscle.", src: 'Biochimie · Chapitre 5, le foie (cholestase et cytolyse)' },
        { t: 'qcm', c: 'biochimie', q: "Lors de la phase II du métabolisme hépatique, que se passe-t-il ?",
          o: ["Une conjugaison (glucuronide, sulfate, glutathion…) qui rend la molécule plus hydrosoluble", "Une oxydation par les cytochromes P450", "Une absorption intestinale", "Une filtration glomérulaire"],
          r: 0, x: "Phase I : on crée ou démasque une fonction (oxydation…). Phase II : conjugaison à un groupe polaire pour l'excréter.", src: 'Biochimie · Chapitre 5, le foie (dia 137)' }
      ]},
      { zone: 'comptoir', qs: [
        { t: 'qcm', c: 'officine', q: "Que lui conseilles-tu ?",
          o: ["Ne pas augmenter la dose : prudence avec le paracétamol en cas d'alcoolisme chronique, et voir rapidement un dentiste", "Prendre 6 g par jour pendant 2 jours", "Associer deux marques de paracétamol", "Prendre son paracétamol avec un verre de vin"],
          r: 0, x: "La dose maximale ne doit pas être dépassée à cause du risque d'atteinte hépatique grave ; la prudence est de mise en cas d'alcoolisme chronique. Un foie malade élimine aussi moins bien les médicaments. Une rage de dents nécessite le dentiste.", src: 'Notice AFMPS paracétamol 500 mg ; Biochimie · Chapitre 5, le foie' }
      ]}
    ]
  },
  {
    id: 'odette', nom: 'Mme Odette Lambert', age: 84, look: { peau: '#f3d9c4', haut: '#8e24aa', cheveux: '#eeeeee' },
    arrive: "Bonjour ma petite. J'ai du mal à avaler mes comprimés. Je peux les écraser dans ma compote ? Il y en a un qui est « gastro-résistant » et un autre « à libération prolongée ».",
    contexte: "Dysphagie de la personne âgée.",
    etapes: [
      { zone: 'comptoir', qs: [
        { t: 'qcm', c: 'galenique', q: "Pourquoi ne faut-il pas écraser un comprimé gastro-résistant ?",
          o: ["Son enrobage entérique (ex. acétophtalate de cellulose) le protège de l'acidité gastrique : l'écraser détruit cette protection", "Il devient toxique une fois écrasé", "Il ne se dissout jamais", "Il colle à la compote"],
          r: 0, x: "Les enrobages entériques (acétophtalate de cellulose, HPMCP, gomme laque, zéine) résistent à l'acidité gastrique et ne se dissolvent qu'au niveau intestinal.", src: 'Galénique · Chapitre 9, formes solides et enrobages' },
        { t: 'qcm', c: 'galenique', q: "Comment fonctionne un comprimé matriciel hydrophile à libération prolongée ?",
          o: ["Un polymère (HPMC, méthylcellulose…) forme un gel qui freine la diffusion du PA", "Il explose dans l'estomac", "Il contient deux fois moins de PA", "Il est enrobé de sucre"],
          r: 0, x: "Les polymères viscosifiants ou gélifiants freinent la diffusion du PA. Écrasé, le comprimé libère toute la dose d'un coup.", src: 'Galénique · Chapitre 4, viscosité et polymères' },
        { t: 'qcm', c: 'officine', q: "Quelle est la meilleure solution pour Mme Lambert ?",
          o: ["Ne pas écraser et contacter le médecin pour une autre forme (solution buvable, comprimé orodispersible…)", "Écraser quand même, mais seulement le matin", "Arrêter les deux traitements", "Couper en 4 et avaler à sec"],
          r: 0, x: "Le pharmacien vérifie si la forme peut être modifiée et, sinon, propose une alternative au prescripteur.", src: 'Galénique · Chapitres 4 et 9' }
      ]}
    ]
  }
  ]
}];
