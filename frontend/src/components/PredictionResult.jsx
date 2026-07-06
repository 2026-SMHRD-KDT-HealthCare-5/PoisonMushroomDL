import React from 'react'

// 더미 데이터 (rank 없이 prob만)
const dummyResult = [
  { name: "", latin: "Agaricus arvensis", isPoisonous: false, prob: 6.4 },
  { name: "독우산광대버섯", latin: "Amanita virosa", isPoisonous: true, prob: 91.2 },
  { name: "천사광대버섯", latin: "Amanita verna", isPoisonous: true, prob: 2.4 },
];

function PredictionResult({ results = dummyResult }) {
  // prob 내림차순 정렬 → 자동 순위
  // 음수 일경우 a가 앞으로 
  // 양수 일경우 b가 앞으로
  // 0이면 순서유지
  const sorted = [...results].sort((a, b) => b.prob - a.prob);

  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow">
      {/* 상단 제목 - 예측결과 */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-800">📊 예측 결과 · TOP-3</p>
      </div>

      {/* 결과 리스트 */}
      <div className="flex flex-col gap-3">
        {sorted.map((r, index) =>{
          return (
            <div key={r.name}> 
            {/*이름*/}
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">
                  {/*순위+ 이름 */}
                  <span className="font-bold">{index + 1} {r.name}</span>

                  {/*학명*/}
                  <span className="ml-2 text-gray-400 italic">{r.latin}</span>

                  {/*독성 여부*/}
                  <span className=
                    {`ml-2 rounded px-1.5 py-0.5 text-xs 
                      text-white ${r.isPoisonous ? "bg-red-600" : "bg-green-600"}`
                    }
                  >
                    {r.isPoisonous ? "독성" : "식용"}
                  </span>

                </span>
                
                {/*확률*/}
                <span className="text-sm font-semibold">{r.prob}%</span>
              </div>

              {/*확률바*/}
              <div className="h-2 w-full rounded bg-gray-100">
                <div
                  className={`h-2 rounded ${r.isPoisonous ? "bg-red-500" : "bg-green-500"}`}
                  style={{ width: `${r.prob}%` }}
                />
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PredictionResult;