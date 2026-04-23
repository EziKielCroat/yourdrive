import React, { useState, useCallback, useEffect, useRef } from "react";
import styled, { css, keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  SearchIcon as Search,
  FolderIcon as Folder,
  UserIcon as User,
  UsersIcon as Users,
  ChevronRightIcon as ChevronRight,
  ArrowLeftIcon as ArrowLeft,
  ClockIcon as Clock,
  TagIcon as Tag,
  BookOpenIcon as BookOpen,
  SparklesIcon as Sparkles,
  MessageSquareIcon as MessageSquare,
  FileTextIcon as FileText,
  ShieldCheckIcon as ShieldCheck,
  Share2Icon as Share2,
  HelpCircleIcon as HelpCircle,
  XIcon as X,
} from "../shared/icons/index";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { AiSupportChat } from "./components/AiSupportChat";
import {
  ARTICLES,
  CATEGORIES,
  searchArticles,
  getArticlesByCategory,
  getRelatedArticles,
  type Article,
  type HelpCategory,
} from "./data/helpCenter.data";

// ── Helpers ────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<HelpCategory, { icon: React.ReactNode; color: string; bg: string }> = {
  "file-management": {
    icon: <Folder size={22} />,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  "account-management": {
    icon: <User size={22} />,
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  security: {
    icon: <ShieldCheck size={22} />,
    color: "#059669",
    bg: "#ecfdf5",
  },
  collaboration: {
    icon: <Share2 size={22} />,
    color: "#d97706",
    bg: "#fffbeb",
  },
};

const CATEGORY_LABELS: Record<HelpCategory, string> = {
  "file-management": "File Management",
  "account-management": "Account Management",
  security: "Security",
  collaboration: "Collaboration",
};

function formatDate(date: string) {
  return date;
}

// ── Article page ───────────────────────────────────────────────────────────

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  onOpenChat: (query?: string) => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack, onOpenChat }) => {
  const related = getRelatedArticles(article);
  const meta = CATEGORY_META[article.category];

  const renderInline = (text: string) =>
    text
      .split(/(\*\*[^*]+\*\*|`[^`]+`)/)
      .map((chunk, ci) => {
        if (chunk.startsWith("**") && chunk.endsWith("**"))
          return <strong key={ci}>{chunk.slice(2, -2)}</strong>;
        if (chunk.startsWith("`") && chunk.endsWith("`"))
          return <InlineCode key={ci}>{chunk.slice(1, -1)}</InlineCode>;
        return chunk;
      });

  const renderContent = (raw: string) => {
    const lines = raw.split("\n");
    const output: React.ReactNode[] = [];
    let listBuffer: string[] = [];
    let olistBuffer: string[] = [];
    let tableBuffer: string[] = [];
    let orderedStart = 1;

    const flushList = () => {
      if (listBuffer.length) {
        output.push(
          <ArticleUl key={`ul-${output.length}`}>
            {listBuffer.map((item, i) => (
              <ArticleLi key={i}>{renderInline(item)}</ArticleLi>
            ))}
          </ArticleUl>,
        );
        listBuffer = [];
      }
    };
    const flushOList = () => {
      if (olistBuffer.length) {
        output.push(
          <ArticleOl key={`ol-${output.length}`} $start={orderedStart}>
            {olistBuffer.map((item, i) => (
              <ArticleOli key={i}>{renderInline(item)}</ArticleOli>
            ))}
          </ArticleOl>,
        );
        olistBuffer = [];
        orderedStart = 1;
      }
    };
    const flushTable = () => {
      if (tableBuffer.length < 2) { tableBuffer = []; return; }
      const header = tableBuffer[0].split("|").map(c => c.trim()).filter(Boolean);
      const bodyRows = tableBuffer.slice(2).map(r => r.split("|").map(c => c.trim()).filter(Boolean));
      output.push(
        <TableWrapper key={`table-${output.length}`}>
          <ArticleTable>
            <thead>
              <tr>{header.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{renderInline(cell)}</td>)}</tr>
              ))}
            </tbody>
          </ArticleTable>
        </TableWrapper>,
      );
      tableBuffer = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("| ") || line.startsWith("|--") || line.startsWith("|-")) {
        flushList(); flushOList();
        tableBuffer.push(line);
        continue;
      }
      if (tableBuffer.length) { flushTable(); }

      if (line.startsWith("## ")) {
        flushList(); flushOList();
        output.push(<ArticleH2 key={i}>{renderInline(line.slice(3))}</ArticleH2>);
      } else if (line.startsWith("### ")) {
        flushList(); flushOList();
        output.push(<ArticleH3 key={i}>{renderInline(line.slice(4))}</ArticleH3>);
      } else if (line.startsWith("> ")) {
        flushList(); flushOList();
        const body = line.slice(2);
        const noteMatch = body.match(/^(NOTE|TIP|WARNING|IMPORTANT):\s*/i);
        const calloutType = noteMatch ? noteMatch[1].toUpperCase() as "NOTE" | "TIP" | "WARNING" | "IMPORTANT" : "NOTE";
        const calloutText = noteMatch ? body.slice(noteMatch[0].length) : body;
        output.push(
          <Callout key={i} $type={calloutType}>
            <CalloutLabel $type={calloutType}>{calloutType}</CalloutLabel>
            <span>{renderInline(calloutText)}</span>
          </Callout>,
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        flushOList();
        listBuffer.push(line.slice(2));
      } else if (/^\d+\./.test(line)) {
        flushList();
        const numMatch = line.match(/^(\d+)\.\s?/);
        if (olistBuffer.length === 0 && numMatch) orderedStart = parseInt(numMatch[1]);
        olistBuffer.push(line.replace(/^\d+\.\s?/, ""));
      } else if (line.trim() === "---") {
        flushList(); flushOList();
        output.push(<ArticleHr key={i} />);
      } else if (!line.trim()) {
        flushList(); flushOList();
        output.push(<ArticleGap key={i} />);
      } else {
        flushList(); flushOList();
        output.push(<ArticleP key={i}>{renderInline(line)}</ArticleP>);
      }
    }
    flushList(); flushOList(); flushTable();
    return output;
  };

  return (
    <ArticlePage
      as={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <ArticleNav>
        <BackBtn onClick={onBack}>
          <ArrowLeft size={15} />
          Back to Help Center
        </BackBtn>
        <CategoryBadge $color={meta.color} $bg={meta.bg}>
          {meta.icon}
          {CATEGORY_LABELS[article.category]}
        </CategoryBadge>
      </ArticleNav>

      <ArticleHeader>
        <ArticleTitle>{article.title}</ArticleTitle>
        <ArticleMeta>
          <MetaItem>
            <User size={13} />
            {article.author} · {article.authorRole}
          </MetaItem>
          <MetaDot />
          <MetaItem>
            <Clock size={13} />
            {formatDate(article.date)}
          </MetaItem>
          <MetaDot />
          <MetaItem>
            <BookOpen size={13} />
            {article.readTime} min read
          </MetaItem>
        </ArticleMeta>
        <ArticleTags>
          {article.tags.map((t) => (
            <TagPill key={t}>
              <Tag size={10} />
              {t}
            </TagPill>
          ))}
        </ArticleTags>
      </ArticleHeader>

      <ArticleBody>{renderContent(article.content)}</ArticleBody>

      {related.length > 0 && (
        <RelatedSection>
          <RelatedTitle>Related articles</RelatedTitle>
          <RelatedGrid>
            {related.map((rel) => {
              const rm = CATEGORY_META[rel.category];
              return (
                <RelatedCard key={rel.id} onClick={onBack}>
                  <RelatedIcon $color={rm.color} $bg={rm.bg}>
                    {rm.icon}
                  </RelatedIcon>
                  <RelatedCardContent>
                    <RelatedCardTitle>{rel.title}</RelatedCardTitle>
                    <RelatedCardExcerpt>{rel.excerpt}</RelatedCardExcerpt>
                  </RelatedCardContent>
                  <ChevronRightWrap><ChevronRight size={14} /></ChevronRightWrap>
                </RelatedCard>
              );
            })}
          </RelatedGrid>
        </RelatedSection>
      )}

      <FloatingAskBtn
        onClick={() => onOpenChat(`I'm reading "${article.title}" — `)}
        title="Ask AI about this article"
      >
        <Sparkles size={15} />
        Ask AI
      </FloatingAskBtn>
    </ArticlePage>
  );
};

