import test from 'node:test';
import assert from 'node:assert/strict';
import { bankCatalog, bankSeed } from '../src/bank-demo.js';
import { cloneSeed, getContextActions, getStats, isValidCalendarDate } from '../src/domain.js';
import { demoConfigs, demoHref, selectDemo } from '../src/scenarios.js';

test('bank demo records keep their source, topic, action and Jira links intact', () => {
  const data = cloneSeed(bankSeed);
  const meetings = new Map(data.meetings.map((item) => [item.id, item]));
  const topics = new Map(data.topics.map((item) => [item.id, item]));
  const decisions = new Map(data.decisions.map((item) => [item.id, item]));
  const actions = new Map(data.actions.map((item) => [item.id, item]));
  const issues = new Map(data.jiraIssues.map((item) => [item.key, item]));
  for (const [key, map] of [['meetings', meetings], ['topics', topics], ['decisions', decisions], ['actions', actions], ['jiraIssues', issues]]) {
    assert.equal(map.size, data[key].length, `Unique identifiers in ${key}`);
  }
  const assertSource = (item) => {
    const meeting = meetings.get(item.source?.meetingId);
    assert.ok(meeting, `${item.id}: source meeting exists`);
    assert.ok(meeting.transcript.some((segment) => segment.id === item.source.segmentId), `${item.id}: source timecode exists`);
    assert.ok(topics.get(item.topicId)?.meetingIds.includes(meeting.id), `${item.id}: source belongs to the same topic`);
  };
  for (const meeting of data.meetings) {
    assert.ok(isValidCalendarDate(meeting.date), meeting.id);
    assert.equal(new Set(meeting.transcript.map((segment) => segment.id)).size, meeting.transcript.length);
    for (const id of meeting.topicIds) assert.ok(topics.get(id)?.meetingIds.includes(meeting.id), `${meeting.id}: reciprocal topic link ${id}`);
  }
  for (const topic of data.topics) {
    for (const id of topic.meetingIds) assert.ok(meetings.get(id)?.topicIds.includes(topic.id), `${topic.id}: reciprocal meeting link ${id}`);
  }
  for (const decision of data.decisions) {
    assertSource(decision);
    for (const id of decision.actionIds) assert.equal(actions.get(id)?.decisionId, decision.id, `Decision ${decision.id} links back from ${id}`);
    if (decision.supersedes) assert.equal(decisions.get(decision.supersedes)?.lifecycle, 'superseded');
  }
  for (const action of data.actions) {
    assertSource(action);
    assert.equal(decisions.get(action.decisionId)?.topicId, action.topicId);
    assert.ok(decisions.get(action.decisionId)?.actionIds.includes(action.id));
    if (action.jiraState === 'linked') assert.ok(issues.has(action.issueKey), action.id);
    for (const key of action.candidateKeys) assert.ok(issues.has(key), `${action.id}: ${key}`);
  }
  for (const item of [...data.meetings, ...data.topics, ...data.decisions, ...data.actions]) {
    for (const field of ['components', 'teams', 'platforms']) {
      for (const value of item[field]) assert.ok(bankCatalog[field].includes(value), `${item.id}: ${field} ${value}`);
    }
  }
});

test('the bank story exposes an old decision, its replacement and work following the current decision', () => {
  const data = cloneSeed(bankSeed);
  const current = data.decisions.find((item) => item.supersedes && item.lifecycle === 'active' && item.verification === 'verified');
  assert.ok(current, 'A checked current decision replaces an older agreement');
  const old = data.decisions.find((item) => item.id === current.supersedes);
  assert.equal(old.lifecycle, 'superseded');
  assert.equal(old.topicId, current.topicId);
  assert.ok(old.createdAt < current.createdAt);
  assert.notEqual(old.source.meetingId, current.source.meetingId);
  assert.ok(current.reason.trim(), 'The change has an explanation');
  assert.ok(data.actions.some((item) => item.decisionId === current.id && item.jiraState === 'linked'), 'Current agreement connects to a demo Jira task');
  assert.ok(data.decisions.some((item) => item.verification === 'pending'), 'The example also preserves an unchecked AI extraction');
  const roles = data.meetings.flatMap((meeting) => (meeting.participants || []).map((participant) => participant.role)).join(' ').toLocaleLowerCase('ru');
  for (const role of [/аналитик/, /дизайнер/, /исследовател/, /backend|бэкенд|бэкэнд/, /qa|тестировщик/, /ios|android|мобильн|frontend|фронтенд/]) {
    assert.match(roles, role, 'Cross-functional participants are present');
  }
});

