import { NextResponse } from "next/server";

const CATEGORIES = [
  "Sports",
  "Science",
  "English",
  "Creativity",
  "Social Studies",
  "Math",
];

function scoreAnswers(answers: number[]) {
  const scores: Record<string, number> = {};
  CATEGORIES.forEach((c) => (scores[c] = 0));

  answers.forEach((a) => {
    if (typeof a === "number" && a >= 0 && a < CATEGORIES.length) {
      scores[CATEGORIES[a]] += 1;
    }
  });

  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map((x) => x[0]);

  return ranked.slice(0, 3); // top 3
}

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();
    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: "answers array required" },
        { status: 400 }
      );
    }

    const topInterests = scoreAnswers(answers);

    return NextResponse.json({
      predictedInterests: topInterests,
      scoresCalculated: true,
    });
  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