// ── Main HelpCenter ────────────────────────────────────────────────────────

const HelpCenter: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<HelpCategory | null>(null);
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>();
  const prevArticleRef = useRef<Article | null>(null);

  // Scroll to top whenever an article opens or changes
  useEffect(() => {
    if (openArticle && openArticle !== prevArticleRef.current) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
    prevArticleRef.current = openArticle;
  }, [openArticle]);

  const openChat = useCallback((q?: string) => {
    setChatInitialQuery(q);
    setChatOpen(true);
  }, []);

  const displayed = query.trim()
    ? searchArticles(query)
    : activeCategory
      ? getArticlesByCategory(activeCategory)
      : ARTICLES;

  const featured = ARTICLES.slice(0, 4);

  if (openArticle) {
    return (
      <>
        <Navbar_main />
        <PageWrapper>
          <ContentMaxWidth>
            <AnimatePresence mode="wait">
              <ArticleView
                key={openArticle.id}
                article={openArticle}
                onBack={() => setOpenArticle(null)}
                onOpenChat={openChat}
              />
            </AnimatePresence>
          </ContentMaxWidth>
        </PageWrapper>
        <Footer />
        <AiSupportChat
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          initialQuery={chatInitialQuery}
        />
      </>
    );
  }

  return (
    <>
      <Navbar_main />

      <HeroSection>
        <HeroInner
          as={motion.div}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <HeroLabel>
            <HelpCircle size={13} />
            Help Center
          </HeroLabel>
          <HeroTitle>
            Find answers, troubleshoot errors,<br />
            and explore all our services.
          </HeroTitle>

          <SearchRow>
            <SearchIconWrap>
              <Search size={17} color="#94a3b8" />
            </SearchIconWrap>
            <SearchInput
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveCategory(null); }}
              placeholder="Search for Help"
              autoFocus
            />
            {query && (
              <ClearSearch onClick={() => setQuery("")}>
                <X size={14} />
              </ClearSearch>
            )}
          </SearchRow>

          <HeroCtas>
            <CtaBtn $primary onClick={() => openChat()}>
              <Sparkles size={15} />
              Ask YourDrive Assistant
            </CtaBtn>
            <CtaBtn onClick={() => openChat("I need help contacting support — ")}>
              <MessageSquare size={15} />
              Contact support
            </CtaBtn>
          </HeroCtas>
        </HeroInner>
      </HeroSection>

      <PageWrapper>
        <ContentMaxWidth>
          {!query && (
            <>
              <SectionLabel>Browse common topics</SectionLabel>
              <CategoriesGrid>
                {CATEGORIES.map((cat) => {
                  const meta = CATEGORY_META[cat.id];
                  const isActive = activeCategory === cat.id;
                  return (
                    <CategoryCard
                      key={cat.id}
                      $active={isActive}
                      $color={meta.color}
                      $bg={meta.bg}
                      onClick={() =>
                        setActiveCategory(isActive ? null : cat.id)
                      }
                      as={motion.div}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.15 }}
                    >
                      <CatIconWrap $color={meta.color} $bg={meta.bg}>
                        {meta.icon}
                      </CatIconWrap>
                      <CatLabel>{cat.label}</CatLabel>
                      <CatMeta>{cat.articleCount} articles</CatMeta>
                    </CategoryCard>
                  );
                })}
              </CategoriesGrid>

              {!activeCategory && (
                <>
                  <SectionLabel>Featured articles</SectionLabel>
                  <FeaturedGrid>
                    {featured.map((art, i) => {
                      const meta = CATEGORY_META[art.category];
                      return (
                        <FeaturedCard
                          key={art.id}
                          onClick={() => setOpenArticle(art)}
                          as={motion.div}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07, duration: 0.3 }}
                          whileHover={{ y: -2 }}
                        >
                          <FeaturedCardTop>
                            <FeaturedIcon $color={meta.color} $bg={meta.bg}>
                              {meta.icon}
                            </FeaturedIcon>
                            <CategoryLabel $color={meta.color}>
                              {CATEGORY_LABELS[art.category]}
                            </CategoryLabel>
                          </FeaturedCardTop>
                          <FeaturedCardTitle>{art.title}</FeaturedCardTitle>
                          <FeaturedCardExcerpt>{art.excerpt}</FeaturedCardExcerpt>
                          <FeaturedCardFooter>
                            <AuthorInfo>
                              <AuthorAvatar>{art.author.charAt(0)}</AuthorAvatar>
                              <AuthorName>{art.author}</AuthorName>
                            </AuthorInfo>
                            <MetaDate>
                              <Clock size={11} />
                              {art.date}
                            </MetaDate>
                          </FeaturedCardFooter>
                        </FeaturedCard>
                      );
                    })}
                  </FeaturedGrid>
                </>
              )}
            </>
          )}

          <ArticleListSection>
            <ArticleListHeader>
              <ArticleListTitle>
                {query
                  ? `${displayed.length} result${displayed.length !== 1 ? "s" : ""} for "${query}"`
                  : activeCategory
                    ? CATEGORY_LABELS[activeCategory]
                    : "All articles"}
              </ArticleListTitle>
              {(activeCategory || query) && (
                <ClearFilterBtn
                  onClick={() => { setQuery(""); setActiveCategory(null); }}
                >
                  <X size={13} /> Clear filter
                </ClearFilterBtn>
              )}
            </ArticleListHeader>

            {displayed.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <FileText size={28} />
                </EmptyIcon>
                <EmptyTitle>No articles found</EmptyTitle>
                <EmptyBody>
                  Try a different search term, or{" "}
                  <InlineLink onClick={() => openChat(query)}>
                    ask the AI assistant
                  </InlineLink>{" "}
                  directly.
                </EmptyBody>
              </EmptyState>
            ) : (
              <ArticleListGrid>
                {displayed.map((art, i) => {
                  const meta = CATEGORY_META[art.category];
                  return (
                    <ArticleRow
                      key={art.id}
                      onClick={() => setOpenArticle(art)}
                      as={motion.div}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.22 }}
                    >
                      <ArticleRowIcon $color={meta.color} $bg={meta.bg}>
                        {meta.icon}
                      </ArticleRowIcon>
                      <ArticleRowContent>
                        <ArticleRowTitle>{art.title}</ArticleRowTitle>
                        <ArticleRowExcerpt>{art.excerpt}</ArticleRowExcerpt>
                        <ArticleRowMeta>
                          <CategoryLabel $color={meta.color}>
                            {CATEGORY_LABELS[art.category]}
                          </CategoryLabel>
                          <RowMetaDot />
                          <RowMetaItem>
                            <User size={11} />
                            {art.author}
                          </RowMetaItem>
                          <RowMetaDot />
                          <RowMetaItem>
                            <Clock size={11} />
                            {art.date}
                          </RowMetaItem>
                        </ArticleRowMeta>
                      </ArticleRowContent>
                      <ChevronRightWrap><ChevronRight size={16} /></ChevronRightWrap>
                    </ArticleRow>
                  );
                })}
              </ArticleListGrid>
            )}
          </ArticleListSection>

          <ContactCta>
            <ContactCtaContent>
              <ContactCtaTitle>Still need help?</ContactCtaTitle>
              <ContactCtaBody>
                Can't find the answer you're looking for? Our AI assistant or human support team can help.
              </ContactCtaBody>
            </ContactCtaContent>
            <ContactCtaActions>
              <CtaBtn $primary onClick={() => openChat()}>
                <Sparkles size={14} />
                Ask AI assistant
              </CtaBtn>
              <CtaBtn onClick={() => openChat("I need to speak with a human support agent — ")}>
                <Users size={14} />
                Talk to a human
              </CtaBtn>
            </ContactCtaActions>
          </ContactCta>
        </ContentMaxWidth>
      </PageWrapper>

      <Footer />

      <AiSupportChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialQuery={chatInitialQuery}
      />
    </>
  );
};

