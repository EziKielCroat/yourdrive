import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import JSZip from "jszip";
import { Download, Search, Folder, File as FileIcon } from "lucide-react";
import api from "../../../../../lib/axios";

interface ArchivePreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  headers?: Record<string, string>;
}

type Entry = {
  path: string;
  name: string;
  isDirectory: boolean;
  uncompressedSize?: number;
  compressedSize?: number;
  date?: Date;
};

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  const v = bytes / Math.pow(k, i);
  return `${v.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

const ArchivePreview: React.FC<ArchivePreviewProps> = ({
  url,
  fileName,
  onDownload,
  onError,
  headers,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const ext = fileName.split(".").pop()?.toLowerCase();
        if (ext && ext !== "zip") {
          throw new Error("Only .zip archives are supported for in-app browsing right now.");
        }

        setLoading(true);
        setError(null);

        // Check if URL is absolute (external) or relative (needs baseURL)
        const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
        
        let buf: ArrayBuffer;
        
        if (isAbsoluteUrl) {
          // For absolute URLs (signed S3 URLs), use fetch directly
          const fetchResponse = await fetch(url, { headers });
          if (!fetchResponse.ok) {
            throw new Error(`Failed to load archive: ${fetchResponse.status}`);
          }
          buf = await fetchResponse.arrayBuffer();
        } else {
          // For relative URLs, use axios API instance to ensure authentication headers
          const res = await api.get(url, {
            responseType: 'arraybuffer',
            headers: headers,
          });
          buf = res.data;
        }

        const zip = await JSZip.loadAsync(buf);
        const list: Entry[] = [];

        zip.forEach((relativePath, file) => {
          const name = relativePath.split("/").filter(Boolean).pop() || relativePath;
          list.push({
            path: relativePath,
            name,
            isDirectory: file.dir,
            // JSZip doesn't always have sizes unless you read the file; keep best-effort
            date: file.date,
          });
        });

        // Sort folders first, then name
        list.sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
          return a.path.localeCompare(b.path);
        });

        setEntries(list);
        setLoading(false);
      } catch (e) {
        let msg = e instanceof Error ? e.message : "Failed to preview archive";
        const lower = msg.toLowerCase();
        if (lower.includes("end of central directory")) {
          msg =
            "This ZIP file appears to be corrupted or incomplete. Try downloading it and opening it with an archive tool.";
        }
        setError(msg);
        onError?.(msg);
        setLoading(false);
      }
    };

    load();
  }, [headers, onError, url]);

  const filtered = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) => e.path.toLowerCase().includes(q));
  }, [entries, search]);

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Reading archive contents…</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <h3>Unable to preview archive</h3>
        <p>{error}</p>
        {onDownload && (
          <Button $primary onClick={onDownload}>
            <Download size={16} />
            Download archive
          </Button>
        )}
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <Toolbar>
        <Title>
          Archive contents <Muted>({filtered.length} items)</Muted>
        </Title>

        <SearchBox>
          <Search size={16} />
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search in archive…"
          />
        </SearchBox>

        {onDownload && (
          <Button $primary onClick={onDownload}>
            <Download size={16} />
            Download
          </Button>
        )}
      </Toolbar>

      <List>
        {filtered.map((e) => (
          <Row key={e.path}>
            <RowLeft>
              <Icon>
                {e.isDirectory ? <Folder size={16} /> : <FileIcon size={16} />}
              </Icon>
              <Path title={e.path}>{e.path}</Path>
            </RowLeft>
            <RowRight>
              <Meta>{formatBytes(e.uncompressedSize)}</Meta>
            </RowRight>
          </Row>
        ))}
        {filtered.length === 0 && (
          <Empty>
            <p>No matching items.</p>
          </Empty>
        )}
      </List>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #dadce0;
`;

const Title = styled.div`
  font-weight: 600;
  color: #202124;
  white-space: nowrap;
`;

const Muted = styled.span`
  color: #5f6368;
  font-weight: 500;
`;

const SearchBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #dadce0;
  border-radius: 6px;
  padding: 6px 10px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 13px;
  color: #202124;
  background: white;

  &::placeholder {
    color: #9aa0a6;
  }
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${({ $primary }) => ($primary ? "#1a73e8" : "#dadce0")};
  background: ${({ $primary }) => ($primary ? "#1a73e8" : "white")};
  color: ${({ $primary }) => ($primary ? "white" : "#202124")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ $primary }) => ($primary ? "#0d62d9" : "#f1f3f4")};
  }
`;

const List = styled.div`
  flex: 1;
  overflow: auto;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #f1f3f4;

  &:hover {
    background: #f8f9fa;
  }
`;

const RowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const Icon = styled.div`
  color: #5f6368;
  flex: 0 0 auto;
`;

const Path = styled.div`
  font-size: 13px;
  color: #202124;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowRight = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Meta = styled.div`
  font-size: 12px;
  color: #5f6368;
`;

const Empty = styled.div`
  padding: 24px 16px;
  color: #5f6368;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  background: #f8f9fa;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  gap: 12px;
  background: white;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

export default ArchivePreview;

