import { type FC, type ReactNode, useEffect, useId, memo } from "react";
import { Root, Layout, SidebarBackdrop } from "../styles/application";

import Sidebar from "./sidebar/Sidebar";
import Main from "./main/Main";
import { useSidebarStore } from "../../../store/sidebarStore";

export interface ApplicationProps {
  title?: string;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  "data-testid"?: string;
}

const Application: FC<ApplicationProps> = ({
  title,
  className = "",
  children,
}) => {
  const id = useId();
  const isOpen = useSidebarStore((s) => s.isOpen);
  const setOpen = useSidebarStore((s) => s.setOpen);

  useEffect(() => {
    if (title) {
      const prev = document.title;
      document.title = title;
      return () => {
        document.title = prev;
      };
    }
  }, [title]);

  return (
    <Root id={`application-${id}`} className={`application-root ${className}`}>
      {isOpen && (
        <SidebarBackdrop
          onClick={() => {
            setOpen(false);
          }}
        />
      )}
      <Layout>
        {isOpen && <Sidebar />}
        <Main>{children}</Main>
      </Layout>
    </Root>
  );
};

export default memo(Application);
