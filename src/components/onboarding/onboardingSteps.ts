export type StepType = "gender" | "checkbox" | "radio" | "sizeGrid" | "bodyShape";

export interface OnboardingStep {
  question: string;
  key: string;
  type: StepType;
  options: string[];
  /** For sizeGrid, sub-categories */
  subGroups?: { label: string; options: string[] }[];
  /** Gender-specific: only show for this gender */
  forGender?: "female" | "male";
}

const sizes = ["3XS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL", "9XL"];

export const sharedSteps: OnboardingStep[] = [
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
];

export const femaleSteps: OnboardingStep[] = [
  {
    question: "Which size range best describes you?",
    key: "sizeRange",
    type: "radio",
    options: ["Regular", "Curvy", "Petite"],
    forGender: "female",
  },
  {
    question: "Do you have clothes in your Closet that you don't know how to style?",
    key: "unstyledClothes",
    type: "radio",
    options: ["Totally", "Not really"],
    forGender: "female",
  },
  {
    question: "Which shape best describes your body?",
    key: "bodyShape",
    type: "bodyShape",
    options: ["Hourglass", "Triangle", "Inverted triangle", "Rectangle", "Round"],
    forGender: "female",
  },
];

export const maleSteps: OnboardingStep[] = [
  {
    question: "Do you have clothes in your Closet that you don't know how to style?",
    key: "unstyledClothes",
    type: "radio",
    options: ["Totally", "Not really"],
    forGender: "male",
  },
  {
    question: "Which body type best describes you?",
    key: "bodyShape",
    type: "radio",
    options: ["Slim / Lean", "Athletic / Fit", "Average", "Stocky / Broad", "Tall & Slim"],
    forGender: "male",
  },
];

export function getStepsForGender(gender: "female" | "male"): OnboardingStep[] {
  return [...sharedSteps, ...(gender === "female" ? femaleSteps : maleSteps)];
}
