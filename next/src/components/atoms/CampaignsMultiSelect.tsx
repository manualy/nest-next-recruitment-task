"use client";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

export const CampaignsMultiSelect = () => {
  return (
    <Autocomplete
      defaultItems={[
        { label: "Campaign 1", value: "1" },
        { label: "Campaign 2", value: "2" },
      ]}
      labelPlacement="outside"
      label="Campaigns"
      placeholder="Search an animal"
      variant="flat"
    >
      {(animal) => (
        <AutocompleteItem key={animal.value}>{animal.label}</AutocompleteItem>
      )}
    </Autocomplete>
  );
};
