/**
 * Canonical How It Works content used on the homepage and About Us page.
 * About Us shows 5 steps; homepage shows 4 cards (steps 2+3 merged into "Get Verified").
 */

export const howItWorksSteps = [
  "Create your Let'sB2B account as a tourism professional or business entity.",
  "Complete your profile and verification to access the trusted trade network.",
  "Get approved and start exploring opportunities",
  "Connect digitally with verified global trade partners",
  "Collaborate, trade, and grow your business",
];

export const howItWorksCards = [
  {
    number: "01",
    title: "Register",
    description: howItWorksSteps[0],
    variant: "purple" as const,
    position: "tl" as const,
  },
  {
    number: "02",
    title: "Get Verified",
    description: howItWorksSteps[1],
    variant: "light" as const,
    position: "mr" as const,
  },
  {
    number: "03",
    title: "Connect",
    description: howItWorksSteps[3],
    variant: "light" as const,
    position: "bl" as const,
  },
  {
    number: "04",
    title: "Collaborate",
    description: howItWorksSteps[4],
    variant: "purple" as const,
    position: "br" as const,
  },
];
