// All meetings, quotations, decisions, teams' situations, and Jira issues below
// are fictional demonstration data. They are not records of real discussions.

export const components = ['TextField', 'Select', 'Button', 'Modal', 'Table', 'Tooltip'];
export const teams = ['Команда ДС', 'Личный кабинет', 'Платежи', 'Каталог', 'Поддержка'];
export const platforms = ['Web', 'Android', 'iOS'];

// Roles and people belong to the fictional design-system demo only.
const designParticipants = {
  design: { name: 'Алина Миронова', role: 'Дизайнер ДС' },
  web: { name: 'Павел Громов', role: 'Разработчик ДС · Web' },
  android: { name: 'Максим Лавров', role: 'Разработчик ДС · Android' },
  ios: { name: 'Кирилл Власов', role: 'Разработчик ДС · iOS' },
  cabinet: { name: 'Ольга Новикова', role: 'Дизайнер продукта · Личный кабинет' },
  payments: { name: 'Михаил Беляев', role: 'Дизайнер продукта · Платежи' },
  catalog: { name: 'Дарья Сафонова', role: 'Дизайнер продукта · Каталог' },
  support: { name: 'Никита Сергеев', role: 'Специалист поддержки' },
};
const meetingParticipants = (...keys) => keys.map(key => ({ ...designParticipants[key] }));

