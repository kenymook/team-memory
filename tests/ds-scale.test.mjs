import test from 'node:test';
import assert from 'node:assert/strict';
import { baseSeed, seed, cloneSeed, enrichDemoData, getStats, getContextActions, isValidCalendarDate, components, teams, platforms } from '../src/domain.js';
import { dsScalePack } from '../src/ds-scale-demo.js';
import { bankSeed } from '../src/bank-demo.js';

const collections = ['meetings', 'topics', 'decisions', 'actions', 'jiraIssues'];
const keyFor = collection => collection === 'jiraIssues' ? 'key' : 'id';
const byId = (items, id) => items.find(item => item.id === id);
const fromPack = (items, originalId) => items.find(item => item.demoPackId === dsScalePack.id && item.demoPackRecordId === originalId);

function assertGraph(data) {
  const maps = Object.fromEntries(collections.map(collection => [collection,
    new Map(data[collection].map(item => [item[keyFor(collection)], item])),
  ]));
  for (const collection of collections) assert.equal(maps[collection].size, data[collection].length, `${collection}: unique IDs`);
  const sourceOf = item => {
    const meeting = maps.meetings.get(item.source?.meetingId);
    assert.ok(meeting, `${item.id}: source meeting`);
    assert.ok(meeting.transcript.some(segment => segment.id === item.source.segmentId), `${item.id}: source segment`);
    assert.ok(maps.topics.get(item.topicId)?.meetingIds.includes(meeting.id), `${item.id}: source belongs to topic`);
    return meeting;
  };
  for (const meeting of data.meetings) {
    assert.ok(isValidCalendarDate(meeting.date), meeting.id);
    assert.ok(meeting.transcript.length >= 3, `${meeting.id}: substantive source`);
    assert.equal(new Set(meeting.transcript.map(segment => segment.id)).size, meeting.transcript.length, meeting.id);
    for (const topicId of meeting.topicIds) assert.ok(maps.topics.get(topicId)?.meetingIds.includes(meeting.id), `${meeting.id}: reciprocal topic`);
    for (const segment of meeting.transcript) {
      assert.match(segment.time, /^\d{2}:\d{2}$/, `${meeting.id}: timecode`);
      const [minutes, seconds] = segment.time.split(':').map(Number);
      assert.ok(seconds < 60 && minutes * 60 + seconds < meeting.duration * 60, `${meeting.id}: timecode inside meeting`);
      assert.ok(meeting.participants.some(person => person.role.startsWith(segment.speaker) || person.name === segment.speaker
        || `${person.name} · ${person.role}` === segment.speaker), `${meeting.id}: speaker has participant`);
    }
    if (meeting.processing === 'ready') assert.ok(!data.decisions.some(decision => decision.source.meetingId === meeting.id && decision.verification === 'pending'), `${meeting.id}: ready means its decisions are checked`);
  }
  for (const topic of data.topics) {
    for (const meetingId of topic.meetingIds) assert.ok(maps.meetings.get(meetingId)?.topicIds.includes(topic.id), `${topic.id}: reciprocal meeting`);
    if (topic.meetingIds.length) assert.equal(topic.firstSeen, topic.meetingIds.map(id => maps.meetings.get(id).date).sort()[0], `${topic.id}: first discussion date`);
  }
  for (const decision of data.decisions) {
    const meeting = sourceOf(decision);
    assert.equal(decision.createdAt, meeting.date, `${decision.id}: date matches source`);
    for (const actionId of decision.actionIds) assert.equal(maps.actions.get(actionId)?.decisionId, decision.id, `${decision.id}: reciprocal action`);
    if (decision.supersedes) {
      const previous = maps.decisions.get(decision.supersedes);
      assert.ok(previous, `${decision.id}: replaced decision exists`);
      assert.equal(previous.lifecycle, 'superseded', `${decision.id}: previous record is historical`);
      assert.equal(previous.topicId, decision.topicId, `${decision.id}: same topic`);
      assert.ok(previous.createdAt < decision.createdAt, `${decision.id}: replacement follows original`);
    }
  }
  for (const action of data.actions) {
    sourceOf(action);
    const decision = maps.decisions.get(action.decisionId);
    assert.equal(decision?.topicId, action.topicId, `${action.id}: decision topic`);
    assert.ok(decision?.actionIds.includes(action.id), `${action.id}: reciprocal decision`);
    if (action.jiraState === 'linked') assert.ok(maps.jiraIssues.has(action.issueKey), `${action.id}: linked issue exists`);
    else assert.equal(action.issueKey, null, `${action.id}: unresolved action does not claim a link`);
    for (const key of action.candidateKeys) assert.ok(maps.jiraIssues.has(key), `${action.id}: candidate exists`);
  }
  const catalog = { components, teams, platforms };
  for (const item of [...data.meetings, ...data.topics, ...data.decisions, ...data.actions]) {
    for (const field of Object.keys(catalog)) for (const value of item[field]) assert.ok(catalog[field].includes(value), `${item.id}: ${field} ${value}`);
  }
}

