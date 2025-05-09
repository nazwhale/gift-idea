import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getSuggestionsForGiftee, Suggestion, FollowUpQuestion } from "@/lib/chatgpt";
import { Giftee, Idea } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { generateAmazonSearchUrl } from "../ActionList";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type SuggestionsTabProps = {
    giftee: Giftee;
    onAddIdea: (ideaName: string) => Promise<void>;
    onTabChange: (tab: string) => void;
};

export default function SuggestionsTab({
    giftee,
    onAddIdea,
    onTabChange
}: SuggestionsTabProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [selectedFollowUp, setSelectedFollowUp] = useState<string | undefined>(undefined);
    const [customFollowUp, setCustomFollowUp] = useState("");

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

    const handleCustomFollowUp = () => {
        if (customFollowUp.trim()) {
            handleFetchSuggestions(customFollowUp.trim());
            setCustomFollowUp("");
        }
    };

    return (
        <div className="flex flex-col flex-1">
            <div className="space-y-2 flex-1">
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
                                <CardContent className="py-2 px-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-grow mr-4">
                                            <div className="text-sm text-muted-foreground" data-testid={`suggestion-short-description-${idx}`}>
                                                {suggestion.shortDescription} – {suggestion.cost}
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
                                                onTabChange("ideas");
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

                        {/* Custom follow-up question input */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium mb-2">Ask your own question:</h3>
                            <div className="flex gap-2" data-testid="custom-follow-up">
                                <Input
                                    placeholder="Type your follow-up question..."
                                    value={customFollowUp}
                                    onChange={(e) => setCustomFollowUp(e.target.value)}
                                    disabled={isFetchingSuggestions}
                                    className="text-sm"
                                    data-testid="custom-follow-up-input"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && customFollowUp.trim()) {
                                            handleCustomFollowUp();
                                        }
                                    }}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCustomFollowUp}
                                    disabled={isFetchingSuggestions || !customFollowUp.trim()}
                                    data-testid="custom-follow-up-button"
                                >
                                    Ask
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center w-full flex-1 min-h-[300px] text-muted-foreground" data-testid="empty-suggestions">
                        Suggestions will appear here
                    </div>
                )}
            </div>

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
        </div>
    );
} 