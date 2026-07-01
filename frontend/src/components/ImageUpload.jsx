import { useState } from "react";

// onImageSelect: 파일 전달 / onPredict: 예측 실행 / loading: 로딩 상태
function ImageUpload({ onImageSelect, onPredict, loading }) {
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    }
  };

  return (
    <div className=" p-4 bg-white rounded-lg shadow">
      <p className="mb-3 font-semibold text-gray-800">표본 이미지</p>

      <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400">
        {preview ? (
          <img src={preview} alt="미리보기" className="h-full object-contain rounded" />
        ) : (
          <span className="text-gray-500">이미지 업로드</span>
        )}
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </label>

      {/* 예측 버튼 (업로드 영역 안으로 이동) */}
      <button
        onClick={onPredict}
        disabled={!preview || loading}
        className="w-full mt-4 rounded-lg bg-red-600 px-6 py-2 text-white font-semibold hover:bg-red-700 disabled:bg-gray-300"
      >
        {loading ? "분석 중..." : "예측하기"}
      </button>
    </div>
  );
}

export default ImageUpload;