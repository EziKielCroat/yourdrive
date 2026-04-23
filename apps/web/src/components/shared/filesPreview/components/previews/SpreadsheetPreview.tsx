import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Download, Search } from "lucide-react";
const DownloadIcon = Download;
import ExcelJS from "exceljs";
import api from "../../../../../lib/axios";

interface SpreadsheetPreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  headers?: Record<string, string>;
}

interface SheetData {
  name: string;
  data: any[][];
  headers: string[];
}

const SpreadsheetPreview: React.FC<SpreadsheetPreviewProps> = ({
  url,
  fileName,
  onDownload,
  onError,
  headers,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    loadSpreadsheet();
  }, [url]);

  const loadSpreadsheet = async () => {
    try {
      setLoading(true);

      // Check if URL is absolute (external) or relative (needs baseURL)
      const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
      
      let arrayBuffer: ArrayBuffer;
      
      if (isAbsoluteUrl) {
        // For absolute URLs (signed S3 URLs), use fetch directly
        const fetchResponse = await fetch(url, { headers });
        if (!fetchResponse.ok) {
          throw new Error(`Failed to load file: ${fetchResponse.status}`);
        }
        arrayBuffer = await fetchResponse.arrayBuffer();
      } else {
        // For relative URLs, use axios API instance to ensure authentication headers
        const response = await api.get(url, {
          responseType: 'arraybuffer',
          headers: headers,
        });
        arrayBuffer = response.data;
      }
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const sheetData: SheetData[] = workbook.worksheets.map((worksheet) => {
        const rows: any[][] = [];
        worksheet.eachRow((row) => {
          // ExcelJS row.values is 1-indexed; index 0 is always undefined
          const cells = (row.values as any[]).slice(1);
          rows.push(cells);
        });

        // Extract headers (first row)
        const headers = rows[0] || [];

        return {
          name: worksheet.name,
          data: rows.slice(1), // Skip header row
          headers: headers.map(String),
        };
      });

      setSheets(sheetData);
      setActiveSheet(sheetData[0]?.name || "");
      setLoading(false);
    } catch (err) {
      setError(
        "Failed to load spreadsheet. Make sure it's a valid Excel/CSV file.",
      );
      onError?.("Failed to load spreadsheet");
      setLoading(false);
    }
  };

  const activeSheetData = sheets.find((sheet) => sheet.name === activeSheet);
  const filteredData =
    activeSheetData?.data.filter((row) => {
      if (!searchTerm) return true;
      return row.some((cell) =>
        String(cell || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );
    }) || [];

  const sortedData = React.useMemo(() => {
    if (sortColumn === null || !filteredData.length) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue || "").toLowerCase();
      const bStr = String(bValue || "").toLowerCase();

      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortColumn, sortDirection]);

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnIndex);
      setSortDirection("asc");
    }
  };

  const handleExportCSV = () => {
    if (!activeSheetData) return;

    const csvContent = [
      activeSheetData.headers.join(","),
      ...activeSheetData.data.map((row) =>
        row
          .map((cell) => {
            const str = String(cell || "");
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName.replace(/\.[^/.]+$/, "")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading spreadsheet...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <h3>Unable to load spreadsheet</h3>
        <p>{error}</p>
        <ButtonGroup>
          <Button onClick={() => window.open(url, "_blank")}>
            Open in new tab
          </Button>
          {onDownload && (
            <Button $primary onClick={onDownload}>
              <Download size={16} />
              Download File
            </Button>
          )}
        </ButtonGroup>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <Toolbar>
        <SheetTabs>
          {sheets.map((sheet) => (
            <SheetTab
              key={sheet.name}
              $active={activeSheet === sheet.name}
              onClick={() => setActiveSheet(sheet.name)}
            >
              {sheet.name}
            </SheetTab>
          ))}
        </SheetTabs>

        <SearchBox>
          <Search size={16} />
          <SearchInput
            type="text"
            placeholder="Search in sheet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <ActionButtons>
          <Button onClick={handleExportCSV}>
            <DownloadIcon size={16} />
            Export CSV
          </Button>
          {onDownload && (
            <Button $primary onClick={onDownload}>
              <Download size={16} />
              Download
            </Button>
          )}
        </ActionButtons>
      </Toolbar>

      <SheetInfo>
        <InfoItem>
          <strong>{sortedData.length}</strong> rows
        </InfoItem>
        <InfoItem>
          <strong>{activeSheetData?.headers.length || 0}</strong> columns
        </InfoItem>
        <InfoItem>
          Sheet: <strong>{activeSheet}</strong>
        </InfoItem>
      </SheetInfo>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              {activeSheetData?.headers.map((header, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(index)}
                  style={{ cursor: "pointer" }}
                >
                  {header}
                  {sortColumn === index && (
                    <SortIcon>{sortDirection === "asc" ? "↑" : "↓"}</SortIcon>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{startIndex + rowIndex + 1}</td>
                {activeSheetData?.headers.map((_, colIndex) => (
                  <td key={colIndex}>
                    {row[colIndex] !== undefined ? String(row[colIndex]) : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      <Pagination>
        <PageInfo>
          Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of{" "}
          {sortedData.length} rows
        </PageInfo>

        <PageControls>
          <PageButton
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>

          <PageNumbers>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <PageNumber
                  key={pageNum}
                  $active={currentPage === pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </PageNumber>
              );
            })}
          </PageNumbers>

          <PageButton
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </PageControls>

        <PageSizeSelect>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </PageSizeSelect>
      </Pagination>
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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
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
  gap: 16px;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $primary }) =>
    $primary
      ? `
    background: #1a73e8;
    color: white;
    
    &:hover {
      background: #0d62d9;
    }
  `
      : `
    background: #f8f9fa;
    color: #202124;
    border: 1px solid #dadce0;
    
    &:hover {
      background: #f1f3f4;
    }
  `}
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #dadce0;
  gap: 16px;
`;

const SheetTabs = styled.div`
  display: flex;
  gap: 4px;
  overflow-x: auto;
  flex: 1;
`;

const SheetTab = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${({ $active }) => ($active ? "#1a73e8" : "#dadce0")};
  background: ${({ $active }) => ($active ? "#1a73e8" : "white")};
  color: ${({ $active }) => ($active ? "white" : "#202124")};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: ${({ $active }) => ($active ? "#0d62d9" : "#f8f9fa")};
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #dadce0;
  border-radius: 4px;
  min-width: 200px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  background: transparent;
  color: #202124;

  &::placeholder {
    color: #9aa0a6;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const SheetInfo = styled.div`
  display: flex;
  gap: 24px;
  padding: 8px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #dadce0;
  font-size: 12px;
  color: #5f6368;
`;

const InfoItem = styled.div`
  strong {
    color: #202124;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th {
    background: #f8f9fa;
    border: 1px solid #dadce0;
    padding: 8px 12px;
    text-align: left;
    font-weight: 500;
    color: #202124;
    position: sticky;
    top: 0;
    z-index: 1;

    &:first-child {
      background: #f1f3f4;
    }
  }

  td {
    border: 1px solid #dadce0;
    padding: 8px 12px;
    color: #202124;

    &:first-child {
      background: #f8f9fa;
      font-weight: 500;
      color: #5f6368;
    }
  }

  tr:hover {
    background: #f8f9fa;
  }
`;

const SortIcon = styled.span`
  margin-left: 4px;
  font-size: 10px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #dadce0;
  background: #f8f9fa;
`;

const PageInfo = styled.div`
  font-size: 12px;
  color: #5f6368;
`;

const PageControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #dadce0;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f8f9fa;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 4px;
`;

const PageNumber = styled.button<{ $active: boolean }>`
  width: 32px;
  height: 32px;
  border: 1px solid ${({ $active }) => ($active ? "#1a73e8" : "#dadce0")};
  background: ${({ $active }) => ($active ? "#1a73e8" : "white")};
  color: ${({ $active }) => ($active ? "white" : "#202124")};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: ${({ $active }) => ($active ? "#0d62d9" : "#f8f9fa")};
  }
`;

const PageSizeSelect = styled.div`
  select {
    padding: 6px 12px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    background: white;
    font-size: 12px;
    color: #202124;

    &:focus {
      outline: none;
      border-color: #1a73e8;
    }
  }
`;

export default SpreadsheetPreview;