test('bank analytics use the bank catalog and keep unresolved Jira states distinct', () => {
  const data = cloneSeed(bankSeed);
  assert.deepEqual(getStats(data).map((stat) => stat.component), bankCatalog.components);
  assert.deepEqual(getStats(data, { component: 'TextField' }), []);
  const states = new Set(data.actions.map((action) => action.jiraState));
  for (const state of ['linked', 'candidates', 'not_found', 'not_checked', 'unavailable', 'not_required']) assert.ok(states.has(state), state);
  assert.equal(getContextActions(data).length, data.actions.length, 'Every action is reachable from its discussion context');
  const uncertain = data.actions.filter((action) => ['not_checked', 'unavailable'].includes(action.jiraState));
  assert.ok(uncertain.every((action) => !action.issueKey && action.reason), 'Unknown Jira state has a reason and is not represented as a confirmed link');
  assert.ok(data.actions.filter((action) => action.jiraState === 'not_required').every((action) => action.reason.trim()), 'No-task decisions explain their outcome');
});

test('repeat transfer discussions count as one problem and completed research is not open work', () => {
  const data = cloneSeed(bankSeed);
  const transfers = getStats(data, { component: 'Переводы' })[0];
  assert.deepEqual([transfers.meetingCount, transfers.problemCount, transfers.affectedTeams], [3, 1, 3]);
  assert.deepEqual([transfers.openActions, transfers.unlinkedActions], [2, 1]);
  const recent = { component: 'Переводы', period: '7d' };
  assert.equal(getStats(data, recent)[0].meetingCount, 1);
  assert.deepEqual(getContextActions(data, recent).map((action) => action.id), ['ACT-B01', 'ACT-B08', 'ACT-B09'], 'Recent follow-up retains older work and completed research in the same context');
  const hypothesis = getStats(data, { component: 'Планирование расходов' })[0];
  assert.deepEqual([hypothesis.meetingCount, hypothesis.problemCount, hypothesis.changeRequestCount], [1, 0, 0]);
  const consultation = getStats(data, { component: 'Поддержка' })[0];
  assert.deepEqual([consultation.problemCount, consultation.openActions, consultation.attention], [0, 0, false]);
});

test('bank multi-topic meetings do not leak one discussion’s team or platform into another', () => {
  const data = cloneSeed(bankSeed);
  for (const filters of [
    { component: 'Уведомления', team: 'Клиентский опыт' },
    { component: 'Поддержка', platform: 'Android' },
  ]) {
    assert.deepEqual(getContextActions(data, filters), [], JSON.stringify(filters));
    const stat = getStats(data, filters)[0];
    assert.deepEqual([stat.meetingCount, stat.problemCount, stat.openActions, stat.attention], [0, 0, 0, false], JSON.stringify(filters));
  }
  assert.deepEqual(getContextActions(data, { component: 'Поддержка', platform: 'Web' }).map((action) => action.id), ['ACT-B06']);
});

test('demo URLs select an isolated scenario and retain the original saved design-system workspace', () => {
  assert.equal(selectDemo('?demo=bank').id, 'bank');
  for (const query of ['', '?demo=ds', '?demo=unknown', '?demo=constructor', '?demo=__proto__']) assert.equal(selectDemo(query).id, 'ds', query);
  assert.equal(demoConfigs.ds.storageKey, 'decision-journal-demo-v1', 'Existing browser data remain at their original key');
  assert.notEqual(demoConfigs.bank.storageKey, demoConfigs.ds.storageKey);
  const bankUrl = new URL(demoHref('bank', 'https://example.test/?entry=share#/analytics'));
  assert.equal(bankUrl.searchParams.get('demo'), 'bank');
  assert.equal(bankUrl.searchParams.get('entry'), 'share');
  assert.equal(bankUrl.hash, '#/meetings');
  const originalUrl = new URL(demoHref('ds', bankUrl.href));
  assert.equal(originalUrl.searchParams.has('demo'), false);
  assert.equal(originalUrl.hash, '#/meetings');
});
