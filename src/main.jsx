import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { CalendarDays, Check, CheckCheck, ChevronRight, ChevronLeft, CircleHelp, Clock3, FileText, Filter, GitBranch, Inbox, Layers3, ListChecks, Menu, MessageSquareText, MoreHorizontal, Plus, Search, Settings2, ShieldCheck, Sparkles, Tag as TagIcon, TrendingUp, TriangleAlert, Upload, X, Link2, ArrowUpRight, RotateCcw, CheckCircle2, CircleDot, Blocks, Plug, BookOpen, LayoutGrid, ArrowRight, Sun, Moon } from "lucide-react";
import { Button, IconButton, TextField, Select, Badge, Tag, Checkbox } from "../vendor/ui/src/index.ts";
import "../vendor/ui/theme.css";
import { cloneSeed, getStats, getContextActions, enrichDemoIssueDetails, isValidCalendarDate, matchText } from "./domain.js";
import { demoConfigs, selectDemo, demoHref } from "./scenarios.js";
import "./app.css";
const demo = selectDemo(location.search);
const { seed, catalog: { components, teams, platforms }, copy } = demo;
const STORAGE = demo.storageKey;
const THEME_STORAGE = "decision-journal-theme";
function savedThemePreference() {
  try {
    const preference = localStorage.getItem(THEME_STORAGE);
    if (preference === "light" || preference === "dark") return preference;
  } catch {}
  return null;
}
const labels = {
  page: { meetings: "Встречи", decisions: "Решения", review: "К разбору", analytics: "Аналитика", integrations: "Интеграции" },
  kind: demo.kind,
  topic: demo.topic,
  jira: { not_checked: "Не проверено", candidates: "Есть похожие задачи", not_found: "Совпадений не найдено", linked: "Связано с задачей", not_required: "Задача не требуется", unavailable: "Jira недоступна" }
};
const jiraTone = { not_checked: "neutral", candidates: "warning", not_found: "warning", linked: "success", not_required: "neutral", unavailable: "danger" };
function jiraCheckContext(action) {
  if (action?.jiraState === "unavailable") return action.reason || "Проверка Jira недоступна. Наличие задачи неизвестно.";
  if (action?.jiraState === "not_checked") return action.reason || "Поиск существующей задачи ещё не выполнялся. Наличие задачи неизвестно.";
  return null;
}
const options = (items, all) => [{ value: "all", label: all }, ...items.map((x) => ({ value: x, label: x }))];
const dateLabel = (date) => new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", timeZone: "Europe/Moscow" }).format(/* @__PURE__ */ new Date(date + "T12:00:00Z")).replace(" г.", "");
const plural = (n, forms) => forms[n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 1 : 2];
function savedData() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE));
    if (d?.schemaVersion === 1 && ["meetings", "topics", "decisions", "actions", "jiraIssues"].every((k) => Array.isArray(d[k]))) return enrichDemoIssueDetails({ ...d, catalog: demo.catalog }, seed);
  } catch {
  }
  return { ...cloneSeed(seed), catalog: demo.catalog, schemaVersion: 1 };
}
function Tags({ values = [], selected, onSelect }) {
  return <div className="tag-list">{values.map((t) => <Tag size="s" key={t} type={onSelect ? "selectable" : "read-only"} selected={Boolean(onSelect && selected === t)} onSelectedChange={onSelect ? (nextSelected) => onSelect(nextSelected ? t : "all") : void 0}>{t}</Tag>)}</div>;
}
function Status({ tone = "neutral", children }) {
  return <Badge variant="label" tone={tone} label={children} />;
}
function Empty({ title = "Ничего не найдено", text = "Попробуйте изменить запрос или сбросить фильтры.", onReset }) {
  return <div className="empty-state"><Search size={28} /><h3>{title}</h3><p>{text}</p>{onReset && <Button variant="secondary" onClick={onReset}>Сбросить фильтры</Button>}</div>;
}
function Notice({ tone = "info", children }) {
  return <div className={"notice " + tone}><span className="notice-icon">{tone === "warning" ? <TriangleAlert /> : tone === "success" ? <CheckCircle2 /> : <CircleHelp />}</span><div className="notice-text">{children}</div></div>;
}
function Tabs({ value, onChange, items, label, className = "", panelClassName = "", children }) {
  const groupId = useId();
  return <><div className={"tabbar " + className} role="tablist" aria-label={label}>{items.map(({ id, label, count }) => <button type="button" id={`${groupId}-tab-${id}`} role="tab" aria-controls={`${groupId}-panel-${id}`} aria-selected={value === id} tabIndex={value === id ? 0 : -1} onKeyDown={(e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const index = items.findIndex((x) => x.id === id);
    const next = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (index + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    onChange(items[next].id);
    e.currentTarget.parentElement.children[next].focus();
  }} className={"tab " + (value === id ? "active" : "")} key={id} onClick={() => onChange(id)}>{label}{count !== void 0 && <span className="tab-count">{count}</span>}</button>)}</div>{items.map(({ id }) => <div key={id} id={`${groupId}-panel-${id}`} role="tabpanel" aria-labelledby={`${groupId}-tab-${id}`} hidden={value !== id} tabIndex={value === id ? 0 : -1} className={value === id ? panelClassName : undefined}>{value === id ? children : null}</div>)}</>;
}
function focusableElements(el) {
  return [...el.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')]
    .filter(e => e.offsetParent !== null && !e.closest('[inert]'));
}
function restoreFocus(preferred) {
  requestAnimationFrame(() => {
    if (preferred?.isConnected && preferred.offsetParent !== null && !preferred.closest('[inert]')) {
      preferred.focus({ preventScroll: true });
      return;
    }
    const panel = [...document.querySelectorAll('[role="dialog"]')].find(el => !el.closest('[inert]'));
    const fallback = panel ? focusableElements(panel)[0] || panel : document.querySelector('main');
    fallback?.focus({ preventScroll: true });
  });
}
function FocusPanel({ children, className, onClose, label, active = true, restoreOnExit = true }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!active) return;
    const old = document.activeElement;
    const el = ref.current;
    const targets = () => focusableElements(el);
    (el.querySelector("[data-autofocus]") || targets()[0] || el).focus({ preventScroll: true });
    const handle = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === "Tab") {
        const a = targets();
        if (!a.length) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey && document.activeElement === a[0]) {
          e.preventDefault();
          a[a.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === a[a.length - 1]) {
          e.preventDefault();
          a[0].focus();
        }
      }
    };
    el.addEventListener("keydown", handle);
    return () => {
      el.removeEventListener("keydown", handle);
      if (restoreOnExit) restoreFocus(old);
    };
  }, [active, label, restoreOnExit]);
  return <section ref={ref} role={active ? "dialog" : undefined} aria-modal={active ? true : undefined} aria-hidden={!active || undefined} inert={active ? undefined : ""} aria-label={label} tabIndex={-1} className={className}>{children}</section>;
}
function App() {
  const [data, setData] = useState(savedData);
  const [themePreference, setThemePreference] = useState(savedThemePreference);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const theme = themePreference || (systemDark ? 'dark' : 'light');
  const themeAction = theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
  const [page, setPage] = useState(() => Object.keys(labels.page).includes(location.hash.slice(2)) ? location.hash.slice(2) : "meetings");
  useEffect(() => { document.title = labels.page[page] + " · " + demo.name + " — Журнал решений"; }, [page]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ component: "all", team: "all", period: "all", platform: "all" });
  const [listTab, setListTab] = useState("all");
  const [decisionTab, setDecisionTab] = useState("active");
  const [reviewTab, setReviewTab] = useState("records");
  const [showAllActions, setShowAllActions] = useState(false);
  const [onlyAttention, setOnlyAttention] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [drawerHistory, setDrawerHistory] = useState([]);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches);
  const sidebarRef = useRef(null);
  const menuTriggerRef = useRef(null);
  const drawerOpenerRef = useRef(null);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',
      getComputedStyle(document.documentElement).getPropertyValue('--surface-page').trim());
  }, [theme]);
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemePreference(next);
    try { localStorage.setItem(THEME_STORAGE, next); } catch {}
  };
  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => { setIsMobile(media.matches); if (!media.matches) setMobileOpen(false); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const menu = sidebarRef.current;
    const targets = () => focusableElements(menu);
    const focusFrame = requestAnimationFrame(() => {
      (menu.querySelector('[aria-current="page"]') || targets()[0] || menu).focus({ preventScroll: true });
    });
    const handle = e => {
      if (e.key === 'Escape') { e.preventDefault(); setMobileOpen(false); }
      if (e.key !== 'Tab') return;
      const items = targets();
      if (!items.length) { e.preventDefault(); return; }
      if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus(); }
    };
    menu.addEventListener('keydown', handle);
    return () => { cancelAnimationFrame(focusFrame); menu.removeEventListener('keydown', handle); restoreFocus(menuTriggerRef.current); };
  }, [isMobile, mobileOpen]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(data));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [data]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4200);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    document.body.style.overflow = drawer || modal || mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer, modal, mobileOpen]);
  useLayoutEffect(() => {
    if (!drawer) return;
    const body = document.querySelector('.drawer .drawer-body');
    if (body) body.scrollTop = drawer.scrollTop || 0;
  }, [drawer?.type, drawer?.id, drawer?.tab, drawer?.restoreKey]);
  useEffect(() => {
    const f = () => {
      const p = location.hash.slice(2);
      if (labels.page[p]) {
        setPage(p);
        setQuery('');
        setDrawer(null);
        setDrawerHistory([]);
        setModal(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const navigate = (p) => {
    setPage(p);
    location.hash = "/" + p;
    setQuery("");
    setMobileOpen(false);
    setDrawer(null);
    setDrawerHistory([]);
    setModal(null);
    requestAnimationFrame(() => document.querySelector('main')?.focus({preventScroll:true}));
  };
  const resetFilters = () => {
    setQuery("");
    setFilters({ component: "all", team: "all", period: "all", platform: "all" });
    setListTab("all");
    setOnlyAttention(false);
  };
  const filter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const latestDate = Math.max(...data.meetings.map((m) => Date.parse(m.date)));
  const inPeriod = (date) => filters.period === "all" || Date.parse(date) >= latestDate - (Number.parseInt(filters.period) - 1) * 864e5;
  const inScope = (item) => (filters.component === "all" || item.components?.includes(filters.component)) && (filters.team === "all" || item.teams?.includes(filters.team)) && (filters.platform === "all" || item.platforms?.includes(filters.platform));
  const filteredMeetings = data.meetings.filter((m) => inScope(m) && inPeriod(m.date) && matchText(query, m.title, m.summary, ...m.components, ...m.teams, ...m.transcript.map((x) => x.text), ...(m.participants || []).flatMap((person) => [person.name, person.role])));
  const meetings = filteredMeetings.filter((m) => listTab === "all" || listTab === "review" && m.processing === "review" || listTab === "development" && m.kind === "development").sort((a, b) => b.date.localeCompare(a.date));
  const pending = data.decisions.filter((d) => d.verification === "pending");
  const unlinked = data.actions.filter((a) => !["linked", "not_required"].includes(a.jiraState));
  const decisions = data.decisions.filter((d) => inScope(d) && inPeriod(d.createdAt) && matchText(query, d.title, d.text, d.reason || "", d.scope, ...d.components, ...d.teams) && (decisionTab === "all" || decisionTab === "active" && d.lifecycle === "active" || decisionTab === "pending" && d.verification === "pending")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const stats = getStats(data, filters).filter((s) => (!onlyAttention || s.attention) && matchText(query, s.component)).sort((a, b) => b.meetingCount - a.meetingCount);
  const openDrawer = next => {
    if (drawer?.type === next.type && drawer?.id === next.id && drawer?.tab === next.tab && drawer?.segmentId === next.segmentId) return;
    if (drawer) {
      const scrollTop = document.querySelector('.drawer .drawer-body')?.scrollTop || 0;
      setDrawerHistory(history => [...history, { ...drawer, scrollTop }]);
    } else {
      drawerOpenerRef.current = document.activeElement;
      setDrawerHistory([]);
    }
    setDrawer(next);
  };
  const closeDrawer = () => {
    setDrawer(null);
    setDrawerHistory([]);
    restoreFocus(drawerOpenerRef.current);
  };
  const backDrawer = () => {
    const previous = drawerHistory.at(-1);
    if (!previous) return closeDrawer();
    setDrawerHistory(history => history.slice(0, -1));
    setDrawer({ ...previous, restoreKey: Date.now() });
  };
  const openMeeting = (id, tab = "summary", segmentId = null) => openDrawer({ type: "meeting", id, tab, segmentId });
  const openDecision = (id) => openDrawer({ type: "decision", id });
  const openComponent = id => openDrawer({ type: 'component', id });
  const updateDecision = (id, patch) => setData(d => {
    const decision = d.decisions.find(item => item.id === id);
    return {
      ...d,
      decisions: d.decisions.map(x => x.id === id ? { ...x, ...patch } : x),
      meetings: patch.verification === 'pending' ? d.meetings.map(m => m.id === decision?.meetingId || m.id === decision?.source?.meetingId ? { ...m, processing: 'review' } : m) : d.meetings
    };
  });
  const verify = (id) => {
    const previousFocus = document.activeElement;
    updateDecision(id, { verification: "verified", reviewedAt: (/* @__PURE__ */ new Date()).toISOString() });
    setToast("Точность записи подтверждена");
    restoreFocus(previousFocus);
  };
  const linkIssue = (actionId, key) => {
    const action = data.actions.find(a => a.id === actionId);
    if (!action || data.decisions.find(d => d.id === action.decisionId)?.verification === 'pending' || !data.jiraIssues.some(i => i.key === key)) return;
    setData((d) => ({ ...d, actions: d.actions.map((a) => a.id === actionId ? { ...a, jiraState: "linked", issueKey: key, reason: null, candidateKeys: [...new Set([...(a.candidateKeys || []), key])], lastChecked: new Date().toISOString() } : a) }));
    setModal(null);
    setToast("Связь с " + key + " сохранена в прототипе");
  };
  const reopenAction = actionId => {
    setData(state => ({ ...state, actions: state.actions.map(action => {
      if (action.id !== actionId) return action;
      const candidateKeys = [...new Set([...(action.candidateKeys || []), action.issueKey, ...state.jiraIssues.filter(issue => action.components.includes(issue.component)).map(issue => issue.key)].filter(key => key && state.jiraIssues.some(issue => issue.key === key)))];
      return { ...action, jiraState: candidateKeys.length ? 'candidates' : 'not_checked', issueKey: null, reason: null, candidateKeys,
        previousResolution: { jiraState: action.jiraState, issueKey: action.issueKey || null, reason: action.reason || null } };
    }) }));
    setModal(null);
    setToast('Действие возвращено к разбору. Задачи Jira сохранены.');
    requestAnimationFrame(() => restoreFocus(document.querySelector(`[data-action-id="${actionId}"] button`)));
  };
  const sourceFor = (s) => {
    const meeting = data.meetings.find((m) => m.id === s?.meetingId);
    const segment = meeting?.transcript.find((t) => t.id === s?.segmentId);
    return { meeting, segment };
  };
  const renderSource = ({ source }) => {
    const { meeting, segment } = sourceFor(source);
    if (!meeting) return null;
    return <div className="source-quote"><div className="source-head"><MessageSquareText size={15} /><span>Фрагмент встречи</span><button className="text-button mono" onClick={() => openMeeting(meeting.id, "transcript", segment?.id)}>{segment?.time || "Открыть"} <ArrowUpRight size={13} /></button></div><p className="source-text">«{segment?.text || "Фрагмент не указан"}»</p><button className="text-button small" onClick={() => openMeeting(meeting.id)}>{meeting.title}</button></div>;
  };
  const renderDecisionCard = ({ item, compact = false }) => <article key={item.id} className="decision-card"><div className="decision-card-head"><span className="mono small muted">{item.id}</span><div className="inline">{item.lifecycle === "superseded" ? <Status>Заменено</Status> : item.lifecycle === "revoked" ? <Status tone="danger">Отменено</Status> : item.verification === "pending" ? <Status tone="warning">Проверить запись</Status> : <Status tone="success">Проверено</Status>}</div></div><button className="table-link decision-heading" onClick={() => openDecision(item.id)}>{item.title}</button><p className="decision-body">{item.text}</p><div className="decision-meta"><Tags values={item.components} /><span className="small muted">{item.platforms.join(" · ")} · {dateLabel(item.createdAt)}</span></div>{!compact && <><div className="reason-box"><span className="small muted">Почему</span><p>{item.reason || "Причина не зафиксирована на встрече."}</p></div><div className="decision-actions"><button className="text-button" onClick={() => openMeeting(item.source.meetingId, "transcript", item.source.segmentId)}><MessageSquareText size={15} /> Открыть источник</button>{item.verification === "pending" && <Button variant="secondary" iconLeft={<Check size={16} />} onClick={() => verify(item.id)}>Запись верна</Button>}</div></>}</article>;
  function Toolbar({ analytics = false }) {
    const hasFilters = Object.values(filters).some(v => v !== 'all');
    const topicContext = analytics || page === 'review' && reviewTab === 'actions';
    return <>
      <div className="toolbar">
        <TextField className="search-field" label="Поиск по тексту" prefix={<Search size={17}/>} placeholder={analytics ? copy.searchAnalytics : page === 'decisions' ? copy.searchDecisions : 'Поиск по названию и содержимому…'} value={query} onChange={e => setQuery(e.target.value)}/>
        <Select className="filter-field" label={copy.singular} options={options(components,copy.all)} value={filters.component} onValueChange={v => filter('component',v)}/>
        <Select className="filter-field" label="Команда" options={options(teams,'Все команды')} value={filters.team} onValueChange={v => filter('team',v)}/>
        <Select className="filter-field" label="Период" options={[{value:'all',label:'Весь период'},{value:'7d',label:'7 дней'},{value:'30d',label:'30 дней'}]} value={filters.period} onValueChange={v => filter('period',v)}/>
        <Select className="filter-field platform-filter" label="Платформа" options={options(platforms,'Все платформы')} value={filters.platform} onValueChange={v => filter('platform',v)}/>
      </div>
      {hasFilters && <div className="filter-chips"><Filter size={14}/>{Object.entries(filters).filter(([,v]) => v !== 'all').map(([k,v]) => <Tag size="s" key={k} dismissible dismissLabel={'Убрать фильтр ' + v} onDismiss={() => filter(k,'all')}>{k === 'period' ? v === '7d' ? 'За 7 дней' : 'За 30 дней' : v}</Tag>)}<button className="text-button small" onClick={resetFilters}>Сбросить всё</button></div>}
      {topicContext && <p className="filter-context-note">{copy.contextTopic}</p>}
      {!topicContext && hasFilters && <p className="filter-context-note">{page === 'meetings' ? copy.contextMeetings : 'Команды и платформы относятся к решению. Период — по дате его принятия.'}</p>}
    </>;
  }
  function MeetingsPage() {
    return <><div className="page-header"><div><h1 className="page-title">Встречи</h1><p className="page-description">{copy.pageDescription}</p></div><div className="header-actions"><Button variant="secondary" iconLeft={<CircleHelp size={16} />} onClick={() => setModal({ type: "how" })}>Как это работает</Button><Button variant="primary" iconLeft={<Plus size={16} />} onClick={() => setModal({ type: "import" })}>Импорт встречи</Button></div></div><div className="metrics-strip compact-metrics"><div className="metric"><span className="metric-value">{data.meetings.length}</span><div><div className="metric-label">встреч в журнале</div><div className="metric-note">{copy.meetingNote}</div></div></div><div className="metric"><span className="metric-value">{data.decisions.filter((d) => d.lifecycle === "active" && d.verification === "verified").length}</span><div><div className="metric-label">проверенных решений</div><div className="metric-note">Действующие договорённости</div></div></div><button className="metric metric-action" onClick={() => {
      navigate("review");
      setReviewTab("records");
    }}><span className="metric-value">{pending.length}</span><div><div className="metric-label">нужно проверить <ArrowUpRight size={14} /></div><div className="metric-note">Сверить формулировки с источником</div></div></button></div>{demo.story && <section className="demo-story" aria-labelledby="demo-story-title"><div className="demo-story-content"><span className="demo-story-kicker">Сквозной сценарий · {demo.story.direction}</span><h2 id="demo-story-title">{demo.story.title}</h2><p>{demo.story.description}</p></div><Button variant="secondary" iconRight={<ArrowRight size={16}/>} onClick={() => openDecision(demo.story.decisionId)}>Проследить решение</Button></section>}{Toolbar({})}<Tabs label="Список встреч" value={listTab} onChange={setListTab} items={[{ id: "all", label: "Все встречи", count: filteredMeetings.length }, { id: "review", label: "К проверке", count: filteredMeetings.filter((m) => m.processing === "review").length }, { id: "development", label: labels.kind.development }]}><div className="table-wrap"><table className="data-table meetings-table" aria-label="Встречи">
      <thead><tr>
        <th scope="col" className="meeting-date">Дата</th>
        <th scope="col" className="col-title">Встреча</th>
        <th scope="col" className="meeting-secondary">{copy.plural}</th>
        <th scope="col" className="meeting-secondary">Команды</th>
        <th scope="col" className="meeting-secondary numeric">Решения</th>
        <th scope="col" className="meeting-status">Статус</th>
        <th scope="col" className="meeting-open" aria-label="Открыть" />
      </tr></thead>
      <tbody>{meetings.map((m) => {
        const decisionCount = data.decisions.filter((d) => d.source.meetingId === m.id).length;
        const meetingTeams = m.teams.filter((t) => demo.id !== "ds" || t !== "Команда ДС");
        return <tr key={m.id}>
          <td className="date-cell meeting-date"><span>{dateLabel(m.date)}</span><span className="cell-subtitle">{m.duration} мин</span></td>
          <td><div className="title-with-icon">
            <span className="meeting-glyph">{m.kind === "development" ? <Layers3 size={18} /> : <MessageSquareText size={18} />}</span>
            <div>
              <button className="table-link cell-title" onClick={() => openMeeting(m.id)}>{m.title}</button>
              <span className="cell-subtitle title-subtitle">{m.stageLabel || labels.kind[m.kind]} · {m.platforms.join(", ")}</span>
              <div className="meeting-compact-meta">
                <span className="meeting-mobile-date">{dateLabel(m.date)} · {m.duration} мин</span>
                <Tags values={m.components} selected={filters.component} onSelect={(v) => filter("component", v)} />
                <span className="meeting-context">{meetingTeams.join(", ") || demo.teamName} · {decisionCount} {plural(decisionCount, ["решение", "решения", "решений"])}</span>
              </div>
            </div>
          </div></td>
          <td className="meeting-secondary"><Tags values={m.components} selected={filters.component} onSelect={(v) => filter("component", v)} /></td>
          <td className="meeting-secondary"><span className="small">{meetingTeams.slice(0, 2).join(", ") || demo.teamName}</span>{meetingTeams.length > 2 && <span className="muted small"> +{meetingTeams.length - 2}</span>}</td>
          <td className="meeting-secondary numeric">{decisionCount}</td>
          <td className="meeting-status"><Status tone={m.processing === "review" ? "warning" : m.processing === "error" ? "danger" : "neutral"}>{m.processing === "review" ? "К проверке" : m.processing === "processing" ? "Обработка" : m.processing === "error" ? "Ошибка" : "Разобрано"}</Status></td>
          <td className="icon-cell meeting-open"><IconButton variant="ghost" aria-label={"Открыть встречу «" + m.title + "»"} icon={<ChevronRight size={17} />} onClick={() => openMeeting(m.id)} /></td>
        </tr>;
      })}</tbody>
    </table>{!meetings.length && <Empty onReset={resetFilters} />}</div><div className="table-footer"><span>Показано {meetings.length} из {data.meetings.length}</span></div></Tabs></>;
  }
  function DecisionsPage() {
    return <><div className="page-header"><div><h1 className="page-title">Решения</h1><p className="page-description">Актуальные договорённости, их основания и история изменений.</p></div><Status tone="info">{data.decisions.length} записей</Status></div>{Toolbar({})}<Tabs label="Список решений" value={decisionTab} onChange={setDecisionTab} items={[{ id: "active", label: "Актуальные" }, { id: "pending", label: "Проверить запись", count: pending.length }, { id: "all", label: "Вся история" }]}><div className="decision-list">{decisions.map((d) => renderDecisionCard({ item: d }))}</div>{!decisions.length && <Empty onReset={() => {
      resetFilters();
      setDecisionTab("all");
    }} />}<p className="page-note"><ShieldCheck size={15} /> «Проверено» означает, что запись точно передаёт встречу. Это отдельный статус от актуальности решения.</p></Tabs></>;
  }
  function renderActionCard({ a }) {
    const issue = a.jiraState === 'linked' && data.jiraIssues.find(i => i.key === a.issueKey);
    const decision = data.decisions.find(x => x.id === a.decisionId);
    const resolved = ['linked', 'not_required'].includes(a.jiraState);
    const jiraContext = jiraCheckContext(a);
    return <article key={a.id} className="action-card" data-action-id={a.id}>
      <div className="row-between"><span className="mono small muted">{a.id}</span><Status tone={jiraTone[a.jiraState]}>{labels.jira[a.jiraState]}</Status></div>
      <h3 className="action-card-title">{a.title}</h3>
      <p className="small muted">{a.description}</p>
      <div className="action-card-meta"><Tags values={a.components}/><span className="small muted">{a.teams.join(' · ')}</span></div>
      {issue && <div className="candidate-card"><div><span className="mono small">{issue.key}</span><p className="candidate-title">{issue.title}</p><span className="small muted">{issue.status} · {issue.assignee}</span></div><CheckCheck size={18}/></div>}
      {a.jiraState === 'not_required' && <div className="reason-box"><span className="small muted">Почему задача не требуется</span><p>{a.reason || 'Отмечено при разборе'}</p></div>}
      {a.jiraState === 'not_found' && <p className="small muted">Проверка в демонстрационном проекте {demo.project}. Нулевой результат не исключает задач за пределами поиска.</p>}
      {jiraContext && <p className="small attention-note">{jiraContext}</p>}
      {decision?.verification === 'pending' && <p className="small attention-note">Сначала проверьте точность связанной записи решения.</p>}
      <div className="decision-actions">
        <button className="text-button small" onClick={() => openDecision(a.decisionId)}><GitBranch size={14}/> Основание</button>
        <div className="inline action-correction-actions">
          {!resolved && <><Button variant="ghost" size="s" onClick={() => setModal({type:'no-task',id:a.id})}>Не нужна</Button><Button variant="secondary" onClick={() => setModal({type:a.jiraState === 'candidates' ? 'candidates' : 'task',id:a.id})}>{a.jiraState === 'candidates' ? 'Проверить совпадения' : 'Подготовить задачу'}</Button></>}
          {a.jiraState === 'linked' && <><Button variant="ghost" size="s" onClick={() => reopenAction(a.id)}>Убрать связь</Button><Button variant="secondary" size="s" onClick={() => setModal({type:'candidates',id:a.id})}>Изменить связь</Button></>}
          {a.jiraState === 'not_required' && <Button variant="secondary" size="s" iconLeft={<RotateCcw size={14}/>} onClick={() => reopenAction(a.id)}>Вернуть к разбору</Button>}
        </div>
      </div>
    </article>;
  }
  function ReviewPage() {
    const contextActions = getContextActions(data, filters).filter(a => matchText(query, a.title, a.description, ...a.components));
    const activeActions = contextActions.filter(a => !['linked','not_required'].includes(a.jiraState));
    const actions = showAllActions ? contextActions : activeActions;
    const toReview = pending.filter(d => inScope(d) && inPeriod(d.createdAt) && matchText(query,d.title,d.text));
    const sliceResolved = !showAllActions && contextActions.length > 0 && !activeActions.length;
    return <>
      <div className="page-header"><div><h1 className="page-title">К разбору</h1><p className="page-description">Проверьте записи и определите, что делать дальше.</p></div><Status tone="warning">{toReview.length + activeActions.length} {plural(toReview.length + activeActions.length,['элемент','элемента','элементов'])} по фильтрам</Status></div>
      {Toolbar({})}
      <Tabs label="Очередь разбора" value={reviewTab} onChange={setReviewTab} items={[{id:'records',label:'Проверить записи',count:toReview.length},{id:'actions',label:'Действия и Jira',count:activeActions.length}]}>
      {reviewTab === 'records' ? <>
        <Notice>AI подготовил записи по расшифровке. Сверьте формулировку с источником — кнопка «Запись верна» подтверждает точность извлечения.</Notice>
        <div className="decision-list">{toReview.map(d => renderDecisionCard({ item: d }))}</div>
        {!toReview.length && <Empty title={pending.length ? 'Нет записей по фильтрам' : 'Все записи проверены'} text={pending.length ? 'Измените запрос или сбросьте фильтры.' : 'Новые извлечения появятся здесь после обработки встреч.'} onReset={pending.length ? resetFilters : undefined}/>}
      </> : <>
        <Notice>Jira работает в демонстрационном режиме. Кандидаты и задачи вымышлены; все действия сохраняются только в этом браузере.</Notice>
        <div className="row-between section-caption"><span className="muted small">{actions.length} {plural(actions.length,['действие','действия','действий'])}</span><Checkbox label="Показывать разобранные" checked={showAllActions} onCheckedChange={setShowAllActions}/></div>
        <div className="review-grid">{actions.map(a => renderActionCard({ a }))}</div>
        {!actions.length && <Empty title={sliceResolved ? 'Действия в этом срезе разобраны' : unlinked.length || showAllActions ? 'Нет действий по фильтрам' : 'Очередь разобрана'} text={sliceResolved ? 'Включите «Показывать разобранные», чтобы посмотреть или изменить результат.' : unlinked.length || showAllActions ? 'Измените запрос или сбросьте фильтры.' : 'Все действия связаны с задачами или отмечены как не требующие задачи.'} onReset={!sliceResolved && (unlinked.length || showAllActions) ? resetFilters : undefined}/>}
      </>}</Tabs>
    </>;
  }
  function AnalyticsPage() {
    const problems = data.topics.filter((t) => t.type === "problem" && t.confirmed && t.status === "open");
    const top = Math.max(1, ...stats.map((s) => s.meetingCount));
    return <><div className="page-header"><div><h1 className="page-title">Аналитика</h1><p className="page-description">Частота обсуждений и подтверждённые проблемы — отдельно.</p></div></div><div className="metrics-strip"><div className="metric"><span className="metric-value">{stats.filter((s) => s.attention).length}</span><div><div className="metric-label">{plural(stats.filter(s => s.attention).length,copy.attentionForms)} внимания</div><div className="metric-note">У каждого сигнала есть основание</div></div></div><div className="metric"><span className="metric-value">{stats.reduce((n, s) => n + s.problemCount, 0)}</span><div><div className="metric-label">{plural(stats.reduce((n,s) => n+s.problemCount,0),['проблема','проблемы','проблем'])} {copy.problemsBy}</div><div className="metric-note">Повторные встречи объединены</div></div></div><div className="metric"><span className="metric-value">{stats.reduce((n, s) => n + s.unlinkedActions, 0)}</span><div><div className="metric-label">{plural(stats.reduce((n,s) => n+s.unlinkedActions,0),['действие','действия','действий'])} без связи с Jira</div><div className="metric-note">{copy.sumBy}</div></div></div></div>{Toolbar({ analytics: true })}<div className="row-between section-caption"><h2 className="section-title">{copy.discussionTitle}</h2><Checkbox label="Только требуют внимания" checked={onlyAttention} onCheckedChange={setOnlyAttention} /></div><div className="table-wrap"><table className="data-table analytics-table"><thead><tr><th>{copy.singular}</th><th>Встречи</th><th className="numeric">Проблемы</th><th className="numeric">Запросы изменений</th><th className="numeric">Затронуто команд</th><th className="numeric">Без связи с Jira</th><th>Внимание</th></tr></thead><tbody>{stats.map((s) => <tr key={s.component}><td><button className="table-link component-name" onClick={() => openComponent(s.component)}><Blocks size={16} />{s.component}</button></td><td><div className="inline"><span className="bar-track"><span className="bar-fill" style={{ width: Math.max(0, s.meetingCount / top * 100) + "%" }} /></span><span className="mono">{s.meetingCount}</span></div></td><td className="numeric">{s.problemCount}</td><td className="numeric">{s.changeRequestCount ?? 0}</td><td className="numeric">{s.affectedTeams}</td><td className="numeric">{s.unlinkedActions ? <button className="text-button" aria-label={`Действия ${s.component} без связи с Jira (${s.unlinkedActions})`} onClick={() => { navigate('review'); filter('component',s.component); setReviewTab('actions'); setShowAllActions(false); }}>{s.unlinkedActions} <ArrowUpRight size={13}/></button> : 0}</td><td>{s.attention ? <><button className="text-button attention-note" onClick={() => openComponent(s.component)}><CircleDot size={14} /> Требует внимания</button><span className="attention-reason">{s.attentionReasons[0]}</span></> : <span className="small muted">Нет сигналов</span>}</td></tr>)}</tbody></table>{!stats.length && <Empty onReset={resetFilters} />}</div><div className="page-note"><CircleHelp size={15} /><span>{copy.countingNote}</span></div><div className="definition-list metric-definitions"><div><dt>Проблемы</dt><dd>Уникальные подтверждённые проблемные темы, обсуждавшиеся в выбранном периоде.</dd></div><div><dt>Запросы изменений</dt><dd>Подтверждённые темы с запросом изменения. Для подсчёта внедрённых изменений нужна связь с выполнением задач и релизами.</dd></div><div><dt>Требует внимания</dt><dd>{copy.attentionHelp}</dd></div></div></>;
  }
  function IntegrationsPage() {
    return <><div className="page-header"><div><h1 className="page-title">Интеграции</h1><p className="page-description">Точки подключения существующего агента и Jira.</p></div><Status>Прототип 0.4</Status></div><div className="connection-grid"><article className="connection-card"><div className="connection-icon"><MessageSquareText size={22} /></div><h2>Агент встреч</h2><Status tone="info">Импорт JSON</Status><p>Принимает результат работы вашего агента: встречу, итоги, теги и расшифровку.</p><div className="connection-state"><span className="small muted">Автоматический приём</span><strong>Пока не подключён</strong></div><Button variant="secondary" iconLeft={<Upload size={16} />} onClick={() => setModal({ type: "import" })}>Проверить формат импорта</Button></article><article className="connection-card"><div className="connection-icon"><ListChecks size={22} /></div><h2>Jira</h2><Status tone="warning">Демонстрационный режим</Status><p>Поиск кандидатов, подтверждение связи и создание задачи после проверки.</p><div className="connection-state"><span className="small muted">Рабочее подключение</span><strong>Не настроено</strong></div><Button variant="secondary" onClick={() => {
      navigate("review");
      setReviewTab("actions");
    }}>Посмотреть сценарий Jira</Button></article></div><section className="integration-spec"><h2 className="section-title">Что нужно для живого пилота</h2><div className="definition-list"><div><dt>Агент</dt><dd>Один обезличенный пример его JSON: ID встречи, таймкоды, summary, теги и выделенные решения.</dd></div><div><dt>Jira</dt><dd>Тип и версия, доступные проекты, обязательные поля и способ авторизации.</dd></div><div><dt>Среда</dt><dd>Сервер в среде с доступом к Jira. Реальные записи и права доступа остаются в рабочем контуре.</dd></div></div></section></>;
  }
  function DecisionDrawer({ d }) {
    const old = data.decisions.find((x) => x.id === d.supersedes);
    const replacement = data.decisions.find((x) => x.supersedes === d.id);
    const actions = data.actions.filter((a) => a.decisionId === d.id);
    return <><div className="drawer-header"><div><div className="drawer-eyebrow mono">{d.id} · {dateLabel(d.createdAt)} {d.createdAt.slice(0, 4)}</div><h2 className="drawer-title">{d.title}</h2></div><IconButton variant="ghost" aria-label="Закрыть решение" icon={<X size={20} />} onClick={closeDrawer} /></div><div className="drawer-meta"><Status tone={d.lifecycle === "active" ? "success" : "neutral"}>{d.lifecycle === "active" ? "Действует" : d.lifecycle === "superseded" ? "Заменено" : "Отменено"}</Status><Status tone={d.verification === "pending" ? "warning" : "neutral"}>{d.verification === "pending" ? "Точность не проверена" : "Запись проверена"}</Status></div><div className="drawer-body">{replacement && <Notice tone="warning">Это решение заменено. <button className="text-button" onClick={() => openDecision(replacement.id)}>Перейти к {replacement.id} <ArrowRight size={14} /></button></Notice>}<h3 className="section-title">Что решили</h3><p className="detail-summary">{d.text}</p><div className="reason-box"><h3 className="section-title">Почему</h3><p>{d.reason || "Причина не зафиксирована. Её можно добавить после уточнения у участников."}</p></div><div className="section-caption"><h3 className="section-title">Область применения</h3><p>{d.scope}</p><div className="scope-grid"><Tags values={d.components} /><span className="small muted">{d.platforms.join(" · ")} · {d.teams.join(", ")}</span></div></div>{renderSource({ source: d.source })}{old && <div className="timeline"><h3 className="section-title">История решения</h3><div className="timeline-item"><span className="timeline-dot" /><div><button className="text-button" onClick={() => openDecision(old.id)}>{old.id} · {old.title}</button><p className="small muted">{dateLabel(old.createdAt)} · Заменено текущим решением</p></div></div><div className="timeline-item"><span className="timeline-dot active" /><div><strong>{d.id} · Текущая формулировка</strong><p className="small muted">{dateLabel(d.createdAt)}</p></div></div></div>}{actions.length > 0 && <><h3 className="section-title section-caption">Дальнейшие действия</h3>{actions.map((a) => renderActionCard({ a }))}</>}</div><div className="drawer-footer"><Button variant="ghost" onClick={() => setModal({ type: "edit-decision", id: d.id })}>Редактировать запись</Button>{d.verification === "pending" ? <Button variant="primary" iconLeft={<Check size={16} />} onClick={() => verify(d.id)}>Запись верна</Button> : <span className="inline small muted"><CheckCheck size={16} /> Точность проверена</span>}</div></>;
  }
  function ComponentDrawer({ name }) {
    const ts = data.topics.filter((t) => t.components.includes(name));
    const ms = data.meetings.filter((m) => m.components.includes(name)).sort((a, b) => b.date.localeCompare(a.date));
    const s = getStats(data, filters).find((x) => x.component === name);
    return <><div className="drawer-header"><div><div className="drawer-eyebrow">{copy.historyTitle}</div><h2 className="drawer-title">{name}</h2></div><IconButton variant="ghost" aria-label={copy.closeDetail} icon={<X size={20} />} onClick={closeDrawer} /></div><div className="drawer-body">{s?.attention && <Notice tone="warning"><strong>Требует внимания</strong><p className="small">Основания по выбранным фильтрам.</p><ul>{s.attentionReasons.map((r, i) => <li key={i}>{r}</li>)}</ul></Notice>}<h3 className="section-title section-caption">Темы и проблемы за всё время</h3>{ts.map((t) => <article className="topic-card" key={t.id}><div className="row-between"><Status tone={t.type === "problem" ? "warning" : "neutral"}>{labels.topic[t.type]}</Status><Status>{t.status === "open" ? "Открыто" : "Закрыто"}</Status></div><h4>{t.title}</h4><p className="small muted">{t.teams.join(" · ")} · {t.meetingIds.length} {plural(t.meetingIds.length, ["встреча", "встречи", "встреч"])}</p>{t.attention && <p className="attention-note small">{t.attentionReason || "Ручная отметка: требует внимания"}</p>}<Button size="s" variant="ghost" iconLeft={<CircleDot size={13} />} onClick={() => {
      if (t.attention) {
        setData((d) => ({ ...d, topics: d.topics.map((x) => x.id === t.id ? { ...x, attention: false, attentionReason: "" } : x) }));
        setToast("Ручная отметка снята. Автоматические сигналы сохраняются.");
      } else setModal({ type: "attention", id: t.id });
    }}>{t.attention ? "Снять ручную отметку" : "Отметить для внимания"}</Button></article>)}<h3 className="section-title section-caption">Вся история обсуждений</h3><div className="timeline">{ms.map((m) => <div className="timeline-item" key={m.id}><span className="timeline-dot" /><div><span className="small muted">{dateLabel(m.date)}</span><button className="table-link" onClick={() => openMeeting(m.id)}>{m.title}</button><p className="small muted">{m.teams.join(" · ")}</p></div></div>)}</div></div></>;
  }
  const currentMeeting = drawer?.type === 'meeting' && data.meetings.find(m => m.id === drawer.id);
  const currentDecision = drawer?.type === 'decision' && data.decisions.find(d => d.id === drawer.id);
  const previousDrawer = drawerHistory.at(-1);
  const backLabel = previousDrawer?.type === 'decision' ? 'Назад к решению' : previousDrawer?.type === 'meeting' ? 'Назад к встрече' : copy.backDetail;
  const previousTitle = previousDrawer?.type === 'decision' ? data.decisions.find(d => d.id === previousDrawer.id)?.title : previousDrawer?.type === 'meeting' ? data.meetings.find(m => m.id === previousDrawer.id)?.title : previousDrawer?.id;
  const sidebarBlocked = Boolean(drawer || modal || isMobile && !mobileOpen);
  const workspaceBlocked = Boolean(drawer || modal || isMobile && mobileOpen);
  return <div className="app-shell">
    <aside ref={sidebarRef} id="workspace-navigation" className={'sidebar ' + (mobileOpen ? 'mobile-open' : '')} role={isMobile && mobileOpen ? 'dialog' : undefined} aria-modal={isMobile && mobileOpen ? true : undefined} aria-label="Навигация" aria-hidden={sidebarBlocked || undefined} inert={sidebarBlocked ? '' : undefined} tabIndex={-1}>
      <IconButton className="mobile-nav-close" variant="ghost" aria-label="Закрыть меню" icon={<X size={19}/>} onClick={() => setMobileOpen(false)}/>
      <a href="#/meetings" className="brand" aria-label="Журнал решений — встречи" onClick={e => {e.preventDefault();navigate('meetings');}}><span className="brand-mark"><GitBranch size={22}/></span><span><span className="brand-name">Журнал решений</span><span className="brand-subtitle">Контекст имеет значение</span></span></a>
      <nav className="nav-list" aria-label="Основная навигация">{[['meetings',MessageSquareText],['decisions',GitBranch],['review',Inbox],['analytics',TrendingUp]].map(([id,Icon]) => <button key={id} className={'nav-item ' + (page === id ? 'active' : '')} aria-label={labels.page[id]} title={labels.page[id]} aria-current={page === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={18}/><span className="nav-label">{labels.page[id]}</span>{id === 'review' && pending.length + unlinked.length > 0 && <span className="nav-count">{pending.length + unlinked.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><button className={'nav-item ' + (page === 'integrations' ? 'active' : '')} aria-label="Интеграции" title="Интеграции" aria-current={page === 'integrations' ? 'page' : undefined} onClick={() => navigate('integrations')}><Plug size={18}/><span className="nav-label">Интеграции</span></button><div className="system-status" title="Руслан Каутаров"><span className="team-avatar" aria-hidden="true">РК</span><div><strong>Руслан Каутаров</strong></div></div></div>
    </aside>
    {isMobile && mobileOpen && <button className="mobile-backdrop" aria-hidden="true" tabIndex={-1} onClick={() => setMobileOpen(false)}/>}
    <div className="workspace" aria-hidden={workspaceBlocked || undefined} inert={workspaceBlocked ? '' : undefined}>
      <header className="topbar"><div className="topbar-context"><IconButton ref={menuTriggerRef} className="mobile-menu" variant="ghost" aria-label="Открыть меню" aria-expanded={mobileOpen} aria-controls="workspace-navigation" icon={<Menu size={19}/>} onClick={() => setMobileOpen(value => !value)}/><div className="demo-selector"><Select label="Сценарий демо" size="s" value={demo.id} options={Object.values(demoConfigs).map(item => ({value: item.id, label: item.name}))} onValueChange={id => { if (id !== demo.id) location.assign(demoHref(id, location.href)); }}/></div><div className="breadcrumbs"><ChevronRight size={13}/><strong>{labels.page[page]}</strong></div></div><div className="topbar-actions"><IconButton className="theme-toggle" variant="ghost" aria-label={themeAction} tooltip={themeAction} icon={theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>} onClick={toggleTheme}/></div></header>
      <main className="main-content" tabIndex={-1}>{storageError && <Notice tone="warning">Изменения доступны в текущей вкладке. Браузер не разрешил локальное сохранение.</Notice>}{page === 'meetings' ? MeetingsPage() : page === 'decisions' ? DecisionsPage() : page === 'review' ? ReviewPage() : page === 'analytics' ? AnalyticsPage() : IntegrationsPage()}</main>
    </div>
    {drawer && <div className="overlay" onMouseDown={e => {if(e.target === e.currentTarget) closeDrawer();}}>
      <FocusPanel className="drawer" label={currentMeeting?.title || currentDecision?.title || drawer.id} onClose={closeDrawer} active={!modal} restoreOnExit={false}>
        {previousDrawer && <div className="drawer-navigation"><button className="text-button" onClick={backDrawer}><ChevronLeft size={16}/>{backLabel}</button><span>{previousTitle}</span></div>}
        {currentMeeting ? <MeetingDrawer key={currentMeeting.id} m={currentMeeting} ctx={{drawer,setDrawer,data,setModal,renderDecisionCard,setData,setToast,closeDrawer,openComponent}}/> : currentDecision ? DecisionDrawer({d:currentDecision}) : drawer.type === 'component' ? ComponentDrawer({name:drawer.id}) : <Empty title="Запись не найдена" text="Возможно, демоданные были восстановлены."/>}
      </FocusPanel>
    </div>}
    {modal && <div className="modal-overlay" onMouseDown={e => {if(e.target === e.currentTarget) setModal(null);}}><ModalContent key={modal.type + ':' + (modal.id || '')} ctx={{data,modal,setModal,setData,navigate,resetFilters,setToast,openDecision,updateDecision,linkIssue,reopenAction}}/></div>}
    {toast && <div className="toast" role="status" aria-live="polite"><CheckCircle2 className="toast-icon" size={17}/><span>{toast}</span></div>}
  </div>;
}

function MeetingDrawer({ m, ctx }) {
  const { drawer, setDrawer, data, setModal, renderDecisionCard, setData, setToast, closeDrawer, openComponent } = ctx;
  const tab = drawer.tab || "summary";
  const ds = data.decisions.filter((d) => d.source.meetingId === m.id);
  const transcriptQuery = drawer.transcriptQuery || "";
  const setTranscriptQuery = value => setDrawer(current => ({...current, transcriptQuery:value}));
  useEffect(() => {
    if (drawer.segmentId && tab === 'transcript' && drawer.scrollTop === undefined) {
      const frame = requestAnimationFrame(() => document.getElementById('segment-' + drawer.segmentId)?.scrollIntoView({block:'center'}));
      return () => cancelAnimationFrame(frame);
    }
  }, [drawer.segmentId, tab]);
  return <><div className="drawer-header"><div><div className="drawer-eyebrow">Встреча · {m.stageLabel || labels.kind[m.kind]}</div><h2 className="drawer-title">{m.title}</h2></div><IconButton variant="ghost" aria-label="Закрыть встречу" icon={<X size={20} />} onClick={closeDrawer} /></div><div className="drawer-meta"><span><CalendarDays size={15} />{dateLabel(m.date)} {m.date.slice(0, 4)}</span><span><Clock3 size={15} />{m.duration} мин</span><Status tone={m.processing === "review" ? "warning" : "neutral"}>{m.processing === "review" ? "К проверке" : "Обработано"}</Status></div><Tabs label="Содержимое встречи" className="drawer-tabs" panelClassName="drawer-body" value={tab} onChange={(v) => setDrawer((d) => ({ ...d, tab: v, segmentId: null, scrollTop: 0 }))} items={[{ id: "summary", label: "Итоги" }, { id: "decisions", label: "Решения", count: ds.length }, { id: "transcript", label: "Расшифровка" }]}>{tab === "summary" ? <><div className="row-between section-caption"><h3 className="section-title">Краткое содержание</h3><Status tone="ai">Подготовлено AI</Status></div><p className="detail-summary">{m.summary}</p><ul className="highlights">{m.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>{m.participants?.length > 0 && <section className="meeting-participants"><h3 className="section-title">Участники <span className="muted small">{m.participants.length}</span></h3><ul className="participant-list">{m.participants.map((person, index) => <li key={person.name + index}><span className="participant-avatar" aria-hidden="true">{person.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span><div><strong>{person.name}</strong><span>{person.role}</span></div></li>)}</ul></section>}<div className="divider" /><div className="row-between section-caption"><h3 className="section-title">Классификация</h3><Button variant="ghost" size="s" onClick={() => setModal({ type: "tags", id: m.id })}>Изменить</Button></div><div className="definition-list"><div><dt>{copy.plural}</dt><dd><Tags values={m.components} /></dd></div><div><dt>Команды</dt><dd><Tags values={m.teams} /></dd></div><div><dt>Платформы</dt><dd>{m.platforms.join(", ")}</dd></div></div><h3 className="section-title section-caption">Обсуждавшиеся темы</h3>{data.topics.filter((t) => m.topicIds.includes(t.id)).map((t) => <article className="topic-card" key={t.id}><div className="row-between"><Status tone={t.type === "problem" ? "warning" : "neutral"}>{labels.topic[t.type]}</Status><span className="small muted">{t.meetingIds.length} {plural(t.meetingIds.length, ["встреча", "встречи", "встреч"])}</span></div><h4>{t.title}</h4><div className="inline"><Tags values={t.components} /><button className="text-button small" onClick={() => openComponent(t.components[0])}>Вся история <ArrowRight size={14} /></button></div></article>)}</> : tab === "decisions" ? <div className="decision-list">{ds.map((d) => renderDecisionCard({ item: d }))}{!ds.length && <Empty title="Решения ещё не выделены" text="После обработки агентом здесь появятся записи со ссылками на расшифровку." />}</div> : <><TextField label="Поиск в расшифровке" prefix={<Search size={15} />} value={transcriptQuery} onChange={(e) => setTranscriptQuery(e.target.value)} placeholder="Слово или фраза" /><div className="transcript-list">{m.transcript.filter((t) => matchText(transcriptQuery, t.text, t.speaker)).map((t) => <div id={"segment-" + t.id} key={t.id} className={"transcript-entry " + (drawer.segmentId === t.id ? "highlight" : "")}><span className="transcript-time mono">{t.time}</span><div><span className="transcript-speaker">{t.speaker}</span><p className="transcript-text">{t.text}</p></div></div>)}</div>{!m.transcript.some((t) => matchText(transcriptQuery, t.text, t.speaker)) && <Empty text="В этой расшифровке нет совпадений." />}<p className="small muted">Фрагменты синтетической расшифровки для проверки сценария.</p></>}</Tabs><div className="drawer-footer"><span className="small muted">{ds.filter((d) => d.verification === 'pending').length} {plural(ds.filter((d) => d.verification === 'pending').length,['запись ждёт','записи ждут','записей ждут'])} проверки</span><div className="inline">{m.processing === "review" && <Button variant="primary" disabled={ds.some((d) => d.verification === "pending")} onClick={() => {
    setData((state) => ({ ...state, meetings: state.meetings.map((x) => x.id === m.id ? { ...x, processing: "ready" } : x) }));
    setToast("Разбор встречи завершён");
  }}>Завершить разбор</Button>}<Button variant="secondary" onClick={closeDrawer}>Закрыть</Button></div></div></>;
}
function ModalContent({ ctx }) {
  const { data, modal, setModal, setData, navigate, resetFilters, setToast, openDecision, updateDecision, linkIssue, reopenAction } = ctx;
  const a = data.actions.find((x) => x.id === modal.id), d = data.decisions.find((x) => x.id === modal.id), m = data.meetings.find((x) => x.id === modal.id);
  const [title, setTitle] = useState(a?.title || d?.title || "");
  const [description, setDescription] = useState(a?.description || d?.text || "");
  const [reason, setReason] = useState(d?.reason || "");
  const [assignee, setAssignee] = useState("Не назначен");
  const [selectedComponents, setSelectedComponents] = useState(m?.components || []);
  const [selectedTeams, setSelectedTeams] = useState(m?.teams || []);
  const [error, setError] = useState("");
  const [json, setJson] = useState("");
  const names = { "how": "От встречи до действия", "import": "Импорт встречи", "tags": "Классификация встречи", "edit-decision": "Редактировать запись", "candidates": "Похожие задачи Jira", "task": "Подготовить задачу", "no-task": "Задача не требуется", "attention": "Отметить тему для внимания" };
  const close = () => setModal(null);
  const currentDecision = a && data.decisions.find((x) => x.id === a.decisionId);
  const jiraContext = jiraCheckContext(a);
  const example = () => {
    const id = demo.id + "-demo-import-01";
    const existing = seed.meetings[0];
    return JSON.stringify({ schemaVersion: 1, meeting: { ...existing, id, title: copy.importTitle, components: [copy.importComponent], teams: [copy.importTeam], platforms: [copy.importPlatform], participants: [], stageLabel: undefined, kind: "review", summary: "Обезличенный пример входящего результата агента. Решения появятся после подключения структурированного извлечения.", highlights: ["Проверить формат и таймкоды результата агента."], processing: "review", topicIds: [], transcript: [{ id: id + "-s1", time: "00:12", speaker: "Участник встречи", text: "Обсудили пример для проверки импорта. Итоговое решение пока не принято." }] } }, null, 2);
  };
  function doImport() {
    try {
      if (json.length > 25e4) throw Error("Пример слишком большой. Лимит прототипа — 250 КБ.");
      const p = JSON.parse(json);
      const x = p.meeting;
      if (p.schemaVersion !== 1 || !x || typeof x.id !== "string" || !x.id.trim() || typeof x.title !== "string" || !x.title.trim() || !isValidCalendarDate(x.date)) throw Error("Нужны schemaVersion: 1 и meeting с id, title и существующей датой YYYY-MM-DD.");
      if (data.meetings.some((y) => y.id === x.id)) throw Error("Встреча с этим ID уже импортирована. Повторный импорт не создаёт дубль.");
      if (!Array.isArray(x.transcript) || !x.transcript.every((t) => typeof t.id === "string" && typeof t.time === "string" && typeof t.speaker === "string" && typeof t.text === "string")) throw Error("Расшифровка должна содержать id, time, speaker и text для каждого фрагмента.");
      if (x.participants !== undefined && (!Array.isArray(x.participants) || !x.participants.every(person => person && typeof person.name === "string" && typeof person.role === "string"))) throw Error("У каждого участника должны быть строковые name и role.");
      if (x.stageLabel !== undefined && typeof x.stageLabel !== "string") throw Error("stageLabel должен быть строкой.");
      if (new Set(x.transcript.map((t) => t.id)).size !== x.transcript.length) throw Error("ID фрагментов должны быть уникальными.");
      if (typeof x.summary !== "string" || !Array.isArray(x.highlights) || !x.highlights.every((v) => typeof v === "string")) throw Error("Нужны summary и массив строк highlights.");
      for (const [field, list] of [["components", components], ["teams", teams], ["platforms", platforms]]) if (!Array.isArray(x[field]) || !x[field].every((v) => list.includes(v))) throw Error("Неизвестные значения в " + field + ". Используйте справочник прототипа.");
      if (p.decisions?.length || p.topics?.length || p.actions?.length) throw Error("В этом прототипе импортируется встреча. Структурированные решения подключаются отдельным адаптером.");
      const imported = { ...x, duration: Number.isFinite(x.duration) && x.duration >= 0 ? x.duration : 0, kind: ["review", "development", "consultation"].includes(x.kind) ? x.kind : "review", processing: "review", topicIds: [] };
      setData((v) => ({ ...v, meetings: [imported, ...v.meetings] }));
      close();
      navigate("meetings");
      resetFilters();
      setToast("Встреча импортирована. Повторный ID защищён от дублирования.");
    } catch (e) {
      setError(e instanceof SyntaxError ? "JSON содержит ошибку. Проверьте запятые и кавычки." : e.message);
    }
  }
  function createTask() {
    if (!title.trim() || !description.trim()) {
      setError("Заполните заголовок и описание.");
      return;
    }
    if (currentDecision?.verification === "pending") {
      setError("Сначала проверьте точность связанного решения.");
      return;
    }
    setData((state) => {
      const source = state.actions.find((x) => x.id === a.id);
      if (!source || source.jiraState === "linked") return state;
      const ids = state.jiraIssues.map((i) => Number(i.key.split("-").at(-1))).filter(Number.isFinite);
      const key = "DEMO-" + (Math.max(100, ...ids) + 1);
      return { ...state, jiraIssues: [...state.jiraIssues, { key, title: title.trim(), status: "К выполнению", assignee, component: a.components[0], description: description.trim(), acceptance: a.acceptance, decisionId: a.decisionId, source: a.source }], actions: state.actions.map((x) => x.id === a.id ? { ...x, jiraState: "linked", issueKey: key, lastChecked: (/* @__PURE__ */ new Date()).toISOString() } : x) };
    });
    close();
    setToast("Демозадача создана и связана. В реальную Jira ничего не отправлено.");
  }
  return <FocusPanel className="modal" label={names[modal.type]} onClose={close}><div className="modal-header"><h2 className="modal-title">{names[modal.type]}</h2><IconButton variant="ghost" aria-label="Закрыть диалог" icon={<X size={19} />} onClick={close} /></div><div className="modal-body">{modal.type === "how" && <><p className="muted">Один короткий цикл — от записи разговора до понятного следующего действия.</p><div className="how-list">{[["Встреча попадает в журнал", copy.howFirst], ["AI выделяет записи", "Решение, предложение и открытый вопрос сохраняют разный смысл. У решения есть источник."], ["Команда проверяет точность", "Формулировку можно исправить, а изменение решения — связать с предыдущим."], ["Действие связывается с Jira", "Проверяем похожие задачи; новую создаём после явного подтверждения."]].map(([t, p], i) => <div className="how-step" key={t}><span className="step-number">{i + 1}</span><div><h3>{t}</h3><p>{p}</p></div></div>)}</div><Notice>Начните со встречи, откройте решение и перейдите к его источнику. Затем загляните в «К разбору → Действия и Jira».</Notice>{demo.story && <div className="how-story"><h3 className="section-title">Попробуйте на банковском сценарии</h3><p className="small muted">{demo.story.description}</p><Button variant="secondary" iconRight={<ArrowRight size={15}/>} onClick={() => { close(); openDecision(demo.story.decisionId); }}>Открыть историю перевода</Button></div>}</>}{modal.type === "import" && <><Notice>Для проверки используйте обезличенный JSON. В прототипе данные хранятся в этом браузере; подключение агента будет следующим этапом.</Notice><div className="row-between section-caption"><span className="small muted">Формат: schemaVersion + meeting</span><Button variant="secondary" size="s" onClick={() => {
    setJson(example());
    setError("");
  }}>Вставить пример</Button></div><label className="form-field">Результат агента<textarea className="app-textarea code-area" value={json} onChange={(e) => setJson(e.target.value)} placeholder={'{ "schemaVersion": 1, "meeting": { … } }'} rows={12} /></label></>}{modal.type === "tags" && <><p className="muted">Метки встречи помогают поиску. Область конкретного решения и затронутые проблемой команды задаются отдельно.</p><h3 className="section-title">{copy.plural}</h3><div className="checkbox-grid">{components.map((c) => <Checkbox key={c} label={c} checked={selectedComponents.includes(c)} onCheckedChange={(checked) => setSelectedComponents((v) => checked ? [...v, c] : v.filter((x) => x !== c))} />)}</div><h3 className="section-title section-caption">Команды</h3><div className="checkbox-grid">{teams.map((t) => <Checkbox key={t} label={t} checked={selectedTeams.includes(t)} onCheckedChange={(checked) => setSelectedTeams((v) => checked ? [...v, t] : v.filter((x) => x !== t))} />)}</div></>}{modal.type === "edit-decision" && <><TextField label="Название" value={title} onChange={(e) => setTitle(e.target.value)} /><label className="form-field">Формулировка<textarea className="app-textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></label><label className="form-field">Причина<textarea className="app-textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Если причина не прозвучала, оставьте пустым" /></label><Notice>Здесь исправляется точность записи. Новая договорённость должна стать отдельным решением со связью «Заменяет».</Notice></>}{modal.type === 'candidates' && <>
      <div className="candidate-context"><span className="mono small muted">Действие {a.id}</span><h3 className="section-title">{a.title}</h3><p>{a.description}</p><ul className="candidate-acceptance">{a.acceptance.map((text,i) => <li key={i}>{text}</li>)}</ul></div>
      <p className="muted">Сопоставьте описание и критерии задачи с действием. Похожее название само по себе не подтверждает связь.</p>
      {data.jiraIssues.filter(issue => issue.key === a.issueKey || a.candidateKeys?.includes(issue.key) || a.components.includes(issue.component)).map(issue => <article className={'candidate-card ' + (issue.key === a.issueKey && a.jiraState === 'linked' ? 'candidate-current' : '')} key={issue.key}>
        <div><span className="mono small">{issue.key}</span><h3 className="candidate-title">{issue.title}</h3><p className="small muted">{issue.status} · {issue.assignee}</p><p className="candidate-description">{issue.description || 'Описание этой демозадачи не сохранено. Данных для проверки связи недостаточно.'}</p>{issue.acceptance?.length > 0 && <ul className="candidate-acceptance">{issue.acceptance.map((text,i) => <li key={i}>{text}</li>)}</ul>}</div>
        <Button variant={issue.key === a.issueKey && a.jiraState === 'linked' ? 'ghost' : 'secondary'} aria-label={issue.key === a.issueKey && a.jiraState === 'linked' ? 'Текущая связь ' + issue.key : 'Связать ' + issue.key} disabled={issue.key === a.issueKey && a.jiraState === 'linked' || currentDecision?.verification === 'pending' || !issue.description} onClick={() => linkIssue(a.id,issue.key)}>{issue.key === a.issueKey && a.jiraState === 'linked' ? 'Связано' : 'Связать'}</Button>
      </article>)}
      {currentDecision?.verification === 'pending' && <Notice tone="warning">Точность {currentDecision.id} ещё не проверена. <button className="text-button" onClick={() => {close();openDecision(currentDecision.id);}}>Проверить запись</button></Notice>}
      <Notice>Кандидаты из демонстрационного набора. Связь можно изменить или убрать после проверки.</Notice>
    </>}{modal.type === "task" && <><Notice>Демонстрация создания. Действие останется в прототипе и получит ключ DEMO.</Notice>{jiraContext && <Notice tone="warning">{jiraContext}</Notice>}<TextField label="Заголовок задачи" value={title} onChange={(e) => setTitle(e.target.value)} required /><label className="form-field">Описание<textarea className="app-textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></label><div className="form-grid"><Select label="Проект" options={[{ value: demo.project, label: demo.project + " · демонстрационный" }]} value={demo.project} /><Select label="Исполнитель" options={demo.assignees.map((x) => ({ value: x, label: x }))} value={assignee} onValueChange={setAssignee} /></div><div className="reason-box"><h3 className="section-title">Критерий результата</h3><ul>{a.acceptance.map((x, i) => <li key={i}>{x}</li>)}</ul><span className="small muted">Основание: {a.decisionId}. Ссылка на исходную встречу будет приложена.</span></div>{currentDecision?.verification === "pending" && <Notice tone="warning">Точность {currentDecision.id} ещё не проверена. <button className="text-button" onClick={() => {
    close();
    openDecision(currentDecision.id);
  }}>Проверить запись</button></Notice>}</>}{["no-task", "attention"].includes(modal.type) && <><p className="muted">{modal.type === "no-task" ? "Укажите, почему это действие не требует отдельной задачи." : copy.attentionReason}</p><label className="form-field">Причина<textarea className="app-textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Коротко и конкретно" /></label></>}{error && <p className="form-error" role="alert">{error}</p>}</div><div className="modal-footer"><Button variant="secondary" onClick={close}>{modal.type === "how" ? "Понятно" : "Отмена"}</Button>{modal.type === "import" && <Button variant="primary" iconLeft={<Upload size={15} />} onClick={doImport} disabled={!json.trim()}>Импортировать</Button>}{modal.type === "tags" && <Button variant="primary" onClick={() => {
    setData((v) => ({ ...v, meetings: v.meetings.map((x) => x.id === m.id ? { ...x, components: selectedComponents, teams: selectedTeams } : x) }));
    close();
    setToast("Метки встречи обновлены");
  }}>Сохранить</Button>}{modal.type === "edit-decision" && <Button variant="primary" onClick={() => {
    if (!title.trim() || !description.trim()) {
      setError("Название и формулировка обязательны.");
      return;
    }
    updateDecision(d.id, { title: title.trim(), text: description.trim(), reason: reason.trim() || null, previousText: d.previousText || d.text, verification: "pending" });
    close();
    setToast("Запись исправлена. Проверьте точность новой формулировки.");
  }}>Сохранить запись</Button>}{modal.type === 'candidates' && (a.jiraState === 'linked' ? <Button variant="secondary" onClick={() => reopenAction(a.id)}>Убрать связь и вернуть к разбору</Button> : <Button variant="ghost" onClick={() => setModal({type:'task',id:a.id})}>Ни одна не подходит</Button>)}{modal.type === "task" && <Button variant="primary" disabled={currentDecision?.verification === "pending" || a.jiraState === "linked"} onClick={createTask}>Создать демозадачу</Button>}{modal.type === "no-task" && <Button variant="primary" onClick={() => {
    if (!reason.trim()) {
      setError("Укажите причину.");
      return;
    }
    setData((v) => ({ ...v, actions: v.actions.map((x) => x.id === a.id ? { ...x, jiraState: "not_required", reason: reason.trim() } : x) }));
    close();
    setToast("Действие разобрано: задача не требуется");
  }}>Сохранить</Button>}{modal.type === "attention" && <Button variant="primary" onClick={() => {
    if (!reason.trim()) {
      setError("Укажите причину отметки.");
      return;
    }
    setData((v) => ({ ...v, topics: v.topics.map((x) => x.id === modal.id ? { ...x, attention: true, attentionReason: reason.trim() } : x) }));
    close();
    setToast("Тема отмечена для внимания");
  }}>Отметить</Button>}</div></FocusPanel>;
}
createRoot(document.getElementById("root")).render(<App />);
