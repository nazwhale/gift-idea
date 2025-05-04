import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

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
    <DialogFooter className="fixed bottom-0 left-0 right-0 pb-4 pt-4 bg-background border-t px-4">
      <form onSubmit={handleSubmit} className="flex w-full space-x-2">
        <Input
          placeholder="Add new idea"
          value={ideaName}
          onChange={(e) => setIdeaName(e.target.value)}
          data-testid="add-idea-input"
        />
        <Button type="submit" data-testid="add-idea-button">Add</Button>
      </form>
    </DialogFooter>
  );
}
