import test from 'node:test';
import assert from 'node:assert/strict';
import { cloneSeed, baseSeed as seed, enrichDemoData, getStats, getContextActions } from '../src/domain.js';
import { bankSeed } from '../src/bank-demo.js';

// Values persisted by the previous published DS demo, before this upgrade.
const legacyCopy = {
  meetings: {
    m2: {
      summary: 'После обновления результатов поиска фокус пропадает из Select. Зафиксирована проблема и необходимость исправления. В демонстрационной Jira найдены две похожие задачи, связь пока не подтверждена.',
      highlights: ['Проблема подтверждена в сценарии поиска.', 'Два кандидата Jira требуют проверки человеком.'],
    },
    m3: {
      summary: 'Рассмотрен запрос на состояние загрузки Button с сохранением размеров. Решение принято; требуется подготовить задачу. В доступном демонстрационном проекте совпадений не найдено.',
      highlights: ['Запрос изменения отделён от подтверждённых проблем.', 'Подготовлены описание и критерии будущей задачи.'],
    },
    m4: {
      highlights: ['Одна проблема затронула две команды.', 'Новое решение заменяет DEC-001.', 'Работа связана с демонстрационной задачей DEMO-101.'],
    },
    m5: {
      summary: 'Внутреннее развитие Table: согласован проверочный пример закреплённых колонок. Необходимо оформить исследовательскую задачу. Поиск в Jira для этого действия ещё не выполнялся.',
    },
    m6: {
      summary: 'Вторая команда подтвердила потерю фокуса Select. Обсудили разделение загрузки и пустого результата. Извлечённое решение по этим состояниям ожидает проверки.',
      highlights: ['Повторное обсуждение связано с существующей проблемой.', 'Предложенная запись решения ещё не проверена.'],
    },
    m7: {
      highlights: ['Проблема Modal относится к команде «Платежи».', 'Tooltip — консультация для команды «Поддержка», новая задача не нужна.', 'Проверить Jira по Modal пока не удалось.'],
    },
    m8: {
      summary: 'Уточнили область исправления TextField и независимость loading от disabled у Button. Две записи решений ожидают проверки. Повторное обсуждение TextField связано с прежней проблемой и задачей.',
      highlights: ['Исправление TextField ограничено Web.', 'Loading не меняет существующий контракт disabled.', 'Две новые записи нужно сверить с источником.'],
    },
  },
  decisions: {
    'DEC-006': { scope: 'Select с асинхронным поиском, Web. Извлечение решения ещё не проверено.' },
    'DEC-010': { scope: 'Уточнение запроса Button для Web, Android и iOS. Извлечение ещё не проверено.' },
  },
};

const byId = (items, id) => items.find((item) => item.id === id);

function previousSavedData() {
  const data = cloneSeed(seed);
  for (const meeting of data.meetings) delete meeting.participants;
  for (const [collection, records] of Object.entries(legacyCopy)) {
    for (const [id, fields] of Object.entries(records)) {
      Object.assign(byId(data[collection], id), structuredClone(fields));
    }
  }
  return data;
}

test('previously saved DS demo gets participants and corrected copy while retaining completed user actions', () => {
  const saved = previousSavedData();
  const decision = byId(saved.decisions, 'DEC-006');
  decision.verification = 'verified';
  decision.reviewedAt = '2026-11-13T10:00:00Z';
  byId(saved.decisions, 'DEC-010').verification = 'verified';
  byId(saved.meetings, 'm8').processing = 'ready';
  Object.assign(byId(saved.actions, 'ACT-002'), { jiraState: 'linked', issueKey: 'DEMO-102', candidateKeys: [], reason: 'Связано после проверки' });
  saved.jiraIssues.find((issue) => issue.key === 'DEMO-102').status = 'Готово';
  delete saved.jiraIssues[0].description;
  delete saved.jiraIssues[0].acceptance;
  const before = structuredClone(saved);

  // A persisted JSON object and a scenario wrapper are the actual load path.
  const upgraded = enrichDemoData(JSON.parse(JSON.stringify(saved)), { ...seed });
  for (const meeting of upgraded.meetings) {
    assert.deepEqual(meeting.participants, byId(seed.meetings, meeting.id).participants);
    const { participants, summary, highlights, ...remaining } = meeting;
    const { summary: oldSummary, highlights: oldHighlights, ...oldRemaining } = byId(before.meetings, meeting.id);
    assert.deepEqual(remaining, oldRemaining, `${meeting.id}: source transcript and classification remain intact`);
  }
  for (const [collection, records] of Object.entries(legacyCopy)) {
    for (const [id, fields] of Object.entries(records)) {
      for (const field of Object.keys(fields)) {
        assert.deepEqual(byId(upgraded[collection], id)[field], byId(seed[collection], id)[field], `${id}.${field}`);
      }
    }
  }
  for (const decision of upgraded.decisions) {
    const original = byId(before.decisions, decision.id);
    const expected = { ...original };
    if (legacyCopy.decisions[decision.id]) expected.scope = byId(seed.decisions, decision.id).scope;
    assert.deepEqual(decision, expected, `${decision.id}: review, lifecycle and source are preserved`);
  }
  assert.deepEqual(upgraded.actions, before.actions);
  assert.deepEqual(upgraded.topics, before.topics);
  assert.equal(upgraded.jiraIssues[1].status, 'Готово');
  assert.equal(upgraded.jiraIssues[0].description, seed.jiraIssues[0].description, 'Existing Jira enrichment still runs');
  for (const filters of [{}, { component: 'Select', period: '7d' }, { platform: 'Android' }, { team: 'Платежи' }]) {
    assert.deepEqual(getStats(upgraded, filters), getStats(before, filters));
    assert.deepEqual(getContextActions(upgraded, filters), getContextActions(before, filters));
  }
  assert.deepEqual(saved, before, 'Loading does not mutate the stored object');
  assert.deepEqual(enrichDemoData(upgraded, seed), upgraded, 'Repeated loads are idempotent');
  upgraded.meetings[0].participants[0].name = 'Локальное изменение';
  assert.notEqual(seed.meetings[0].participants[0].name, 'Локальное изменение', 'Enriched participants do not share mutable seed objects');
});

