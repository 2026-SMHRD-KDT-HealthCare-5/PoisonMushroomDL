import os
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent  # backend/app
ROOT_DIR = APP_DIR.parent  # backend

try:
    from dotenv import load_dotenv

    load_dotenv(ROOT_DIR / ".env")
except ImportError:
    pass

# CV가 직접 분류하는 독버섯 7종 (기획서 변경사항: lookalike-pair 방식 폐기, 7종 직접 분류로 전환)
CLASS_NAMES = [
    "amanita_pantherina",
    "amanita_subjunquillea",
    "entoloma_rhodopolium",
    "omphalotus_japonicus",
    "hypholoma_fasciculare",
    "amanita_virosa",
    "trichoderma_cornudamae",
]

# class_code -> 학명 (저자 인용 없는 깨끗한 문자열, 프론트 mushroomData.js의 키와 1:1로 맞춤)
LATIN_NAMES = {
    "amanita_pantherina": "Amanita pantherina",
    "amanita_subjunquillea": "Amanita subjunquillea",
    "entoloma_rhodopolium": "Entoloma rhodopolium",
    "omphalotus_japonicus": "Omphalotus japonicus",
    "hypholoma_fasciculare": "Hypholoma fasciculare",
    "amanita_virosa": "Amanita virosa",
    "trichoderma_cornudamae": "Trichoderma cornu-damae",
}

# class_code -> 국명. RAG 노트북이 export하는 mushroom_db.json은 국명을 key로 쓰므로,
# mushroom_db.py가 이 매핑을 이용해 class_code 기준으로 재-키한다.
NAME_KR = {
    "amanita_pantherina": "마귀광대버섯",
    "amanita_subjunquillea": "개나리광대버섯",
    "entoloma_rhodopolium": "삿갓외대버섯",
    "omphalotus_japonicus": "화경솔밭버섯",
    "hypholoma_fasciculare": "노란개암버섯",
    "amanita_virosa": "독우산광대버섯",
    "trichoderma_cornudamae": "붉은사슴뿔버섯",
}


def _resolve(env_value: str | None, default: Path) -> str:
    """.env 값이 상대경로면 실행 시 cwd가 아니라 backend/ 기준으로 해석한다
    (uvicorn --app-dir 등으로 cwd가 프로젝트 루트일 때도 항상 올바른 경로를 찾도록)."""
    if not env_value:
        return str(default)
    p = Path(env_value)
    return str(p if p.is_absolute() else (ROOT_DIR / p))


class Settings:
    MODEL_PATH: str = _resolve(os.getenv("MODEL_PATH"), ROOT_DIR / "models" / "model_b.keras")
    MODEL_BACKEND: str = os.getenv("MODEL_BACKEND", "efficientnet")  # "efficientnet" | "resnet"

    MUSHROOM_DB_PATH: str = _resolve(os.getenv("MUSHROOM_DB_PATH"), APP_DIR / "data" / "mushroom_db.json")
    FAISS_INDEX_PATH: str = _resolve(os.getenv("FAISS_INDEX_PATH"), APP_DIR / "data" / "faiss_index")

    GOOGLE_API_KEY: str | None = os.getenv("GOOGLE_API_KEY") or None

    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]

    TOP_K: int = int(os.getenv("TOP_K", "3"))


settings = Settings()