export const seed = {
  meetings: [
    {
      id: 'm1', title: 'TextField: ошибка во время ввода с маской', date: '2026-10-23', duration: 28,
      kind: 'review', components: ['TextField'], teams: ['Личный кабинет'], platforms: ['Web'],
      participants: meetingParticipants('cabinet', 'web', 'design'),
      summary: 'В демонстрационном сценарии маска и валидация одновременно меняют значение поля. Команда договорилась сначала проверять значение после потери фокуса. Позднее это решение было заменено.',
      highlights: ['Зафиксировано первое проявление проблемы.', 'Исходное решение сохранено в истории и больше не действует.'],
      processing: 'ready', topicIds: ['t1'],
      transcript: [
        { id: 'm1-s1', time: '03:20', speaker: 'Дизайнер продукта', text: 'При вводе номера маска меняет значение, и сообщение об ошибке появляется до завершения ввода. Пользователь ещё не закончил, а поле уже спорит с ним.' },
        { id: 'm1-s2', time: '12:40', speaker: 'Разработчик ДС', text: 'Для первой проверки договорились вызывать валидацию после потери фокуса. Это уменьшит конфликт с форматированием маски.' },
        { id: 'm1-s3', time: '22:10', speaker: 'Дизайнер ДС', text: 'Проверим это на примере формы. Вопрос относится к Web; про остальные платформы сейчас ничего не решали.' },
      ],
    },
    {
      id: 'm2', title: 'Select: фокус при обновлении вариантов', date: '2026-10-29', duration: 35,
      kind: 'review', components: ['Select'], teams: ['Каталог'], platforms: ['Web'],
      participants: meetingParticipants('catalog', 'web', 'design'),
      summary: 'После обновления результатов поиска фокус пропадает из Select. Зафиксировали проблему и согласовали сохранение фокуса при обновлении списка. Похожие задачи договорились сравнить по описанию и критериям, чтобы избежать дубликата.',
      highlights: ['Проблема подтверждена в сценарии поиска.', 'Согласовали сравнение похожих задач по содержанию.'],
      processing: 'ready', topicIds: ['t2'],
      transcript: [
        { id: 'm2-s1', time: '04:15', speaker: 'Дизайнер продукта', text: 'Список вариантов обновляется после запроса. В этот момент фокус покидает поле поиска, и следующий символ уже не вводится.' },
        { id: 'm2-s2', time: '16:05', speaker: 'Разработчик ДС', text: 'Решили сохранить фокус поля при обновлении списка. Создадим или найдём задачу на это исправление: перерисовка вариантов не должна прерывать ввод.' },
        { id: 'm2-s3', time: '29:30', speaker: 'Дизайнер ДС', text: 'Похожая задача могла уже обсуждаться. Сначала проверим её описание, чтобы не завести дубликат только по похожему названию.' },
      ],
    },
    {
      id: 'm3', title: 'Button: состояние загрузки без скачка ширины', date: '2026-11-03', duration: 24,
      kind: 'development', components: ['Button'], teams: ['Каталог'], platforms: ['Web', 'Android', 'iOS'],
      participants: meetingParticipants('catalog', 'design', 'web', 'android', 'ios'),
      summary: 'Рассмотрели запрос на состояние загрузки Button с сохранением размеров. Согласовали сохранение ширины и проверку поведения на Web, Android и iOS.',
      highlights: ['Запрос изменения отделён от подтверждённых проблем.', 'Договорились проверить размеры с разными текстами на трёх платформах.'],
      processing: 'ready', topicIds: ['t3'],
      transcript: [
        { id: 'm3-s1', time: '02:50', speaker: 'Дизайнер продукта', text: 'Нужно показывать загрузку в кнопке и сохранять место в группе действий. Это запрос на развитие компонента, а не сообщение о текущем дефекте.' },
        { id: 'm3-s2', time: '11:20', speaker: 'Дизайнер ДС', text: 'Договорились добавить состояние loading, при котором сохраняется ширина кнопки. Так соседние действия не будут смещаться.' },
        { id: 'm3-s3', time: '19:10', speaker: 'Разработчик ДС', text: 'Нужна отдельная задача: описать контракт, проверить размеры с разными текстами и показать состояние на трёх платформах.' },
      ],
    },
    {
      id: 'm4', title: 'TextField: повторная проверка и пересмотр решения', date: '2026-11-05', duration: 42,
      kind: 'review', components: ['TextField'], teams: ['Личный кабинет', 'Платежи'], platforms: ['Web'],
      participants: meetingParticipants('cabinet', 'payments', 'web', 'design'),
      summary: 'Вторая команда подтвердила тот же конфликт маски и валидации. Проверка только после потери фокуса не покрывает управляемые формы. Принято новое решение: разделить форматирование и события валидации.',
      highlights: ['Одна проблема затронула две команды.', 'Новое решение заменяет DEC-001.', 'На встрече согласовали привязку реализации к демонстрационной задаче DEMO-101.'],
      processing: 'ready', topicIds: ['t1'],
      transcript: [
        { id: 'm4-s1', time: '05:00', speaker: 'Дизайнер продукта', text: 'У второй команды обнаружился тот же конфликт. Проверки только при потере фокуса недостаточно: форма может запускать проверку самостоятельно.' },
        { id: 'm4-s2', time: '17:25', speaker: 'Разработчик ДС', text: 'Предлагаю разделить форматирование маски и валидацию, а изменение и потерю фокуса отдать отдельными событиями. Правила проверки останутся у продукта.' },
        { id: 'm4-s3', time: '24:40', speaker: 'Дизайнер ДС', text: 'Принимаем это решение вместо предыдущего. Причина — один фиксированный момент проверки ограничивает управляемые формы. Старую договорённость сохраняем как заменённую.' },
        { id: 'm4-s4', time: '33:15', speaker: 'Разработчик ДС', text: 'Для демонстрации привяжем исправление к DEMO-101. В задаче должны быть независимые события и проверка ввода с маской; это одна работа, а не две новые задачи.' },
      ],
    },
    {
      id: 'm5', title: 'Table: контракт закрепления колонок', date: '2026-11-06', duration: 31,
      kind: 'development', components: ['Table'], teams: ['Команда ДС'], platforms: ['Web'],
      participants: meetingParticipants('design', 'web'),
      summary: 'Внутреннее развитие Table: согласовали проверочный пример закреплённых колонок. Договорились подготовить пример с горизонтальной прокруткой и список ограничений перед расширением API.',
      highlights: ['Внутреннее развитие не учитывается как проблема потребителя.', 'Сначала проверяем контракт на одном примере.'],
      processing: 'review', topicIds: ['t4'],
      transcript: [
        { id: 'm5-s1', time: '03:35', speaker: 'Дизайнер ДС', text: 'Это внутренняя работа по Table. Обращения с подтверждённой проблемой от продуктовых команд в этой встрече нет.' },
        { id: 'm5-s2', time: '14:10', speaker: 'Разработчик ДС', text: 'Решили сначала проверить закрепление первой и последней колонки на одном примере с горизонтальной прокруткой. Так увидим ограничения до расширения API.' },
        { id: 'm5-s3', time: '23:45', speaker: 'Дизайнер ДС', text: 'Нужно оформить исследовательскую задачу с результатом в виде примера и списка ограничений. Наличие такой задачи ещё не проверяли.' },
      ],
    },
    {
      id: 'm6', title: 'Select: повтор проблемы и состояния загрузки', date: '2026-11-09', duration: 29,
      kind: 'review', components: ['Select'], teams: ['Личный кабинет', 'Каталог'], platforms: ['Web'],
      participants: meetingParticipants('cabinet', 'catalog', 'design', 'web'),
      summary: 'Вторая команда подтвердила потерю фокуса Select. Согласовали отдельное представление загрузки списка и пустого результата, чтобы различать ожидание ответа и завершённый поиск.',
      highlights: ['Повторное обсуждение связано с существующей проблемой.', 'Согласовали раздельные состояния загрузки и пустого результата.'],
      processing: 'review', topicIds: ['t2'],
      transcript: [
        { id: 'm6-s1', time: '04:30', speaker: 'Дизайнер продукта', text: 'Мы воспроизвели ту же потерю фокуса. Это существующая проблема Select, отдельное обращение не должно становиться второй проблемой в статистике.' },
        { id: 'm6-s2', time: '13:50', speaker: 'Дизайнер ДС', text: 'Договорились отдельно представлять загрузку списка и отсутствие результатов. Сейчас одинаковое пустое место не даёт понять, закончился ли поиск.' },
        { id: 'm6-s3', time: '22:05', speaker: 'Разработчик ДС', text: 'По фиксации фокуса остаются два кандидата в демонстрационной Jira. Похожее название ещё не подтверждает, что задача покрывает наш случай.' },
      ],
    },
    {
      id: 'm7', title: 'Modal и Tooltip: прокрутка и консультация по API', date: '2026-11-10', duration: 38,
      kind: 'consultation', components: ['Modal', 'Tooltip'], teams: ['Платежи', 'Поддержка'], platforms: ['Web'],
      participants: meetingParticipants('payments', 'support', 'web', 'design'),
      summary: 'Зафиксирована проблема восстановления прокрутки при вложенных Modal. Отдельно разобран вопрос по API Tooltip: изменений не требуется. Эти темы связаны с разными командами и учитываются отдельно.',
      highlights: ['Проблема Modal относится к команде «Платежи».', 'По Tooltip на встрече согласовали сохранить API без новой задачи.', 'Во время встречи проверка Jira по Modal была недоступна.'],
      processing: 'ready', topicIds: ['t5', 't6'],
      transcript: [
        { id: 'm7-s1', time: '05:40', speaker: 'Дизайнер продукта', text: 'После закрытия вложенного окна прокрутка основной страницы остаётся заблокированной. Это воспроизводится в сценарии команды платежей.' },
        { id: 'm7-s2', time: '14:20', speaker: 'Разработчик ДС', text: 'Решили учитывать все открытые Modal и снимать блокировку после закрытия последнего. Иначе вложенные окна нарушают восстановление прокрутки. Это нужно исправить.' },
        { id: 'm7-s3', time: '25:10', speaker: 'Специалист поддержки', text: 'Отдельный вопрос про Tooltip: можем оставить существующий API позиционирования в нашем примере?' },
        { id: 'm7-s4', time: '27:30', speaker: 'Дизайнер ДС', text: 'Да, договорились сохранить существующий API Tooltip. Изменение компонента и новая задача не требуются.' },
        { id: 'm7-s5', time: '33:00', speaker: 'Разработчик ДС', text: 'Проверка Jira по исправлению Modal сейчас недоступна. Из этого нельзя сделать вывод, что задачи нет.' },
      ],
    },
    {
      id: 'm8', title: 'TextField и Button: уточнение границ изменений', date: '2026-11-12', duration: 26,
      kind: 'review', components: ['TextField', 'Button'], teams: ['Личный кабинет', 'Платежи', 'Каталог'], platforms: ['Web', 'Android', 'iOS'],
      participants: meetingParticipants('cabinet', 'payments', 'catalog', 'design', 'web', 'android', 'ios'),
      summary: 'Уточнили область исправления TextField и независимость loading от disabled у Button. Повторное обсуждение TextField продолжило прежнюю тему; новых проблем по нему не выделяли.',
      highlights: ['Исправление TextField ограничено Web.', 'Loading не меняет существующий контракт disabled.', 'Зафиксированы границы платформ и независимость состояний.'],
      processing: 'review', topicIds: ['t1', 't3'],
      transcript: [
        { id: 'm8-s1', time: '04:20', speaker: 'Разработчик ДС', text: 'Исправление маски остаётся в работе в DEMO-101. Сегодня обсуждаем ту же проблему, новую задачу и новую проблему не создаём.' },
        { id: 'm8-s2', time: '09:15', speaker: 'Дизайнер ДС', text: 'Решили не менять Android и iOS в рамках этого исправления TextField. Подтверждённый сценарий относится к Web; изменение остальных платформ требует отдельного основания.' },
        { id: 'm8-s3', time: '17:40', speaker: 'Разработчик ДС', text: 'По Button договорились оставить существующий API disabled. Loading добавляем отдельно, чтобы приложения могли независимо задавать эти состояния.' },
        { id: 'm8-s4', time: '22:10', speaker: 'Дизайнер ДС', text: 'Проверим две записи в журнале: границу платформ для поля и независимость состояний кнопки. По Button черновик задачи пока не связан с Jira.' },
      ],
    },
  ],
  topics: [
    { id: 't1', title: 'Конфликт маски и валидации TextField', type: 'problem', confirmed: true, status: 'open', components: ['TextField'], teams: ['Личный кабинет', 'Платежи'], platforms: ['Web'], meetingIds: ['m1', 'm4', 'm8'], firstSeen: '2026-10-23', attention: false, attentionReason: '' },
    { id: 't2', title: 'Потеря фокуса Select при обновлении списка', type: 'problem', confirmed: true, status: 'open', components: ['Select'], teams: ['Каталог', 'Личный кабинет'], platforms: ['Web'], meetingIds: ['m2', 'm6'], firstSeen: '2026-10-29', attention: false, attentionReason: '' },
    { id: 't3', title: 'Состояние загрузки Button с сохранением ширины', type: 'change', confirmed: true, status: 'open', components: ['Button'], teams: ['Каталог'], platforms: ['Web', 'Android', 'iOS'], meetingIds: ['m3', 'm8'], firstSeen: '2026-11-03', attention: false, attentionReason: '' },
    { id: 't4', title: 'Проверка контракта закреплённых колонок Table', type: 'development', confirmed: true, status: 'open', components: ['Table'], teams: ['Команда ДС'], platforms: ['Web'], meetingIds: ['m5'], firstSeen: '2026-11-06', attention: false, attentionReason: '' },
    { id: 't5', title: 'Прокрутка после закрытия вложенных Modal', type: 'problem', confirmed: true, status: 'open', components: ['Modal'], teams: ['Платежи'], platforms: ['Web'], meetingIds: ['m7'], firstSeen: '2026-11-10', attention: true, attentionReason: 'Ручная отметка: после закрытия окна основная страница остаётся заблокированной.' },
    { id: 't6', title: 'Использование существующего API Tooltip', type: 'consultation', confirmed: true, status: 'closed', components: ['Tooltip'], teams: ['Поддержка'], platforms: ['Web'], meetingIds: ['m7'], firstSeen: '2026-11-10', attention: false, attentionReason: '' },
  ],
  decisions: [
    { id: 'DEC-001', title: 'Проверять значение TextField после потери фокуса', text: 'Вызывать валидацию Web-поля с маской после потери фокуса.', reason: 'Уменьшить конфликт между форматированием маски и проверкой незавершённого ввода.', scope: 'Первоначальная договорённость для Web; заменена решением DEC-004.', components: ['TextField'], teams: ['Личный кабинет'], platforms: ['Web'], topicId: 't1', source: { meetingId: 'm1', segmentId: 'm1-s2' }, verification: 'verified', lifecycle: 'superseded', supersedes: null, createdAt: '2026-10-23', actionIds: [] },
    { id: 'DEC-002', title: 'Сохранять фокус Select при обновлении вариантов', text: 'Обновление списка вариантов не должно прерывать ввод в поле поиска Select.', reason: 'При перерисовке списка пользователь теряет фокус и не может продолжить поиск.', scope: 'Select с поиском и асинхронным обновлением вариантов, Web.', components: ['Select'], teams: ['Каталог', 'Личный кабинет'], platforms: ['Web'], topicId: 't2', source: { meetingId: 'm2', segmentId: 'm2-s2' }, verification: 'verified', lifecycle: 'active', supersedes: null, createdAt: '2026-10-29', actionIds: ['ACT-002'] },
    { id: 'DEC-003', title: 'Сохранять ширину Button в состоянии загрузки', text: 'Добавить состояние loading с сохранением ширины кнопки при замене её содержимого индикатором.', reason: 'Соседние действия не должны смещаться при переходе кнопки в загрузку.', scope: 'Button на Web, Android и iOS; запрос на развитие компонента.', components: ['Button'], teams: ['Каталог'], platforms: ['Web', 'Android', 'iOS'], topicId: 't3', source: { meetingId: 'm3', segmentId: 'm3-s2' }, verification: 'verified', lifecycle: 'active', supersedes: null, createdAt: '2026-11-03', actionIds: ['ACT-003'] },
    { id: 'DEC-004', title: 'Разделить маску и события валидации TextField', text: 'Разделить форматирование маски и пользовательскую валидацию. Предоставить независимые события изменения значения и потери фокуса; правила проверки определяет продукт.', reason: 'Фиксированная проверка только после потери фокуса ограничивает управляемые формы и не покрывает сценарии двух команд.', scope: 'Web-поле с маской; заменяет DEC-001. Контракт остальных платформ не меняется.', components: ['TextField'], teams: ['Личный кабинет', 'Платежи'], platforms: ['Web'], topicId: 't1', source: { meetingId: 'm4', segmentId: 'm4-s3' }, verification: 'verified', lifecycle: 'active', supersedes: 'DEC-001', createdAt: '2026-11-05', actionIds: ['ACT-001'] },
    { id: 'DEC-005', title: 'Проверить закрепление колонок Table на примере', text: 'Подготовить один проверочный пример с закреплёнными первой и последней колонками и горизонтальной прокруткой.', reason: 'Выявить ограничения до расширения публичного API Table.', scope: 'Внутреннее развитие Table, Web; это не подтверждённая проблема продуктовой команды.', components: ['Table'], teams: ['Команда ДС'], platforms: ['Web'], topicId: 't4', source: { meetingId: 'm5', segmentId: 'm5-s2' }, verification: 'verified', lifecycle: 'active', supersedes: null, createdAt: '2026-11-06', actionIds: ['ACT-004'] },
    { id: 'DEC-006', title: 'Различать загрузку и пустой результат Select', text: 'Представлять загрузку вариантов и отсутствие результатов как два отдельных состояния Select.', reason: 'Одинаковое пустое место не объясняет, завершился ли поиск.', scope: 'Select с асинхронным поиском, Web.', components: ['Select'], teams: ['Каталог', 'Личный кабинет'], platforms: ['Web'], topicId: 't2', source: { meetingId: 'm6', segmentId: 'm6-s2' }, verification: 'pending', lifecycle: 'active', supersedes: null, createdAt: '2026-11-09', actionIds: [] },
    { id: 'DEC-007', title: 'Восстанавливать прокрутку после последнего Modal', text: 'Учитывать все открытые Modal и снимать блокировку прокрутки после закрытия последнего окна.', reason: 'Вложенные окна нарушают восстановление прокрутки основной страницы.', scope: 'Вложенные Modal на Web в подтверждённом сценарии команды «Платежи».', components: ['Modal'], teams: ['Платежи'], platforms: ['Web'], topicId: 't5', source: { meetingId: 'm7', segmentId: 'm7-s2' }, verification: 'verified', lifecycle: 'active', supersedes: null, createdAt: '2026-11-10', actionIds: ['ACT-005'] },
    { id: 'DEC-008', title: 'Сохранить существующий API Tooltip', text: 'Использовать существующий API позиционирования Tooltip; изменение компонента и новая задача не требуются.', reason: null, scope: 'Консультационный сценарий команды «Поддержка», Web. Причина выбора отдельно не зафиксирована.', components: ['Tooltip'], teams: ['Поддержка'], platforms: ['Web'], topicId: 't6', source: { meetingId: 'm7', segmentId: 'm7-s4' }, verification: 'verified', lifecycle: 'active', supersedes: null, createdAt: '2026-11-10', actionIds: ['ACT-006'] },
    { id: 'DEC-009', title: 'Ограничить исправление TextField платформой Web', text: 'В рамках текущего исправления маски не менять поведение Android и iOS.', reason: 'Подтверждённый сценарий относится к Web; изменение остальных платформ требует отдельного основания.', scope: 'Граница исправления DEC-004. Это не изменение контрактов Android и iOS.', components: ['TextField'], teams: ['Личный кабинет', 'Платежи'], platforms: ['Web', 'Android', 'iOS'], topicId: 't1', source: { meetingId: 'm8', segmentId: 'm8-s2' }, verification: 'pending', lifecycle: 'active', supersedes: null, createdAt: '2026-11-12', actionIds: [] },
    { id: 'DEC-010', title: 'Сохранить независимость loading и disabled у Button', text: 'Добавить loading отдельно от существующего API disabled, сохранив возможность независимо задавать эти состояния.', reason: 'Продуктам требуется независимо управлять загрузкой и доступностью действия.', scope: 'Уточнение запроса Button для Web, Android и iOS.', components: ['Button'], teams: ['Каталог'], platforms: ['Web', 'Android', 'iOS'], topicId: 't3', source: { meetingId: 'm8', segmentId: 'm8-s3' }, verification: 'pending', lifecycle: 'active', supersedes: null, createdAt: '2026-11-12', actionIds: [] },
  ],
  actions: [
    { id: 'ACT-001', platforms: ['Web'], title: 'Разделить обработку маски и валидации TextField', description: 'Исправить конфликт форматирования маски и пользовательской проверки; реализовать независимые события изменения и потери фокуса.', acceptance: ['Проверка значения не меняет порядок форматирования маски.', 'Продукт может независимо обработать изменение и потерю фокуса.', 'Проверочные сценарии обеих команд проходят на Web.'], topicId: 't1', decisionId: 'DEC-004', source: { meetingId: 'm4', segmentId: 'm4-s4' }, components: ['TextField'], teams: ['Личный кабинет', 'Платежи'], jiraState: 'linked', issueKey: 'DEMO-101', candidateKeys: [], project: 'DS', assignee: 'Разработчик ДС', lastChecked: '2026-11-12T09:30:00Z', reason: 'Связь подтверждена в демонстрационном сценарии. DEMO-101 — вымышленная задача.' },
    { id: 'ACT-002', platforms: ['Web'], title: 'Сохранить фокус Select при обновлении вариантов', description: 'Исправить потерю фокуса поля поиска при асинхронном обновлении списка Select. Проверить найденные кандидаты перед созданием задачи.', acceptance: ['Ввод продолжается после обновления списка.', 'Выбранное значение не теряется при поиске.', 'Проверен сценарий быстрого последовательного ввода.'], topicId: 't2', decisionId: 'DEC-002', source: { meetingId: 'm2', segmentId: 'm2-s2' }, components: ['Select'], teams: ['Каталог', 'Личный кабинет'], jiraState: 'candidates', issueKey: null, candidateKeys: ['DEMO-102', 'DEMO-103'], project: 'DS', assignee: 'Не назначен', lastChecked: '2026-11-12T09:30:00Z', reason: 'Две похожие демонстрационные задачи. Соответствие этому действию не подтверждено.' },
    { id: 'ACT-003', platforms: ['Web', 'Android', 'iOS'], title: 'Добавить loading в Button с сохранением ширины', description: 'Описать и реализовать состояние loading. Сохранить размеры кнопки и независимость существующего API disabled.', acceptance: ['Ширина сохраняется для коротких и длинных надписей.', 'Loading и disabled управляются независимо.', 'Подготовлены примеры для Web, Android и iOS.'], topicId: 't3', decisionId: 'DEC-003', source: { meetingId: 'm3', segmentId: 'm3-s3' }, components: ['Button'], teams: ['Каталог'], jiraState: 'not_found', issueKey: null, candidateKeys: [], project: 'DS', assignee: 'Не назначен', lastChecked: '2026-11-12T09:30:00Z', reason: 'В демонстрационном проекте DS совпадений не найдено. Это не утверждение об отсутствии задачи в реальной Jira.' },
    { id: 'ACT-004', platforms: ['Web'], title: 'Проверить контракт закрепления колонок Table', description: 'Подготовить проверочный пример Table с закреплёнными крайними колонками и описать обнаруженные ограничения.', acceptance: ['Пример демонстрирует горизонтальную прокрутку.', 'Проверены первая и последняя закреплённые колонки.', 'Результат содержит ограничения и вывод по контракту.'], topicId: 't4', decisionId: 'DEC-005', source: { meetingId: 'm5', segmentId: 'm5-s3' }, components: ['Table'], teams: ['Команда ДС'], jiraState: 'not_checked', issueKey: null, candidateKeys: [], project: 'DS', assignee: 'Не назначен', lastChecked: null, reason: 'Поиск существующей задачи ещё не выполнялся.' },
    { id: 'ACT-005', platforms: ['Web'], title: 'Исправить прокрутку после вложенных Modal', description: 'Устранить сохранение блокировки страницы после закрытия последнего вложенного Modal.', acceptance: ['После закрытия последнего Modal прокрутка восстанавливается.', 'Пока хотя бы один Modal открыт, заданная блокировка сохраняется.', 'Повторное открытие и закрытие не оставляет блокировку.'], topicId: 't5', decisionId: 'DEC-007', source: { meetingId: 'm7', segmentId: 'm7-s2' }, components: ['Modal'], teams: ['Платежи'], jiraState: 'unavailable', issueKey: null, candidateKeys: [], project: 'DS', assignee: 'Не назначен', lastChecked: null, reason: 'Проверка Jira недоступна в демонстрационном сценарии. Наличие задачи неизвестно.' },
    { id: 'ACT-006', platforms: ['Web'], title: 'Проверить необходимость изменения Tooltip', description: 'По результату консультации использовать существующий API; дополнительная реализация не требуется.', acceptance: ['Решение и исходный фрагмент консультации сохранены.'], topicId: 't6', decisionId: 'DEC-008', source: { meetingId: 'm7', segmentId: 'm7-s4' }, components: ['Tooltip'], teams: ['Поддержка'], jiraState: 'not_required', issueKey: null, candidateKeys: [], project: 'DS', assignee: 'Не назначен', lastChecked: null, reason: 'На встрече явно согласовано: изменение компонента и новая задача не требуются.' },
  ],
  jiraIssues: [
    {
      key: 'DEMO-101', title: 'TextField: разделение маски и валидации', status: 'В работе', assignee: 'Разработчик ДС', component: 'TextField',
      description: 'Разделить форматирование маски и пользовательскую валидацию Web-поля. Компонент предоставляет независимые события изменения значения и потери фокуса; правила проверки задаёт продукт. Исправление покрывает сценарии команд «Личный кабинет» и «Платежи».',
      acceptance: ['Маска не перезаписывает результат пользовательской проверки.', 'Обработчики изменения и потери фокуса независимы.', 'Существующее поведение Android и iOS не меняется.'],
    },
    {
      key: 'DEMO-102', title: 'Select: сохранение фокуса при фильтрации', status: 'Открыта', assignee: 'Не назначен', component: 'Select',
      description: 'Устранить потерю фокуса поля поиска Select на Web при получении новых вариантов с сервера. Обновление списка не должно пересоздавать поле ввода или прерывать набор запроса. Задача относится к поведению фокуса, а не к оформлению состояний списка.',
      acceptance: ['После ответа сервера фокус остаётся в поле поиска.', 'Быстрый последовательный ввод продолжается без пропущенных символов.', 'Поиск и обновление вариантов не сбрасывают выбранное значение.'],
    },
    {
      key: 'DEMO-103', title: 'Select: загрузка вариантов и пустой результат', status: 'В работе', assignee: 'Разработчик ДС', component: 'Select',
      description: 'Показать разные состояния списка Select на Web: ожидание ответа сервера и завершённый поиск без совпадений. Задача уточняет отображение индикатора и поясняющего текста. Исправление потери фокуса при обновлении вариантов в её объём не входит.',
      acceptance: ['Во время запроса виден индикатор загрузки.', 'После ответа без совпадений показан текст «Ничего не найдено».', 'Пустой результат не отображается до завершения запроса.'],
    },
  ],
};

