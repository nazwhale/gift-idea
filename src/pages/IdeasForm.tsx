import { useState } from "react";
import { Button } from "../components/ui/button";
import { getSuggestionsForGiftee, Suggestion } from "@/lib/chatgpt";
import { Giftee, Idea } from "@/types";
import IdeaList from "./IdeaList";
import AddIdeaForm from "./AddIdeaForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

type IdeasFormProps = {
  giftee: Giftee;
  ideas: Idea[];
  onToggleBought: (ideaId: string) => Promise<void>;
  onDelete: (ideaId: string) => Promise<void>;
  onAddIdea: (ideaName: string) => Promise<void>;
};

export default function IdeasForm({ giftee, ideas, onToggleBought, onDelete, onAddIdea }: IdeasFormProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState("ideas");

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
    <div className="flex flex-col min-h-[400px]">
      <Tabs defaultValue="ideas" className="w-full flex-1" onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4 grid grid-cols-2">
          <TabsTrigger value="ideas" data-testid="ideas-tab">Ideas</TabsTrigger>
          <TabsTrigger value="ai" data-testid="suggestions-tab">
            <span className="flex items-center gap-2">
              <span role="img" aria-label="lightbulb">💡</span>
              Suggestions
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ideas" className="space-y-4 flex-1 overflow-auto" data-testid="ideas-content">
          <div className="overflow-y-auto pr-1 border border-gray-200 rounded-md">
            <IdeaList
              ideas={ideas}
              onToggleBought={onToggleBought}
              onDelete={onDelete}
            />
          </div>
        </TabsContent>

        <TabsContent value="ai" className="flex-1 overflow-auto" data-testid="ai-content">
          <div className="space-y-4">
            {suggestions.length > 0 ? (
              <div className="space-y-2 text-sm overflow-y-auto max-h-96">
                {suggestions.map((suggestion, idx) => (
                  <Card key={idx} data-testid={`suggestion-card-${idx}`}>
                    <CardContent className="pt-6 px-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-500 mr-4 min-w-10" data-testid={`suggestion-cost-${idx}`}>
                          {suggestion.cost}
                        </span>
                        <div className="flex-grow mr-4">
                          <div className="text-sm text-muted-foreground" data-testid={`suggestion-short-description-${idx}`}>
                            {suggestion.shortDescription}
                          </div>
                          <span className="break-words" data-testid={`suggestion-description-${idx}`}>
                            {suggestion.description}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="shrink-0"
                          size="xs"
                          onClick={() => {
                            onAddIdea(suggestion.description);
                            setActiveTab("ideas");
                          }}
                          data-testid={`add-suggestion-${idx}`}
                        >
                          Add idea
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center w-full flex-1 min-h-[300px] text-muted-foreground" data-testid="empty-suggestions">
                Suggestions will appear here
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer sections based on active tab */}
      {activeTab === "ideas" && (
        <AddIdeaForm onAddIdea={onAddIdea} />
      )}

      {activeTab === "ai" && (
        <DialogFooter className="sticky bottom-0 pb-4 pt-4 bg-background border-t">
          <Button
            size="sm"
            variant="outline"
            className="bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 w-full"
            onClick={handleFetchSuggestions}
            disabled={isFetchingSuggestions}
            data-testid="get-suggestions-button"
          >
            {isFetchingSuggestions ? "Thinking..." : "Get 3 Suggestions"}
          </Button>
        </DialogFooter>
      )}
    </div>
  );
} 