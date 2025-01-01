import ActionList from "@/pages/ActionList.tsx";

export default function IdeaList({
  ideas,
  onMarkAsBought,
  onDelete,
}: {
  ideas: any[];
  onMarkAsBought: (ideaId: string) => void;
  onDelete: (ideaId: string) => void;
}) {
  return ideas.length > 0 ? (
    <ul className="space-y-2 overflow-y-scroll max-h-96">
      {ideas.map((idea) => (
        <li
          key={idea.id}
          className="flex items-center justify-between border-b p-2 rounded"
        >
          <div>
            <p>{idea.name}</p>
            {idea.purchased_at && (
              <span className="ml-2 text-sm text-green-600">(bought)</span>
            )}
          </div>
          <ActionList
            ideaId={idea.id}
            isBought={!!idea.purchased_at}
            onMarkAsBought={onMarkAsBought}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-gray-500">No ideas yet.</p>
  );
}
