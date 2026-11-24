/* IronLog 기본 종목 목록 (앱 코드와 분리된 데이터 파일)
 * 형식: { id, name, en, aka[], part, equip, type, rest(초), tips[], mistake }
 *  part : 가슴 / 등 / 하체 / 어깨 / 팔 / 코어 / 유산소
 *  sub  : 고르는 화면의 세부 부위 (가슴 / 등·승모근·허리 / 어깨 / 이두·삼두·전완 / 복부 / 허벅지·엉덩이·종아리), 유산소는 없음
 *  equip: 바벨 / 덤벨 / 머신 / 케이블 / 맨몸 / 기타
 *  type : weight_reps(무게+횟수) / reps(횟수) / time(초) / distance_time(분+km)
 *  vmul : 볼륨 계산 배수 (없으면 덤벨 = 2: 한 손 무게를 적고 양손으로 계산, 그 외 = 1)
 *         덤벨 하나를 두 손으로 드는 종목은 vmul: 1
 * tips·mistake가 비어 있는 종목은 Gemini(ironlog-trainer)가 나중에 채운다.
 */
window.IRONLOG_EXERCISES = [
  // ── 가슴 ──
  {
    id: 'barbell_bench_press', name: '바벨 벤치프레스', en: 'Barbell Bench Press',
    aka: ['벤치프레스', '플랫 벤치프레스'], part: '가슴', sub: '가슴', equip: '바벨', type: 'weight_reps', rest: 120,
    tips: [
      '견갑골을 후인·하강하여 가슴을 열고 아치를 유지한다.',
      '바벨을 내릴 때 팔꿈치 각도가 몸통과 45~60도 정도가 되게 한다.',
      '발바닥으로 지면을 단단히 밀어내며 수직에 가깝게 밀어 올린다.'
    ],
    mistake: '팔꿈치를 옆으로 너무 벌리면(90도) 어깨 충돌과 팔꿈치 힘줄 부상 위험이 큽니다.'
  },
  {
    id: 'dumbbell_bench_press', name: '덤벨 벤치프레스', en: 'Dumbbell Bench Press',
    aka: ['덤벨 프레스'], part: '가슴', sub: '가슴', equip: '덤벨', type: 'weight_reps', rest: 90,
    tips: [
      '손목이 뒤로 꺾이지 않도록 전완근과 수직을 유지한다.',
      '이완 시 가슴 근육이 늘어나는 느낌을 받으며 천천히 내린다.'
    ],
    mistake: '세트가 끝난 뒤 무거운 덤벨을 팔을 뻗은 채 바닥에 떨어뜨리면 어깨 관절이 다칠 수 있습니다.'
  },
  {
    id: 'incline_chest_press_machine', name: '인클라인 체스트 프레스 머신', en: 'Incline Chest Press Machine',
    aka: ['인클라인 프레스 머신'], part: '가슴', sub: '가슴', equip: '머신', type: 'weight_reps', rest: 90,
    tips: [
      '손잡이가 쇄골 아래쪽(윗가슴 라인)에 오도록 의자 높이를 조절한다.',
      '팔꿈치를 완전히 잠그기 직전까지만 밀어 윗가슴 긴장을 유지한다.'
    ],
    mistake: '무게를 밀 때 어깨가 앞으로 말리면 삼각근 개입이 커지고 어깨 앞쪽 통증을 유발합니다.'
  },
  { id: 'incline_bench_press', name: '인클라인 바벨 벤치프레스', en: 'Incline Barbell Bench Press', aka: ['인클라인 벤치프레스', '인클라인 바벨 프레스'], part: '가슴', sub: '가슴', equip: '바벨', type: 'weight_reps', rest: 120, tips: [], mistake: '' },
  { id: 'incline_dumbbell_press', name: '인클라인 덤벨 프레스', en: 'Incline Dumbbell Press', aka: ['인클라인 덤벨', '인클라인 덤벨 벤치프레스', '윗가슴 덤벨 프레스'], part: '가슴', sub: '가슴', equip: '덤벨', type: 'weight_reps', rest: 90, tips: ['벤치 각도는 30~45도로 맞춘다.', '어깨뼈를 모으고 가슴을 편 채 덤벨을 쇄골 라인 위로 민다.', '덤벨을 내릴 때 아래팔이 바닥과 수직을 유지하게 한다.'], mistake: '벤치를 너무 높이 세우거나 팔꿈치를 과하게 벌리면 어깨 앞쪽에 부담이 갑니다.' },
  { id: 'chest_press_machine', name: '체스트 프레스 머신', en: 'Chest Press Machine', aka: ['머신 체스트 프레스'], part: '가슴', sub: '가슴', equip: '머신', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'pec_deck_fly', name: '펙덱 플라이', en: 'Pec Deck Fly', aka: ['버터플라이', '머신 플라이'], part: '가슴', sub: '가슴', equip: '머신', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'cable_crossover', name: '케이블 크로스오버', en: 'Cable Crossover', aka: ['케이블 플라이', '스탠딩 케이블 플라이'], part: '가슴', sub: '가슴', equip: '케이블', type: 'weight_reps', rest: 60, tips: ['한 발을 앞으로 내디뎌 상체 중심을 단단히 고정한다.', '팔꿈치를 살짝 굽힌 각도를 유지하며 큰 나무를 안듯 모은다.', '가슴 가운데에서 잠시 수축을 느낀 뒤 천천히 되돌린다.'], mistake: '팔을 뒤로 너무 젖혀 어깨 앞쪽이 과하게 늘어나면 어깨를 다치기 쉽습니다.' },
  { id: 'dips', name: '딥스', en: 'Dips', aka: ['평행봉 딥스'], part: '가슴', sub: '가슴', equip: '맨몸', type: 'reps', rest: 90, tips: [], mistake: '' },
  { id: 'push_up', name: '푸시업', en: 'Push-Up', aka: ['팔굽혀펴기'], part: '가슴', sub: '가슴', equip: '맨몸', type: 'reps', rest: 60, tips: [], mistake: '' },

  // ── 등 ──
  {
    id: 'pull_up', name: '풀업', en: 'Pull-Up',
    aka: ['턱걸이'], part: '등', sub: '등', equip: '맨몸', type: 'reps', rest: 120,
    tips: [
      '매달린 상태에서 어깨를 먼저 아래로 끌어내린(하강) 뒤 당긴다.',
      '가슴 윗부분이 바에 닿는다는 느낌으로 당겨 올라간다.'
    ],
    mistake: '반동을 쓰거나 목을 앞으로 빼면서 턱만 걸치려고 하면 승모근 과긴장과 목 부상을 유발합니다.'
  },
  { id: 'smith_machine_bench_press', name: '스미스 머신 벤치프레스', en: 'Smith Machine Bench Press', aka: ['스미스 벤치프레스', '스미스 플랫 프레스'], part: '가슴', sub: '가슴', equip: '머신', type: 'weight_reps', rest: 120, tips: ['바가 유두 라인 근처에 닿도록 벤치 위치를 맞춘다.', '어깨뼈를 모으고 가슴을 편 채 수직 궤적으로 밀어 올린다.', '손목이 뒤로 꺾이지 않도록 아래팔과 일직선을 유지한다.'], mistake: '벤치 위치가 어긋나면 어깨가 부자연스럽게 꺾여 통증이 생길 수 있습니다.' },
  {
    id: 'straight_arm_pulldown', name: '암풀다운', en: 'Straight-Arm Pulldown',
    aka: ['스트레이트 암 풀다운', '케이블 풀오버'], part: '등', sub: '등', equip: '케이블', type: 'weight_reps', rest: 60,
    tips: [
      '팔꿈치를 살짝 굽혀 고정한 상태에서 광배근 힘으로 바를 허벅지까지 당긴다.',
      '상체를 살짝 숙이고 코어에 힘을 주어 반동을 줄인다.'
    ],
    mistake: '팔꿈치를 접었다 폈다 하면 광배근 대신 삼두근 운동이 되므로 팔 각도를 고정하세요.'
  },
  { id: 'decline_bench_press', name: '디클라인 벤치프레스', en: 'Decline Bench Press', aka: ['아랫가슴 벤치프레스', '디클라인 바벨 프레스'], part: '가슴', sub: '가슴', equip: '바벨', type: 'weight_reps', rest: 120, tips: ['발목 패드에 다리를 단단히 고정하고 어깨뼈를 벤치에 붙인다.', '바벨을 아랫가슴(명치 위쪽) 라인으로 천천히 내린다.', '팔꿈치가 과하게 벌어지지 않게 유지하며 수직으로 민다.'], mistake: '머리가 아래로 향해 바를 랙에 걸 때 놓치기 쉬우니 보조자나 안전바를 꼭 활용해야 합니다.' },
  { id: 'lat_pulldown', name: '랫풀다운', en: 'Lat Pulldown', aka: ['랫 풀 다운', '렛풀다운', '광배 당기기'], part: '등', sub: '등', equip: '머신', type: 'weight_reps', rest: 90, tips: ['어깨너비보다 약간 넓게 바를 잡고 가슴을 천장 쪽으로 든다.', '팔꿈치를 옆구리 아래로 찍어 누른다는 느낌으로 쇄골 앞까지 당긴다.', '바가 올라갈 때 어깨가 귀 쪽으로 딸려 올라가지 않게 긴장을 유지한다.'], mistake: '상체를 뒤로 크게 눕혀 반동으로 당기면 허리에 무리가 가고 광배근 자극이 빠집니다.' },
  { id: 'barbell_row', name: '바벨 로우', en: 'Barbell Row', aka: ['벤트오버 로우', '바벨로우'], part: '등', sub: '등', equip: '바벨', type: 'weight_reps', rest: 120, tips: ['무릎을 살짝 굽히고 엉덩이를 뒤로 빼 상체를 45도 정도 숙인다.', '복압을 단단히 잡은 채 바벨을 배꼽 방향으로 당긴다.', '팔꿈치가 몸통 뒤로 지나가며 등 가운데가 조여지게 한다.'], mistake: '허리가 둥글게 말린 채 무거운 무게를 들면 허리를 다칠 위험이 큽니다.' },
  { id: 'one_arm_dumbbell_row', name: '원암 덤벨 로우', en: 'One-Arm Dumbbell Row', aka: ['덤벨 로우'], part: '등', sub: '등', equip: '덤벨', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'seated_cable_row', name: '시티드 케이블 로우', en: 'Seated Cable Row', aka: ['케이블 로우', '시티드 로우', '앉아서 당기기'], part: '등', sub: '등', equip: '케이블', type: 'weight_reps', rest: 90, tips: ['허리를 곧게 세우고 가슴을 편 채 손잡이를 잡는다.', '어깨가 솟지 않게 내린 채 명치 아래쪽으로 당긴다.', '돌아갈 때 상체가 앞으로 딸려가지 않게 버틴다.'], mistake: '상체를 앞뒤로 크게 흔들며 반동을 쓰면 허리 통증이 생기기 쉽습니다.' },
  { id: 'dumbbell_shrug', name: '덤벨 슈러그', en: 'Dumbbell Shrug', aka: ['슈러그', '승모'], part: '등', sub: '승모근', equip: '덤벨', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'back_extension', name: '백 익스텐션', en: 'Back Extension', aka: ['하이퍼 익스텐션', '허리'], part: '등', sub: '허리', equip: '맨몸', type: 'reps', rest: 60, tips: [], mistake: '' },
  { id: 'deadlift', name: '데드리프트', en: 'Deadlift', aka: ['컨벤셔널 데드리프트'], part: '등', sub: '등', equip: '바벨', type: 'weight_reps', rest: 180, tips: [], mistake: '' },

  // ── 하체 ──
  {
    id: 'low_bar_squat', name: '로우바 스쿼트', en: 'Low-Bar Squat',
    aka: ['바벨 스쿼트', '백 스쿼트'], part: '하체', sub: '허벅지', equip: '바벨', type: 'weight_reps', rest: 150,
    tips: [
      '승모근 아래 후면 삼각근 선반에 바를 견고하게 얹는다.',
      '복압을 단단히 잡은 상태에서 고관절과 무릎을 동시에 접어 내려간다.'
    ],
    mistake: '무릎이 안쪽으로 모이거나(knee valgus) 허리가 둥글게 말리지 않도록 주의하세요.'
  },
  { id: 'good_morning', name: '굿모닝', en: 'Good Morning', aka: ['바벨 굿모닝'], part: '등', sub: '허리', equip: '바벨', type: 'weight_reps', rest: 120, tips: ['스쿼트처럼 바를 승모근 위에 얹고 무릎을 살짝 굽힌다.', '허리를 곧게 편 채 엉덩이를 뒤로 밀며 인사하듯 상체를 숙인다.', '햄스트링과 허리 근육의 긴장을 느끼며 엉덩이를 밀어 일어난다.'], mistake: '무거운 무게로 허리가 둥글게 말린 채 숙이면 허리를 크게 다칠 수 있습니다.' },
  { id: 'barbell_shrug', name: '바벨 슈러그', en: 'Barbell Shrug', aka: ['승모근 바벨 슈러그'], part: '등', sub: '승모근', equip: '바벨', type: 'weight_reps', rest: 90, tips: ['어깨너비로 바벨을 잡고 팔꿈치를 편 상태를 유지한다.', '어깨를 귀 쪽으로 수직으로 끌어올려 1초 멈춘다.', '승모근의 긴장을 느끼며 천천히 어깨를 내린다.'], mistake: '어깨를 앞뒤로 둥글게 돌리며 올리면 어깨 관절에 불필요한 부담을 줍니다.' },
  { id: 't_bar_row', name: '티바 로우', en: 'T-Bar Row', aka: ['T바 로우', '티바로우'], part: '등', sub: '등', equip: '머신', type: 'weight_reps', rest: 120, tips: ['가슴 패드가 있으면 명치를 대고, 서서 하면 상체를 45도 정도 숙인다.', '어깨가 솟지 않게 내린 채 팔꿈치를 등 뒤로 당긴다.', '등 가운데가 조여지는 지점에서 잠시 멈췄다 내린다.'], mistake: '반동을 쓰며 상체를 세워 당기면 등 자극이 빠지고 허리에 무리가 갑니다.' },
  { id: 'dumbbell_fly', name: '덤벨 플라이', en: 'Dumbbell Fly', aka: ['플랫 덤벨 플라이', '가슴 덤벨 플라이'], part: '가슴', sub: '가슴', equip: '덤벨', type: 'weight_reps', rest: 90, tips: ['양손에 덤벨을 하나씩 잡고 팔꿈치를 살짝 굽힌 각도를 끝까지 고정한다.', '큰 나무를 안는 느낌으로 가슴을 늘리며 천천히 벌린다.', '덤벨끼리 부딪히기 직전까지만 모아 가슴 긴장을 유지한다.'], mistake: '팔을 너무 깊게 내리면 어깨 앞쪽에 무리가 갑니다.' },
  {
    id: 'leg_extension', name: '레그 익스텐션', en: 'Leg Extension',
    aka: ['레그익스텐션'], part: '하체', sub: '허벅지', equip: '머신', type: 'weight_reps', rest: 60,
    tips: [
      '무릎 관절 축과 머신의 회전축을 정확히 일치시킨다.',
      '관절 보호를 위해 무릎을 100% 끝까지 튕기듯 펴지 않고 약 95% 지점까지 수축한다.'
    ],
    mistake: '엉덩이가 시트에서 들릴 정도로 반동을 쓰면 무릎 인대에 무리가 갑니다.'
  },
  { id: 'machine_shrug', name: '머신 슈러그', en: 'Machine Shrug', aka: ['스미스 슈러그', '슈러그 머신'], part: '등', sub: '승모근', equip: '머신', type: 'weight_reps', rest: 90, tips: ['손잡이를 잡고 가슴을 편 채 상체를 곧게 세운다.', '팔을 굽히지 말고 어깨만 수직 위쪽으로 끌어올린다.', '맨 위에서 승모근을 조인 뒤 무게가 떨어지지 않게 내린다.'], mistake: '목을 앞으로 빼면서 어깨를 올리면 목 주변이 긴장해 통증이 생길 수 있습니다.' },
  { id: 'assisted_pull_up_machine', name: '어시스트 풀업 머신', en: 'Assisted Pull-Up Machine', aka: ['어시스트 턱걸이', '머신 풀업'], part: '등', sub: '등', equip: '머신', type: 'weight_reps', rest: 90, tips: ['기록하는 무게는 체중을 받쳐 주는 보조 무게다(클수록 쉬움).', '무릎 패드에 올라선 뒤 어깨를 먼저 아래로 내리고 가슴을 든다.', '팔꿈치를 옆구리 아래로 찍어 누르듯 쇄골 쪽으로 당긴다.'], mistake: '내려올 때 반동으로 튕기듯 올라가면 운동 효과가 떨어지고 어깨에 무리가 갈 수 있습니다.' },
  { id: 'leg_press', name: '레그 프레스', en: 'Leg Press', aka: ['레그프레스'], part: '하체', sub: '허벅지', equip: '머신', type: 'weight_reps', rest: 120, tips: [], mistake: '' },
  { id: 'romanian_deadlift', name: '루마니안 데드리프트', en: 'Romanian Deadlift', aka: ['RDL', '바벨 루마니안 데드리프트'], part: '하체', sub: '허벅지', equip: '바벨', type: 'weight_reps', rest: 120, tips: ['바벨을 허벅지에 스치듯 붙인 채 엉덩이를 뒤로 밀며 내려간다.', '무릎은 살짝만 굽히고 허리 중립을 끝까지 유지한다.', '햄스트링이 팽팽해지는 지점에서 엉덩이를 앞으로 밀며 일어난다.'], mistake: '바벨이 몸에서 멀어지거나 허리가 굽으면 허리에 큰 부담이 갑니다.' },
  { id: 'lying_leg_curl', name: '라잉 레그 컬', en: 'Lying Leg Curl', aka: ['레그 컬', '레그컬', '햄스트링 컬'], part: '하체', sub: '허벅지', equip: '머신', type: 'weight_reps', rest: 60, tips: ['무릎이 벤치 끝에 오고 머신 회전축과 맞도록 엎드린다.', '발목을 몸쪽으로 당긴 채 뒤꿈치를 엉덩이 쪽으로 끌어당긴다.', '내릴 때 무게가 툭 떨어지지 않게 천천히 버티며 내린다.'], mistake: '당길 때 엉덩이가 패드에서 들리면 허리가 꺾여 요통이 생길 수 있습니다.' },
  { id: 'dumbbell_lunge', name: '덤벨 런지', en: 'Dumbbell Lunge', aka: ['런지', '워킹 런지'], part: '하체', sub: '허벅지', equip: '덤벨', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'bulgarian_split_squat', name: '불가리안 스플릿 스쿼트', en: 'Bulgarian Split Squat', aka: ['불스스', '스플릿 스쿼트'], part: '하체', sub: '허벅지', equip: '덤벨', type: 'weight_reps', rest: 90, tips: ['뒷발 등을 벤치에 올리고 앞발은 보폭을 넉넉히 앞으로 뺀다.', '상체를 살짝 숙인 채 앞다리 고관절과 무릎을 접어 아래로 앉는다.', '앞발 뒤꿈치로 바닥을 강하게 밀며 일어난다.'], mistake: '앞무릎이 안쪽으로 무너지거나 앞발 뒤꿈치가 들리면 무릎에 무리가 갑니다.' },
  { id: 'hip_thrust', name: '힙 쓰러스트', en: 'Hip Thrust', aka: ['바벨 힙 쓰러스트', '엉덩이'], part: '하체', sub: '엉덩이', equip: '바벨', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'hip_abduction', name: '힙 어브덕션', en: 'Hip Abduction Machine', aka: ['어브덕션', '엉덩이'], part: '하체', sub: '엉덩이', equip: '머신', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'calf_raise', name: '카프 레이즈', en: 'Calf Raise', aka: ['종아리'], part: '하체', sub: '종아리', equip: '머신', type: 'weight_reps', rest: 60, tips: [], mistake: '' },

  // ── 어깨 ──
  {
    id: 'overhead_press', name: '오버헤드 프레스', en: 'Overhead Press',
    aka: ['바벨 숄더프레스', '밀리터리 프레스', 'OHP'], part: '어깨', sub: '어깨', equip: '바벨', type: 'weight_reps', rest: 120,
    tips: [
      '둔근과 복부에 힘을 꽉 주어 허리가 과도하게 젖혀지지 않게 고정한다.',
      '바가 얼굴을 스치듯 수직으로 올라가며 머리 위로 통과할 때 상체를 살짝 밀어 넣는다.'
    ],
    mistake: '허리를 뒤로 심하게 꺾으며 밀어 올리면 요추에 강한 압박이 가해집니다.'
  },
  { id: 'row_machine', name: '로우 머신', en: 'Chest-Supported Row Machine', aka: ['시티드 로우 머신', '플레이트 로드 로우'], part: '등', sub: '등', equip: '머신', type: 'weight_reps', rest: 90, tips: ['명치가 가슴 패드 위쪽에 오도록 의자 높이를 맞춘다.', '가슴을 패드에 붙인 채 팔꿈치를 뒤로 깊게 당긴다.', '돌아갈 때 어깨가 앞으로 말리지 않게 긴장을 유지한다.'], mistake: '당길 때 가슴이 패드에서 떨어지면 허리 반동을 쓰게 되어 등 자극이 줄어듭니다.' },
  { id: 'one_arm_cable_row', name: '원암 케이블 로우', en: 'One-Arm Cable Row', aka: ['싱글암 케이블 로우', '한손 케이블 로우'], part: '등', sub: '등', equip: '케이블', type: 'weight_reps', rest: 60, tips: ['한 손으로 손잡이를 잡고 반대손으로 기둥이나 허벅지를 짚어 몸을 고정한다.', '팔꿈치를 옆구리에 스치듯 붙이며 골반 쪽으로 당긴다.', '광배근이 늘어나는 느낌을 받으며 천천히 되돌린다.'], mistake: '몸통을 과하게 비틀며 당기면 등 대신 허리와 팔 힘으로 당기게 됩니다.' },
  { id: 'dumbbell_shoulder_press', name: '덤벨 숄더 프레스', en: 'Dumbbell Shoulder Press', aka: ['덤벨 숄더프레스'], part: '어깨', sub: '어깨', equip: '덤벨', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'shoulder_press_machine', name: '숄더 프레스 머신', en: 'Shoulder Press Machine', aka: ['머신 숄더프레스'], part: '어깨', sub: '어깨', equip: '머신', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'lateral_raise', name: '사이드 레터럴 레이즈', en: 'Lateral Raise', aka: ['레터럴 레이즈', '사레레', '덤벨 레터럴 레이즈'], part: '어깨', sub: '어깨', equip: '덤벨', type: 'weight_reps', rest: 60, tips: ['상체를 살짝 숙이고 팔꿈치를 약간 굽힌 채 고정한다.', '위로 든다기보다 양옆 벽을 향해 멀리 보낸다는 느낌으로 올린다.', '어깨 높이까지만 올리고 긴장을 유지하며 천천히 내린다.'], mistake: '어깨를 귀 쪽으로 으쓱하며 올리면 승모근만 쓰이고 어깨에 무리가 갑니다.' },
  { id: 'rear_delt_fly', name: '리어 델트 플라이', en: 'Rear Delt Fly', aka: ['리버스 펙덱', '후면 삼각근'], part: '어깨', sub: '어깨', equip: '머신', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'face_pull', name: '페이스 풀', en: 'Face Pull', aka: ['페이스풀', '케이블 페이스풀'], part: '어깨', sub: '어깨', equip: '케이블', type: 'weight_reps', rest: 60, tips: ['도르래를 눈높이로 맞추고 로프를 양손으로 잡는다.', '로프를 이마 쪽으로 당기며 엄지가 뒤를 향하도록 팔을 바깥으로 돌린다.', '후면 어깨와 날개뼈 사이가 조여지는 지점에서 1초 멈춘다.'], mistake: '무게가 너무 무거워 허리를 뒤로 젖히면 후면 어깨 자극이 사라지고 허리를 다칠 수 있습니다.' },
  { id: 'cable_lateral_raise', name: '케이블 레터럴 레이즈', en: 'Cable Lateral Raise', aka: ['케이블 사레레', '원암 케이블 레터럴'], part: '어깨', sub: '어깨', equip: '케이블', type: 'weight_reps', rest: 60, tips: ['케이블이 몸 앞이나 뒤로 지나가게 잡고 팔꿈치를 살짝 굽힌다.', '어깨를 내린 채 팔꿈치를 옆으로 멀리 보낸다는 느낌으로 든다.', '손이 어깨 높이에 오면 잠시 멈췄다 버티며 내린다.'], mistake: '어깨를 으쓱하며 반동으로 당기면 측면 어깨 자극이 사라지고 목이 뻐근해집니다.' },
  { id: 'machine_lateral_raise', name: '머신 레터럴 레이즈', en: 'Machine Lateral Raise', aka: ['사레레 머신', '레터럴 레이즈 머신'], part: '어깨', sub: '어깨', equip: '머신', type: 'weight_reps', rest: 60, tips: ['어깨 관절과 머신 회전축이 일직선이 되도록 의자를 맞춘다.', '손잡이보다 팔꿈치 패드를 바깥으로 밀어낸다는 느낌으로 올린다.', '어깨 높이까지만 들고 긴장을 풀지 않고 내린다.'], mistake: '패드를 어깨보다 너무 높이 들면 어깨에 무리가 갑니다.' },
  { id: 'arnold_press', name: '아놀드 프레스', en: 'Arnold Press', aka: ['덤벨 아놀드 프레스', '회전 숄더프레스'], part: '어깨', sub: '어깨', equip: '덤벨', type: 'weight_reps', rest: 90, tips: ['양손에 덤벨을 쥐고 손바닥이 얼굴을 보게 턱 앞에 둔다.', '밀어 올리면서 손바닥이 앞을 보도록 바깥쪽으로 돌린다.', '내릴 때는 반대로 손바닥이 다시 얼굴을 향하게 천천히 접어 내린다.'], mistake: '허리를 뒤로 젖히며 반동으로 밀면 어깨와 허리에 함께 무리가 갑니다.' },
  { id: 'upright_row', name: '업라이트 로우', en: 'Upright Row', aka: ['바벨 업라이트 로우'], part: '어깨', sub: '어깨', equip: '바벨', type: 'weight_reps', rest: 90, tips: ['어깨너비보다 약간 넓게 바를 잡고 몸에 스치듯 수직으로 당긴다.', '손목이 꺾이지 않게 하고 팔꿈치가 손보다 높게 올라가게 한다.', '바가 명치와 쇄골 사이 높이에 오면 멈추고 천천히 내린다.'], mistake: '그립을 너무 좁게 잡고 턱 끝까지 높이 당기면 어깨에 무리가 가기 쉽습니다.' },

  // ── 팔 ──
  { id: 'barbell_curl', name: '바벨 컬', en: 'Barbell Curl', aka: ['이두 컬', '바벨컬', '스탠딩 바벨컬'], part: '팔', sub: '이두', equip: '바벨', type: 'weight_reps', rest: 60, tips: ['팔꿈치를 옆구리에 고정하고 손바닥이 앞을 보게 바를 잡는다.', '손목이 뒤로 꺾이지 않게 고정한 채 이두 힘으로 들어 올린다.', '내릴 때 팔꿈치를 튕기듯 완전히 펴지 않고 긴장을 유지한다.'], mistake: '상체 반동을 쓰거나 팔꿈치가 앞뒤로 흔들리면 어깨가 개입하고 팔꿈치에 무리가 갑니다.' },
  { id: 'dumbbell_curl', name: '덤벨 컬', en: 'Dumbbell Curl', aka: ['이두'], part: '팔', sub: '이두', equip: '덤벨', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'hammer_curl', name: '해머 컬', en: 'Hammer Curl', aka: ['해머컬'], part: '팔', sub: '이두', equip: '덤벨', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'preacher_curl', name: '프리처 컬', en: 'Preacher Curl', aka: ['바벨 프리처 컬', '이지바 프리처 컬'], part: '팔', sub: '이두', equip: '바벨', type: 'weight_reps', rest: 60, tips: ['겨드랑이를 프리처 패드 위쪽에 빈틈없이 붙여 상체를 고정한다.', '팔꿈치가 패드에서 뜨지 않게 누른 채 이두 힘으로 감아 올린다.', '내릴 때 팔꿈치를 튕기듯 완전히 펴지 않고 살짝 굽힌 곳에서 멈춘다.'], mistake: '맨 아래에서 팔꿈치를 튕기듯 끝까지 펴면 이두 힘줄과 팔꿈치에 무리가 갑니다.' },
  { id: 'cable_curl', name: '케이블 컬', en: 'Cable Curl', aka: ['케이블 바이셉스 컬', '케이블 이두 컬'], part: '팔', sub: '이두', equip: '케이블', type: 'weight_reps', rest: 60, tips: ['도르래를 가장 아래로 내리고 팔꿈치를 옆구리에 고정한다.', '손목이 뒤로 젖혀지지 않게 유지하며 바를 감아 올린다.', '내릴 때도 케이블 저항을 끝까지 버티며 천천히 푼다.'], mistake: '상체를 뒤로 젖히거나 팔꿈치가 앞으로 나오면 어깨가 개입해 이두 자극이 줄어듭니다.' },
  { id: 'incline_dumbbell_curl', name: '인클라인 덤벨 컬', en: 'Incline Dumbbell Curl', aka: ['인클라인 컬', '인클라인 덤벨 이두 컬'], part: '팔', sub: '이두', equip: '덤벨', type: 'weight_reps', rest: 60, tips: ['벤치를 45~60도로 세우고 등을 패드에 완전히 기댄다.', '양손에 덤벨을 쥐고 팔이 아래로 곧게 늘어진 상태에서 시작한다.', '팔꿈치가 앞으로 빠지지 않게 고정한 채 이두를 수축한다.'], mistake: '내릴 때 팔을 튕기듯 세게 펴면 어깨 앞쪽과 팔꿈치에 무리가 갑니다.' },
  { id: 'triceps_pushdown', name: '케이블 푸시다운', en: 'Triceps Pushdown', aka: ['트라이셉스 푸시다운', '삼두', '케이블 삼두'], part: '팔', sub: '삼두', equip: '케이블', type: 'weight_reps', rest: 60, tips: ['팔꿈치를 옆구리에 단단히 붙이고 아래팔만 움직여 아래로 민다.', '맨 아래에서 팔을 완전히 펴 삼두를 강하게 수축한다.', '손잡이가 올라갈 때 팔꿈치가 따라 올라가지 않게 고정한다.'], mistake: '어깨가 앞으로 말린 채 체중으로 눌러 내리면 삼두 자극이 줄고 어깨 앞쪽에 부담이 갑니다.' },
  { id: 'overhead_triceps_extension', name: '오버헤드 트라이셉스 익스텐션', en: 'Overhead Triceps Extension', aka: ['삼두 익스텐션'], part: '팔', sub: '삼두', equip: '덤벨', type: 'weight_reps', rest: 60, vmul: 1, tips: [], mistake: '' },
  { id: 'lying_triceps_extension', name: '라잉 트라이셉스 익스텐션', en: 'Lying Triceps Extension', aka: ['스컬 크러셔', '라잉 트라이셉스'], part: '팔', sub: '삼두', equip: '바벨', type: 'weight_reps', rest: 90, tips: ['벤치에 누워 팔을 천장으로 뻗은 뒤 머리 쪽으로 살짝 기울인다.', '팔꿈치 간격이 벌어지지 않게 고정하고 아래팔만 접어 바를 내린다.', '삼두가 충분히 늘어나면 팔꿈치를 펴며 시작 위치로 밀어 올린다.'], mistake: '팔꿈치가 바깥으로 크게 벌어지면 삼두 자극이 줄고 팔꿈치에 통증이 생길 수 있습니다.' },
  { id: 'close_grip_bench_press', name: '클로즈그립 벤치프레스', en: 'Close-Grip Bench Press', aka: ['내로우 그립 벤치프레스', '삼두 벤치프레스'], part: '팔', sub: '삼두', equip: '바벨', type: 'weight_reps', rest: 90, tips: ['어깨너비 정도로 바벨을 잡고 손목이 꺾이지 않게 단단히 쥔다.', '팔꿈치를 몸통 옆에 가깝게 붙인 채 명치 쪽으로 바를 내린다.', '삼두 힘으로 팔꿈치를 펴며 수직으로 밀어 올린다.'], mistake: '양손을 너무 좁게 붙여 잡으면 손목과 팔꿈치가 꺾여 다치기 쉽습니다.' },
  { id: 'cable_overhead_triceps_extension', name: '케이블 오버헤드 트라이셉스 익스텐션', en: 'Cable Overhead Triceps Extension', aka: ['케이블 오버헤드 익스텐션', '로프 오버헤드 익스텐션'], part: '팔', sub: '삼두', equip: '케이블', type: 'weight_reps', rest: 60, tips: ['케이블을 등지고 서서 한 발을 앞으로 내딛고 상체를 살짝 숙인다.', '팔꿈치를 머리 옆에 고정한 채 아래팔만 앞으로 뻗어 삼두를 조인다.', '팔꿈치를 머리 뒤로 접을 때 삼두가 늘어나는 것을 느낀다.'], mistake: '허리가 과하게 꺾이거나 팔꿈치가 옆으로 벌어지면 삼두 자극이 흩어지고 허리에 부담이 갑니다.' },


  { id: 'wrist_curl', name: '리스트 컬', en: 'Wrist Curl', aka: ['손목 컬', '전완'], part: '팔', sub: '전완', equip: '덤벨', type: 'weight_reps', rest: 45, tips: [], mistake: '' },

  // ── 코어 ──
  { id: 'plank', name: '플랭크', en: 'Plank', aka: ['프론트 플랭크', '코어 버티기'], part: '코어', sub: '복부', equip: '맨몸', type: 'time', rest: 60, tips: ['팔꿈치를 어깨 바로 아래에 두고 머리부터 발뒤꿈치까지 일직선을 만든다.', '배꼽을 등 쪽으로 당기고 엉덩이에 힘을 주어 골반을 고정한다.', '숨을 참지 말고 일정하게 호흡한다.'], mistake: '코어 힘이 풀려 허리가 아래로 꺼지면 허리에 큰 부담이 갑니다.' },
  { id: 'hanging_leg_raise', name: '행잉 레그 레이즈', en: 'Hanging Leg Raise', aka: ['레그 레이즈'], part: '코어', sub: '복부', equip: '맨몸', type: 'reps', rest: 60, tips: [], mistake: '' },
  { id: 'crunch', name: '크런치', en: 'Crunch', aka: ['윗몸 일으키기', '복근 크런치'], part: '코어', sub: '복부', equip: '맨몸', type: 'reps', rest: 45, tips: ['무릎을 세우고 누워 허리를 바닥에 붙인다.', '상체를 끝까지 일으키지 않고 어깨뼈가 바닥에서 떨어질 만큼만 말아 올린다.', '올라갈 때 숨을 강하게 내쉬며 윗배를 조인다.'], mistake: '양손으로 뒷목을 세게 잡아당기면 목에 무리가 갑니다.' },
  { id: 'cable_crunch', name: '케이블 크런치', en: 'Cable Crunch', aka: [], part: '코어', sub: '복부', equip: '케이블', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'ab_rollout', name: 'AB 롤아웃', en: 'Ab Wheel Rollout', aka: ['AB 슬라이드', '복근 휠'], part: '코어', sub: '복부', equip: '기타', type: 'reps', rest: 60, tips: [], mistake: '' },

  // ── 유산소 ──
  { id: 'treadmill', name: '러닝머신', en: 'Treadmill', aka: ['트레드밀', '달리기', '러닝', '러닝머신 걷기'], part: '유산소', equip: '머신', type: 'distance_time', rest: 0, tips: ['시선은 정면, 가슴을 편 채 팔을 자연스럽게 앞뒤로 흔든다.', '발뒤꿈치부터 발바닥 가운데, 앞꿈치 순서로 부드럽게 딛는다.', '경사를 올려도 손잡이에 매달리지 않고 걷는다.'], mistake: '손잡이를 꽉 잡고 몸을 뒤로 기댄 채 걸으면 운동 효과가 떨어지고 손목·허리에 무리가 갑니다.' },
  { id: 'stationary_bike', name: '실내 사이클', en: 'Stationary Bike', aka: ['자전거', '사이클'], part: '유산소', equip: '머신', type: 'distance_time', rest: 0, tips: [], mistake: '' },
  { id: 'stair_climber', name: '스텝밀', en: 'Stair Climber', aka: ['천국의 계단', '계단 오르기'], part: '유산소', equip: '머신', type: 'distance_time', rest: 0, tips: [], mistake: '' },
  { id: 'rowing_machine', name: '로잉머신', en: 'Rowing Machine', aka: ['로잉'], part: '유산소', equip: '머신', type: 'distance_time', rest: 0, tips: [], mistake: '' },
  { id: 'walking', name: '걷기', en: 'Walking', aka: ['산책', '인클라인 워킹'], part: '유산소', equip: '맨몸', type: 'distance_time', rest: 0, tips: [], mistake: '' }
];
