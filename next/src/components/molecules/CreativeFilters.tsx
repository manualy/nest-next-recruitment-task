import { CampaignsMultiSelect } from "../atoms/CampaignsMultiSelect";
import { CreativeSizesSelect } from "../atoms/CreativeSizesSelect";
import { CreativeStatusSelect } from "../atoms/CreativeStatusSelect";
import { DateRangeSelect } from "../atoms/DateRangeSelect";

export const CreativeFilters = () => {
  return (
    <div className="grid grid-flow-col gap-4">
      <CampaignsMultiSelect />
      <DateRangeSelect />
      <CreativeSizesSelect />
      <CreativeStatusSelect />
    </div>
  );
};
