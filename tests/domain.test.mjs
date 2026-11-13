import test from 'node:test';
import assert from 'node:assert/strict';
import { cloneSeed, baseSeed, getContextActions, getStats, enrichDemoIssueDetails, isValidCalendarDate } from '../src/domain.js';

const onlyStat = (data, filters) => getStats(data, filters)[0];
const actionIds = (data, filters) => getContextActions(data, filters).map((action) => action.id);

test('Select discussion in the last 7 days retains the older action in both analytics and queue', () => {
  const data = cloneSeed(baseSeed);
  const filters = { component: 'Select', period: '7d' };
  assert.deepEqual(actionIds(data, filters), ['ACT-002']);
  const stat = onlyStat(data, filters);
  assert.equal(stat.meetingCount, 1);
  assert.equal(stat.problemCount, 1);
  assert.equal(stat.unlinkedActions, 1);
  assert.equal(data.decisions.find((decision) => decision.id === 'DEC-002').createdAt, '2026-10-29');
});

test('mixed meeting tags do not leak another topic’s platform or team into actions or analytics', () => {
  const data = cloneSeed(baseSeed);
  for (const filters of [
    { component: 'TextField', platform: 'Android' },
    { component: 'TextField', team: 'Каталог' },
    { component: 'Tooltip', team: 'Платежи' },
  ]) {
    assert.deepEqual(actionIds(data, filters), [], JSON.stringify(filters));
    const stat = onlyStat(data, filters);
    assert.equal(stat.meetingCount, 0, JSON.stringify(filters));
    assert.equal(stat.openActions, 0, JSON.stringify(filters));
    assert.equal(stat.problemCount, 0, JSON.stringify(filters));
  }
  assert.deepEqual(actionIds(data, { component: 'Button', platform: 'Android', period: '7d' }), ['ACT-003']);
});

test('repeat discussions count once as a problem and development is not a consumer defect', () => {
  const data = cloneSeed(baseSeed);
  const textField = onlyStat(data, { component: 'TextField' });
  assert.deepEqual([textField.meetingCount, textField.problemCount, textField.affectedTeams], [3, 1, 2]);
  const button = onlyStat(data, { component: 'Button' });
  assert.deepEqual([button.meetingCount, button.problemCount, button.changeRequestCount], [2, 0, 1]);
});

test('period includes the seventh day and uses the latest meeting as its reference', () => {
  const data = cloneSeed(baseSeed);
  assert.deepEqual(actionIds(data, { component: 'Table', period: '7d' }), ['ACT-004']); // Nov 6–12.
  assert.equal(onlyStat(data, { component: 'TextField', period: '7d' }).meetingCount, 1); // Nov 5 excluded.
  data.meetings.push({ id: 'new-snapshot', date: '2026-12-01', components: [], teams: [], platforms: [] });
  assert.deepEqual(actionIds(data, { component: 'Table', period: '7d' }), []);
});

test('linking and reopening an action update analytics without losing it from the shared context', () => {
  const data = cloneSeed(baseSeed);
  const filters = { component: 'Select', period: '7d' };
  const action = data.actions.find((item) => item.id === 'ACT-002');
  action.jiraState = 'linked';
  action.issueKey = 'DEMO-102';
  assert.deepEqual(actionIds(data, filters), ['ACT-002']);
  assert.equal(onlyStat(data, filters).unlinkedActions, 0);
  assert.equal(onlyStat(data, filters).openActions, 1);
  data.jiraIssues.find((issue) => issue.key === 'DEMO-102').status = 'Готово';
  assert.equal(onlyStat(data, filters).openActions, 0);
  action.jiraState = 'candidates';
  action.issueKey = null;
  assert.equal(onlyStat(data, filters).unlinkedActions, 1);
});

test('resolved actions remain available for the review queue’s show-resolved option', () => {
  const data = cloneSeed(baseSeed);
  assert.deepEqual(actionIds(data, { component: 'Tooltip', team: 'Поддержка', period: '7d' }), ['ACT-006']);
  assert.equal(onlyStat(data, { component: 'Tooltip' }).openActions, 0);
  assert.equal(getContextActions(data).length, 6);
});