test('the expanded DS demo adds exactly forty meetings with a complete, varied decision graph', () => {
  assert.equal(baseSeed.meetings.length, 8);
  assert.equal(dsScalePack.meetings.length, 40);
  assert.equal(seed.meetings.length, 48);
  for (const collection of collections) {
    assert.equal(seed[collection].length, baseSeed[collection].length + dsScalePack[collection].length, collection);
    assert.deepEqual(seed[collection].slice(0, baseSeed[collection].length), baseSeed[collection], `${collection}: original records remain unchanged`);
  }
  assertGraph(seed);
  assert.equal(new Set(dsScalePack.meetings.map(meeting => meeting.title)).size, 40, 'Distinct meeting subjects, not repeated filler');
  assert.ok(dsScalePack.topics.some(topic => topic.type === 'problem' && topic.meetingIds.length > 1), 'Recurring problems have follow-up meetings');
  assert.ok(dsScalePack.topics.some(topic => topic.status === 'closed'), 'The archive includes resolved topics');
  assert.ok(dsScalePack.decisions.some(decision => decision.supersedes), 'Changed agreements keep their history');
  assert.ok(dsScalePack.decisions.some(decision => decision.verification === 'pending'), 'There is a bounded review backlog');
  assert.ok(dsScalePack.decisions.filter(decision => decision.verification === 'pending').length < dsScalePack.decisions.length / 3, 'Most historical records are already reviewed');
  assert.deepEqual(new Set(dsScalePack.meetings.flatMap(meeting => meeting.components)), new Set(components));
  assert.equal(getContextActions(seed).length, seed.actions.length, 'Every action is reachable through a discussion');
});

test('repeat discussions in the expanded archive count as one problem, not one per meeting', () => {
  const topic = seed.topics.find(item => item.demoPackId === dsScalePack.id && item.type === 'problem' && item.confirmed === true && item.meetingIds.length > 1);
  const isolated = {
    ...cloneSeed(seed),
    meetings: seed.meetings.filter(meeting => topic.meetingIds.includes(meeting.id)),
    topics: [topic],
    decisions: seed.decisions.filter(decision => decision.topicId === topic.id),
    actions: seed.actions.filter(action => action.topicId === topic.id),
  };
  for (const component of topic.components) {
    const stat = getStats(isolated, { component })[0];
    assert.equal(stat.meetingCount, topic.meetingIds.length);
    assert.equal(stat.problemCount, 1);
  }
});

test('old saved DS data gains the pack once while preserving edits, reviewed decisions and linked tasks', () => {
  const saved = cloneSeed(baseSeed);
  saved.schemaVersion = 1;
  saved.meetings.find(meeting => meeting.id === 'm8').summary = 'Уточнённые пользователем итоги встречи';
  saved.decisions.find(decision => decision.id === 'DEC-009').verification = 'verified';
  saved.decisions.find(decision => decision.id === 'DEC-009').reviewedAt = '2026-11-13T10:00:00Z';
  saved.jiraIssues.push({ key: 'DEMO-199', title: 'Созданная пользователем задача', status: 'Готово', description: 'Сохранить мой текст', acceptance: ['Мой критерий'] });
  Object.assign(saved.actions.find(action => action.id === 'ACT-003'), { jiraState: 'linked', issueKey: 'DEMO-199', reason: 'Проверено пользователем' });
  const imported = { ...cloneSeed(baseSeed.meetings[0]), id: 'imported-m1', title: 'Собственная встреча', topicIds: [], participants: [] };
  saved.meetings.push(imported);
  const before = structuredClone(saved);
  const upgraded = enrichDemoData(saved, { ...seed });
  assert.equal(upgraded.meetings.length, 49, 'Forty demo meetings plus the original eight and one import');
  assert.deepEqual(upgraded.demoDataPacks, [dsScalePack.id]);
  for (const collection of collections) {
    const key = keyFor(collection);
    for (const record of before[collection]) assert.deepEqual(upgraded[collection].find(item => item[key] === record[key]), record, `${collection}: ${record[key]} stays intact`);
  }
  assert.deepEqual(saved, before, 'Migration does not mutate its input');
  assert.deepEqual(enrichDemoData(upgraded, seed), upgraded, 'Repeated loads do not append duplicates');
  upgraded.meetings.find(meeting => meeting.demoPackId === dsScalePack.id).participants[0].name = 'Локальная правка';
  assert.notEqual(seed.meetings.find(meeting => meeting.demoPackId === dsScalePack.id).participants[0].name, 'Локальная правка', 'Saved data does not share mutable seed objects');
});

