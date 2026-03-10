import { z } from "zod";

export const EnquiryTypeEnum = z.enum([
  "accommodation",
  "tours",
  "transportation",
  "mice",
  "medical_tourism",
]);

export type EnquiryType = z.infer<typeof EnquiryTypeEnum>;

const BudgetSchema = z.object({
  amount: z.number().min(1, "Budget is required"),
  currency: z.enum(["INR", "USD", "EUR"]),
  budgetType: z.enum([
    "perRoom",
    "perPerson",
    "perDay",
    "perTransfer",
    "perDelegate",
    "totalEvent",
    "treatmentStay",
  ]),
});

const ExternalLinkSchema = z.object({
  title: z.string().min(1, "Link title is required"),
  url: z.string().url("Invalid URL"),
});

// Accommodation Fields
export const AccommodationSchema = z.object({
  propertyType: z.string().min(1, "Property type is required"),
  destination: z.string().min(1, "Destination is required"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  adults: z.number().min(1),
  children: z.number().min(0),
  rooms: z.number().min(1),
  roomCategory: z.string().optional(),
  extraBeds: z.number().min(0),
  childWithoutBed: z.number().min(0),
  starCategory: z.string().optional(),
  mealPlan: z.string().optional(),
  preferences: z.array(z.string()).optional(),
});

// Tours Fields
export const ToursSchema = z.object({
  tourType: z.string().min(1, "Tour type is required"),
  tourFormat: z.string().min(1, "Tour format is required"),
  purposeOfTravel: z.string().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  checkIn: z.string().min(1, "Start date is required"),
  checkOut: z.string().min(1, "End date is required"),
  flexible: z.boolean().default(false),
  adults: z.number().min(1),
  children: z.number().min(0),
  propertyType: z.string().optional(),
  starCategory: z.string().optional(),
  roomCategory: z.string().optional(),
  inclusions: z.array(z.string()).optional(),
  preferences: z.array(z.string()).optional(),
});

// Transportation Fields
export const TransportationSchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  passengers: z.number().min(1),
  luggage: z.number().min(0),
  location: z.string().min(1, "Location is required"),
  dateTime: z.string().min(1, "Date & Time is required"),
  usageDetails: z.string().optional(),
  purpose: z.string().optional(),
  specialInstructions: z.array(z.string()).optional(),
});

// MICE Fields
export const MICESchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  venueLocation: z.string().min(1, "Venue location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  participants: z.number().min(1),
  venueRequirements: z.array(z.string()).optional(),
  technicalRequirements: z.array(z.string()).optional(),
  foodAndBeverage: z.array(z.string()).optional(),
  decisionStatus: z.string().optional(),
});

// Medical Tourism Fields
export const MedicalTourismSchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  treatmentCategory: z.string().min(1, "Treatment category is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  patients: z.number().min(1),
  attendants: z.number().min(0),
  hospitalPreference: z.string().optional(),
  accommodationType: z.string().optional(),
  lengthOfStay: z.string().optional(),
  additionalServices: z.array(z.string()).optional(),
  timeline: z.string().optional(),
});

export const MasterEnquirySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(), 
  type: EnquiryTypeEnum,
  details: z.any(), // Validated dynamically
  budget: BudgetSchema,
  tags: z.array(z.string()),
  attachments: z.array(z.number()),
  binaryFiles: z.any().optional(),
  externalLinks: z.array(ExternalLinkSchema),
});

export type MasterEnquiryForm = z.infer<typeof MasterEnquirySchema>;