export function cloneSeed(basis = seed) {
  return JSON.parse(JSON.stringify(basis));
}

/** Add newly supplied demo metadata without replacing saved edits or links. */
export function enrichDemoIssueDetails(data, basis = seed) {
  if (!Array.isArray(data?.jiraIssues)) return data;
  const details = new Map((basis?.jiraIssues || []).map((issue) => [issue.key, issue]));
  return {
    ...data,
    jiraIssues: data.jiraIssues.map((issue) => {
      const known = details.get(issue.key);
      if (!known) return issue;
      return {
        ...issue,
        description: issue.description ?? known.description,
        acceptance: issue.acceptance ?? (known.acceptance ? [...known.acceptance] : undefined),
      };
    }),
  };
}

// Exact previous demo copy: migrate these values, never arbitrary user text.
const previousDesignCopy = {
  "meetings": {
    "m2": {
      "summary": "После обновления результатов поиска фокус пропадает из Select. Зафиксирована проблема и необходимость исправления. В демонстрационной Jira найдены две похожие задачи, связь пока не подтверждена.",
      "highlights": [
        "Проблема подтверждена в сценарии поиска.",
        "Два кандидата Jira требуют проверки человеком."
      ]
    },
    "m3": {
      "summary": "Рассмотрен запрос на состояние загрузки Button с сохранением размеров. Решение принято; требуется подготовить задачу. В доступном демонстрационном проекте совпадений не найдено.",
      "highlights": [
        "Запрос изменения отделён от подтверждённых проблем.",
        "Подготовлены описание и критерии будущей задачи."
      ]
    },
    "m4": {
      "highlights": [
        "Одна проблема затронула две команды.",
        "Новое решение заменяет DEC-001.",
        "Работа связана с демонстрационной задачей DEMO-101."
      ]
    },
    "m5": {
      "summary": "Внутреннее развитие Table: согласован проверочный пример закреплённых колонок. Необходимо оформить исследовательскую задачу. Поиск в Jira для этого действия ещё не выполнялся."
    },
    "m6": {
      "summary": "Вторая команда подтвердила потерю фокуса Select. Обсудили разделение загрузки и пустого результата. Извлечённое решение по этим состояниям ожидает проверки.",
      "highlights": [
        "Повторное обсуждение связано с существующей проблемой.",
        "Предложенная запись решения ещё не проверена."
      ]
    },
    "m7": {
      "highlights": [
        "Проблема Modal относится к команде «Платежи».",
        "Tooltip — консультация для команды «Поддержка», новая задача не нужна.",
        "Проверить Jira по Modal пока не удалось."
      ]
    },
    "m8": {
      "summary": "Уточнили область исправления TextField и независимость loading от disabled у Button. Две записи решений ожидают проверки. Повторное обсуждение TextField связано с прежней проблемой и задачей.",
      "highlights": [
        "Исправление TextField ограничено Web.",
        "Loading не меняет существующий контракт disabled.",
        "Две новые записи нужно сверить с источником."
      ]
    }
  },
  "decisions": {
    "DEC-006": {
      "scope": "Select с асинхронным поиском, Web. Извлечение решения ещё не проверено."
    },
    "DEC-010": {
      "scope": "Уточнение запроса Button для Web, Android и iOS. Извлечение ещё не проверено."
    }
  }
};

