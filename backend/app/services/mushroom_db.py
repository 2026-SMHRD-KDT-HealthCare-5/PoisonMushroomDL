import json
import logging
from pathlib import Path

from app.config import CLASS_NAMES, LATIN_NAMES, NAME_KR, settings
from app.schemas import RagInfo

logger = logging.getLogger(__name__)

_FALLBACK_RECORD = {
    "name_kr": "알 수 없음",
    "name_sci": "",
    "toxin_type": "정보 없음",
    "symptoms": ["정보를 찾을 수 없습니다."],
    "firstAid": ["이상 증상 시 즉시 의료기관에 문의하십시오."],
    "emergency_action": "즉시 의료기관 방문",
    "lookalike_edible": None,
    "source": "정보 없음",
}


_KR_TO_CODE = {name_kr: code for code, name_kr in NAME_KR.items()}

# 실제 PDF 파싱 데이터(mushroom_db.json)에는 symptoms/firstAid가 배열로 들어있지 않아서,
# RagInfoPanel에 보여줄 상세 증상 경과·응급 대처 목록을 종별로 보강해둔다.
# (toxin_type/rank 등 핵심 사실은 real mushroom_db.json 쪽을 그대로 신뢰하고, 여기서는
# 그 사실을 사람이 읽기 좋은 타임라인/단계별 문장으로 풀어쓴 것)
SYMPTOM_FIRSTAID_ENRICHMENT: dict[str, dict[str, list[str]]] = {
    "amanita_pantherina": {
        "symptoms": [
            "섭취 30분~2시간 내 어지럼증·착란 등 신경 증상 발현",
            "심한 경우 경련, 환각, 일시적 혼수 상태",
            "위장 증상(구토·복통)이 동반되기도 함",
        ],
        "firstAid": [
            "즉시 119 신고 및 응급실 이송",
            "의식 저하 시 기도 확보, 무리한 구토 유도 금지",
            "섭취한 버섯 실물·사진을 보관해 종 동정에 활용",
        ],
    },
    "amanita_subjunquillea": {
        "symptoms": [
            "6~24시간 잠복기 후 심한 구토·설사·복통",
            "1~2일 거짓 회복기 동안 증상이 완화된 것처럼 보임",
            "치료 지연 시 간부전으로 진행 가능",
        ],
        "firstAid": [
            "즉시 119 신고 및 응급실 이송",
            "거짓 회복기에도 반드시 지속적인 의료 관찰 필요",
            "자가 구토 유도·민간요법 금지",
        ],
    },
    "entoloma_rhodopolium": {
        "symptoms": [
            "섭취 후 비교적 빠르게 구토·설사·복통 발생",
            "심한 탈수 및 전해질 불균형 우려",
        ],
        "firstAid": [
            "충분한 수분·전해질 보충",
            "증상이 심하거나 지속되면 즉시 응급실 방문",
            "먹은 버섯 실물 보존",
        ],
    },
    "omphalotus_japonicus": {
        "symptoms": [
            "섭취 후 심한 구토·설사·복통",
            "다량 섭취 시 탈수 및 전신 쇠약",
        ],
        "firstAid": [
            "수분·전해질 보충",
            "증상이 심하면 즉시 119 또는 응급실",
            "표고·느타리와 혼동되었는지 실물로 확인",
        ],
    },
    "hypholoma_fasciculare": {
        "symptoms": [
            "섭취 후 구토·설사·복통",
            "드물게 어지럼증 등 경미한 신경 증상",
        ],
        "firstAid": [
            "즉시 119 신고 또는 응급실 이송",
            "수분 보충 및 안정",
            "먹은 버섯 실물 보존",
        ],
    },
    "amanita_virosa": {
        "symptoms": [
            "섭취 후 6~24시간 잠복기 — 뚜렷한 증상 없음",
            "잠복기 이후 극심한 구토·설사·복통 (콜레라 유사 증상)",
            "1~2일 거짓 회복기 — 증상 완화로 호전 착각",
            "3~5일 경과 시 간·신부전, 다발성 장기부전으로 진행 가능",
        ],
        "firstAid": [
            "즉시 119 신고 및 응급실 이송",
            "섭취한 버섯·조리물의 실물과 사진을 보관해 종 동정에 활용",
            "자가 구토 유도·민간요법 금지 (오히려 위험)",
            "활성탄·실리빈 등 치료는 반드시 의료진 판단에 따름",
        ],
    },
    "trichoderma_cornudamae": {
        "symptoms": [
            "섭취 후 심한 구토·설사·복통",
            "이후 피부 박리, 조혈 기능 저하, 신경 증상 등 전신 중독 진행",
            "소량 섭취로도 사망에 이를 수 있는 맹독성",
        ],
        "firstAid": [
            "즉시 119 신고 및 응급실 이송 (지체 시 매우 위험)",
            "섭취량이 적더라도 반드시 의료기관 방문",
            "먹은 버섯 실물·사진 보관",
        ],
    },
}


