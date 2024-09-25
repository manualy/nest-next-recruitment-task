"use client";
import { Select, SelectItem } from "@nextui-org/react";

export const CreativeStatusSelect = () => {
  return (
    <Select
      label="Status"
      labelPlacement="outside"
      placeholder="Select status"
      className="max-w-xs"
    >
      {[
        { label: "PAUSED", value: "PAUSED" },
        { label: "ACTIVE", value: "ACTIVE" },
        { label: "NEW", value: "NEW" },
      ].map((animal) => (
        <SelectItem key={animal.value}>{animal.label}</SelectItem>
      ))}
    </Select>
  );
};