/** Add selected-scenario metadata and correct unchanged legacy demo copy. */
export function enrichDemoData(data, basis = seed) {
  let enriched = enrichDemoIssueDetails(data, basis);
  if (!enriched || typeof enriched !== 'object') return enriched;
  for (const collection of ['meetings', 'decisions']) {
    if (!Array.isArray(enriched[collection])) continue;
    const knownById = new Map((basis?.[collection] || []).map(item => [item.id, item]));
    const designById = new Map(seed[collection].map(item => [item.id, item]));
    enriched = {
      ...enriched,
      [collection]: enriched[collection].map(item => {
        const known = knownById.get(item.id);
        if (!known) return item;
        let next = item;
        if (collection === 'meetings' && item.participants === undefined && Array.isArray(known.participants)) {
          next = { ...next, participants: known.participants.map(person => ({ ...person })) };
        }
        // The selected scenario must carry the same design-system record.
        // Bank records and custom/imported records do not match this boundary.
        const previous = previousDesignCopy[collection][item.id];
        const original = designById.get(item.id);
        if (previous && original && known.title === original.title) {
          for (const [field, value] of Object.entries(previous)) {
            if (JSON.stringify(item[field]) === JSON.stringify(value)) {
              next = { ...next, [field]: Array.isArray(known[field]) ? [...known[field]] : known[field] };
            }
          }
        }
        return next;
      }),
    };
  }
  return enriched;
}