export default HelpCenter;

// ── Styled components ──────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const HeroSection = styled.div`
  width: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e9ecef;
  padding: 80px 24px 64px;
  text-align: center;
`;

const HeroInner = styled.div`
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const HeroLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 13px;
  border-radius: 999px;
  background: #f0f7ff;
  border: 1px solid rgba(37, 99, 235, 0.2);
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #2563eb;
`;

const HeroTitle = styled.h1`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
  color: #1e293b;
  margin: 0;
`;

const SearchRow = styled.div`
  position: relative;
  width: 100%;
  max-width: 560px;
`;

const SearchIconWrap = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
`;

const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 14px 48px 14px 48px;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 15px;
  color: #1e293b;
  background: #fff;
  outline: none;
  box-shadow: 0 2px 12px rgba(14, 22, 36, 0.05);
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder { color: #94a3b8; }
  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1), 0 2px 12px rgba(14, 22, 36, 0.06);
  }
`;

const ClearSearch = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover { background: #e2e8f0; }
`;

const HeroCtas = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
`;

const CtaBtn = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: 10px;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;

  ${({ $primary }) =>
    $primary
      ? css`
          background: #2563eb;
          border: 1.5px solid #2563eb;
          color: #fff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);

          &:hover {
            background: #1d4ed8;
            border-color: #1d4ed8;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
          }
        `
      : css`
          background: #fff;
          border: 1.5px solid #e2e8f0;
          color: #475569;

          &:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
          }
        `}
`;