def _rekey_by_class_code(data: dict[str, dict]) -> dict[str, dict]:
    """RAG 노트북이 export하는 mushroom_db.json은 국명(예: '독우산광대버섯')을 key로 쓰지만
    분류기는 영문 class_code(예: 'amanita_virosa')를 출력하므로, 조회 가능하도록 재-키한다.
    이미 class_code로 키가 되어 있으면 그대로 둔다."""
    rekeyed: dict[str, dict] = {}
    for key, record in data.items():
        if key in CLASS_NAMES:
            rekeyed[key] = record
        elif key in _KR_TO_CODE:
            rekeyed[_KR_TO_CODE[key]] = record
        else:
            rekeyed[key] = record  # 7종 외 종(향후 실시간 검색 대상) 등은 원래 key 그대로 보관
    return rekeyed


def load_mushroom_db(path: str | None = None) -> dict[str, dict]:
    """mushroom_db.json을 로드한다. 파일이 없거나 손상되어도 앱이 죽지 않도록
    빈 dict를 반환하고, 조회 시점에 get_core_info가 폴백 레코드를 채운다."""
    db_path = Path(path or settings.MUSHROOM_DB_PATH)
    if not db_path.exists():
        logger.warning("mushroom_db.json not found at %s — using per-species fallback records", db_path)
        return {}
    try:
        with open(db_path, encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        logger.warning("failed to load mushroom_db.json (%s) — using fallback records", e)
        return {}
    data.pop("_disclaimer", None)
    return _rekey_by_class_code(data)


MUSHROOM_DB: dict[str, dict] = load_mushroom_db()


def get_core_info(class_code: str) -> dict:
    record = MUSHROOM_DB.get(class_code)
    if record is None:
        return {**_FALLBACK_RECORD, "name_kr": class_code}
    return record


def get_rag_info(class_code: str) -> RagInfo:
    info = get_core_info(class_code)
    enrichment = SYMPTOM_FIRSTAID_ENRICHMENT.get(class_code, {})

    symptoms = info.get("symptoms") or enrichment.get("symptoms")
    if not symptoms:
        # 7종 보강 데이터에도 없는 경우(알 수 없는 종 등) toxin_type/rank로 최소한의 요약을 구성한다.
        toxin_type = info.get("toxin_type")
        rank = info.get("rank")
        if toxin_type:
            symptoms = [f"독소 유형: {toxin_type}" + (f" (위험도: {rank})" if rank else "")]
        else:
            symptoms = ["정보를 찾을 수 없습니다."]

    first_aid = info.get("firstAid") or enrichment.get("firstAid")
    if not first_aid:
        emergency_action = info.get("emergency_action")
        first_aid = [emergency_action] if emergency_action else ["이상 증상 시 즉시 의료기관에 문의하십시오."]

    source = info.get("source") or "국립수목원 「우리나라 독버섯」 생태도감"

    return RagInfo(
        name=info.get("name_kr", class_code),
        latin=LATIN_NAMES.get(class_code, info.get("name_sci") or ""),
        toxinType=info.get("toxin_type") or "정보 없음",
        symptoms=symptoms,
        firstAid=first_aid,
        source=source,
    )


def get_lookalike_name(class_code: str) -> str | None:
    return get_core_info(class_code).get("lookalike_edible")
