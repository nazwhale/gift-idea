import { ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Gift, Rabbit, WandSparkles, Bell } from "lucide-react"; // lucide.dev/icons

const features = [
  {
    id: 1,
    title: "Store Ideas & People",
    description: "Keep track of gift ideas and the people you care about.",
    icon: <Gift size={20} />,
    bgColor: "bg-blue-50",
  },
  {
    id: 2,
    title: "Magically Generate ideas",
    description:
      "Personalized gift ideas based on biography and age, powered by AI.",
    icon: <WandSparkles size={20} />,
    bgColor: "bg-purple-50",
  },
  {
    id: 3,
    title: "Never Miss a Birthday",
    description:
      "Automated reminders for birthdays and key events keep you prepared.",
    icon: <Bell size={20} />,
    bgColor: "bg-yellow-50",
  },
  {
    id: 4,
    title: "Fast Amazon Search",
    description:
      "Find and buy gifts in seconds with direct Amazon search integration.",
    icon: <Rabbit size={20} />,
    bgColor: "bg-green-50",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8 mb-2 mt-6 md:mb-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Never miss a gift again</h1>
        <p className="text-lg text-gray-600">
          Track ideas, stay reminded, and get AI-powered gift suggestions for
          every occasion.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
        <a href="/signup" className="w-full sm:w-1/2">
          <Button className="w-full">Get started for free</Button>
        </a>
        <a href="/login" className="w-full sm:w-1/2">
          <Button className="w-full" variant="outline">
            Login
          </Button>
        </a>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            bgColor={feature.bgColor}
          />
        ))}
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
