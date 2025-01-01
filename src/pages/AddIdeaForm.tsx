import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function AddIdeaForm({
  onAddIdea,
}: {
  onAddIdea: (ideaName: string) => void;
}) {
  const [ideaName, setIdeaName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ideaName.trim()) {
      onAddIdea(ideaName);
      setIdeaName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 mt-4">
      <Input
        placeholder="Add new idea"
        value={ideaName}
        onChange={(e) => setIdeaName(e.target.value)}
      />
      <Button type="submit">Add</Button>
    </form>
  );
}
