/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, type RefObject, useState } from "react";
import { usePopupStore } from "../popup.store";
import { useClickOutside } from "../../hooks/useOutsideClick";
import { usePopupPosition } from "../../hooks/usePopupPosition";

import { PopupIcon, PopupText } from "../styles/general";

import {
  PopupContainer,
  PopupItem,
} from "../../../dashboard/component/main/styles/filterPopup.styles";

import NewFolderIcon from "../../icons/newFolder";
import FileUploadIcon from "../../icons/fileUpload";
import UploadFolderIcon from "../../icons/uploadFolder";

import UppyUploadPopup from "./UppyUploadPopup";

interface UploadPopupProps {
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
}

const UploadPopup: React.FC<UploadPopupProps> = ({ anchorRef }) => {
  const isOpen = usePopupStore((s) => s.isUploadPopupOpen);
  const closeUploadPopup = usePopupStore((s) => s.closeUploadPopup);

  const popupRef = useRef<HTMLDivElement>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFolderPath, setUploadFolderPath] = useState("");

  const position = usePopupPosition({
    isOpen,
    anchorRef,
    popupRef,
    placement: "bottom-left",
    offset: 8,
  });

  useClickOutside(popupRef as RefObject<HTMLElement>, closeUploadPopup);

  const handleNewFolder = () => {
    console.log("Create new folder...");
    closeUploadPopup();
  };

  const handleFileUploadClick = () => {
    setUploadFolderPath("");
    setShowUploadModal(true);
    closeUploadPopup();
  };

  const handleFolderUploadClick = () => {
    setUploadFolderPath("");
    setShowUploadModal(true);
    closeUploadPopup();
  };

  const options = [
    { icon: NewFolderIcon, text: "New Folder", onClick: handleNewFolder },
    {
      icon: FileUploadIcon,
      text: "Upload File",
      onClick: handleFileUploadClick,
    },
    {
      icon: UploadFolderIcon,
      text: "Upload Folder",
      onClick: handleFolderUploadClick,
    },
  ];

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFolderPath("");
  };

  if (!isOpen)
    return (
      <UppyUploadPopup
        isOpen={showUploadModal}
        onClose={handleCloseUploadModal}
        folderPath={uploadFolderPath}
      />
    );

  return (
    <>
      <PopupContainer
        ref={popupRef}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          padding: "6px 0",
          display: "flex",
          flexDirection: "column",
          width: "210px",
        }}
      >
        {options.map(({ icon: Icon, text, onClick }) => (
          <PopupItem key={text} onClick={onClick}>
            <PopupIcon>
              <Icon color="#535355" />
            </PopupIcon>
            <PopupText>{text}</PopupText>
          </PopupItem>
        ))}
      </PopupContainer>

      <UppyUploadPopup
        isOpen={showUploadModal}
        onClose={handleCloseUploadModal}
        folderPath={uploadFolderPath}
      />
    </>
  );
};

export default UploadPopup;
