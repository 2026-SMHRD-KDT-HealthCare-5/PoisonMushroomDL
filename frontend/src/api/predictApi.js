// 백엔드 /predict 호출 (이미지 업로드 -> top-3 예측 + RAG 정보)
export async function predictMushroom(imageFile) {
  const formData = new FormData();
  formData.append("file", imageFile);

  const res = await fetch("/predict", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("예측 요청 실패");
  }

  const data = await res.json();
  return {
    predictions: data.predictions.map((p) => ({
      ...p,
      name: p.name_kr, // PredictionResult가 기대하는 필드명
    })),
    ragInfo: data.ragInfo,
  };
}