test('existing user IDs and Jira keys remain theirs while the added graph is remapped safely', () => {
  const saved = cloneSeed(baseSeed);
  const collision = Object.fromEntries(collections.map(collection => [collection, dsScalePack[collection][0][keyFor(collection)]]));
  const customMeeting = { ...cloneSeed(baseSeed.meetings[0]), id: collision.meetings, title: 'Встреча, импортированная пользователем', topicIds: [], participants: undefined };
  const customTopic = { ...cloneSeed(baseSeed.topics[5]), id: collision.topics, title: 'Тема пользователя', meetingIds: [] };
  const customDecision = { ...cloneSeed(baseSeed.decisions[7]), id: collision.decisions, title: 'Решение пользователя', actionIds: [] };
  const customAction = { ...cloneSeed(baseSeed.actions[5]), id: collision.actions, title: 'Действие пользователя' };
  const customIssue = { key: collision.jiraIssues, title: 'Пользовательская Jira-задача', status: 'Готово' };
  saved.meetings.push(customMeeting);
  saved.topics.push(customTopic);
  saved.decisions.push(customDecision);
  saved.actions.push(customAction);
  byId(saved.decisions, customAction.decisionId).actionIds.push(customAction.id);
  saved.jiraIssues.push(customIssue);
  Object.assign(byId(saved.actions, 'ACT-003'), { jiraState: 'linked', issueKey: customIssue.key });
  const before = structuredClone(saved);
  const upgraded = enrichDemoData(saved);
  for (const collection of collections) {
    const key = keyFor(collection);
    for (const record of before[collection]) assert.deepEqual(upgraded[collection].find(item => item[key] === record[key]), record, `Preserved ${collection}: ${record[key]}`);
    const added = fromPack(upgraded[collection], collision[collection]);
    assert.ok(added, `${collection}: new demo record still exists`);
    assert.notEqual(added[key], collision[collection], `${collection}: collision receives a separate ID`);
  }
  const addedMeeting = fromPack(upgraded.meetings, collision.meetings);
  const addedTopic = fromPack(upgraded.topics, collision.topics);
  assert.ok(addedMeeting.topicIds.includes(addedTopic.id));
  assert.ok(addedTopic.meetingIds.includes(addedMeeting.id));
  for (const decision of upgraded.decisions.filter(item => item.demoPackId === dsScalePack.id)) {
    const meeting = byId(upgraded.meetings, decision.source.meetingId);
    assert.equal(meeting?.demoPackId, dsScalePack.id, `${decision.id}: source is never the user's colliding meeting`);
    assert.ok(meeting.transcript.some(segment => segment.id === decision.source.segmentId));
    assert.equal(byId(upgraded.topics, decision.topicId)?.demoPackId, dsScalePack.id);
    for (const actionId of decision.actionIds) assert.equal(byId(upgraded.actions, actionId)?.decisionId, decision.id);
    if (decision.supersedes) assert.equal(byId(upgraded.decisions, decision.supersedes)?.demoPackId, dsScalePack.id);
  }
  for (const action of upgraded.actions.filter(item => item.demoPackId === dsScalePack.id)) {
    assert.equal(byId(upgraded.decisions, action.decisionId)?.demoPackId, dsScalePack.id);
    for (const key of [action.issueKey, ...action.candidateKeys].filter(Boolean)) assert.equal(upgraded.jiraIssues.find(issue => issue.key === key)?.demoPackId, dsScalePack.id, `${action.id}: never linked to the user's colliding issue`);
  }
  assert.deepEqual(enrichDemoData(upgraded), upgraded);
  assert.deepEqual(saved, before);
});

test('pack metadata prevents duplication and deliberate deletions are respected on later loads', () => {
  const partial = cloneSeed(baseSeed);
  const existing = cloneSeed(seed.meetings.find(meeting => meeting.demoPackId === dsScalePack.id));
  existing.summary = 'Сохранённая правка уже добавленной демовстречи';
  partial.meetings.push(existing);
  const upgraded = enrichDemoData(partial);
  assert.equal(upgraded.meetings.length, 48);
  assert.deepEqual(byId(upgraded.meetings, existing.id), existing);
  for (const collection of collections) upgraded[collection] = upgraded[collection].filter(item => item.demoPackId !== dsScalePack.id);
  assert.deepEqual(enrichDemoData(upgraded), upgraded, 'A completed migration does not refill intentionally removed records');
});

test('pack loading preserves legacy corrections and never expands the bank or base-only scenario', () => {
  const saved = cloneSeed(baseSeed);
  delete saved.meetings[7].participants;
  saved.meetings[7].summary = 'Уточнили область исправления TextField и независимость loading от disabled у Button. Две записи решений ожидают проверки. Повторное обсуждение TextField связано с прежней проблемой и задачей.';
  saved.decisions[8].verification = 'verified';
  const upgraded = enrichDemoData(saved);
  assert.equal(upgraded.meetings.length, 48);
  assert.equal(byId(upgraded.meetings, 'm8').summary, baseSeed.meetings[7].summary);
  assert.deepEqual(byId(upgraded.meetings, 'm8').participants, baseSeed.meetings[7].participants);
  assert.equal(byId(upgraded.decisions, 'DEC-009').verification, 'verified');
  const bank = cloneSeed(bankSeed);
  assert.deepEqual(enrichDemoData(bank, bankSeed), bank);
  assert.equal(bank.meetings.length, 8);
  assert.deepEqual(enrichDemoData(cloneSeed(baseSeed), baseSeed), baseSeed);
  assert.deepEqual(enrichDemoData(cloneSeed(seed)), seed, 'Fresh expanded data is stable on reload');
});
