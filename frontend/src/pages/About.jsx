import React from "react";
import {Link} from "react-router-dom";




// 프로젝트 소개 데이터 (수정 편하게 분리)
const TECH_STACK = [
  { category: "이미지 분류", items: "ResNet50V2 (ImageNet 전이학습), Grad-CAM" },
  { category: "교육용 안내", items: "LLM-RAG, FAISS 검색" },
  { category: "프론트엔드", items: "React, Vite, Tailwind CSS" },
  { category: "데이터", items: "iNaturalist, GBIF, 국립수목원 생태도감" },
];

const LIMITATIONS = [
  "소규모·편향 데이터로 인한 일반화 한계",
  "외형만으로는 전문가도 구분이 어려운 종이 존재",
  "오분류의 결과가 치명적일 수 있어 실사용에는 부적합",
];

function About() {
  return (
    
    <div className="min-h-screen bg-gray-50 pb-10">

      <div className="max-w-3xl mx-auto mt-6 px-4">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">프로젝트 소개</h1>
        <p className="text-gray-500 mb-6">
          딥러닝 기반 국내 독버섯·식용버섯 이미지 분류 모델 + 교육용 RAG 안내 서비스
        </p>

        {/* 목적 */}
        <section className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold text-gray-800 mb-2">🎯 프로젝트 목적</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            외형이 유사해 중독사고를 일으키는 독·식용버섯을 이미지로 구분하고,
            인식 결과에 대해 독성·증상 정보를 교육용으로 안내합니다.
            fine-grained(미세 구분) 분류의 성능과 한계를 함께 다루는 학습 프로젝트입니다.
          </p>
        </section>

        {/* 사용 기술 */}
        <section className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold text-gray-800 mb-3">🛠 사용 기술</h2>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {TECH_STACK.map((t) => (
                <tr key={t.category} className="border-b border-gray-100">
                  <td className="p-2 font-semibold text-gray-700 w-1/3">{t.category}</td>
                  <td className="p-2 text-gray-600">{t.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 한계 */}
        <section className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold text-gray-800 mb-2">⚠ 한계 및 고찰</h2>
          <ul className="flex flex-col gap-1">
            {LIMITATIONS.map((l, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-red-400">•</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-gray-600 bg-amber-50 p-3 rounded">
            핵심 고찰: 모델이 예측에 참고한 부위(Grad-CAM)와 구별 포인트를 함께 확인하며,
            학습 데이터·모델 성능의 한계를 이해하고, 실제 채집·섭취 판단에는 사용하지 않아야 합니다.
          </p>
        </section>


        {/* 링크 */}
        <section className="p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold text-gray-800 mb-2">🔗 링크</h2>
          
            <a href="https://github.com/여기에_깃허브_주소"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
            >
            GitHub 저장소 보기
          </a>
        </section>

      </div>
    </div>
  );
}

export default About;