/** Date.parse alone normalizes impossible dates such as 2026-02-31. */
export function isValidCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Search every query word across all supplied strings; ё and е are equivalent. */
export function matchText(query, ...strings) {
  const normalize = (value) => String(value ?? '').normalize('NFKC').toLocaleLowerCase('ru').replace(/ё/g, 'е');
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  const haystack = normalize(strings.flat(Infinity).filter((value) => value != null).join(' '));
  return words.every((word) => haystack.includes(word));
}

/**
 * Periods use the latest meeting date in the dataset as the demonstration's
 * snapshot date, not the computer clock. Accepted values: all, 7d, 30d, 90d
 * (numeric/string 7/30/90 and week/month/quarter aliases are also supported).
 * A period selects meetings, then topics discussed in those meetings. Open
 * actions belong to those topics, even if the action originated earlier.
 */
function getContext(data, filters = {}) {
  const sourceMeetings = Array.isArray(data?.meetings) ? data.meetings : [];
  const sourceTopics = Array.isArray(data?.topics) ? data.topics : [];
  const sourceActions = Array.isArray(data?.actions) ? data.actions : [];
  const sourceDecisions = Array.isArray(data?.decisions) ? data.decisions : [];
  const selectedComponent = filters.component || 'all';
  const selectedTeam = filters.team || 'all';
  const selectedPlatform = filters.platform || 'all';
  const period = filters.period ?? 'all';
  const aliases = { week: 7, month: 30, quarter: 90 };
  const parsedDays = aliases[period] ?? Number(String(period).replace(/d$/, ''));
  const days = Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : null;
  const dates = sourceMeetings.map((meeting) => Date.parse(`${meeting.date}T00:00:00Z`)).filter(Number.isFinite);
  const latest = dates.length ? Math.max(...dates) : 0;
  const earliest = days ? latest - (days - 1) * 86400000 : -Infinity;
  const includesTeam = (item) => selectedTeam === 'all' || (item.teams || []).includes(selectedTeam);
  const includesPlatform = (item) => selectedPlatform === 'all' || (item.platforms || []).includes(selectedPlatform);
  const visibleMeetings = sourceMeetings.filter((meeting) => {
    const date = Date.parse(`${meeting.date}T00:00:00Z`);
    return Number.isFinite(date) && date >= earliest && includesTeam(meeting) && includesPlatform(meeting)
      && (selectedComponent === 'all' || (meeting.components || []).includes(selectedComponent));
  });
  const decisionById = new Map(sourceDecisions.map((decision) => [decision.id, decision]));
  const topicById = new Map(sourceTopics.map((topic) => [topic.id, topic]));
  // The fallback also supports previously saved local demo data created before
  // actions gained explicit platform metadata.
  const actionMatchesPlatform = (action) => includesPlatform({
    platforms: action.platforms ?? decisionById.get(action.decisionId)?.platforms ?? topicById.get(action.topicId)?.platforms ?? [],
  });
  // Each scenario owns its catalog. An explicit empty catalog is valid, and
  // must not silently reveal design-system components from the original demo.
  const catalog = Array.isArray(data?.catalog?.components) ? data.catalog.components : components;
  const visibleComponents = selectedComponent === 'all' ? catalog : catalog.filter((component) => component === selectedComponent);
  const componentContexts = visibleComponents.map((component) => {
    const componentTopics = sourceTopics.filter((topic) => (topic.components || []).includes(component));
    const meetingIds = new Set(visibleMeetings.filter((meeting) => {
      if (!(meeting.components || []).includes(component)) return false;
      const relatedTopics = componentTopics.filter((topic) => (topic.meetingIds || []).includes(meeting.id));
      // A multi-topic meeting must not imply every component applies to every
      // tagged team/platform. Imported, unclassified meetings still count by
      // their explicit meeting metadata until structured topics are available.
      return !relatedTopics.length || relatedTopics.some((topic) => includesTeam(topic) && includesPlatform(topic));
    }).map((meeting) => meeting.id));
    const topicsForComponent = componentTopics.filter((topic) => includesTeam(topic) && includesPlatform(topic)
      && (topic.meetingIds || []).some((id) => meetingIds.has(id)));
    const topicIds = new Set(topicsForComponent.map((topic) => topic.id));
    return { component, meetingIds, topicsForComponent, topicIds };
  });
  return { sourceActions, selectedTeam, includesTeam, actionMatchesPlatform, componentContexts };
}

