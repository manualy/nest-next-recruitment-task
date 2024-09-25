import { ChartDimensionSelect } from "../atoms/ChartDimensionSelect";
import { GenerateReportButton } from "../atoms/GenerateReportButton";

export const GeneratorOptions = () => {
  return (
    <div className="w-full flex justify-between items-baseline">
      <ChartDimensionSelect />
      <GenerateReportButton />
    </div>
  );
};