const PageWrapper = styled.div`
  width: 100%;
  background: #f8fafc;
  min-height: 60vh;
  padding: 0 24px 80px;
`;

const ContentMaxWidth = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding-top: 52px;

  @media (max-width: 1100px) {
    padding-top: 88px; /* 64px fixed navbar + 24px breathing room */
  }
`;

const SectionLabel = styled.h2`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 0 0 18px;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 52px;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr 1fr; }
`;

const CategoryCard = styled.div<{
  $active: boolean;
  $color: string;
  $bg: string;
}>`
  padding: 20px 18px;
  border-radius: 14px;
  background: #fff;
  border: 1.5px solid ${(p) => (p.$active ? p.$color : "#e9ecef")};
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  display: flex;
  flex-direction: column;
  gap: 8px;

  ${(p) =>
    p.$active &&
    css`
      background: ${p.$bg};
      box-shadow: 0 0 0 3px ${p.$color}22;
    `}

  &:hover:not([data-active="true"]) {
    border-color: ${(p) => p.$color}88;
    box-shadow: 0 2px 12px rgba(14, 22, 36, 0.07);
  }
`;

const CatIconWrap = styled.div<{ $color: string; $bg: string }>`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: ${(p) => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.$color};
`;

const CatLabel = styled.div`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const CatMeta = styled.div`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12px;
  color: #94a3b8;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 52px;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const FeaturedCard = styled.div`
  padding: 22px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e9ecef;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:hover {
    box-shadow: 0 4px 20px rgba(14, 22, 36, 0.08);
    border-color: #cbd5e1;
  }
