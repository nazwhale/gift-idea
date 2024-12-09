import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getIdeasForGiftee,
  addIdea,
  updateIdea,
  deleteIdea,
} from "../lib/ideas";
import { deleteGiftee, getGifteeById, updateGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "@/components/ui/label";

import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Giftee } from "@/types.tsx";
import { Badge } from "@/components/ui/badge.tsx";

export default function GifteeDetail() {
  const { id: gifteeId } = useParams();
  const [giftee, setGiftee] = useState<any | null>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [ideaName, setIdeaName] = useState("");
  // dob
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  useEffect(() => {
    if (gifteeId) {
      // Fetch giftee's name
      getGifteeById(gifteeId)
        .then((giftee) => {
          setGiftee(giftee);
          setDay(giftee.date_of_birth?.split("-")[2] || "");
          setMonth(giftee.date_of_birth?.split("-")[1] || "");
          setYear(giftee.date_of_birth?.split("-")[0] || "");
        })

        .catch(console.error);

      // Fetch gift ideas for this giftee
      getIdeasForGiftee(gifteeId).then(setIdeas).catch(console.error);
    }
  }, [gifteeId]);

  // Generic handler for updating the giftee's date_of_birth
  const handleSaveDob = async () => {
    console.log("SAVEIHNG");
    // Validate and combine the inputs
    if (!day || !month || !year) {
      alert("Please fill out all fields");
      return;
    }
    const dob = `${year.padStart(4, "0")}-${month.padStart(
      2,
      "0"
    )}-${day.padStart(2, "0")}`;

    console.log("giftee", giftee);

    if (!gifteeId) return;

    try {
      await updateGiftee(giftee.id, { date_of_birth: dob, id: giftee.id });
      setGiftee((prev: Giftee) =>
        prev ? { ...prev, date_of_birth: dob, id: giftee.id } : null
      );
    } catch (error) {
      console.error("Error updating date_of_birth:", error.message);
    }
  };

  const handleAddIdea = async () => {
    if (!gifteeId) return;
    const idea = await addIdea(gifteeId, ideaName);
    setIdeas([...ideas, idea]);
    setIdeaName("");
  };

  const handleDeleteGiftee = async (gifteeId: string) => {
    await deleteGiftee(gifteeId);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    if (ideaName.trim()) {
      handleAddIdea(); // Trigger the add giftee function
    }
  };

  if (!giftee) return <div>Loading...</div>;

  return (
    <div>
      {/* Link back to Home */}
      <div className="mb-4">
        <Link to="/" className="text-sm text-primary underline">
          ← Home
        </Link>
      </div>
      {/* Giftee Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl flex justify-between">
            <div className="flex items-center">
              <div className="mr-2">{giftee.name || "Loading..."} </div>
              {giftee.on_christmas && (
                <Badge variant="outline" className="ml-1 bg-green-100">
                  Christmas
                </Badge>
              )}
              {giftee.on_birthday && (
                <Badge variant="outline" className="ml-1 bg-blue-100">
                  Birthday
                </Badge>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="text-red-500"
              onClick={() => handleDeleteGiftee(giftee.id)}
            >
              Delete
            </Button>
          </CardTitle>
          <CardDescription className="text-secondary">
            Has {ideas.length} ideas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="DD"
                maxLength={2}
                value={day}
                onChange={(e) => setDay(e.target.value.replace(/\D/g, ""))} // Allow only numbers
                className="w-16"
              />
              <Input
                type="text"
                placeholder="MM"
                maxLength={2}
                value={month}
                onChange={(e) => setMonth(e.target.value.replace(/\D/g, ""))} // Allow only numbers
                className="w-16"
              />
              <Input
                type="text"
                placeholder="YYYY"
                maxLength={4}
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))} // Allow only numbers
                className="w-20"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleSaveDob}>
              Save Date of Birth
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Idea name"
              value={ideaName}
              onChange={(e) => setIdeaName(e.target.value)}
            />
            <Button type="submit">Add Idea</Button>
          </form>
        </CardHeader>
      </Card>
      {/* Gift Ideas List */}
      <div className="mt-6 space-y-4">
        {ideas?.map((idea) => (
          <Idea idea={idea} key={idea.id} setIdeas={setIdeas} ideas={ideas} />
        ))}
      </div>
    </div>
  );
}

function Idea({ idea, setIdeas, ideas }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(idea.url || "");
  }, [idea]);

  const handleToggleChosen = async (ideaId: string, current: Date | null) => {
    const purchasedAt = current ? null : new Date();

    const updated = await updateIdea(ideaId, {
      purchased_at: purchasedAt,
    });

    setIdeas(ideas.map((i) => (i.id === ideaId ? updated : i)));
  };

  const handleUpdateUrl = async () => {
    await updateIdea(idea.id, {
      url,
    });
  };

  const handleDeleteIdea = async (ideaId: string) => {
    await deleteIdea(ideaId);
    setIdeas(ideas.filter((i) => i.id !== ideaId));
  };

  const handleRating = async (ideaId: string, rating: number) => {
    const updated = await updateIdea(ideaId, { rating });
    setIdeas(ideas.map((i) => (i.id === ideaId ? updated : i)));
  };

  const handleSubmitUrl = (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    if (url.trim()) {
      handleUpdateUrl(); // Trigger the add url function
    }
  };

  return (
    <Card key={idea.id} className="p-6">
      {/*// open in new tab*/}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-md">{idea.name}</h3>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-secondary text-blue-500"
            >
              <span>link</span>
            </a>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteIdea(idea.id)}
          className="text-red-500"
        >
          Delete
        </Button>
      </div>

      <form onSubmit={handleSubmitUrl} className="flex my-4">
        <Input
          placeholder="www.amazon.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button type="submit" variant="ghost">
          Add link
        </Button>
      </form>

      {idea.purchased_at != null && (
        <div className="flex flex-col my-4">
          <Label htmlFor="dateOfBirth" className="mb-2">
            Giftee's rating
          </Label>
          <div className="space-x-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <Button
                key={num}
                size="sm"
                variant={idea.rating === num ? "default" : "outline"}
                onClick={() => handleRating(idea.id, num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center my-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToggleChosen(idea.id, idea.purchased_at)}
          className={idea.purchased_at == null ? "text-blue-500" : "text-black"}
        >
          {idea.purchased_at == null ? "Bought" : "Not bought"}
        </Button>
      </div>
    </Card>
  );
}
