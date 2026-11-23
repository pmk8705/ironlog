/* IronLog 기본 종목 목록 (앱 코드와 분리된 데이터 파일)
 * 형식: { id, name, en, aka[], part, equip, type, rest(초), tips[], mistake }
 *  part : 가슴 / 등 / 하체 / 어깨 / 팔 / 코어 / 유산소
 *  equip: 바벨 / 덤벨 / 머신 / 케이블 / 맨몸 / 기타
 *  type : weight_reps(무게+횟수) / reps(횟수) / time(초) / distance_time(분+km)
 * tips·mistake가 비어 있는 종목은 Gemini(ironlog-trainer)가 나중에 채운다.
 */
window.IRONLOG_EXERCISES = [
  // ── 가슴 ──
  {
    id: 'barbell_bench_press', name: '벤치프레스', en: 'Barbell Bench Press',
    aka: ['바벨 벤치프레스', '플랫 벤치프레스'], part: '가슴', equip: '바벨', type: 'weight_reps', rest: 120,
    tips: [
      '견갑골을 후인·하강하여 가슴을 열고 아치를 유지한다.',
      '바벨을 내릴 때 팔꿈치 각도가 몸통과 45~60도 정도가 되게 한다.',
      '발바닥으로 지면을 단단히 밀어내며 수직에 가깝게 밀어 올린다.'
    ],
    mistake: '팔꿈치를 옆으로 너무 벌리면(90도) 어깨 충돌과 팔꿈치 힘줄 부상 위험이 큽니다.'
  },
  {
    id: 'dumbbell_bench_press', name: '덤벨 벤치프레스', en: 'Dumbbell Bench Press',
    aka: ['덤벨 프레스'], part: '가슴', equip: '덤벨', type: 'weight_reps', rest: 90,
    tips: [
      '손목이 뒤로 꺾이지 않도록 전완근과 수직을 유지한다.',
      '이완 시 가슴 근육이 늘어나는 느낌을 받으며 천천히 내린다.'
    ],
    mistake: '세트가 끝난 뒤 무거운 덤벨을 팔을 뻗은 채 바닥에 떨어뜨리면 어깨 관절이 다칠 수 있습니다.'
  },
  {
    id: 'incline_chest_press_machine', name: '인클라인 체스트 프레스 머신', en: 'Incline Chest Press Machine',
    aka: ['인클라인 프레스 머신'], part: '가슴', equip: '머신', type: 'weight_reps', rest: 90,
    tips: [
      '손잡이가 쇄골 아래쪽(윗가슴 라인)에 오도록 의자 높이를 조절한다.',
      '팔꿈치를 완전히 잠그기 직전까지만 밀어 윗가슴 긴장을 유지한다.'
    ],
    mistake: '무게를 밀 때 어깨가 앞으로 말리면 삼각근 개입이 커지고 어깨 앞쪽 통증을 유발합니다.'
  },
  { id: 'incline_bench_press', name: '인클라인 벤치프레스', en: 'Incline Barbell Bench Press', aka: ['인클라인 바벨 프레스'], part: '가슴', equip: '바벨', type: 'weight_reps', rest: 120, tips: [], mistake: '' },
  { id: 'incline_dumbbell_press', name: '인클라인 덤벨 프레스', en: 'Incline Dumbbell Press', aka: ['인클라인 덤벨'], part: '가슴', equip: '덤벨', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'chest_press_machine', name: '체스트 프레스 머신', en: 'Chest Press Machine', aka: ['머신 체스트 프레스'], part: '가슴', equip: '머신', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'pec_deck_fly', name: '펙덱 플라이', en: 'Pec Deck Fly', aka: ['버터플라이', '머신 플라이'], part: '가슴', equip: '머신', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'cable_crossover', name: '케이블 크로스오버', en: 'Cable Crossover', aka: ['케이블 플라이'], part: '가슴', equip: '케이블', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'dips', name: '딥스', en: 'Dips', aka: ['평행봉 딥스'], part: '가슴', equip: '맨몸', type: 'reps', rest: 90, tips: [], mistake: '' },
  { id: 'push_up', name: '푸시업', en: 'Push-Up', aka: ['팔굽혀펴기'], part: '가슴', equip: '맨몸', type: 'reps', rest: 60, tips: [], mistake: '' },

  // ── 등 ──
  {
    id: 'pull_up', name: '풀업', en: 'Pull-Up',
    aka: ['턱걸이'], part: '등', equip: '맨몸', type: 'reps', rest: 120,
    tips: [
      '매달린 상태에서 어깨를 먼저 아래로 끌어내린(하강) 뒤 당긴다.',
      '가슴 윗부분이 바에 닿는다는 느낌으로 당겨 올라간다.'
    ],
    mistake: '반동을 쓰거나 목을 앞으로 빼면서 턱만 걸치려고 하면 승모근 과긴장과 목 부상을 유발합니다.'
  },
  {
    id: 'straight_arm_pulldown', name: '암풀다운', en: 'Straight-Arm Pulldown',
    aka: ['스트레이트 암 풀다운', '케이블 풀오버'], part: '등', equip: '케이블', type: 'weight_reps', rest: 60,
    tips: [
      '팔꿈치를 살짝 굽혀 고정한 상태에서 광배근 힘으로 바를 허벅지까지 당긴다.',
      '상체를 살짝 숙이고 코어에 힘을 주어 반동을 줄인다.'
    ],
    mistake: '팔꿈치를 접었다 폈다 하면 광배근 대신 삼두근 운동이 되므로 팔 각도를 고정하세요.'
  },
  { id: 'lat_pulldown', name: '랫풀다운', en: 'Lat Pulldown', aka: ['랫 풀 다운'], part: '등', equip: '머신', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'barbell_row', name: '바벨 로우', en: 'Barbell Row', aka: ['벤트오버 로우'], part: '등', equip: '바벨', type: 'weight_reps', rest: 120, tips: [], mistake: '' },
  { id: 'one_arm_dumbbell_row', name: '원암 덤벨 로우', en: 'One-Arm Dumbbell Row', aka: ['덤벨 로우'], part: '등', equip: '덤벨', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'seated_cable_row', name: '시티드 케이블 로우', en: 'Seated Cable Row', aka: ['케이블 로우', '시티드 로우'], part: '등', equip: '케이블', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'deadlift', name: '데드리프트', en: 'Deadlift', aka: ['컨벤셔널 데드리프트'], part: '등', equip: '바벨', type: 'weight_reps', rest: 180, tips: [], mistake: '' },

  // ── 하체 ──
  {
    id: 'low_bar_squat', name: '로우바 스쿼트', en: 'Low-Bar Squat',
    aka: ['바벨 스쿼트', '백 스쿼트'], part: '하체', equip: '바벨', type: 'weight_reps', rest: 150,
    tips: [
      '승모근 아래 후면 삼각근 선반에 바를 견고하게 얹는다.',
      '복압을 단단히 잡은 상태에서 고관절과 무릎을 동시에 접어 내려간다.'
    ],
    mistake: '무릎이 안쪽으로 모이거나(knee valgus) 허리가 둥글게 말리지 않도록 주의하세요.'
  },
  {
    id: 'leg_extension', name: '레그 익스텐션', en: 'Leg Extension',
    aka: ['레그익스텐션'], part: '하체', equip: '머신', type: 'weight_reps', rest: 60,
    tips: [
      '무릎 관절 축과 머신의 회전축을 정확히 일치시킨다.',
      '관절 보호를 위해 무릎을 100% 끝까지 튕기듯 펴지 않고 약 95% 지점까지 수축한다.'
    ],
    mistake: '엉덩이가 시트에서 들릴 정도로 반동을 쓰면 무릎 인대에 무리가 갑니다.'
  },
  { id: 'leg_press', name: '레그 프레스', en: 'Leg Press', aka: ['레그프레스'], part: '하체', equip: '머신', type: 'weight_reps', rest: 120, tips: [], mistake: '' },
  { id: 'romanian_deadlift', name: '루마니안 데드리프트', en: 'Romanian Deadlift', aka: ['RDL'], part: '하체', equip: '바벨', type: 'weight_reps', rest: 120, tips: [], mistake: '' },
  { id: 'lying_leg_curl', name: '라잉 레그 컬', en: 'Lying Leg Curl', aka: ['레그 컬', '레그컬'], part: '하체', equip: '머신', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'dumbbell_lunge', name: '덤벨 런지', en: 'Dumbbell Lunge', aka: ['런지', '워킹 런지'], part: '하체', equip: '덤벨', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'bulgarian_split_squat', name: '불가리안 스플릿 스쿼트', en: 'Bulgarian Split Squat', aka: ['불스스'], part: '하체', equip: '덤벨', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'hip_thrust', name: '힙 쓰러스트', en: 'Hip Thrust', aka: ['바벨 힙 쓰러스트', '엉덩이'], part: '하체', equip: '바벨', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'calf_raise', name: '카프 레이즈', en: 'Calf Raise', aka: ['종아리'], part: '하체', equip: '머신', type: 'weight_reps', rest: 60, tips: [], mistake: '' },

  // ── 어깨 ──
  {
    id: 'overhead_press', name: '오버헤드 프레스', en: 'Overhead Press',
    aka: ['바벨 숄더프레스', '밀리터리 프레스', 'OHP'], part: '어깨', equip: '바벨', type: 'weight_reps', rest: 120,
    tips: [
      '둔근과 복부에 힘을 꽉 주어 허리가 과도하게 젖혀지지 않게 고정한다.',
      '바가 얼굴을 스치듯 수직으로 올라가며 머리 위로 통과할 때 상체를 살짝 밀어 넣는다.'
    ],
    mistake: '허리를 뒤로 심하게 꺾으며 밀어 올리면 요추에 강한 압박이 가해집니다.'
  },
  { id: 'dumbbell_shoulder_press', name: '덤벨 숄더 프레스', en: 'Dumbbell Shoulder Press', aka: ['덤벨 숄더프레스'], part: '어깨', equip: '덤벨', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'shoulder_press_machine', name: '숄더 프레스 머신', en: 'Shoulder Press Machine', aka: ['머신 숄더프레스'], part: '어깨', equip: '머신', type: 'weight_reps', rest: 90, tips: [], mistake: '' },
  { id: 'lateral_raise', name: '사이드 레터럴 레이즈', en: 'Lateral Raise', aka: ['레터럴 레이즈', '사레레'], part: '어깨', equip: '덤벨', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'rear_delt_fly', name: '리어 델트 플라이', en: 'Rear Delt Fly', aka: ['리버스 펙덱', '후면 삼각근'], part: '어깨', equip: '머신', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'face_pull', name: '페이스 풀', en: 'Face Pull', aka: ['페이스풀'], part: '어깨', equip: '케이블', type: 'weight_reps', rest: 60, tips: [], mistake: '' },

  // ── 팔 ──
  { id: 'barbell_curl', name: '바벨 컬', en: 'Barbell Curl', aka: ['이두 컬'], part: '팔', equip: '바벨', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'dumbbell_curl', name: '덤벨 컬', en: 'Dumbbell Curl', aka: ['이두'], part: '팔', equip: '덤벨', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'hammer_curl', name: '해머 컬', en: 'Hammer Curl', aka: ['해머컬'], part: '팔', equip: '덤벨', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'triceps_pushdown', name: '케이블 푸시다운', en: 'Triceps Pushdown', aka: ['트라이셉스 푸시다운', '삼두'], part: '팔', equip: '케이블', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'overhead_triceps_extension', name: '오버헤드 트라이셉스 익스텐션', en: 'Overhead Triceps Extension', aka: ['삼두 익스텐션'], part: '팔', equip: '덤벨', type: 'weight_reps', rest: 60, tips: [], mistake: '' },

  // ── 코어 ──
  { id: 'plank', name: '플랭크', en: 'Plank', aka: [], part: '코어', equip: '맨몸', type: 'time', rest: 60, tips: [], mistake: '' },
  { id: 'hanging_leg_raise', name: '행잉 레그 레이즈', en: 'Hanging Leg Raise', aka: ['레그 레이즈'], part: '코어', equip: '맨몸', type: 'reps', rest: 60, tips: [], mistake: '' },
  { id: 'crunch', name: '크런치', en: 'Crunch', aka: ['윗몸 일으키기'], part: '코어', equip: '맨몸', type: 'reps', rest: 45, tips: [], mistake: '' },
  { id: 'cable_crunch', name: '케이블 크런치', en: 'Cable Crunch', aka: [], part: '코어', equip: '케이블', type: 'weight_reps', rest: 60, tips: [], mistake: '' },
  { id: 'ab_rollout', name: 'AB 롤아웃', en: 'Ab Wheel Rollout', aka: ['AB 슬라이드', '복근 휠'], part: '코어', equip: '기타', type: 'reps', rest: 60, tips: [], mistake: '' },

  // ── 유산소 ──
  { id: 'treadmill', name: '러닝머신', en: 'Treadmill', aka: ['트레드밀', '달리기', '러닝'], part: '유산소', equip: '머신', type: 'distance_time', rest: 0, tips: [], mistake: '' },
  { id: 'stationary_bike', name: '실내 사이클', en: 'Stationary Bike', aka: ['자전거', '사이클'], part: '유산소', equip: '머신', type: 'distance_time', rest: 0, tips: [], mistake: '' },
  { id: 'stair_climber', name: '스텝밀', en: 'Stair Climber', aka: ['천국의 계단', '계단 오르기'], part: '유산소', equip: '머신', type: 'distance_time', rest: 0, tips: [], mistake: '' },
  { id: 'rowing_machine', name: '로잉머신', en: 'Rowing Machine', aka: ['로잉'], part: '유산소', equip: '머신', type: 'distance_time', rest: 0, tips: [], mistake: '' },
  { id: 'walking', name: '걷기', en: 'Walking', aka: ['산책', '인클라인 워킹'], part: '유산소', equip: '맨몸', type: 'distance_time', rest: 0, tips: [], mistake: '' }
];
