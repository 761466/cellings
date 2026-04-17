// 도메인 enum·상수·매핑 (v2.x)
// - 카테고리는 DB(`product_categories.slug`) 기반으로 확장 가능
// - 측정 템플릿은 고정 4종(measurement_profile)로 유지해 주문/측정 UX를 안정화

export type ProductCategory = string; // product_categories.slug
export type MeasurementProfile = "pillow" | "shoes" | "clothing" | "shapewear";
export type ProductType = "ready_made" | "custom" | "both";
export type OrderChoice = "ready_made" | "custom";
export type OrderStatus = "pending" | "confirmed" | "producing" | "done";
export type Gender = "m" | "f" | "other";

const DEFAULT_CATEGORY_LABEL: Record<MeasurementProfile, string> = {
  pillow: "베개",
  shoes: "신발",
  clothing: "의류",
  shapewear: "보정속옷",
};

export function categoryLabel(
  slug: string | null | undefined,
  map?: Record<string, string>,
) {
  if (!slug) return "-";
  return map?.[slug] ?? DEFAULT_CATEGORY_LABEL[slug as MeasurementProfile] ?? slug;
}

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  ready_made: "기성품",
  custom: "커스텀",
  both: "복합",
};

export const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string }[] = [
  { value: "ready_made", label: "기성품" },
  { value: "custom", label: "커스텀" },
  { value: "both", label: "복합" },
];

export const CHOICE_LABEL: Record<OrderChoice, string> = {
  ready_made: "기성품",
  custom: "커스텀",
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "접수",
  confirmed: "접수확인",
  producing: "제작중",
  done: "완료",
};

export const STATUS_COLOR: Record<
  OrderStatus,
  "default" | "success" | "warning" | "accent"
> = {
  pending: "default",
  confirmed: "accent",
  producing: "warning",
  done: "success",
};

// UI 상태 탭 그룹 (pending + confirmed → 접수)
export type OrderTab = "all" | "accept" | "producing" | "done";
export const ORDER_TABS: { value: OrderTab; label: string; statuses?: OrderStatus[] }[] = [
  { value: "all", label: "전체" },
  { value: "accept", label: "접수", statuses: ["pending", "confirmed"] },
  { value: "producing", label: "제작중", statuses: ["producing"] },
  { value: "done", label: "완료", statuses: ["done"] },
];

export const GENDER_LABEL: Record<Gender, string> = {
  m: "남",
  f: "여",
  other: "기타",
};

// ─────────────────────────────────────────────────────────
// 측정 데이터 (v2.0 — 3D 스캐너 실측 출력 전 항목)
// ─────────────────────────────────────────────────────────

export type MeasurementUnit =
  | "cm"   // 체형 길이·둘레
  | "mm"   // 발 길이·둘레 (키에 _mm 접미사)
  | "deg"  // 각도
  | "kg"
  | "kcal"
  | "pct"  // %
  | "age"
  | "level"
  | "ratio" // 소수 비율
  | "score" // 건강 평가 점수
  | "text"; // 유형(평발/표준 등)

export type MeasurementGroup =
  | "body"
  | "composition"
  | "posture"
  | "spine"
  | "foot";

export type MeasurementField = {
  key: string;
  label: string;
  unit: MeasurementUnit;
  group: MeasurementGroup;
  hint?: string;
  side?: "left" | "right";
};

// 그룹 라벨
export const MEASUREMENT_GROUP_LABEL: Record<MeasurementGroup, string> = {
  body: "체형 측정",
  composition: "체성분",
  posture: "자세 평가",
  spine: "척추 평가",
  foot: "발 스캔",
};

// 단위 표기
export const UNIT_SUFFIX: Partial<Record<MeasurementUnit, string>> = {
  cm: "cm",
  mm: "mm",
  deg: "°",
  kg: "kg",
  kcal: "kcal/d",
  pct: "%",
  age: "세",
  level: "등급",
};

function fmtUnit(unit: MeasurementUnit): string {
  return UNIT_SUFFIX[unit] ?? "";
}

export function formatMeasurementValue(
  value: MeasurementValue | undefined,
  unit: MeasurementUnit,
): string {
  if (value == null || value === "") return "-";
  if (unit === "text") return String(value);
  if (typeof value !== "number" && Number.isNaN(Number(value))) return String(value);
  const n = typeof value === "number" ? value : Number(value);
  const suffix = fmtUnit(unit);
  return suffix ? `${n} ${suffix}` : `${n}`;
}

