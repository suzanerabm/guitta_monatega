export default {
  common: {
    back: 'back',
    siteTitle: 'Guitta Monatega',
    footerAbout: 'about guitta monatega',
    soon: 'coming soon',
  },
  home: {
    title: 'Guitta Monatega',
    heroSub: 'universes & creatures',
    bichittos: {
      label: 'Series',
      title: 'Bichittos',
      desc: 'Creatures that live between the absurd and affection.',
    },
    kammara: {
      label: 'Saga',
      title: 'Kammara',
      desc: 'Connected worlds. Living systems. An illustrated saga.',
    },
    art: {
      label: 'Portfolio',
      title: 'Art',
      desc: 'Illustration, concept art and visual design.',
    },
  },
  about: {
    pageTitle: 'About — Guitta Monatega',
    title: 'About',
    paragraphs: [
      'Guitta Monatega is the artistic name of Suzane Machado — designer, illustrator and creator of universes.',
      'Since 2012, she creates characters and stories that live between cute and absurd. NapCat, Zeco, Taylo and their friends were born from sketchbooks and became books, animations and miniature sculptures.',
      'Kammara is the most recent project — an illustrated saga that connects worlds, systems and creatures in a narrative that grows with each chapter.',
      'The work mixes techniques: ink, graphite, pointillism, crochet, needle felting, modeling and digital illustration. All handmade, with patience.',
    ],
    universesLabel: 'Universes',
    contactLabel: 'Contact',
  },
  bichittos: {
    pageTitle: 'Bichittos — Guitta Monatega',
    heroLabel: 'Series',
    heroTitle: 'Bichittos',
    heroDesc: 'Creatures that live between the absurd and affection.',
    napcat: {
      name: 'NapCat',
      text: 'Gray, soft, with a blue-tipped tail — as if dipped in a bucket of paint. Calm, charming, always in a good mood. What he loves most is taking naps. He has a twin sister, Violeta.',
    },
    zeco: {
      name: 'Zeco',
      text: 'Round, orange, with plaid socks. Makes friends with anyone. Loves popsicles, is afraid of the fridge and cries about everything — but the next minute he is laughing again.',
    },
    taylo: {
      name: 'Taylo',
      text: [
        'A bear with bigger ears than the others — and that makes him special. Loves telling stories. He inherited from his ancestors the power of the stars: once a year, on the magic cliff, he hunts the ones that fall from the sky.',
        'In the forest, everyone is his friend — Pitu, Squizo, Candy and the others. Together, they form the Taylo universe.',
      ],
    },
    napcatBooksTitle: 'Books',
    napcatBooks: {
      adventures: 'NapCat Adventures',
    },
    zecoBooksTitle: 'Books - The 4 Seasons',
    zecoBookSeasons: {
      primavera: 'Spring',
      verao: 'Summer',
      outono: 'Autumn',
      inverno: 'Winter',
    },
    tayloBooksTitle: 'Books',
    tayloBooks: {
      starHunter: 'The Star Hunter',
    },
    bookIllustrated: 'Illustrated book',
    miscelania: {
      name: 'Miscelania',
      text: 'Loose creatures, experiments and characters that haven\'t found their story yet.',
    },
    miscelaniaBooksTitle: 'Books',
  },
  kammara: {
    pageTitle: 'Kammara — Guitta Monatega',
    heroLabel: 'Illustrated Saga',
    heroTitle: 'Kammara',
    heroDesc: 'Connected worlds. Living systems. A saga that grows with each chapter.',
    placeholder: 'Placeholder — description goes here.',
  },
  art: {
    pageTitle: 'Art — Guitta Monatega',
    heroLabel: 'Portfolio',
    heroTitle: 'Art',
    filterAll: 'All',
    booksTitle: 'Art Books',
    books: {
      sketchbook: 'Sketchbook',
    },
    sections: {
      black: { title: 'White on Black', technique: 'White ink on black paper' },
      grafite: { title: 'Graphite', technique: 'Shading and volume studies' },
      doodle: { title: 'Doodle', technique: 'Pencil sketches and doodles' },
      digital: { title: 'Digital Art', technique: 'Digital illustration' },
      collections: { title: 'Collections', technique: 'Themed series and collections' },
      fimo: { title: 'Pointillism', technique: 'Pen pointillism and mosaic' },
      needle: { title: 'Needle Felting', technique: 'Miniature sculptures with needle and wool' },
      clay: { title: 'Clay', technique: 'Clay and dough modeling' },
      croche: { title: 'Crochet', technique: 'Amigurumi and crochet pieces' },
    },
  },
} as const;
