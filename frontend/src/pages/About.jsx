import React from "react";
import {Link} from "react-router-dom";




// 프로젝트 소개 데이터 (수정 편하게 분리)
const TECH_STACK = [
  { category: "이미지 분류", items: "ResNet50V2 (ImageNet 전이학습)" },
  { category: "의료진 참고 정보", items: "LLM-RAG, FAISS 검색" },
  { category: "프론트엔드", items: "React, Vite, Tailwind CSS" },
  { category: "데이터", items: "iNaturalist, GBIF, 국립수목원 생태도감" },
];

const LIMITATIONS = [
  "소규모·편향 데이터로 인한 일반화 한계",
  "국내 맹독성 버섯 7종 외에는 식별할 수 없음",
  "오분류의 결과가 치명적일 수 있어 최종 판단은 반드시 의료진이 내려야 함",
];

function About() {
  return (
    
    <div className="min-h-screen bg-gray-50 pb-10">

      <div className="max-w-3xl mx-auto mt-6 px-4">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">프로젝트 소개</h1>
        <p className="text-gray-500 mb-6">
          딥러닝 기반 국내 맹독성 버섯 7종 식별 모델 + 의료진 참고용 RAG 안내 도구
        </p>

        {/* 목적 */}
        <section className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold text-gray-800 mb-2">🎯 프로젝트 목적</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            독버섯 섭취가 의심되는 환자가 병원에 왔을 때, 의료진이 사진만으로 어떤 독버섯인지
            빠르게 추정하고 독성·증상·응급 대처 정보를 참고할 수 있도록 돕는 도구입니다.
            국내 맹독성 버섯 7종만 식별하며, 일반적인 식용 여부 판별이나 채집 목적으로는
            사용할 수 없습니다.
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
            핵심 고찰: 예측 확률이 낮거나 7종에 포함되지 않는 경우 반드시 전문가 동정을 병행해야
            합니다. 이 도구의 결과만으로 진단·치료를 결정해서는 안 됩니다.
          </p>
        </section>


        {/* 링크 */}
        <section className="p-4 bg-white rounded-lg shadow">
          <h2 className="font-semibold text-gray-800 mb-2">🔗 링크</h2>
          
            <a href="https://github.com/2026-SMHRD-KDT-HealthCare-5/PoisonMushroomDL.git"
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