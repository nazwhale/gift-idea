import ActionList from "@/pages/ActionList.tsx";

export default function IdeaList({
  ideas,
  onToggleBought,
  onDelete,
  onEditUrl,
}: {
  ideas: any[];
  onToggleBought: (ideaId: string) => void;
  onDelete: (ideaId: string) => void;
  onEditUrl: (ideaId: string, currentUrl: string | null) => void;
}) {
  return ideas.length > 0 ? (
    <ul className="overflow-y-scroll max-h-96">
      {ideas.map((idea, index) => (
        <li
          key={idea.id}
          className={`flex items-center justify-between px-2 ${index < ideas.length - 1 ? "border-b" : ""
            }`}
          data-testid={`idea-item-${idea.id}`}
        >
          <div className="flex items-center text-sm">
            <p>{idea.name}</p>
            {idea.purchased_at && (
              <span className="ml-2 text-green-600">bought</span>
            )}
            {idea.url && (
              <a
                href={idea.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-500 hover:underline"
                data-testid={`idea-url-${idea.id}`}
              >
                🔗
              </a>
            )}
          </div>
          <ActionList
            ideaId={idea.id}
            ideaName={idea.name}
            isBought={!!idea.purchased_at}
            onToggleBought={onToggleBought}
            onDelete={onDelete}
            onEditUrl={onEditUrl}
            url={idea.url}
          />
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-gray-500">No ideas yet.</p>
  );
}
