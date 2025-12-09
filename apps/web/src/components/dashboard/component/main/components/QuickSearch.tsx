import React from "react";

import SearchIcon from "../../../../shared/icons/searchIcon";
import FilterIcon from "../../../../shared/icons/filter";
import {
  SearchContainer,
  InputWrapper,
  FilterButtons,
  FilterButton,
  FilterText,
} from "../styles/search.styles";
import FileIcon from "../../../../shared/icons/file";
import PersonIcon from "../../../../shared/icons/person";
import CalendarIcon from "../../../../shared/icons/calendar";

import { usePopupStore } from "../../../../shared/popups/popup.store";
import FileTypePopup from "./filters/FileTypePopup";
import PersonPopup from "./filters/PersonPopup";
import LastModifiedPopup from "./filters/LastModifiedPopup";
import AdvancedPopup from "./filters/AdvancedPopup";

interface QuickSearchProps {
  // Add props as needed
}

const QuickSearch: React.FC<QuickSearchProps> = () => {
  const personFilterRef = React.useRef<HTMLButtonElement>(null);
  const fileTypeFilterRef = React.useRef<HTMLButtonElement>(null);
  const lastModifiedFilterRef = React.useRef<HTMLButtonElement>(null);
  const advancedFilterRef = React.useRef<SVGSVGElement>(null);

  const toggleFileTypePopup = usePopupStore((s) => s.toggleFileTypePopup);
  const togglePersonPopup = usePopupStore((s) => s.togglePersonPopup);
  const toggleLastModifiedPopup = usePopupStore(
    (s) => s.toggleLastModifiedPopup
  );
  const toggleAdvancedPopup = usePopupStore((s) => s.toggleAdvancedPopup);

  const iconColor = "#1A1A1A";

  return (
    <SearchContainer>
      <LastModifiedPopup anchorRef={lastModifiedFilterRef} />
      <PersonPopup anchorRef={personFilterRef} />
      <FileTypePopup anchorRef={fileTypeFilterRef} />
      <AdvancedPopup anchorRef={advancedFilterRef} />{" "}
      <InputWrapper>
        <SearchIcon color={iconColor} />
        <input type="text" placeholder="Search by name or keyword..." />
        <FilterIcon
          color={iconColor}
          ref={advancedFilterRef}
          onClick={toggleAdvancedPopup}
        />
      </InputWrapper>
      <FilterButtons>
        <FilterButton ref={fileTypeFilterRef} onClick={toggleFileTypePopup}>
          <span>
            <FileIcon color={iconColor} />
          </span>
          <FilterText>Type</FilterText>
        </FilterButton>
        <FilterButton ref={personFilterRef} onClick={togglePersonPopup}>
          <span>
            <PersonIcon color={iconColor} />
          </span>
          <FilterText>Person</FilterText>
        </FilterButton>
        <FilterButton
          ref={lastModifiedFilterRef}
          onClick={toggleLastModifiedPopup}
        >
          <span>
            <CalendarIcon color={iconColor} />
          </span>
          <FilterText>Last Modified</FilterText>
        </FilterButton>
      </FilterButtons>
    </SearchContainer>
  );
};

export default QuickSearch;
