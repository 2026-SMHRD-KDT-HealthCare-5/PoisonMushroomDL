import react from "react";

// 값 없이 항목명만 있는 기본 행
const EMPTY_ROWS = [
  { label: "대주머니(볼바)", a: "", b: "" },
  { label: "주름 색", a: "", b: "" },
  { label: "포자문", a: "", b: "" },
  { label: "학명(속)", a: "", b: "" },
  { label: "냄새", a: "", b: "" },
];

function LookalikeCompare({ predictedLatin = null }) {
  const predicted = predictedLatin ? MUSHROOM_DB[predictedLatin] : null;
  const lookalikeLatin = predicted?.lookalike || null;

  // 독/식용 역할 구분 (데이터 없으면 null)
  const poisonLatin = predicted
    ? (predicted.isPoisonous ? predictedLatin : lookalikeLatin)
    : null;
  const edibleLatin = predicted
    ? (predicted.isPoisonous ? lookalikeLatin : predictedLatin)
    : null;

  const poison = poisonLatin ? MUSHROOM_DB[poisonLatin] : null;
  const edible = edibleLatin ? MUSHROOM_DB[edibleLatin] : null;

  // 표 행: 데이터 있으면 생성, 없으면 항목명만 있는 빈 행
  const rows = (poisonLatin && edibleLatin)
    ? buildCompareRows(poisonLatin, edibleLatin)
    : EMPTY_ROWS;  // 아래에서 정의

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <p className="font-semibold text-gray-800 mb-3">🔍 닮은꼴 비교 · LOOK-ALIKE</p>

      {/* 이미지 2개 (비어있어도 자리 유지) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border-2 border-red-200 rounded-lg p-3">
          <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-xs text-white mb-2">독</span>
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded">
            <span className="text-gray-300 text-sm">독종 참고 사진</span>
          </div>
          <p className="mt-2 font-bold text-sm">{poison?.name || "—"}</p>
          <p className="text-gray-400 text-xs italic">{poisonLatin || ""}</p>
        </div>

        <div className="border-2 border-green-200 rounded-lg p-3">
          <span className="inline-block rounded bg-green-600 px-2 py-0.5 text-xs text-white mb-2">식용</span>
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded">
            <span className="text-gray-300 text-sm">식용종 참고 사진</span>
          </div>
          <p className="mt-2 font-bold text-sm">{edible?.name || "—"}</p>
          <p className="text-gray-400 text-xs italic">{edibleLatin || ""}</p>
        </div>
      </div>

      {/* 표 (틀은 항상, 값은 비어있을 수 있음) */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">구별 항목</th>
            <th className="p-2 text-red-700">{poison?.name || "독종"}</th>
            <th className="p-2 text-green-700">{edible?.name || "식용종"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-gray-100">
              <td className="p-2 font-semibold">{row.label}</td>
              <td className="p-2 text-gray-700">{row.a || "—"}</td>
              <td className="p-2 text-gray-700">{row.b || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LookalikeCompare;