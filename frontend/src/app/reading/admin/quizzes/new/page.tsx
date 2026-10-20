import { QuizBuilder } from "@/features/reading/components/admin/QuizBuilder";
import { QuizNightBuilder } from "@/features/reading/components/admin/QuizNightBuilder";

interface PageProps {
  searchParams: Promise<{ format?: string }>;
}

export default async function ReadingAdminNewQuizPage({ searchParams }: PageProps) {
  const { format } = await searchParams;
  return format === "rounds" ? <QuizNightBuilder /> : <QuizBuilder />;
}