`;

const FeaturedCardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FeaturedIcon = styled.div<{ $color: string; $bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${(p) => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.$color};
  flex-shrink: 0;
`;

const CategoryLabel = styled.span<{ $color: string }>`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  color: ${(p) => p.$color};
  background: ${(p) => p.$color}1a;
  padding: 2px 8px;
  border-radius: 999px;
`;

const FeaturedCardTitle = styled.h3`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.4;
`;

const FeaturedCardExcerpt = styled.p`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
  margin: 0;
  flex: 1;
`;

const FeaturedCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

const AuthorAvatar = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #dbeafe;
  color: #2563eb;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AuthorName = styled.span`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12px;
  color: #475569;
`;

const MetaDate = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 11.5px;
  color: #94a3b8;
`;

const ArticleListSection = styled.div`
  margin-bottom: 52px;
`;

const ArticleListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ArticleListTitle = styled.h2`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ClearFilterBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: transparent;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;

  &:hover { background: #f1f5f9; }
`;

const ArticleListGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ArticleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;

  &:hover {
    box-shadow: 0 3px 16px rgba(14, 22, 36, 0.07);
    border-color: #cbd5e1;
  }
`;

const ArticleRowIcon = styled.div<{ $color: string; $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: ${(p) => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.$color};
  flex-shrink: 0;
`;

const ArticleRowContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ArticleRowTitle = styled.h3`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ArticleRowExcerpt = styled.p`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12.5px;
  color: #64748b;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ArticleRowMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const RowMetaDot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #cbd5e1;
`;

const RowMetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 11.5px;
  color: #94a3b8;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
`;

const EmptyTitle = styled.h3`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const EmptyBody = styled.p`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const InlineLink = styled.span`
  color: #2563eb;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
`;

const ContactCta = styled.div`
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
  border: 1px solid #dbeafe;
  border-radius: 20px;
  padding: 36px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 28px 24px;
  }
`;

const ContactCtaContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ContactCtaTitle = styled.h2`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px;
`;

const ContactCtaBody = styled.p`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 14px;
  color: #475569;
  margin: 0;
`;

const ContactCtaActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

// ── Article view styled ────────────────────────────────────────────────────

const ArticlePage = styled.div`
  padding-top: 24px;
  padding-bottom: 40px;
`;

const ArticleNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 10px;
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;

  &:hover { background: #f8fafc; border-color: #cbd5e1; }
`;

const CategoryBadge = styled.div<{ $color: string; $bg: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12px;
  font-weight: 500;
`;

const ArticleHeader = styled.div`
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e9ecef;
`;

const ArticleTitle = styled.h1`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: clamp(24px, 3.5vw, 36px);
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px;
  line-height: 1.25;
  letter-spacing: -0.4px;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12.5px;
  color: #64748b;
`;

const MetaDot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #cbd5e1;
`;

const ArticleTags = styled.div`
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
`;

const TagPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 11px;
  color: #475569;
`;

const ArticleBody = styled.div`
  max-width: 740px;
  margin-bottom: 48px;
`;

const ArticleH2 = styled.h2`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 40px 0 14px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
  letter-spacing: -0.3px;

  &:first-child { margin-top: 0; }
`;

const ArticleH3 = styled.h3`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 26px 0 10px;
  letter-spacing: -0.1px;
`;

const ArticleP = styled.p`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.8;
  color: #374151;
  margin: 0 0 14px;
`;

const InlineCode = styled.code`
  font-family: "JetBrains Mono", "Fira Code", "Courier New", monospace;
  font-size: 13px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  padding: 1px 5px;
  border-radius: 4px;
`;

const ArticleUl = styled.ul`
  margin: 0 0 16px 0;
  padding: 0;
  list-style: none;
`;

const ArticleLi = styled.li`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.75;
  color: #374151;
  margin: 0 0 8px 0;
  padding-left: 20px;
  position: relative;

  &::before {
    content: "•";
    position: absolute;
    left: 4px;
    color: #2563eb;
    font-weight: 700;
  }
`;

const ArticleOl = styled.ol<{ $start?: number }>`
  margin: 0 0 16px 0;
  padding: 0;
  list-style: none;
  counter-reset: item ${({ $start }) => ($start ? $start - 1 : 0)};
`;

const ArticleOli = styled.li`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.75;
  color: #374151;
  margin: 0 0 10px 0;
  padding-left: 36px;
  position: relative;
  counter-increment: item;

  &::before {
    content: counter(item);
    position: absolute;
    left: 0;
    top: 2px;
    width: 22px;
    height: 22px;
    background: #2563eb;
    color: white;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Poppins", system-ui, sans-serif;
  }
`;

const calloutColors = {
  NOTE:      { bg: "#eff6ff", border: "#bfdbfe", label: "#1d4ed8", icon: "#3b82f6" },
  TIP:       { bg: "#f0fdf4", border: "#bbf7d0", label: "#15803d", icon: "#22c55e" },
  WARNING:   { bg: "#fffbeb", border: "#fde68a", label: "#b45309", icon: "#f59e0b" },
  IMPORTANT: { bg: "#fef2f2", border: "#fecaca", label: "#b91c1c", icon: "#ef4444" },
};

const Callout = styled.div<{ $type: keyof typeof calloutColors }>`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: ${({ $type }) => calloutColors[$type].bg};
  border: 1px solid ${({ $type }) => calloutColors[$type].border};
  border-left: 4px solid ${({ $type }) => calloutColors[$type].icon};
  border-radius: 8px;
  padding: 14px 16px;
  margin: 20px 0;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.7;
  color: #1e293b;
`;

const CalloutLabel = styled.span<{ $type: keyof typeof calloutColors }>`
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${({ $type }) => calloutColors[$type].label};
  background: ${({ $type }) => calloutColors[$type].border};
  padding: 2px 7px;
  border-radius: 4px;
  margin-top: 1px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin: 20px 0 24px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
`;

const ArticleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 14px;

  th {
    background: #f8fafc;
    color: #0f172a;
    font-weight: 600;
    text-align: left;
    padding: 11px 16px;
    border-bottom: 2px solid #e2e8f0;
    white-space: nowrap;
  }

  td {
    color: #374151;
    padding: 10px 16px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }

  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f8fafc; }
