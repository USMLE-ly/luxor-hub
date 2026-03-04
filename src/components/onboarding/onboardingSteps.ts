export type StepType = "gender" | "checkbox" | "radio" | "sizeGrid" | "bodyShape" | "faceShape" | "height" | "notification" | "selfieIntro" | "selfieGuide" | "cameraCapture" | "generating" | "detectionResult";

export interface BrandLogo {
  name: string;
  image: string;
}

export interface OnboardingStep {
  question: string;
  key: string;
  type: StepType;
  options: string[];
  /** For sizeGrid, sub-categories */
  subGroups?: { label: string; options: string[] }[];
  /** Gender-specific: only show for this gender */
  forGender?: "female" | "male";
  /** For selfieGuide steps */
  stepNumber?: number;
  description?: string;
  /** Subtitle above the question */
  subtitle?: string;
  /** Brand labels for each option */
  brandLabels?: Record<string, string[]>;
  /** Brand logos for each option */
  brandLogos?: Record<string, BrandLogo[]>;
  /** Camera mode: selfie or fullBody */
  cameraMode?: "selfie" | "fullBody";
  /** Detection result mode: face or body */
  detectionMode?: "face" | "body";
}

const sizes = ["3XS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL", "9XL"];

export const sharedSteps: OnboardingStep[] = [
  {
    question: "What's your biggest style challenge?",
    key: "styleChallenge",
    type: "checkbox",
    options: [
      "Knowing what looks good on me",
      "Shopping taking forever",
      "Wearing the same outfits on repeat",
      "Wasting money on clothes I never wear",
    ],
  },
  {
    question: "What's your main style goal?",
    key: "styleGoal",
    type: "checkbox",
    options: [
      "Learning how to complement my natural features",
      "Looking chic and fashionable",
      "Standing out from the crowd",
      "Shopping smart and buying less",
    ],
  },
  {
    question: "How do you want Style DNA to elevate your style?",
    key: "elevateStyle",
    type: "radio",
    options: [
      "Create a color palette and personalized style guide",
      "Tell me whether or not an item suits me before I buy it",
      "Mix and match items I already own to create brand-new looks",
      "Create new and unique looks from brands I love to improve my personal style",
    ],
  },
  {
    question: "Tell us about your shopping experience",
    key: "shoppingExperience",
    type: "radio",
    options: [
      "I generally feel pleased with most of my purchases",
      "I return most items",
      "I spend a lot of time trying to find clothes I feel confident and comfortable in",
      "I don't buy clothes very often because I believe nothing suits me",
    ],
  },
  {
    question: "Which brands do you want to see recommendations from?",
    key: "brands",
    type: "radio",
    options: [
      "Fast fashion",
      "Premium brands",
      "Luxury labels",
      "A mix of fast fashion and designer brands",
    ],
    brandLabels: {
      "Fast fashion": ["ZARA", "H&M", "GAP", "MANGO"],
      "Premium brands": ["COS", "GANNI", "ISABEL MARANT", "Reformation"],
      "Luxury labels": ["GUCCI", "FENDI", "VALENTINO", "CHANEL"],
    },
    brandLogos: {
      "Fast fashion": [
        { name: "ZARA", image: "brand-zara" },
        { name: "H&M", image: "brand-hm" },
        { name: "GAP", image: "brand-gap" },
        { name: "MANGO", image: "brand-mango" },
      ],
      "Premium brands": [
        { name: "COS", image: "brand-cos" },
        { name: "GANNI", image: "brand-ganni" },
        { name: "ISABEL MARANT", image: "brand-isabelmarant" },
        { name: "Reformation", image: "brand-reformation" },
      ],
      "Luxury labels": [
        { name: "GUCCI", image: "brand-gucci" },
        { name: "FENDI", image: "brand-fendi" },
        { name: "VALENTINO", image: "brand-valentino" },
        { name: "CHANEL", image: "brand-chanel" },
      ],
    },
  },
  {
    question: "What sizes do you typically wear?",
    key: "sizes",
    type: "sizeGrid",
    options: [],
    subGroups: [
      { label: "Tops", options: sizes },
      { label: "Bottoms", options: sizes },
    ],
  },
  {
    question: "How well do you know your style?",
    key: "styleKnowledge",
    type: "checkbox",
    options: [
      "I know what colors suit my skin tone",
      "I know which prints and silhouettes suit my body type",
      "I'm not entirely sure... but I can't wait to find out!",
      "I'm a professional stylist",
    ],
  },
  {
    question: "Do you have clothes in your Closet that you don't know how to style?",
    key: "unstyledClothes",
    type: "radio",
    options: ["Totally", "Not really"],
  },
  {
    question: "Roughly how much do you spend on clothes per year?",
    key: "budget",
    type: "radio",
    subtitle: "Your wardrobe is an investment",
    options: ["$0 – $500", "$501 – $1,500", "$1,501 – $2,500", "$2,501 – $5,000", "Over $5,000"],
  },
  // --- gender-specific steps inserted here via getStepsForGender ---
  {
    question: "Your height",
    key: "height",
    type: "height",
    options: [],
  },
  {
    question: "What's your age range?",
    key: "ageRange",
    type: "radio",
    options: ["18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75+"],
  },
  {
    question: "Stay in the loop with your latest arrivals and closet updates.",
    key: "notifications",
    type: "notification",
    options: [],
    description: "Be the first to know about exclusive offers.",
  },
  {
    question: "Let's discover your unique Color and Style Type",
    key: "selfieIntro",
    type: "selfieIntro",
    options: [],
    description: "We'll do this by analyzing your complexion and facial features",
  },
  {
    question: "Clean your camera lens",
    key: "selfieStep1",
    type: "selfieGuide",
    options: [],
    stepNumber: 1,
  },
  {
    question: "Remove glasses and hair accessories",
    key: "selfieStep2",
    type: "selfieGuide",
    options: [],
    stepNumber: 2,
  },
  {
    question: "Use natural light, facing a window. Avoid direct sunlight and open spaces",
    key: "selfieStep3",
    type: "selfieGuide",
    options: [],
    stepNumber: 3,
  },
  {
    question: "Keep a neutral expression",
    key: "selfieStep4",
    type: "selfieGuide",
    options: [],
    stepNumber: 4,
  },
  {
    question: "Look directly at the camera",
    key: "selfieStep5",
    type: "selfieGuide",
    options: [],
    stepNumber: 5,
  },
  {
    question: "Take your selfie",
    key: "selfieCapture",
    type: "cameraCapture",
    options: [],
    cameraMode: "selfie",
    description: "Position your face within the frame and tap capture",
  },
  {
    question: "Face Shape Detected",
    key: "faceResult",
    type: "detectionResult",
    options: [],
    detectionMode: "face",
    description: "Based on your facial proportions and features",
  },
  {
    question: "Now let's capture your full body",
    key: "fullBodyCapture",
    type: "cameraCapture",
    options: [],
    cameraMode: "fullBody",
    description: "Stand back and capture your full outfit for AI analysis",
  },
  {
    question: "Body Shape Detected",
    key: "bodyResult",
    type: "detectionResult",
    options: [],
    detectionMode: "body",
    description: "Based on your body proportions and silhouette",
  },
  {
    question: "Hold tight, we're generating your Style Formula!",
    key: "generating",
    type: "generating",
    options: [],
  },
];

