// 이 시스템이 실제로 인식하는 독버섯 7종 안내
// (섭취 의심 환자의 버섯을 식별하는 용도이므로, 이 7종 외에는 판별할 수 없음을 명확히 고지)
const SUPPORTED_SPECIES = [
  { ko: "마귀광대버섯", la: "Amanita pantherina" },
  { ko: "개나리광대버섯", la: "Amanita subjunquillea" },
  { ko: "삿갓외대버섯", la: "Entoloma rhodopolium" },
  { ko: "화경솔밭버섯", la: "Omphalotus japonicus" },
  { ko: "노란개암버섯", la: "Hypholoma fasciculare" },
  { ko: "독우산광대버섯", la: "Amanita virosa" },
  { ko: "붉은사슴뿔버섯", la: "Trichoderma cornu-damae" },
];

function SupportedSpecies() {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <p className="font-semibold text-gray-800 mb-1">🧬 인식 대상 · 독버섯 7종</p>
      <p className="text-xs text-gray-500 mb-3">
        이 시스템은 아래 7종만 식별할 수 있습니다. 이 목록에 없는 버섯이거나 예측 확률이 낮다면
        반드시 전문가·의료진의 별도 확인이 필요합니다.
      </p>
      <ul className="grid grid-cols-1 gap-1.5">
        {SUPPORTED_SPECIES.map((s) => (
          <li key={s.la} className="flex items-baseline gap-2 text-sm">
            <span className="font-medium text-gray-800">{s.ko}</span>
            <span className="text-xs text-gray-400 italic">{s.la}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SupportedSpecies;