`;

const ArticleHr = styled.hr`
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 32px 0;
`;

const ArticleGap = styled.div`
  height: 6px;
`;

const RelatedSection = styled.div`
  margin-bottom: 40px;
`;

const RelatedTitle = styled.h3`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px;
`;

const RelatedGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RelatedCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: box-shadow 0.13s, border-color 0.13s;

  &:hover {
    box-shadow: 0 2px 12px rgba(14, 22, 36, 0.07);
    border-color: #cbd5e1;
  }
`;

const RelatedIcon = styled.div<{ $color: string; $bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${(p) => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.$color};
  flex-shrink: 0;
`;

const RelatedCardContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const RelatedCardTitle = styled.h4`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RelatedCardExcerpt = styled.p`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12px;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChevronRightWrap = styled.span`
  display: flex;
  align-items: center;
  color: #94a3b8;
  flex-shrink: 0;
`;

const FloatingAskBtn = styled.button`
  position: fixed;
  bottom: 28px;
  right: 28px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 12px 20px;
  border-radius: 999px;
  border: none;
  background: #2563eb;
  color: #fff;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.35);
  z-index: 100;
  transition: background 0.15s, box-shadow 0.15s;
  animation: ${fadeIn} 0.3s ease;

  &:hover {
    background: #1d4ed8;
    box-shadow: 0 6px 28px rgba(37, 99, 235, 0.45);
  }
`;
