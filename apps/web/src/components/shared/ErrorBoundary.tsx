import { Component, type ErrorInfo, type ReactNode } from "react";
import styled from "styled-components";
import { AlertTriangleIcon as AlertTriangle, RefreshCwIcon as RefreshCw, HomeIcon as Home } from "./icons/index";

const Wrap = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 50%, #f0f9ff 100%);
  padding: ${({ theme }) => theme.spacing?.xl ?? "1.5rem"};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors?.background?.primary ?? "#fff"};
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  padding: ${({ theme }) => theme.spacing?.["3xl"] ?? "2.5rem"};
  max-width: 440px;
  width: 100%;
  text-align: center;
`;

const IconWrap = styled.div`
  color: ${({ theme }) => theme.colors?.danger ?? "#dc2626"};
  margin-bottom: ${({ theme }) => theme.spacing?.lg ?? "1rem"};
  display: flex;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSize?.["2xl"] ?? "1.5rem"};
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary ?? "#111827"};
  margin: 0 0 ${({ theme }) => theme.spacing?.sm ?? "0.5rem"};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fontSize?.sm ?? "0.875rem"};
  color: ${({ theme }) => theme.colors?.text?.secondary ?? "#6b7280"};
  margin: 0 0 ${({ theme }) => theme.spacing?.xl ?? "1.5rem"};
  line-height: 1.5;
`;

const Details = styled.pre`
  text-align: left;
  font-size: 12px;
  color: ${({ theme }) => theme.colors?.text?.muted ?? "#9ca3af"};
  background: ${({ theme }) => theme.colors?.background?.tertiary ?? "#f3f4f6"};
  padding: ${({ theme }) => theme.spacing?.md ?? "1rem"};
  border-radius: 8px;
  overflow: auto;
  max-height: 120px;
  margin: 0 0 ${({ theme }) => theme.spacing?.xl ?? "1.5rem"};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing?.md ?? "1rem"};
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: filter 0.15s ease;
  &:hover {
    filter: brightness(0.95);
  }
  ${({ $primary, theme }: { $primary?: boolean; theme?: any }) =>
    $primary
      ? `background: ${theme?.colors?.primary ?? "#2563eb"}; color: white;`
      : `background: ${theme?.colors?.secondary ?? "#f3f4f6"}; color: ${theme?.colors?.text?.primary ?? "#111827"};`}
`;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <Wrap>
          <Card>
            <IconWrap>
              <AlertTriangle size={48} strokeWidth={1.5} />
            </IconWrap>
            <Title>Something went wrong</Title>
            <Message>
              An unexpected error occurred. You can refresh the page or go back home.
            </Message>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <Details>{this.state.error.toString()}</Details>
            )}
            <Actions>
              <Button $primary onClick={this.handleRefresh}>
                <RefreshCw size={18} />
                Refresh
              </Button>
              <Button onClick={this.handleGoHome}>
                <Home size={18} />
                Go Home
              </Button>
            </Actions>
          </Card>
        </Wrap>
      );
    }
    return this.props.children;
  }
}