test('old saved demo issues receive descriptions without changing existing edits or linked actions', () => {
  const data = cloneSeed(baseSeed);
  delete data.jiraIssues[0].description;
  delete data.jiraIssues[0].acceptance;
  data.jiraIssues[1].description = 'Пользовательское уточнение';
  data.jiraIssues[1].acceptance = ['Собственный критерий'];
  data.jiraIssues[1].status = 'Готово';
  data.jiraIssues.push({ key: 'DEMO-200', title: 'Созданная в браузере задача', description: 'Сохранить это описание' });
  const before = structuredClone(data);
  const enriched = enrichDemoIssueDetails(data, baseSeed);
  assert.ok(enriched.jiraIssues[0].description.length > 50);
  assert.equal(enriched.jiraIssues[0].acceptance.length, 3);
  assert.equal(enriched.jiraIssues[1].description, 'Пользовательское уточнение');
  assert.deepEqual(enriched.jiraIssues[1].acceptance, ['Собственный критерий']);
  assert.equal(enriched.jiraIssues[1].status, 'Готово');
  assert.deepEqual(enriched.jiraIssues.at(-1), before.jiraIssues.at(-1));
  assert.deepEqual(enriched.actions, before.actions);
  assert.deepEqual(data, before, 'Migration must not mutate its input');
});

test('calendar validation rejects normalized invalid dates while accepting leap days', () => {
  for (const date of ['2026-02-31', '2026-02-29', '2026-04-31', '2026-13-01', '2026-00-01', '2026-1-01', '2026-01-01T00:00:00Z', null]) {
    assert.equal(isValidCalendarDate(date), false, String(date));
  }
  for (const date of ['2028-02-29', '2026-11-12', '2026-12-31']) assert.equal(isValidCalendarDate(date), true, date);
});

test('empty datasets return a stable empty context', () => {
  assert.deepEqual(getContextActions({}), []);
  assert.ok(getStats({}).every((stat) => stat.meetingCount === 0 && stat.openActions === 0 && !stat.attention));
});

test('scenario catalogs isolate analytics and action context from the original demo', () => {
  const data = {
    catalog: { components: ['Переводы', 'История операций'] },
    meetings: [{ id: 'bank-meeting', date: '2026-11-12', components: ['Переводы'], teams: ['Мобильный банк'], platforms: ['iOS'] }],
    topics: [{ id: 'bank-topic', components: ['Переводы'], teams: ['Мобильный банк'], platforms: ['iOS'], meetingIds: ['bank-meeting'], type: 'problem', confirmed: true, status: 'open' }],
    decisions: [],
    actions: [{ id: 'bank-action', topicId: 'bank-topic', components: ['Переводы'], teams: ['Мобильный банк'], platforms: ['iOS'], jiraState: 'not_checked' }],
    jiraIssues: [],
  };
  assert.deepEqual(getStats(data).map((stat) => stat.component), ['Переводы', 'История операций']);
  assert.equal(onlyStat(data, { component: 'Переводы' }).problemCount, 1);
  assert.deepEqual(actionIds(data, { component: 'Переводы' }), ['bank-action']);
  assert.deepEqual(getStats(data, { component: 'TextField' }), []);
  assert.deepEqual(actionIds(data, { component: 'TextField' }), []);
  assert.deepEqual(getStats({ ...data, catalog: { components: [] } }), []);
  const cloned = cloneSeed(data);
  cloned.catalog.components.push('Новый раздел');
  cloned.meetings[0].title = 'Локальная правка';
  assert.equal(data.catalog.components.length, 2);
  assert.equal(data.meetings[0].title, undefined);
});

test('issue enrichment uses only the selected scenario even when demo issue keys overlap', () => {
  const basis = { jiraIssues: [{ key: 'DEMO-101', description: 'Описание банковского сценария', acceptance: ['Банковский критерий'] }] };
  const saved = { jiraIssues: [{ key: 'DEMO-101' }, { key: 'DEMO-102' }] };
  const enriched = enrichDemoIssueDetails(saved, basis);
  assert.equal(enriched.jiraIssues[0].description, 'Описание банковского сценария');
  assert.deepEqual(enriched.jiraIssues[0].acceptance, ['Банковский критерий']);
  assert.deepEqual(enriched.jiraIssues[1], { key: 'DEMO-102' });
  enriched.jiraIssues[0].acceptance.push('Локальная правка');
  assert.deepEqual(basis.jiraIssues[0].acceptance, ['Банковский критерий']);
  assert.deepEqual(saved.jiraIssues[0], { key: 'DEMO-101' });
});
