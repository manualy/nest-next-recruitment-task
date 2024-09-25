import { FiltersSection } from "@src/components/organisms/FiltersSection";
import { BudgetReportResults } from "@src/components/organisms/BudgetReportResults";
import { HeaderLogo } from "@src/components/atoms/HeaderLogo";

export default function Home() {
  return (
    <div className="flex flex-col items-center h-screen w-full">
      <header className="w-full flex flex-col items-center fixed bg-[rgb(var(--background-rgb))] z-50">
        <HeaderLogo />
        <div className="flex w-full items-center grow justify-center mt-8 px-24">
          <div className="max-w-[890px] w-full">
            <FiltersSection />
          </div>
        </div>
      </header>
      <main className="flex w-full items-center grow justify-center px-24 pt-96">
        <div className="max-w-[890px] w-full h-fit flex flex-col gap-6 py-14">
          <BudgetReportResults />
        </div>
      </main>
    </div>
  );
}
