import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  const modules = [
    {
      title: "Explosive Power Circuit",
      focus: "Strength",
      duration: "45 min",
      intensity: "High",
      description:
        "Olympic lifts, sled pushes, and plyometrics to prime neuromuscular output.",
    },
    {
      title: "Tempo Endurance Ride",
      focus: "Conditioning",
      duration: "60 min",
      intensity: "Moderate",
      description:
        "Zone 3 tempo ride with cadence holds for sustainable power.",
    },
    {
      title: "Mobility & Prehab Flow",
      focus: "Mobility",
      duration: "25 min",
      intensity: "Low",
      description:
        "Thoracic opener, hip cars, and ankle sequencing for joint prep.",
    },
    {
      title: "Race Visualization",
      focus: "Mindset",
      duration: "15 min",
      intensity: "Low",
      description:
        "Guided visualization script focusing on strategic decision-making.",
    },
    {
      title: "Threshold Track Session",
      focus: "Conditioning",
      duration: "50 min",
      intensity: "High",
      description:
        "5x1k repeats @ 10k pace with 90s recoveries to raise lactate threshold.",
    },
    {
      title: "Contrast Recovery",
      focus: "Recovery",
      duration: "30 min",
      intensity: "Low",
      description:
        "Contrast bath protocol paired with diaphragmatic breathing reset.",
    },
    {
      title: "Strength Foundations",
      focus: "Strength",
      duration: "40 min",
      intensity: "Moderate",
      description:
        "Tempo squats, pull variations, and single-leg stability primer.",
    },
    {
      title: "Track Strides",
      focus: "Conditioning",
      duration: "20 min",
      intensity: "Moderate",
      description:
        "8x120m strides with buildups to reinforce running mechanics.",
    },
  ];

  try {
    const created = await PrismaClient.module.createMany({
      data: modules,
    });

    return NextResponse.json(
      { message: "Modules seeded successfully", created },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to seed modules" },
      { status: 500 }
    );
  }
}
