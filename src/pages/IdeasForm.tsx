import { useState, useEffect } from "react";
import { Giftee, Idea } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SuggestionsTab from "./tabs/Suggestions";
import IdeasTab from "./tabs/Ideas";
import DetailsTab from "./tabs/Details";

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
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
          <IdeasTab
            giftee={giftee}
            ideas={ideas}
            onToggleBought={onToggleBought}
            onDelete={onDelete}
            onAddIdea={onAddIdea}
          />
        </TabsContent>

        {/* Suggestions tab */}
        <TabsContent value="ai" className="flex-1 overflow-auto mb-0" data-testid="ai-content">
          <SuggestionsTab
            giftee={giftee}
            onAddIdea={onAddIdea}
            onTabChange={setActiveTab}
          />
        </TabsContent>

        {/* Details tab */}
        <TabsContent value="details" className="flex-1 overflow-auto mb-0" data-testid="details-content">
          {onDetailsUpdate && <DetailsTab giftee={giftee} onClose={onDetailsUpdate} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}