/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import {
  useSearchStore,
  type PersonFilter,
} from "../../../../../../store/searchStore";
import { usePopupStore } from "../../../../../shared/popups/popup.store";
import {
  PopupContainer,
  PopupItem,
  CheckMark,
} from "../../styles/filterPopup.styles";
import { useClickOutside } from "../../../../../shared/hooks/useOutsideClick";
import { usePopupPosition } from "../../../../../shared/hooks/usePopupPosition";
import api from "../../../../../../lib/axios";

interface PersonPopupProps {
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
}

interface Person {
  id: string;
  name: string;
  email: string;
  isYou: boolean;
}

const PersonPopup: React.FC<PersonPopupProps> = ({ anchorRef }) => {
  const popupRef = React.useRef<HTMLDivElement>(null);

  const isOpen = usePopupStore((s) => s.isPersonPopupOpen);
  const closePopup = usePopupStore((s) => s.togglePersonPopup);

  const personFilter = useSearchStore((s) => s.filters.person);
  const setPerson = useSearchStore((s) => s.setPerson);

  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  const position = usePopupPosition({
    isOpen,
    anchorRef,
    popupRef,
    placement: "bottom-left",
    offset: 8,
  });

  useClickOutside(popupRef as React.RefObject<HTMLElement>, closePopup);

  useEffect(() => {
    if (isOpen) {
      fetchPeople();
    }
  }, [isOpen]);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await api.get("/files/people");
      const data = response.data;
      if (data.success) {
        setPeople(data.people);
      }
    } catch (err) {
      console.error("Failed to fetch people:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelect = (person: PersonFilter | null) => {
    setPerson(person);
    closePopup();
  };

  const handleClear = () => {
    setPerson(null);
    closePopup();
  };

  return (
    <PopupContainer
      ref={popupRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: "200px",
      }}
    >
      <PopupItem $selected={personFilter === null} onClick={handleClear}>
        All People
        {personFilter === null && <CheckMark>✓</CheckMark>}
      </PopupItem>
      {loading ? (
        <PopupItem>Loading...</PopupItem>
      ) : (
        people.map((person) => {
          const personFilterValue: PersonFilter = {
            id: person.id,
            name: person.name,
            isYou: person.isYou,
          };
          const isSelected = personFilter === person.id;

          return (
            <PopupItem
              key={person.id}
              $selected={isSelected}
              onClick={() => handleSelect(personFilterValue)}
            >
              {person.isYou ? "Me" : person.name}
              {isSelected && <CheckMark>✓</CheckMark>}
            </PopupItem>
          );
        })
      )}
    </PopupContainer>
  );
};

export default PersonPopup;
