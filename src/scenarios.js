import { seed as designSeed, components, teams, platforms } from './domain.js';
import { bankCatalog, bankSeed } from './bank-demo.js';

const designCatalog = { components, teams, platforms };

export const demoConfigs = {
  ds: {
    id: 'ds', name: 'Дизайн-система', teamName: 'Команда ДС',
    storageKey: 'decision-journal-demo-v1',
    seed: { ...designSeed, catalog: designCatalog }, catalog: designCatalog,
    project: 'DS', assignees: ['Не назначен', 'Дизайнер ДС', 'Разработчик Web', 'Разработчик Android'],
    kind: { review: 'Рабочее обсуждение', development: 'Внутреннее развитие', consultation: 'Консультация' },
    topic: { problem: 'Проблема', change: 'Запрос изменения', development: 'Внутреннее развитие', consultation: 'Консультация', hypothesis: 'Гипотеза' },
    copy: {
      pageDescription: 'Обсуждения, решения и контекст — в одном месте.',
      meetingNote: 'Рабочие обсуждения и развитие ДС',
      singular: 'Компонент', plural: 'Компоненты', all: 'Все компоненты',
      searchAnalytics: 'Найти компонент…', searchDecisions: 'Найти решение, причину, компонент…',
      contextTopic: 'Период — по дате обсуждения темы. Команды и платформы относятся к теме компонента; ранее принятые действия тоже учитываются.',
      contextMeetings: 'Фильтры по меткам всей встречи. Компоненты и платформы могли обсуждаться в разных темах.',
      attentionForms: ['компонент требует', 'компонента требуют', 'компонентов требуют'],
      problemsBy: 'по компонентам', sumBy: 'Сумма по выбранным компонентам',
      discussionTitle: 'Обсуждения компонентов', historyTitle: 'История компонента',
      closeDetail: 'Закрыть компонент', backDetail: 'Назад к компоненту',
      attentionHelp: 'Повторная открытая проблема у нескольких команд, действие без подтверждённой связи с Jira или ручная отметка. Основания видны в карточке компонента.',
      countingNote: 'Одна проблема на трёх встречах считается одной проблемой. Консультации и внутреннее развитие не увеличивают число проблем.',
      attentionReason: 'Краткое основание будет видно в аналитике компонента.',
      howFirst: 'Ваш агент передаёт расшифровку, итоги, компоненты и команды.',
      importTitle: 'Пример импорта: обсуждение TextField',
      importComponent: 'TextField', importTeam: 'Команда ДС', importPlatform: 'Web',
    },
  },
  bank: {
    id: 'bank', name: 'Банковское приложение', teamName: 'Продуктовая команда',
    storageKey: 'decision-journal-bank-demo-v1', seed: bankSeed, catalog: bankCatalog,
    project: 'BANK', assignees: ['Не назначен', 'Продуктовый аналитик', 'Продуктовый дизайнер', 'Мобильный разработчик', 'Backend-разработчик', 'QA-инженер', 'UX-исследователь'],
    kind: { review: 'Продуктовый разбор', development: 'Развитие продукта', consultation: 'Рабочая консультация' },
    topic: { problem: 'Проблема', change: 'Запрос изменения', development: 'Развитие продукта', consultation: 'Консультация', hypothesis: 'Гипотеза' },
    copy: {
      pageDescription: 'Банковское приложение. Исследования, требования, дизайн, разработка и QA — с общим контекстом.',
      meetingNote: 'От исследования до проверки релиза',
      singular: 'Направление', plural: 'Направления', all: 'Все направления',
      searchAnalytics: 'Найти направление…', searchDecisions: 'Найти решение, причину, направление…',
      contextTopic: 'Период — по дате обсуждения темы. Команды и платформы относятся к конкретной теме; ранее принятые действия тоже учитываются.',
      contextMeetings: 'Фильтры по меткам всей встречи. Направления и платформы могли обсуждаться в разных темах.',
      attentionForms: ['направление требует', 'направления требуют', 'направлений требуют'],
      problemsBy: 'по направлениям', sumBy: 'Сумма по выбранным направлениям',
      discussionTitle: 'Обсуждения направлений', historyTitle: 'История направления',
      closeDetail: 'Закрыть направление', backDetail: 'Назад к направлению',
      attentionHelp: 'Открытая проблема у нескольких команд, действие без подтверждённой связи с Jira или ручная отметка. Основания видны в карточке направления.',
      countingNote: 'Одна проблема на трёх встречах считается одной проблемой. Исследовательская гипотеза и частота обсуждений сами по себе не означают проблему.',
      attentionReason: 'Краткое основание будет видно в аналитике направления.',
      howFirst: 'Ваш агент передаёт расшифровку, итоги, участников, продуктовые направления и команды.',
      importTitle: 'Пример импорта: статус банковского перевода',
      importComponent: 'Переводы', importTeam: 'Мобильный банк', importPlatform: 'iOS',
    },
  },
};

export function selectDemo(search = '') {
  return new URLSearchParams(search).get('demo') === 'bank' ? demoConfigs.bank : demoConfigs.ds;
}

export function demoHref(id, currentUrl) {
  const url = new URL(currentUrl);
  if (id === 'bank') url.searchParams.set('demo', 'bank');
  else url.searchParams.delete('demo');
  url.hash = '/meetings';
  return url.href;
}