// ─────────────────────────────────────────────────────────
// B-1. 체형 측정 (단위 cm, 특정 값은 점수)
// ─────────────────────────────────────────────────────────
const BODY_FIELDS: MeasurementField[] = [
  { key: "height", label: "신장", unit: "cm", group: "body", hint: "직립 키" },
  { key: "bmi", label: "BMI", unit: "score", group: "body", hint: "참고값" },
  { key: "neck_circ", label: "목 둘레", unit: "cm", group: "body", hint: "베개 카테고리" },
  { key: "bust_grid", label: "버스트 그리드", unit: "cm", group: "body" },
  { key: "waist_circ_std", label: "표준 허리 둘레", unit: "cm", group: "body" },
  { key: "waist_circ_min", label: "가장 작은 허리 둘레", unit: "cm", group: "body" },
  { key: "hip_circ", label: "엉덩이 둘레", unit: "cm", group: "body" },
  { key: "shoulder_length", label: "어깨 길이", unit: "cm", group: "body" },
  { key: "arm_length_left", label: "왼팔 길이", unit: "cm", group: "body" },
  { key: "arm_length_right", label: "오른팔 길이", unit: "cm", group: "body" },
  { key: "upper_body_length", label: "상체 길이", unit: "cm", group: "body" },
  { key: "lower_body_length", label: "하체 길이", unit: "cm", group: "body" },
  { key: "stomach_circ", label: "위 둘레", unit: "cm", group: "body" },
  { key: "lower_abdomen_circ1", label: "하복부 둘레1", unit: "cm", group: "body" },
  { key: "lower_abdomen_circ2", label: "하복부 둘레2", unit: "cm", group: "body" },
  { key: "thigh_circ", label: "허벅지 둘레", unit: "cm", group: "body" },
  { key: "thigh_circ2", label: "허벅지 둘레2", unit: "cm", group: "body" },
  { key: "calf_circ", label: "종아리 둘레", unit: "cm", group: "body", hint: "참고값" },
  { key: "ankle_circ", label: "발목 둘레", unit: "cm", group: "body", hint: "참고값" },
  { key: "inseam", label: "인심 길이", unit: "cm", group: "body" },
  { key: "bnp_height", label: "BNP 높이", unit: "cm", group: "body", hint: "참고값" },
  { key: "bnp_waist_v_dist", label: "BNP-허리 V거리", unit: "cm", group: "body", hint: "참고값" },
];

// ─────────────────────────────────────────────────────────
// B-2. 체성분
// ─────────────────────────────────────────────────────────
const COMPOSITION_FIELDS: MeasurementField[] = [
  { key: "body_fat_pct", label: "체지방률", unit: "pct", group: "composition" },
  { key: "muscle_weight_kg", label: "근육 무게", unit: "kg", group: "composition" },
  { key: "water_weight_pct", label: "수분 비율", unit: "pct", group: "composition" },
  { key: "bone_mineral_kg", label: "뼈 미네랄 무게", unit: "kg", group: "composition" },
  { key: "protein_pct", label: "단백질 비율", unit: "pct", group: "composition" },
  { key: "bmr_kcal", label: "기초대사량 (BMR)", unit: "kcal", group: "composition" },
  { key: "body_age", label: "신체 연령", unit: "age", group: "composition" },
  { key: "visceral_level", label: "내장지방 수준", unit: "level", group: "composition" },
  { key: "skeletal_muscle_kg", label: "골격근 무게", unit: "kg", group: "composition" },
  { key: "std_weight_kg", label: "표준 체중", unit: "kg", group: "composition" },
];

// ─────────────────────────────────────────────────────────
// B-3. 자세 평가
// ─────────────────────────────────────────────────────────
const POSTURE_FIELDS: MeasurementField[] = [
  { key: "shoulder_type", label: "어깨 유형", unit: "text", group: "posture", hint: "표준/라운드 등" },
  { key: "shoulder_slope_left_deg", label: "왼쪽 어깨 경사각", unit: "deg", group: "posture" },
  { key: "shoulder_slope_right_deg", label: "오른쪽 어깨 경사각", unit: "deg", group: "posture" },
  { key: "back_type", label: "등 형태", unit: "text", group: "posture" },
  { key: "neck_type", label: "목 모양", unit: "text", group: "posture" },
  { key: "pelvis_type", label: "골반 형태", unit: "text", group: "posture" },
  { key: "buttocks_type", label: "엉덩이 모양", unit: "text", group: "posture" },
  { key: "knee_hyperext_type", label: "과신전 무릎", unit: "text", group: "posture" },
  { key: "leg_type", label: "다리 모양", unit: "text", group: "posture" },
  { key: "body_shape_yxthoa", label: "체형 (YXTHOA)", unit: "text", group: "posture" },
  { key: "body_shape_vhoa", label: "체형 (VHOA)", unit: "text", group: "posture" },
];

