import { useState } from "react";
import { predictMushroom } from "../api/predictApi";
import ImageUpload from "../components/ImageUpload";
import PredictionResult from "../components/PredictionResult";
import LookalikeCompare from "../components/LookalikeCompare";
import RagInfoPanel from "../components/RagInfoPanel";
import GradCamToggle from "../components/GradCamToggle";
import {Link} from "react-router-dom";

function Home() {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (file) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handlePredict = async () => {
    if (!imageFile) return;
    setLoading(true);
    const data = await predictMushroom(imageFile);
    setResult(data);
    setLoading(false);
  };

  const topLatin = result?.predictions
    ? [...result.predictions].sort((a, b) => b.prob - a.prob)[0].latin
    : null;

  return (
    <div className="h-full overflow-auto bg-gray-50 pb-4">
      <div className=" mx-auto px-4 mt-3 grid grid-cols-3 gap-4">
        {/* 1열: 이미지 + 예측결과 */}
        <div className=" flex flex-col gap-4">
          {/*업로드 + 버튼 */}
          <ImageUpload
            onImageSelect={handleImageSelect}
            onPredict={handlePredict}
            loading={loading}
          />
          {/*예측 결과 */}
          <PredictionResult results={result?.predictions} />
        </div>

        {/* 2열: 닮은꼴 + 정보 패널 */}
        <div className="flex flex-col gap-4">
          <LookalikeCompare predictedLatin={topLatin} />
          <RagInfoPanel />

        </div>

        <div className="flex flex-row gap-4">
          <GradCamToggle originalImage={preview} gradcamImage={result?.gradcamImage} />
        </div>

      </div>

    </div>
  );
}

export default Home;