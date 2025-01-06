import { ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Gift, CheckCircle2, Users, Heart } from "lucide-react"; // Example icons from Lucide

export default function HomePage() {
  return (
    <div className="space-y-8 mb-2 mt-6 md:mb-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Never miss a gift again</h1>
        <p className="text-lg text-gray-600">
          Track birthdays, and store ideas, and get handy reminders.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
        <Button className="w-full sm:w-1/2" size="sm">
          <a href="/signup" className="text-center block text-sm">
            Signup
          </a>
        </Button>
        <Button className="w-full sm:w-1/2" size="sm" variant="outline">
          <a href="/login" className="text-center block text-sm">
            Login
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
        <FeatureCard
          title="Thoughtful Gift Planning"
          description="Compile meaningful gift ideas for your loved ones, personalized for every occasion. No more last-minute stress."
          icon={<Gift size={20} />}
          bgColor="bg-yellow-50"
        />
        <FeatureCard
          title="Organize Your Giftees"
          description="Easily keep track of all the people you care about and their special occasions, all in one place."
          icon={<Users size={20} />}
          bgColor="bg-purple-50"
        />
        <FeatureCard
          title="Track What’s Been Chosen"
          description="Mark gift ideas as bought and keep a record of which gifts were a hit. Stay organized and always on top of things."
          icon={<CheckCircle2 size={20} />}
          bgColor="bg-green-50"
        />
        <FeatureCard
          title="Memories That Matter"
          description="Cherish the joy of giving and reflect on what they loved most. Gift-giving made simpler, more intentional, and fun."
          icon={<Heart size={20} />}
          bgColor="bg-red-50"
        />
      </div>
    </div>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  bgColor: string;
  link?: {
    url: string;
    text: string;
  };
};

const FeatureCard = ({
  title,
  description,
  icon,
  bgColor,
  link,
}: FeatureCardProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-full ${bgColor}`}>{icon}</div>
        <span className="font-semibold text-lg">{title}</span>
      </div>
      <p className="text-gray-600">
        {description}
        {link && (
          <>
            {" "}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 hover:text-blue-800"
            >
              {link.text}
            </a>
            .
          </>
        )}
      </p>
    </div>
  );
};
