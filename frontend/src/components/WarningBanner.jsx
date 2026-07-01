import React from 'react'
//상단 경고 배너창

const WarningBanner = () => {
  return (
    <div className="sticky top-0 z-[100] flex items-center gap-3 py-2 px-4 bg-red-800 text-[#f5e6c8] text-[13px]">

        <span className="flex-1">
          ⚠ 교육용 도구입니다 · 이 결과로 식용 여부를 판단하거나 버섯을 섭취하지 마세요.
        </span>

    </div>
  )
}

export default WarningBanner