test('custom text, explicit empty participants and imported records survive the DS upgrade', () => {
  const saved = previousSavedData();
  byId(saved.meetings, 'm1').participants = [{ name: 'Новый участник', role: 'Исследователь' }];
  byId(saved.meetings, 'm2').participants = [];
  byId(saved.meetings, 'm3').participants = null;
  byId(saved.meetings, 'm6').highlights.push('Моё уточнение — сохранить весь отредактированный список');
  byId(saved.meetings, 'm8').summary = `Мой комментарий. ${legacyCopy.meetings.m8.summary}`;
  byId(saved.decisions, 'DEC-006').scope = 'Уточнённая область по результатам проверки';
  byId(saved.decisions, 'DEC-010').scope = '';
  saved.meetings.push({ id: 'imported-m1', title: 'Встреча пользователя', summary: legacyCopy.meetings.m8.summary });
  const before = structuredClone(saved);
  const upgraded = enrichDemoData(saved, seed);
  for (const id of ['m1', 'm2', 'm3']) {
    assert.deepEqual(byId(upgraded.meetings, id).participants, byId(before.meetings, id).participants);
  }
  assert.deepEqual(byId(upgraded.meetings, 'm6').highlights, byId(before.meetings, 'm6').highlights);
  assert.equal(byId(upgraded.meetings, 'm8').summary, byId(before.meetings, 'm8').summary);
  assert.equal(byId(upgraded.decisions, 'DEC-006').scope, byId(before.decisions, 'DEC-006').scope);
  assert.equal(byId(upgraded.decisions, 'DEC-010').scope, '');
  assert.deepEqual(upgraded.meetings.at(-1), before.meetings.at(-1));
  assert.deepEqual(saved, before);
});

test('the selected bank scenario supplies only its own participants and never receives DS copy fixes', () => {
  const saved = cloneSeed(bankSeed);
  assert.deepEqual(enrichDemoData(saved, bankSeed), saved, 'An existing bank demo is unchanged');
  const expected = structuredClone(saved);
  delete saved.meetings[0].participants;
  assert.deepEqual(enrichDemoData(saved, bankSeed), expected, 'Missing bank participants come from bank metadata');

  // A different scenario may independently reuse the same short record IDs.
  const basis = {
    meetings: [{ id: 'm8', title: 'Обсуждение переводов', participants: [{ name: 'Участник банка', role: 'Аналитик' }] }],
    decisions: [{ id: 'DEC-006', title: 'Обработка переводов', scope: 'Область банковского решения' }],
    jiraIssues: [],
  };
  const colliding = {
    meetings: [{ id: 'm8', title: 'Обсуждение переводов', summary: legacyCopy.meetings.m8.summary }],
    decisions: [{ id: 'DEC-006', title: 'Обработка переводов', scope: legacyCopy.decisions['DEC-006'].scope }],
    jiraIssues: [],
  };
  const upgraded = enrichDemoData(colliding, basis);
  assert.equal(upgraded.meetings[0].summary, colliding.meetings[0].summary);
  assert.equal(upgraded.decisions[0].scope, colliding.decisions[0].scope);
  assert.deepEqual(upgraded.meetings[0].participants, basis.meetings[0].participants);
});

test('every DS meeting lists fictional participants covering the source speaker roles', () => {
  assert.equal(seed.meetings.length, 8);
  for (const meeting of seed.meetings) {
    assert.ok(meeting.participants.length > 0, meeting.id);
    assert.equal(new Set(meeting.participants.map((person) => person.name)).size, meeting.participants.length);
    for (const person of meeting.participants) {
      assert.ok(person.name.trim().length > 0);
      assert.ok(person.role.trim().length > 0);
    }
    for (const segment of meeting.transcript) {
      assert.ok(meeting.participants.some((person) => person.role.startsWith(segment.speaker)), `${meeting.id}: ${segment.speaker}`);
    }
  }
  assert.ok(byId(seed.meetings, 'm5').participants.every((person) => person.role.includes('ДС')), 'Internal Table work keeps DS-only roles');
});
