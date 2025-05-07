import ActionList from "@/pages/ActionList.tsx";
import { Idea } from "@/types";
import { useEffect } from "react";

export default function IdeaList({
  ideas,
  onToggleBought,
  onDelete,
  onEditUrl,
}: {
  ideas: Idea[];
  onToggleBought: (ideaId: string) => void;
  onDelete: (ideaId: string) => void;
  onEditUrl: (ideaId: string, currentUrl: string | null) => void;
}) {
  // Debug logging to monitor incoming ideas
  useEffect(() => {
    console.log("IdeaList RENDER - Ideas received:", JSON.stringify(ideas));

    // Check each idea's URL property
    ideas.forEach(idea => {
      console.log(`Idea ${idea.id} - ${idea.name} - URL:`, idea.url,
        "Type:", typeof idea.url,
        "Has URL prop:", Object.prototype.hasOwnProperty.call(idea, 'url'),
        "Props:", Object.keys(idea)
      );
    });
  }, [ideas]);

  return ideas.length > 0 ? (
    <ul className="overflow-y-scroll max-h-96">
      {ideas.map((idea, index) => {
        // Create a new reference for each idea to ensure React detects changes
        const currentIdea = { ...idea };

        // Force ensure URL property exists, even if undefined or null
        if (!Object.prototype.hasOwnProperty.call(currentIdea, 'url')) {
          console.warn(`Idea ${currentIdea.id} missing url property - adding it`);
          currentIdea.url = undefined;
        }

        // SANITY CHECK: Filter out corrupt URLs that contain JSON data
        if (currentIdea.url &&
          (currentIdea.url.includes('{"id":') ||
            currentIdea.url.includes('CHANGED') ||
            currentIdea.url.includes('[{') ||
            currentIdea.url.length > 1000)) {
          console.error(`Corrupt URL detected for idea ${currentIdea.id} - cleaning`);
          currentIdea.url = undefined;
        }

        // Explicit boolean check for URL display
        const hasUrl = Boolean(currentIdea.url);

        console.log(`Rendering idea ${currentIdea.id}: URL=${currentIdea.url}, hasUrl=${hasUrl}`);

        return (
          <li
            key={`${currentIdea.id}-${hasUrl ? 'has-url' : 'no-url'}`}
            className={`flex items-center justify-between px-2 ${index < ideas.length - 1 ? "border-b" : ""
              }`}
            data-testid={`idea-item-${currentIdea.id}`}
          >
            <div className="flex items-center text-sm">
              <p>{currentIdea.name}</p>
              {currentIdea.purchased_at && (
                <span className="ml-2 text-green-600">bought</span>
              )}
              {hasUrl && (
                <a
                  href={currentIdea.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-500 hover:underline"
                  data-testid={`idea-url-${currentIdea.id}`}
                >
                  🔗
                </a>
              )}
            </div>
            <ActionList
              ideaId={currentIdea.id}
              ideaName={currentIdea.name}
              isBought={!!currentIdea.purchased_at}
              onToggleBought={onToggleBought}
              onDelete={onDelete}
              onEditUrl={onEditUrl}
              url={currentIdea.url}
            />
          </li>
        );
      })}
    </ul>
  ) : (
    <p className="text-sm text-gray-500">No ideas yet.</p>
  );
}
