import { Card, CardFooter, CardHeader, Divider } from "@nextui-org/react";
import { GeneratorOptions } from "../molecules/GeneratorOptions";
import { CreativeFilters } from "../molecules/CreativeFilters";

export const FiltersSection = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CreativeFilters />
      </CardHeader>
      <Divider />
      <CardFooter>
        <GeneratorOptions />
      </CardFooter>
    </Card>
  );
};
