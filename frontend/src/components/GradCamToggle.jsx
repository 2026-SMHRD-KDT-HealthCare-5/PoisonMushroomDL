import React from "react";
import { useState } from "react";

// originalImage: 업로드 원본 / gradcamImage: 백엔드가 만든 히트맵 이미지
function GradCamToggle({ originalImage = null, gradcamImage = null }) {
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <div className=" mx-auto p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-800">🔥 Grad-CAM · 모델이 본 부위</p>

        {/* 토글 버튼 */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`rounded px-3 py-1 text-xs font-semibold ${
            showHeatmap ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          {showHeatmap ? "히트맵 ON" : "히트맵 OFF"}
        </button>
      </div>

      {/* 이미지 표시 영역 */}
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg overflow-hidden">
        {showHeatmap ? (
          gradcamImage ? (
            <img src={gradcamImage} alt="Grad-CAM" className="h-full object-contain" />
          ) : (
            <span className="text-gray-300 text-sm">히트맵 이미지 없음</span>
          )
        ) : originalImage ? (
          <img src={originalImage} alt="원본" className="h-full object-contain" />
        ) : (
          <span className="text-gray-300 text-sm">원본 이미지 없음</span>
        )}
      </div>

      {/* 설명 */}
      <p className="mt-3 text-xs text-gray-500">
        빨강일수록 모델이 예측에 크게 참고한 부위입니다. 갓·주름에 반응하면 정상, 배경에 반응하면 학습 개선이 필요합니다.
      </p>
    </div>
  );
}

export default GradCamToggle;