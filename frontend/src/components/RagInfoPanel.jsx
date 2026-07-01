import React from "react";

// 더미 데이터 (백엔드 RAG 응답 전 테스트용)
const dummyRag = {
  name: "독우산광대버섯",
  latin: "Amanita virosa",
  toxinType: "아마톡신 (Amatoxin) 계열",
  symptoms: [
    "섭취 6~24시간 후 구토·복통·설사 (지연 발현)",
    "일시 회복기 후 24~48시간 내 간·신장 손상",
    "치료 지연 시 간부전으로 사망 가능",
  ],
  firstAid: [
    "즉시 119 신고 또는 응급실 이송",
    "먹은 버섯·토사물 사진이나 실물 보존 (종 동정용)",
    "억지로 토하게 하지 말고 의료진 지시 따르기",
  ],
  source: "국립수목원 「우리나라 독버섯」 생태도감",
};

function RagInfoPanel({ data = dummyRag }) {
  return (
    <div className="mx-auto p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-800">📖 생태·독성 정보 · RAG</p>
        <span className="text-xs text-gray-400">교육용</span>
      </div>

      {/* 종 이름 + 독소 유형 */}
      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
        <p className="font-bold text-red-800">{data.name}</p>
        <p className="text-xs text-gray-500 italic">{data.latin}</p>
        <p className="mt-1 text-sm text-red-700">독소 유형: {data.toxinType}</p>
      </div>

      {/* 중독 증상 */}
      <div className="mb-4">
        <p className="font-semibold text-gray-700 mb-2">⚠ 중독 증상</p>
        <ul className="flex flex-col gap-1">
          {data.symptoms.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-red-400">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 응급 대처 */}
      <div className="mb-4">
        <p className="font-semibold text-gray-700 mb-2">🚑 응급 대처</p>
        <ul className="flex flex-col gap-1">
          {data.firstAid.map((f, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-blue-400">{i + 1}.</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 출처 + 필수 고지 */}
      <p className="text-xs text-gray-400 mb-2">출처: {data.source}</p>
      <p className="text-xs text-red-500 bg-red-50 p-2 rounded">
        ※ 본 정보는 교육·학습용입니다. 실제 채집·섭취 판단에 사용하지 마시고, 이상 증상 시 즉시 의료기관에 문의하십시오.
      </p>
    </div>
  );
}

export default RagInfoPanel;