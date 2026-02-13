import React, { useState, useEffect } from "react";
import { useSearchStore } from "../../../../../../store/searchStore";
import { usePopupStore } from "../../../../../shared/popups/popup.store";
import {
  PopupContainer,
  PopupItem,
  InputGroup,
  Label,
  Input,
  SelectWrapper,
  StyledSelect,
} from "../../styles/filterPopup.styles";
import { usePopupPosition } from "../../../../../shared/hooks/usePopupPosition";
import ChevronDownIcon from "../../../../../shared/icons/chevronDown";

interface AdvancedPopupProps {
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
}

const locationOptions = [
  { value: "all", label: "All Locations" },
  { value: "my-files", label: "My Files" },
  { value: "shared-with-me", label: "Shared With Me" },
  { value: "starred", label: "Starred" },
  { value: "trash", label: "Trash" },
  { value: "specific-folder", label: "Specific Folder..." },
];

const sizeUnits = ["KB", "MB", "GB"];

const AdvancedPopup: React.FC<AdvancedPopupProps> = ({ anchorRef }) => {
  const popupRef = React.useRef<HTMLDivElement>(null);

  const isOpen = usePopupStore((s) => s.isAdvancedPopupOpen);
  const closePopup = usePopupStore((s) => s.closeAdvancedPopup);

  const advancedFilters = useSearchStore((s) => s.filters.advanced);
  const setAdvancedFilters = useSearchStore((s) => s.setAdvancedFilters);
  const clearAllFilters = useSearchStore((s) => s.resetFilters);

  const [location, setLocation] = useState(advancedFilters?.location || "all");
  const [modifiedAfter, setModifiedAfter] = useState(
    advancedFilters?.modifiedAfter || ""
  );
  const [modifiedBefore, setModifiedBefore] = useState(
    advancedFilters?.modifiedBefore || ""
  );
  const [minSize, setMinSize] = useState(advancedFilters?.minSize || "");
  const [minSizeUnit, setMinSizeUnit] = useState(
    advancedFilters?.minSizeUnit || "MB"
  );
  const [maxSize, setMaxSize] = useState(advancedFilters?.maxSize || "");
  const [maxSizeUnit, setMaxSizeUnit] = useState(
    advancedFilters?.maxSizeUnit || "MB"
  );

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const position = usePopupPosition({
    isOpen,
    anchorRef,
    popupRef,
    placement: "bottom-right",
    offset: 8,
  });

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (popupRef.current?.contains(target)) return;
      if (anchorRef?.current?.contains(target)) return;
      closePopup();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [closePopup, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopup();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closePopup]);

  if (!isOpen) return null;

  const handleApply = () => {
    setAdvancedFilters({
      location,
      modifiedAfter: modifiedAfter || null,
      modifiedBefore: modifiedBefore || null,
      minSize: minSize || null,
      minSizeUnit,
      maxSize: maxSize || null,
      maxSizeUnit,
    });
    closePopup();
  };

  const handleLocationSelect = (value: string) => {
    setLocation(value);
    if (value === "specific-folder") {
      console.log("Open folder selector");
    }
    setExpandedSection(null);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <PopupContainer
      ref={popupRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: "280px",
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      <AccordionSection>
        <AccordionHeader onClick={() => toggleSection("location")}>
          <AccordionTitle>Location</AccordionTitle>
          <ChevronIcon $expanded={expandedSection === "location"}>
            <ChevronDownIcon color="#5f6368" />
          </ChevronIcon>
        </AccordionHeader>
        {expandedSection === "location" && (
          <AccordionContent>
            {locationOptions.map((option) => (
              <PopupItem
                key={option.value}
                $selected={location === option.value}
                onClick={() => handleLocationSelect(option.value)}
              >
                {option.label}
              </PopupItem>
            ))}
          </AccordionContent>
        )}
      </AccordionSection>

      <Divider />

      <AccordionSection>
        <AccordionHeader onClick={() => toggleSection("date")}>
          <AccordionTitle>Date Modified</AccordionTitle>
          <ChevronIcon $expanded={expandedSection === "date"}>
            <ChevronDownIcon color="#5f6368" />
          </ChevronIcon>
        </AccordionHeader>
        {expandedSection === "date" && (
          <AccordionContent>
            <InputGroup>
              <Label>Modified After</Label>
              <Input
                type="date"
                value={modifiedAfter}
                onChange={(e) => setModifiedAfter(e.target.value)}
              />
            </InputGroup>
            <InputGroup>
              <Label>Modified Before</Label>
              <Input
                type="date"
                value={modifiedBefore}
                onChange={(e) => setModifiedBefore(e.target.value)}
              />
            </InputGroup>
          </AccordionContent>
        )}
      </AccordionSection>

      <Divider />

      <AccordionSection>
        <AccordionHeader onClick={() => toggleSection("size")}>
          <AccordionTitle>File Size</AccordionTitle>
          <ChevronIcon $expanded={expandedSection === "size"}>
            <ChevronDownIcon color="#5f6368" />
          </ChevronIcon>
        </AccordionHeader>
        {expandedSection === "size" && (
          <AccordionContent>
            <InputGroup>
              <Label>Min Size</Label>
              <SelectWrapper>
                <Input
                  type="number"
                  value={minSize}
                  onChange={(e) => setMinSize(e.target.value)}
                  placeholder="0"
                  min="0"
                  style={{ flex: 2 }}
                />
                <StyledSelect
                  value={minSizeUnit}
                  onChange={(e) => setMinSizeUnit(e.target.value)}
                >
                  {sizeUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </StyledSelect>
              </SelectWrapper>
            </InputGroup>
            <InputGroup>
              <Label>Max Size</Label>
              <SelectWrapper>
                <Input
                  type="number"
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  placeholder="∞"
                  min="0"
                  style={{ flex: 2 }}
                />
                <StyledSelect
                  value={maxSizeUnit}
                  onChange={(e) => setMaxSizeUnit(e.target.value)}
                >
                  {sizeUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </StyledSelect>
              </SelectWrapper>
            </InputGroup>
          </AccordionContent>
        )}
      </AccordionSection>

      <Divider />

      {/* Action Buttons */}
      <ButtonGroup>
        <ClearButton
          onClick={() => {
            clearAllFilters();
            setLocation("all");
            setModifiedAfter("");
            setModifiedBefore("");
            setMinSize("");
            setMaxSize("");
            closePopup();
          }}
        >
          Clear All
        </ClearButton>
        <ApplyButton onClick={handleApply}>Apply</ApplyButton>
      </ButtonGroup>
    </PopupContainer>
  );
};

// Styled Components
import styled from "styled-components";

const AccordionSection = styled.div``;

const AccordionHeader = styled.div`
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #f5f5f5;
  }
`;

const AccordionTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #202124;
`;

const ChevronIcon = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  transform: ${(props) => (props.$expanded ? "rotate(180deg)" : "rotate(0)")};
`;

const AccordionContent = styled.div`
  animation: slideDown 0.2s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e0e0e0;
`;

const ButtonGroup = styled.div`
  padding: 12px 16px;
  display: flex;
  gap: 8px;
`;

const ClearButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  color: #5f6368;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f5f5f5;
    border-color: #d0d0d0;
  }
`;

const ApplyButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #1a73e8;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #1557b0;
  }
`;

export default AdvancedPopup;