// ─────────────────────────────────────────────────────────
// B-4. 척추 평가
// ─────────────────────────────────────────────────────────
const SPINE_FIELDS: MeasurementField[] = [
  { key: "scoliosis_risk", label: "척추측만증 위험", unit: "text", group: "spine", hint: "낮음/중간/높음" },
  { key: "shoulder_balance_type", label: "어깨 밸런스", unit: "text", group: "spine" },
  { key: "lateral_deviation_type", label: "측면 편향", unit: "text", group: "spine" },
  { key: "pelvis_twist_type", label: "골반 비틀림", unit: "text", group: "spine" },
  { key: "spine_curve_health", label: "척추 곡률 건강 점수", unit: "score", group: "spine" },
  { key: "cervical_curve_type", label: "경추 곡선", unit: "text", group: "spine" },
  { key: "thoracic_curve_type", label: "흉부 곡선", unit: "text", group: "spine" },
  { key: "lumbar_curve_type", label: "요추 곡선", unit: "text", group: "spine" },
  { key: "pelvis_tilt_type", label: "골반 기울기", unit: "text", group: "spine" },
  { key: "cobb_angle_deg", label: "코브 각도", unit: "deg", group: "spine" },
];

// ─────────────────────────────────────────────────────────
// B-5/B-6. 발 스캔 — 좌/우발 공통 필드
// ─────────────────────────────────────────────────────────
type FootSuffix = {
  suffix: string;
  label: string;
  unit: MeasurementUnit;
  hint?: string;
};

const FOOT_SUFFIXES: FootSuffix[] = [
  // 측정 (mm)
  { suffix: "foot_length_mm", label: "발 길이", unit: "mm", hint: "신발 카테고리 필수" },
  { suffix: "foot_width_mm", label: "발 너비", unit: "mm", hint: "신발 카테고리 필수" },
  { suffix: "big_toe_length_mm", label: "엄지발가락 길이", unit: "mm" },
  { suffix: "ball_circ_mm", label: "볼 둘레", unit: "mm", hint: "신발 카테고리 필수" },
  { suffix: "instep_circ_mm", label: "발등 둘레", unit: "mm" },
  { suffix: "heel_girth_mm", label: "힐 둘레 (뒤꿈치)", unit: "mm", hint: "신발 카테고리 필수" },
  { suffix: "ankle_circ_mm", label: "발목 둘레", unit: "mm" },
  { suffix: "arch_height_mm", label: "아치 높이", unit: "mm" },
  { suffix: "arch_length_mm", label: "아치 길이", unit: "mm" },
  { suffix: "arch_start_pos_mm", label: "아치 시작 위치", unit: "mm" },
  { suffix: "arch_peak_pos_mm", label: "아치 최상단 위치", unit: "mm" },
  { suffix: "arch_end_pos_mm", label: "아치 끝 위치", unit: "mm" },
  { suffix: "instep_height_mm", label: "발등 높이", unit: "mm" },
  // 비율·각도
  { suffix: "arch_index", label: "아치 지수", unit: "ratio" },
  { suffix: "foot_width_ratio", label: "발 너비 비율", unit: "ratio" },
  { suffix: "hallux_valgus_angle_deg", label: "할루스 발거스 각도 (HV)", unit: "deg" },
  { suffix: "pronation_angle_deg", label: "프로네이션 각도", unit: "deg" },
  // 유형 (텍스트)
  { suffix: "foot_arch_type", label: "발 아치 유형", unit: "text", hint: "평발/정상/높은 아치" },
  { suffix: "hallux_valgus_type", label: "할루스 발거스 유형", unit: "text" },
  { suffix: "pronation_type", label: "프로네이션 유형", unit: "text", hint: "표준/내전/외전" },
  { suffix: "toe_type", label: "발가락 유형", unit: "text", hint: "로마/이집트/그리스" },
  { suffix: "foot_fat_type", label: "발 지방 유형", unit: "text" },
];

export type FootSide = "left" | "right";
export const FOOT_SIDE_LABEL: Record<FootSide, string> = {
  left: "왼발",
  right: "오른발",
};

function footFieldsFor(side: FootSide): MeasurementField[] {
  const prefix = side === "left" ? "left_" : "right_";
  return FOOT_SUFFIXES.map((f) => ({
    key: `${prefix}${f.suffix}`,
    label: f.label,
    unit: f.unit,
    group: "foot" as const,
    hint: f.hint,
    side,
  }));
}

export const FOOT_FIELDS_LEFT = footFieldsFor("left");
export const FOOT_FIELDS_RIGHT = footFieldsFor("right");

// 전체 필드 레지스트리
export const ALL_MEASUREMENT_FIELDS: MeasurementField[] = [
  ...BODY_FIELDS,
  ...COMPOSITION_FIELDS,
  ...POSTURE_FIELDS,
  ...SPINE_FIELDS,
  ...FOOT_FIELDS_LEFT,
  ...FOOT_FIELDS_RIGHT,
];

