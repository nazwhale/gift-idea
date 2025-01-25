import { useState } from "react";
import { Button } from "../components/ui/button";
import { getSuggestionsForGiftee } from "@/lib/chatgpt";
import { Giftee, Idea } from "@/types";
import IdeaList from "./IdeaList";
import AddIdeaForm from "./AddIdeaForm";

type IdeasFormProps = {
  giftee: Giftee;
  ideas: Idea[];
  onToggleBought: (ideaId: string) => Promise<void>;
  onDelete: (ideaId: string) => Promise<void>;
  onAddIdea: (ideaName: string) => Promise<void>;
};

export default function IdeasForm({ giftee, ideas, onToggleBought, onDelete, onAddIdea }: IdeasFormProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const handleFetchSuggestions = async () => {
    if (!giftee?.name) return;
    setIsFetchingSuggestions(true);
    setSuggestions([]);
    try {
      const newSuggestions = await getSuggestionsForGiftee(giftee.name, giftee.bio || "");
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <IdeaList
        ideas={ideas}
        onToggleBought={onToggleBought}
        onDelete={onDelete}
      />
      <AddIdeaForm onAddIdea={onAddIdea} />
      <div className="mt-4 mb-4">
        <Button
          size="sm"
          variant="outline"
          className="bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 w-full sm:w-auto"
          onClick={handleFetchSuggestions}
          disabled={isFetchingSuggestions}
        >
          {isFetchingSuggestions ? "Thinking..." : "Get Suggestions"}
        </Button>
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-2 text-sm">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap"
              >
                <span className="before:content-['•'] before:mr-2 break-words">{suggestion}</span>
                <Button
                  variant="ghost"
                  className="text-blue-500 shrink-0"
                  size="sm"
                  onClick={() => onAddIdea(suggestion)}
                >
                  Add idea
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 