import ActionList from "@/pages/ActionList.tsx";

export default function IdeaList({
  ideas,
  onToggleBought,
  onDelete,
}: {
  ideas: any[];
  onToggleBought: (ideaId: string) => void;
  onDelete: (ideaId: string) => void;
}) {
  return ideas.length > 0 ? (
    <ul className="overflow-y-scroll max-h-96">
      {ideas.map((idea, index) => (
        <li
          key={idea.id}
          className={`flex items-center justify-between px-2 ${index < ideas.length - 1 ? "border-b" : ""
            }`}
        >
          <div className="flex items-center text-sm">
            <p>{idea.name}</p>
            {idea.purchased_at && (
              <span className="ml-2 text-green-600">bought</span>
            )}
          </div>
          <ActionList
            ideaId={idea.id}
            ideaName={idea.name}
            isBought={!!idea.purchased_at}
            onToggleBought={onToggleBought}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-gray-500">No ideas yet.</p>
  );
}