/**
 * Actions for the selected discussion context. The period describes when a
 * topic was discussed, not when its first decision/action was created. Return
 * resolved actions too so the review queue can show them on request.
 */
export function getContextActions(data, filters = {}) {
  const { sourceActions, includesTeam, actionMatchesPlatform, componentContexts } = getContext(data, filters);
  return sourceActions.filter((action) => includesTeam(action) && actionMatchesPlatform(action)
    && componentContexts.some(({ component, topicIds }) => (action.components || []).includes(component) && topicIds.has(action.topicId)));
}

export function getStats(data, filters = {}) {
  const { selectedTeam, componentContexts } = getContext(data, filters);
  // One selector powers the analytics signal and its destination review queue.
  const contextActions = getContextActions(data, filters);
  const sourceIssues = Array.isArray(data?.jiraIssues) ? data.jiraIssues : [];
  const issueByKey = new Map(sourceIssues.map((issue) => [issue.key, issue]));
  const completedStatuses = new Set(['done', 'closed', 'resolved', 'готово', 'выполнено', 'закрыта', 'закрыто']);
  const isOpenAction = (action) => {
    if (action.jiraState === 'not_required') return false;
    if (action.jiraState !== 'linked') return true;
    const issue = issueByKey.get(action.issueKey);
    return !issue || !completedStatuses.has(String(issue.status || '').toLocaleLowerCase('ru'));
  };
  return componentContexts.map(({ component, meetingIds, topicsForComponent, topicIds }) => {
    const problems = topicsForComponent.filter((topic) => topic.type === 'problem' && topic.confirmed === true);
    const changeRequests = topicsForComponent.filter((topic) => topic.type === 'change' && topic.confirmed === true);
    const affectedTeamNames = new Set(problems.flatMap((topic) => (topic.teams || []).filter((team) => selectedTeam === 'all' || team === selectedTeam)));
    const actions = contextActions.filter((action) => (action.components || []).includes(component)
      && topicIds.has(action.topicId) && isOpenAction(action));
    const unlinkedActions = actions.filter((action) => action.jiraState !== 'linked').length;
    const attentionTopics = topicsForComponent.filter((topic) => topic.attention === true && topic.status !== 'closed');
    const plural = (number, forms) => forms[number % 10 === 1 && number % 100 !== 11 ? 0
      : number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 12 || number % 100 > 14) ? 1 : 2];
    // Pilot hypotheses, not a validated component-quality score. A topic's
    // cross-team signal uses its full known scope, even under a one-team filter.
    const automaticReasons = problems.filter((topic) => topic.status === 'open' && new Set(topic.teams || []).size >= 2).map((topic) => {
      const count = new Set(topic.teams || []).size;
      return `Открытая проблема «${topic.title}» затрагивает ${count} ${plural(count, ['команду', 'команды', 'команд'])} по всем обсуждениям темы.`;
    });
    if (unlinkedActions > 0) automaticReasons.push(`${unlinkedActions} ${plural(unlinkedActions, ['открытое действие', 'открытых действия', 'открытых действий'])} без подтверждённой связи с Jira. Наличие задачи требует проверки.`);
    const reasons = [...automaticReasons, ...attentionTopics.map((topic) => topic.attentionReason || 'Ручная отметка команды.')];
    const reasonKeys = new Set();
    const attentionReasons = reasons.filter((reason) => {
      const key = reason.toLocaleLowerCase('ru').replace(/^(ручная отметка|отметка команды):\s*/, '').replace(/\s+/g, ' ').replace(/[.!]+$/, '').trim();
      if (reasonKeys.has(key)) return false;
      reasonKeys.add(key);
      return true;
    });
    return {
      component,
      meetingCount: meetingIds.size,
      problemCount: new Set(problems.map((topic) => topic.id)).size,
      changeRequestCount: new Set(changeRequests.map((topic) => topic.id)).size,
      affectedTeams: affectedTeamNames.size,
      openActions: actions.length,
      unlinkedActions,
      attention: attentionReasons.length > 0,
      attentionReasons,
    };
  });
}