export const MEASUREMENT_META: Record<string, MeasurementField> = Object.fromEntries(
  ALL_MEASUREMENT_FIELDS.map((f) => [f.key, f]),
);

export const ALL_MEASUREMENT_KEYS: string[] = ALL_MEASUREMENT_FIELDS.map((f) => f.key);

// 그룹별 필드 목록
export const FIELDS_BY_GROUP: Record<MeasurementGroup, MeasurementField[]> = {
  body: BODY_FIELDS,
  composition: COMPOSITION_FIELDS,
  posture: POSTURE_FIELDS,
  spine: SPINE_FIELDS,
  foot: [...FOOT_FIELDS_LEFT, ...FOOT_FIELDS_RIGHT],
};

// ─────────────────────────────────────────────────────────
// B-7. 카테고리별 사용 측정 항목 (v2.0 확정)
// ─────────────────────────────────────────────────────────

// 베개 — 목 둘레·어깨 길이·좌우 어깨 경사각
const PILLOW_KEYS: string[] = [
  "neck_circ",
  "shoulder_length",
  "shoulder_slope_left_deg",
  "shoulder_slope_right_deg",
];

// 신발 — 좌/우발 각각 측정 4개 + 형태 3개
const SHOE_SUFFIX_REQUIRED: string[] = [
  "foot_length_mm",
  "foot_width_mm",
  "ball_circ_mm",
  "heel_girth_mm",
  "foot_arch_type",
  "pronation_type",
  "hallux_valgus_type",
];

const SHOES_KEYS_LEFT = SHOE_SUFFIX_REQUIRED.map((s) => `left_${s}`);
const SHOES_KEYS_RIGHT = SHOE_SUFFIX_REQUIRED.map((s) => `right_${s}`);
const SHOES_KEYS: string[] = [...SHOES_KEYS_LEFT, ...SHOES_KEYS_RIGHT];

// 의류 — 체형 중심
const CLOTHING_KEYS: string[] = [
  "height",
  "bust_grid",
  "waist_circ_std",
  "hip_circ",
  "shoulder_length",
  "arm_length_left",
  "arm_length_right",
  "upper_body_length",
  "lower_body_length",
  "inseam",
];

// 보정속옷 — 허리·복부·엉덩이·허벅지·체형
const SHAPEWEAR_KEYS: string[] = [
  "waist_circ_std",
  "waist_circ_min",
  "hip_circ",
  "stomach_circ",
  "lower_abdomen_circ1",
  "lower_abdomen_circ2",
  "thigh_circ",
  "body_shape_yxthoa",
  "body_shape_vhoa",
];

export const PROFILE_MEASUREMENT_KEYS: Record<MeasurementProfile, string[]> = {
  pillow: PILLOW_KEYS,
  shoes: SHOES_KEYS,
  clothing: CLOTHING_KEYS,
  shapewear: SHAPEWEAR_KEYS,
};

// 신발 좌/우 분리 뷰용
export const PROFILE_MEASUREMENT_KEYS_BY_SIDE: Record<
  MeasurementProfile,
  { left?: string[]; right?: string[]; common?: string[] }
> = {
  pillow: { common: PILLOW_KEYS },
  clothing: { common: CLOTHING_KEYS },
  shapewear: { common: SHAPEWEAR_KEYS },
  shoes: {
    left: SHOES_KEYS_LEFT,
    right: SHOES_KEYS_RIGHT,
  },
};

export function resolveMeasurementKeysBySide(args: {
  profile: MeasurementProfile;
  customKeys?: string[] | null;
}): { left?: string[]; right?: string[]; common?: string[] } {
  const keys =
    args.customKeys && args.customKeys.length > 0
      ? args.customKeys
      : PROFILE_MEASUREMENT_KEYS[args.profile];

  const left = keys.filter((k) => k.startsWith("left_"));
  const right = keys.filter((k) => k.startsWith("right_"));
  const hasSides = left.length > 0 || right.length > 0;

  if (hasSides) {
    return { left, right };
  }
  return { common: keys };
}

export function resolveProfileFromCategorySlug(
  slug: string | null | undefined,
): MeasurementProfile {
  if (!slug) return "clothing";
  if (slug === "pillow") return "pillow";
  if (slug === "shoes") return "shoes";
  if (slug === "shapewear") return "shapewear";
  if (slug === "clothing") return "clothing";
  return "clothing";
}

// ─────────────────────────────────────────────────────────
// 측정 데이터 타입
// ─────────────────────────────────────────────────────────
export type MeasurementValue = number | string;
export type MeasurementData = Record<string, MeasurementValue | undefined>;
