"use client";
import { Select, SelectItem } from "@nextui-org/react";

export const CreativeSizesSelect = () => {
  return (
    <Select
      label="Sizes"
      placeholder="Select an animal"
      selectionMode="multiple"
      className="max-w-xs"
    >
      {[
        { label: "Campaign 1", value: "1" },
        { label: "Campaign 2", value: "2" },
      ].map((animal) => (
        <SelectItem key={animal.value}>{animal.label}</SelectItem>
      ))}
    </Select>
  );
};
