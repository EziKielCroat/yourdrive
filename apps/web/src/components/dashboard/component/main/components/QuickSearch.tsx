import React from "react";
import styled from "styled-components";

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
import { useUserUiPreferencesStore } from "../../../../../store/userUiPreferencesStore";
import FileTypePopup from "./filters/FileTypePopup";
import PersonPopup from "./filters/PersonPopup";
import LastModifiedPopup from "./filters/LastModifiedPopup";
import AdvancedPopup from "./filters/AdvancedPopup";
import SidebarToggle from "../../sidebar/SidebarToggle";

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
  const advancedFilterRef = React.useRef<HTMLButtonElement>(null);

  const toggleFileTypePopup = usePopupStore((s) => s.toggleFileTypePopup);
  const togglePersonPopup = usePopupStore((s) => s.togglePersonPopup);
  const toggleLastModifiedPopup = usePopupStore(
    (s) => s.toggleLastModifiedPopup,
  );
  const toggleAdvancedPopup = usePopupStore((s) => s.toggleAdvancedPopup);

  const query = useSearchStore((s) => s.filters.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const hasActiveFilters = useSearchStore((s) => s.hasActiveFilters);
  const searchEnabled = useUserUiPreferencesStore(
    (s) => s.privacy?.indexFilesForSearch !== false,
  );

  const iconColor = "#1A1A1A";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <SearchContainer data-search-disabled={!searchEnabled}>
      {!searchEnabled && (
        <SearchDisabledNote>
          Search and filters are turned off in Settings → Privacy. Enable
          &quot;Search &amp; filters&quot; to use them here.
        </SearchDisabledNote>
      )}
      {showFilters && (
        <>
          <LastModifiedPopup anchorRef={lastModifiedFilterRef} />
          <PersonPopup anchorRef={personFilterRef} />
          <FileTypePopup anchorRef={fileTypeFilterRef} />
          <AdvancedPopup anchorRef={advancedFilterRef} />
        </>
      )}

      <SearchRow>
        <LeftSection>
          <SidebarToggle />
        </LeftSection>
        <CenterSection>
          <InputWrapper data-tour="tour-search">
            <SearchIcon color={iconColor} />
            <input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              disabled={!searchEnabled}
            />
            {showFilters && (
              <button
                type="button"
                data-advanced-filter="true"
                ref={advancedFilterRef}
                onClick={toggleAdvancedPopup}
                disabled={!searchEnabled}
                style={{
                  opacity: hasActiveFilters() ? 1 : 0.6,
                }}
              >
                <FilterIcon color={iconColor} />
              </button>
            )}
          </InputWrapper>
        </CenterSection>
        <RightSection />
      </SearchRow>

      {showFilters && (
        <FilterButtons>
          <FilterButton
            ref={fileTypeFilterRef}
            onClick={toggleFileTypePopup}
            disabled={!searchEnabled}
          >
            <span>
              <FileIcon color={iconColor} />
            </span>
            <FilterText>Type</FilterText>
          </FilterButton>
          <FilterButton
            ref={personFilterRef}
            onClick={togglePersonPopup}
            disabled={!searchEnabled}
          >
            <span>
              <PersonIcon color={iconColor} />
            </span>
            <FilterText>Person</FilterText>
          </FilterButton>
          <FilterButton
            ref={lastModifiedFilterRef}
            onClick={toggleLastModifiedPopup}
            disabled={!searchEnabled}
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

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    row-gap: 8px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  flex: 0 0 auto;

  @media (max-width: 768px) {
    order: 1;
  }
`;

const CenterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;

  @media (max-width: 768px) {
    order: 2;
    width: 100%;
  }
`;

const RightSection = styled.div`
  flex: 0 0 auto;
  width: 66px;

  @media (max-width: 768px) {
    order: 3;
    width: auto;
  }
`;

const SearchDisabledNote = styled.p`
  margin: 0 0 10px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.4;
  color: #5c6b7d;
  background: #f3f7fc;
  border: 1px solid #dbe7f4;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
`;
