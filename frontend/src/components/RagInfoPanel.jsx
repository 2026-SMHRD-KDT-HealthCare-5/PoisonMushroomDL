import React from "react";

function RagInfoPanel({ data }) {
  return (
    <div className=" p-4 bg-white rounded-lg shadow h-full">

      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-800">📖 생태·독성 정보 · RAG</p>
        <span className="text-xs text-gray-400">의료진 참고용</span>
      </div>

      {!data ? (
        <div className="border border-dashed border-gray-300 rounded-lg py-8 text-center">
          <p className="text-sm text-gray-400">정보 대기 중</p>
          <p className="text-xs text-gray-400 mt-1">예측 결과에 맞춰 독성·증상·응급 대처 정보가 표시됩니다.</p>
        </div>
      ) : (
        <>
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
            ※ 본 정보는 참고용 보조 정보입니다. 실제 진단·치료 결정은 반드시 의료진 판단에 따라야 합니다.
          </p>
        </>
      )}
    </div>
  );
}

export default RagInfoPanel;
