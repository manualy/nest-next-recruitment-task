import { Card, CardFooter, CardHeader, Divider } from "@nextui-org/react";
import { BudgetReportTable } from "../molecules/BudgetReportTable";

export const ResultCard = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <BudgetReportTable />
      </CardHeader>
      <Divider />
      <CardFooter>
        <div className="w-full flex items-center justify-center">chart</div>
      </CardFooter>
    </Card>
  );
};
