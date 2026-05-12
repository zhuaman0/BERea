import type { Metadata } from "next";

export const metadata: Metadata = { title: "Materials" };

export default function MaterialsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-primary">Materials</h1>
      <p className="text-text-secondary">
        Flashcard decks, practice tests, and YouTube summaries.
      </p>
      {/* Material list + upload — built in features/flashcards */}
    </div>
  );
}
