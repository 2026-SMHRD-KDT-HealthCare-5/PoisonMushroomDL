// 학명(latin)을 key로 하는 버섯 정보 DB
// 각 종이 자기 특징(features)을 독립적으로 보유
export const MUSHROOM_DB = {
  "Amanita virosa": {
    name: "독우산광대버섯",
    isPoisonous: true,
    lookalike: "Agaricus arvensis",
    features: {
      "대주머니(볼바)": "있음 — 밑동에 막질 주머니",
      "주름 색": "항상 흰색 유지",
      "포자문": "백색",
      "학명(속)": "Amanita (광대버섯속)",
      "냄새": "특별한 향 없음",
    },
  },
  "Agaricus arvensis": {
    name: "흰주름버섯",
    isPoisonous: false,
    lookalike: "Amanita virosa",
    features: {
      "대주머니(볼바)": "없음",
      "주름 색": "분홍 → 성숙 시 초콜릿갈색",
      "포자문": "자갈색~흑갈색",
      "학명(속)": "Agaricus (주름버섯속)",
      "냄새": "아니스/아몬드 향",
    },
  },
  // ... 나머지 종 추가
};

// 두 종의 features를 비교 표 형태로 합치는 헬퍼
export function buildCompareRows(latinA, latinB) {
  const a = MUSHROOM_DB[latinA];
  const b = MUSHROOM_DB[latinB];
  if (!a || !b) return [];

  // 두 종의 항목(label)을 합쳐서 중복 제거
  const labels = [...new Set([...Object.keys(a.features), ...Object.keys(b.features)])];

  return labels.map((label) => ({
    label,
    a: a.features[label] || "-",
    b: b.features[label] || "-",
  }));
}