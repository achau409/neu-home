import { SquareCheckBig } from "lucide-react";

interface AdvantagesProps {
  advantageData: any;
  title: string;
}

const Advantages = ({ advantageData, title }: AdvantagesProps) => {

  return (
    <section className="mt-10  py-12 px-4">
      <div className="w-full lg:w-[1180px] mx-auto">
        <h2 className="text-4xl font-semibold mb-12 text-center">
          {advantageData.sectionTitle || `Advantages Of ${title}`}
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantageData.advantageList.map((advantage: any, index: any) => (
            <li
              key={index}
              className="flex md:items-start items-center md:gap-4"
            >
              <SquareCheckBig
                strokeWidth={2.5}
                size={28}
                className="text-trust-heading mr-3 !min-w-[28px] mt-1"
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
    </section>
  );
};

export default Advantages;
