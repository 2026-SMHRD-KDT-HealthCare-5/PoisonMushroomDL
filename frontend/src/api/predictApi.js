// 실제 백엔드 연동 전, 가짜 응답을 돌려주는 함수
export async function predictMushroom(imageFile) {
  // 실제로는 여기서 fetch로 백엔드 호출
  // 지금은 1초 후 더미 결과 반환 (로딩 흉내)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    predictions: [
      { name: "흰주름버섯", latin: "Agaricus arvensis", isPoisonous: false, prob: 6.4 },
      { name: "독우산광대버섯", latin: "Amanita virosa", isPoisonous: true, prob: 91.2 },
      { name: "천사광대버섯", latin: "Amanita verna", isPoisonous: true, prob: 2.4 },
    ],
    gradcamImage: null, // 백엔드가 생성한 히트맵 URL
  };
}