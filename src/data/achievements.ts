export interface Achievement {
  id?: number;
  title: string;
  emoji: string;
  description: string;
  longDescription?: string;
  reward?: number;
  requirement?: number;
  clicksRequired?: number;
  purchasesRequired?: number;
  rarity?: string;
  max_progress?: number;
  image_url?: string;
  created_at?: string;
}

/**
 * All achievements that can be earned by the user.
 * This structure matches the Supabase DB schema for the achievements table.
 */
export const achievements: { [key: string]: Achievement } = {
  // points
  honeyBeginner: {
    id: 1,
    title: "Honey Beginner",
    emoji: "🍯",
    description: "Produce 100 honey",
    longDescription:
      "You've taken your first steps into the world of beekeeping and produced 100 sweet, golden drops of honey. Keep up the buzz-worthy work!",
    requirement: 100,
    rarity: "Common",
    max_progress: 100,
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  beekeeperTrainee: {
    id: 2,
    title: "Beekeeper Trainee",
    emoji: "🍯",
    description: "Produce 1,000 honey",
    longDescription:
      "You've graduated to the rank of Beekeeper Trainee by producing 1,000 jars of honey. Your bees must be working overtime!",
    requirement: 1000,
    rarity: "Common",
    max_progress: 1000,
    image_url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
  honeyExpert: {
    id: 3,
    title: "Honey Expert",
    emoji: "🍯",
    description: "Produce 10,000 honey",
    longDescription:
      "You're no longer a novice beekeeper; you're a Honey Expert! You've produced 10,000 jars of honey and have undoubtedly earned the respect of your bee colony.",
    requirement: 10000,
    rarity: "Uncommon",
    max_progress: 10000,
    image_url: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
  },
  beekeepingMaster: {
    id: 4,
    title: "Beekeeping Master",
    emoji: "🍯",
    description: "Produce 100,000 honey",
    longDescription:
      "You've mastered the art of beekeeping and produced 100,000 jars of honey. Your honey is in high demand and your bees couldn't be happier.",
    requirement: 100000,
    rarity: "Rare",
    max_progress: 100000,
    image_url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
  honeyLegend: {
    id: 5,
    title: "Honey Legend",
    emoji: "🍯",
    description: "Produce 1,000,000 honey",
    longDescription:
      "You're a Honey Legend! With 1,000,000 jars of honey under your belt, your honey is known far and wide for its sweetness and quality.",
    requirement: 1000000,
    rarity: "Epic",
    max_progress: 1000000,
    image_url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80",
  },
  honeyTycoon: {
    id: 6,
    title: "Honey Tycoon",
    emoji: "🍯",
    description: "Produce 10,000,000 honey",
    longDescription:
      "Your beekeeping empire is growing! With 10,000,000 jars of honey produced, you're now a Honey Tycoon. Keep up the sweet work!",
    requirement: 10000000,
    rarity: "Epic",
    max_progress: 10000000,
    image_url: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
  },
  honeyMagnate: {
    id: 7,
    title: "Honey Magnate",
    emoji: "🍯",
    description: "Produce 100,000,000 honey",
    longDescription:
      "You're a Honey Magnate, producing 100,000,000 jars of honey! Your honey is a top seller and you've become a household name in the beekeeping world.",
    requirement: 100000000,
    rarity: "Legendary",
    max_progress: 100000000,
    image_url: "https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&w=400&q=80",
  },
  honeyBaron: {
    id: 8,
    title: "Honey Baron",
    emoji: "🍯",
    description: "Produce 1,000,000,000 honey",
    longDescription:
      "With 1,000,000,000 jars of honey produced, you're now a Honey Baron. Your bees are well-fed and happy, and your honey is a sought-after commodity.",
    requirement: 1000000000,
    rarity: "Legendary",
    max_progress: 1000000000,
    image_url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
  honeyEmpire: {
    id: 9,
    title: "Honey Empire",
    emoji: "🍯",
    description: "Produce 10,000,000,000 honey",
    longDescription:
      "You've built a honey empire with 10,000,000,000 jars of honey produced. Your bees are buzzing with pride, and your honey is the envy of all other beekeepers.",
    requirement: 10000000000,
    rarity: "Mythic",
    max_progress: 10000000000,
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  honeyUniverse: {
    id: 10,
    title: "Honey Universe",
    emoji: "🍯",
    description: "Produce 100,000,000,000 honey",
    longDescription:
      "You're a true master of beekeeping with 100,000,000,000 jars of honey produced, earning you the title of Honey Universe. Your bees bow down to your greatness!",
    requirement: 100000000000,
    rarity: "Mythic",
    max_progress: 100000000000,
    image_url: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
  },
  // clicks
  clickingNovice: {
    id: 11,
    title: "Clicker Novice",
    emoji: "🖱️",
    description: "Click the button 10 times",
    longDescription:
      "You've clicked the button 10 times and earned the title of Clicker Novice. Your clicking skills are just starting to buzz!",
    clicksRequired: 10,
    rarity: "Common",
    max_progress: 10,
    image_url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
  clickingPro: {
    id: 12,
    title: "Clicker Pro",
    emoji: "🖱️",
    description: "Click the button 100 times",
    longDescription:
      "With 100 clicks under your belt, you're now a Clicker Pro. Keep up the speedy clicking!",
    clicksRequired: 100,
    rarity: "Common",
    max_progress: 100,
    image_url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80",
  },
  clickingChampion: {
    id: 13,
    title: "Clicking Champion",
    emoji: "🖱️",
    description: "Click the button 500 times",
    longDescription:
      "You've clicked the button 500 times and have earned the title of Clicking Champion. Your clicking skills are truly impressive!",
    clicksRequired: 500,
    rarity: "Uncommon",
    max_progress: 500,
    image_url: "https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&w=400&q=80",
  },
  clickingMaster: {
    id: 14,
    title: "Clicking Master",
    emoji: "🖱️",
    description: "Click the button 1000 times",
    longDescription:
      "You've clicked the button 1000 times and are now a Clicking Master. Your fingers are lightning-fast and your clicking skills are truly impressive.",
    clicksRequired: 1000,
    rarity: "Rare",
    max_progress: 1000,
    image_url: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
  },
  clickingSuperstar: {
    id: 15,
    title: "Clicking Superstar",
    emoji: "🖱️",
    description: "Click the button 5000 times",
    longDescription:
      "You've clicked the button 5000 times and have earned the title of Clicking Superstar. Your clicking skills are unmatched, and you are truly a master of the art of clicking!",
    clicksRequired: 5000,
    rarity: "Epic",
    max_progress: 5000,
    image_url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
  clickingLegend: {
    id: 16,
    title: "Clicking Legend",
    emoji: "🖱️",
    description: "Click the button 10,000 times",
    longDescription:
      "You're a Clicking Legend with 10,000 button clicks. Your clicking abilities are unmatched, and your speed is simply astounding.",
    clicksRequired: 10000,
    rarity: "Legendary",
    max_progress: 10000,
    image_url: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
  },
  clickingTitan: {
    id: 17,
    title: "Clicking Titan",
    emoji: "🖱️",
    description: "Click the button 50,000 times",
    longDescription:
      "You've clicked the button 50,000 times, achieving the title of Clicking Titan. Your clicking skills are beyond impressive and have reached a level of mastery that few can match.",
    clicksRequired: 50000,
    rarity: "Mythic",
    max_progress: 50000,
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  // buys
  buyBeginner: {
    id: 18,
    title: "Buy Beginner",
    emoji: "🛍️",
    description: "Buy 10 items",
    longDescription:
      "You've made your first 10 purchases and earned the title of Buy Beginner. Keep buying and building your beekeeping empire!",
    purchasesRequired: 10,
    rarity: "Common",
    max_progress: 10,
    image_url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
  buyingEnthusiast: {
    id: 19,
    title: "Buying Enthusiast",
    emoji: "🛍️",
    description: "Buy 50 items",
    longDescription:
      "Congratulations, you're a Buying Enthusiast! You've made 50 purchases, showing your passion and dedication for beekeeping. Keep up the great work!",
    purchasesRequired: 50,
    rarity: "Uncommon",
    max_progress: 50,
    image_url: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
  },
  shoppingPro: {
    id: 20,
    title: "Shopping Pro",
    emoji: "🛍️",
    description: "Buy 100 items",
    longDescription:
      "With 100 purchases made, you're now a Shopping Pro. Your beekeeping equipment is top-of-the-line, and your bees are happy and well-cared-for.",
    purchasesRequired: 100,
    rarity: "Rare",
    max_progress: 100,
    image_url: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
  },
  buyTycoon: {
    id: 21,
    title: "Buy Tycoon",
    emoji: "🛍️",
    description: "Buy 500 items",
    longDescription:
      "You've purchased 500 items and have earned the title of Buy Tycoon. Your dedication to beekeeping and your exceptional shopping skills have propelled your empire to new heights!",
    purchasesRequired: 500,
    rarity: "Epic",
    max_progress: 500,
    image_url: "https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&w=400&q=80",
  },
  buyExpert: {
    id: 22,
    title: "Buy Expert",
    emoji: "🛍️",
    description: "Buy 1,000 items",
    longDescription:
      "You've made 1,000 purchases and have earned the title of Buy Expert. Your beekeeping knowledge and equipment are second to none!",
    purchasesRequired: 1000,
    rarity: "Legendary",
    max_progress: 1000,
    image_url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80",
  },
  // others
  ShareGameEnthusiast: {
    id: 23,
    title: "Share Game Enthusiast",
    emoji: "🔗",
    description: "Click on share button",
    longDescription:
      "You've shared this amazing game on a social media platform, spreading the word about the wonders of beekeeping. Keep buzzing and sharing!",
    reward: 5000,
    rarity: "Common",
    max_progress: 1,
    image_url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
  volumeController: {
    id: 24,
    title: "Volume Controller",
    emoji: "🔊",
    description: "Adjust the volume of game sounds",
    longDescription:
      "You've taken control of the game sounds by adjusting the volume to your liking. Whether you prefer it loud or soft, you're now in charge of the audio experience!",
    rarity: "Common",
    max_progress: 1,
    image_url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
  profilePicturePro: {
    id: 25,
    title: "Profile Picture Pro",
    emoji: "📷",
    description: "Change your profile picture",
    longDescription:
      "You've updated your profile picture and earned the title of Profile Picture Pro. Your new picture looks great!",
    rarity: "Common",
    max_progress: 1,
    image_url: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
  },

  
};