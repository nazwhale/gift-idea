import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { addIdea, updateIdea, deleteIdea } from "@/lib/ideas";
import IdeaList from "./IdeaList.tsx";
import AddIdeaForm from "@/pages/AddIdeaForm.tsx";
import DetailsForm from "@/pages/DetailsForm.tsx";

import { Giftee } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { getSuggestionsForGiftee } from "@/lib/chatgpt.ts";

type GifteeProps = {
  g: Giftee;
};

export default function GifteeRow({ g }: GifteeProps) {
  const { toast } = useToast();
  const [ideas, setIdeas] = useState(g.ideas || []);
  const [isIdeasDialogOpen, setIsIdeasDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // ChatGPT suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // Functions for handling idea actions
  const handleAddIdea = async (ideaName: string) => {
    const newIdea = await addIdea(g.id, ideaName);
    setIdeas((prev) => [...prev, newIdea]);
    toast({
      title: "Idea Added",
      description: `Added "${newIdea.name}" for ${g.name}.`,
    });
  };

  const handleToggleBought = async (ideaId: string) => {
    // get current purchased_at value
    const currentIdea = ideas.find((i) => i.id === ideaId);
    const purchasedAt = currentIdea?.purchased_at ? null : new Date();

    // if purchased_at is null, set to current date, else set to null
    const updated = await updateIdea(ideaId, { purchased_at: purchasedAt });
    setIdeas((prev) => prev.map((i) => (i.id === ideaId ? updated : i)));
    toast({
      title: `Idea Marked as ${purchasedAt ? "Bought" : "Not Bought"}`,
    });
  };

  const handleDeleteIdea = async (ideaId: string) => {
    await deleteIdea(ideaId);
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    toast({ title: "Idea Deleted", description: "Removed the idea." });
  };

  const handleFetchSuggestions = async () => {
    if (!g?.name) return;
    setIsFetchingSuggestions(true);
    setSuggestions([]);
    try {
      // Pass the bio along to the GPT function
      const newSuggestions = await getSuggestionsForGiftee(g.name, g.bio);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  return (
    <li className="flex items-center justify-between mb-2">
      <span>
        <a href={`/giftee/${g.id}`} className="text-blue-600 underline">
          {g.name}
        </a>
      </span>
      <div className="flex space-x-2">
        {/* View Ideas Dialog */}
        <Dialog open={isIdeasDialogOpen} onOpenChange={setIsIdeasDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="xs" className="text-blue-500">
              View Ideas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {g.name}'s {ideas.length} Ideas
              </DialogTitle>
            </DialogHeader>
            <IdeaList
              ideas={ideas}
              onToggleBought={handleToggleBought}
              onDelete={handleDeleteIdea}
            />
            <AddIdeaForm onAddIdea={handleAddIdea} />
            <div className="mb-6">
              <Button
                size="sm"
                variant="outline"
                className="bg-gradient-to-r from-purple-300 via-pink-300 to-red-300"
                onClick={handleFetchSuggestions}
                disabled={isFetchingSuggestions}
              >
                {isFetchingSuggestions ? "Thinking..." : "Get Suggestions"}
              </Button>
              {suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <ul
                      key={idx}
                      className="flex items-center justify-between list-disc list-inside"
                    >
                      <li className="flex justify-between items-center">
                        <span>{suggestion}</span>
                        <Button
                          variant="ghost"
                          className="text-blue-500"
                          size="sm"
                          onClick={() => handleAddIdea(suggestion)}
                        >
                          Add idea
                        </Button>
                      </li>
                    </ul>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="xs" className="text-blue-500">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{g.name}'s Details</DialogTitle>
            </DialogHeader>
            <DetailsForm giftee={g} />
          </DialogContent>
        </Dialog>
      </div>
    </li>
  );
}
