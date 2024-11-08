import { NextResponse } from "next/server";
import { getVisualizationData } from "./gen";

export async function POST(req: Request) {
  const { sqlQuery, language } = await req.json();
  const result = await getVisualizationData(sqlQuery, language);
  return NextResponse.json(result);
}
