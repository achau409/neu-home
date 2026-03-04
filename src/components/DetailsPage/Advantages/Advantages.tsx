import { SquareCheckBig } from "lucide-react";

interface AdvantagesProps {
  advantageData: any;
  title: string;
}

const Advantages = ({ advantageData, title }: AdvantagesProps) => {

  return (
    <div className="mt-10  py-12 px-2">
      <div className="w-full lg:w-[1180px] mx-auto">
        <h1 className="text-4xl font-semibold mb-12 text-center">
          {advantageData.sectionTitle || `Advantages Of ${title}`}
        </h1>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantageData.advantageList.map((advantage: any, index: any) => (
            <li
              key={index}
              className="flex flex-col md:flex-row md:items-start gap-4"
            >
              <SquareCheckBig
                strokeWidth={2.5}
                size={28}
                className="text-[#0B1B3F] mr-3 !min-w-[28px] mt-1"
              />
              <div>
                <h2 className="text-xl font-bold mb-2 text-gray-800">
                  {advantage.title}
                </h2>
                <p className="text-gray-600 text-lg">{advantage.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Advantages;
