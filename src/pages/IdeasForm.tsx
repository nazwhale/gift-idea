import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { getSuggestionsForGiftee, Suggestion, FollowUpQuestion } from "@/lib/chatgpt";
import { Giftee, Idea } from "@/types";
import IdeaList from "./IdeaList";
import AddIdeaForm from "./AddIdeaForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { generateAmazonSearchUrl } from "./ActionList";
import DetailsForm from "@/pages/DetailsForm";

type IdeasFormProps = {
  giftee: Giftee;
  ideas: Idea[];
  onToggleBought: (ideaId: string) => Promise<void>;
  onDelete: (ideaId: string) => Promise<void>;
  onAddIdea: (ideaName: string) => Promise<void>;
  onDetailsUpdate?: (updated: boolean, updatedGiftee?: Giftee) => void;
  initialTab?: string;
};

export default function IdeasForm({
  giftee,
  ideas,
  onToggleBought,
  onDelete,
  onAddIdea,
  onDetailsUpdate,
  initialTab = "ideas"
}: IdeasFormProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedFollowUp, setSelectedFollowUp] = useState<string | undefined>(undefined);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleFetchSuggestions = async (followUpQuestion?: string) => {
    if (!giftee?.name) return;
    setIsFetchingSuggestions(true);
    setSuggestions([]);
    setFollowUpQuestions([]);
    setSelectedFollowUp(followUpQuestion);

    try {
      // Calculate age from date of birth if available
      let age: number | undefined;
      if (giftee.date_of_birth) {
        const birthDate = new Date(giftee.date_of_birth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();

        // Adjust age if birthday hasn't occurred yet this year
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      const response = await getSuggestionsForGiftee(giftee.name, giftee.bio || "", age, followUpQuestion);
      setSuggestions(response.suggestions);
      setFollowUpQuestions(response.followUpQuestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[400px]">
      <Tabs defaultValue={initialTab} value={activeTab} className="w-full flex-1" onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4 grid grid-cols-3">
          <TabsTrigger value="ideas" data-testid="ideas-tab">Ideas</TabsTrigger>
          <TabsTrigger value="ai" data-testid="suggestions-tab">
            <span className="flex items-center gap-2">
              Suggestions
            </span>
          </TabsTrigger>
          <TabsTrigger value="details" data-testid="details-tab">Details</TabsTrigger>
        </TabsList>

        {/* Ideas tab */}
        <TabsContent value="ideas" className="flex-1 overflow-auto mb-0" data-testid="ideas-content">
          <div className="overflow-y-auto pr-1 border border-gray-200 rounded-md">
            <IdeaList
              ideas={ideas}
              onToggleBought={onToggleBought}
              onDelete={onDelete}
              onEditUrl={(ideaId, currentUrl) => { }} // Empty function to satisfy TypeScript
            />
          </div>
        </TabsContent>

        {/* Suggestions tab */}
        <TabsContent value="ai" className="flex-1 overflow-auto mb-0" data-testid="ai-content">
          <div className="space-y-2">
            {selectedFollowUp && (
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => handleFetchSuggestions()}
                  data-testid="clear-follow-up"
                >
                  ← Back to general suggestions
                </Button>
                <p className="text-sm text-muted-foreground mt-1">
                  Showing suggestions for: <span className="font-medium">{selectedFollowUp}</span>
                </p>
              </div>
            )}

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
                          size="sm"
                          onClick={() => {
                            onAddIdea(suggestion.description);
                            setActiveTab("ideas");
                          }}
                          data-testid={`add-suggestion-${idx}`}
                        >
                          Save idea
                        </Button>
                      </div>
                      <div className="flex justify-end mt-2 space-x-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-sm text-blue-500 p-0 h-auto"
                          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(suggestion.description)}`, '_blank')}
                          data-testid={`google-suggestion-${idx}`}
                        >
                          Google it →
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-sm text-orange-500 p-0 h-auto"
                          onClick={() => window.open(generateAmazonSearchUrl(suggestion.description), '_blank')}
                          data-testid={`amazon-suggestion-${idx}`}
                        >
                          Amazon it →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Follow-up questions section */}
                {followUpQuestions.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium mb-3">Refine your suggestions:</h3>
                    <div className="flex flex-wrap gap-2" data-testid="follow-up-questions">
                      {followUpQuestions.map((question, idx) => (
                        <Button
                          key={idx}
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleFetchSuggestions(question.text)}
                          disabled={isFetchingSuggestions}
                          data-testid={`follow-up-question-${idx}`}
                        >
                          {question.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center w-full flex-1 min-h-[300px] text-muted-foreground" data-testid="empty-suggestions">
                Suggestions will appear here
              </div>
            )}
          </div>
        </TabsContent>

        {/* Details tab */}
        <TabsContent value="details" className="flex-1 overflow-auto mb-0" data-testid="details-content">
          <div className="space-y-2">
            {onDetailsUpdate && <DetailsForm giftee={giftee} onClose={onDetailsUpdate} />}
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
            onClick={() => handleFetchSuggestions()}
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