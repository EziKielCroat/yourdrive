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
import { useSearchStore } from "../../../../../store/searchStore";
import FileTypePopup from "./filters/FileTypePopup";
import PersonPopup from "./filters/PersonPopup";
import LastModifiedPopup from "./filters/LastModifiedPopup";
import AdvancedPopup from "./filters/AdvancedPopup";

interface QuickSearchProps {
  placeholder?: string;
  showFilters?: boolean;
}

const QuickSearch: React.FC<QuickSearchProps> = ({
  placeholder = "Search by name or keyword...",
  showFilters = true,
}) => {
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

  const query = useSearchStore((s) => s.filters.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const hasActiveFilters = useSearchStore((s) => s.hasActiveFilters);

  const iconColor = "#1A1A1A";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <SearchContainer>
      {showFilters && (
        <>
          <LastModifiedPopup anchorRef={lastModifiedFilterRef} />
          <PersonPopup anchorRef={personFilterRef} />
          <FileTypePopup anchorRef={fileTypeFilterRef} />
          <AdvancedPopup anchorRef={advancedFilterRef} />
        </>
      )}

      <InputWrapper>
        <SearchIcon color={iconColor} />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
        />
        {showFilters && (
          <FilterIcon
            color={iconColor}
            ref={advancedFilterRef}
            onClick={toggleAdvancedPopup}
            style={{
              cursor: "pointer",
              opacity: hasActiveFilters() ? 1 : 0.6,
            }}
          />
        )}
      </InputWrapper>

      {showFilters && (
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
      )}
    </SearchContainer>
  );
};

export default QuickSearch;
