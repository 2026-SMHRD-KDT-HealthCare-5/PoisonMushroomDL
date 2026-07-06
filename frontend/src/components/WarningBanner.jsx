import React from 'react'
//상단 경고 배너창

const WarningBanner = () => {
  return (
    <div className="sticky top-0 z-[100] flex items-center gap-3 py-2 px-4 bg-red-800 text-[#f5e6c8] text-[13px]">

        <span className="flex-1">
          ⚠ 의료진용 독버섯 식별 지원 도구입니다 · 국내 맹독성 버섯 7종만 인식하며, 섭취 의심 환자의 버섯 종을 빠르게 확인하기 위한 용도입니다. 식용 여부 판단·채집 목적으로 사용하지 마세요.
        </span>

    </div>
  )
}

export default WarningBanner