"use client";
import { Select, SelectItem } from "@nextui-org/react";

export const ChartDimensionSelect = () => {
  return (
    <Select
      label="Chart dimension"
      labelPlacement="outside"
      placeholder="Select dimension"
      className="max-w-xs"
    >
      {[
        { label: "Sizes", value: "sizes" },
        { label: "Days", value: "days" },
      ].map((animal) => (
        <SelectItem key={animal.value}>{animal.label}</SelectItem>
      ))}
    </Select>
  );
};
