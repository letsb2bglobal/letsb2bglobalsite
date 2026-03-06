/**
 * Canonical How It Works content used on the homepage and About Us page.
 * About Us shows 5 steps; homepage shows 4 cards (steps 2+3 merged into "Get Verified").
 */

export const howItWorksSteps = [
  "Register as an Individual Business or Business Entity",
  "Complete your profile and submit verification details",
  "Get approved by the platform",
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
    description: `${howItWorksSteps[1]}. ${howItWorksSteps[2]}`,
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
