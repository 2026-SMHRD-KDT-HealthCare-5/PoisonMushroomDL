import { useState } from "react";
import { predictMushroom } from "../api/predictApi";
import ImageUpload from "../components/ImageUpload";
import PredictionResult from "../components/PredictionResult";
import SupportedSpecies from "../components/SupportedSpecies";
import RagInfoPanel from "../components/RagInfoPanel";
import Chatbot from "../components/Chatbot";
import {Link} from "react-router-dom";

function Home() {
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (file) => {
    setImageFile(file);
    setResult(null);
  };

  const handlePredict = async () => {
    if (!imageFile) return;
    setLoading(true);
    try {
      const data = await predictMushroom(imageFile);
      setResult(data);
    } catch (err) {
      alert("예측에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const topPrediction = result?.predictions
    ? [...result.predictions].sort((a, b) => b.prob - a.prob)[0]
    : null;

  return (
    <div className="h-full overflow-auto bg-gray-50 pb-4">
      <div className="mx-auto px-4 mt-3 grid grid-cols-3 items-stretch gap-4">
        {/* 1열: 이미지 + 예측결과 */}
        <div className="flex flex-col gap-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            onPredict={handlePredict}
            loading={loading}
          />
          <PredictionResult results={result?.predictions} />
        </div>

        {/* 2열: 인식 범위 안내 + RAG 정보 */}
        <div className="flex flex-col gap-4">
          <SupportedSpecies />
          <RagInfoPanel data={result?.ragInfo} />
        </div>
        
        {/* 3열: 챗봇 */}
        <div className="flex flex-col gap-4">
          <Chatbot
              key={topPrediction?.class_code || "empty"}
              classCode={topPrediction?.class_code}
              speciesName={topPrediction?.name_kr}
          />
        </div>
        
      </div>
    </div>
  );
}

export default Home;