export const femaleSteps: OnboardingStep[] = [
  {
    question: "Which shape best describes your body?",
    key: "bodyShape",
    type: "bodyShape",
    options: ["Hourglass", "Triangle", "Inverted triangle", "Rectangle", "Round"],
    forGender: "female",
  },
  {
    question: "Which shape best describes your face?",
    key: "faceShape",
    type: "faceShape",
    options: ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"],
    forGender: "female",
  },
  {
    question: "Which size range best describes you?",
    key: "sizeRange",
    type: "radio",
    options: ["Regular", "Curvy", "Petite"],
    forGender: "female",
  },
];

export const maleSteps: OnboardingStep[] = [
  {
    question: "Which shape best describes your body?",
    key: "bodyShape",
    type: "bodyShape",
    options: ["Rectangle", "Triangle", "Inverted triangle", "Oval", "Trapezoid"],
    forGender: "male",
  },
  {
    question: "Which shape best describes your face?",
    key: "faceShape",
    type: "faceShape",
    options: ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"],
    forGender: "male",
  },
  {
    question: "Which build best describes you?",
    key: "sizeRange",
    type: "radio",
    options: ["Slim", "Regular", "Athletic", "Big & Tall"],
    forGender: "male",
  },
];

export function getStepsForGender(gender: "female" | "male"): OnboardingStep[] {
  return [
    ...sharedSteps.slice(0, 9), // challenge, goal, elevate, shopping, brands, sizes, styleKnowledge, unstyledClothes, budget
    ...(gender === "female" ? femaleSteps : maleSteps), // bodyShape, faceShape, sizeRange/build
    ...sharedSteps.slice(9), // height, age, notifications, selfie steps, camera captures
  ];
}
