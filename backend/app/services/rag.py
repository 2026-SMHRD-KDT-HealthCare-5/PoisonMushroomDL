import logging
import shutil
import tempfile
from pathlib import Path

from app.config import settings
from app.services import mushroom_db

logger = logging.getLogger(__name__)

_vectorstore = None
_llm = None
_rag_checked = False
_rag_available = False


def is_rag_available() -> bool:
    """GOOGLE_API_KEY가 설정되어 있고, langchain 계열 패키지가 설치되어 있고,
    FAISS 인덱스 폴더가 실제로 존재할 때만 True. 하나라도 없으면 템플릿 폴백을 쓴다."""
    global _rag_checked, _rag_available
    if _rag_checked:
        return _rag_available
    _rag_checked = True

    if not settings.GOOGLE_API_KEY:
        logger.info("GOOGLE_API_KEY not set — /ask running in template fallback mode")
        _rag_available = False
        return False

    faiss_dir = Path(settings.FAISS_INDEX_PATH)
    if not any(faiss_dir.glob("*")):
        logger.info("FAISS index not found at %s — /ask running in template fallback mode", faiss_dir)
        _rag_available = False
        return False

    try:
        import langchain_community.vectorstores  # noqa: F401
        import langchain_google_genai  # noqa: F401
    except ImportError as e:
        logger.info("RAG dependencies not installed (%s) — /ask running in template fallback mode", e)
        _rag_available = False
        return False

    _rag_available = True
    return True


def _ascii_safe_faiss_dir(path: str) -> str:
    """FAISS의 C++ IO 레이어(faiss.read_index)는 경로에 비-ASCII 문자(한글 등)가
    섞여 있으면 파일을 열지 못한다("Illegal byte sequence"). 프로젝트 경로 자체가
    한글을 포함하는 경우가 많으므로, 그럴 때만 ASCII 전용 임시 폴더로 복사해 그쪽에서 로드한다."""
    try:
        path.encode("ascii")
        return path
    except UnicodeEncodeError:
        pass

    safe_dir = Path(tempfile.gettempdir()) / "mycoscan_faiss_index"
    shutil.rmtree(safe_dir, ignore_errors=True)
    shutil.copytree(path, safe_dir)
    logger.info("FAISS index path contains non-ASCII characters — copied to %s", safe_dir)
    return str(safe_dir)


def _load_vectorstore():
    global _vectorstore
    if _vectorstore is not None:
        return _vectorstore

    from langchain_community.vectorstores import FAISS
    from langchain_google_genai import GoogleGenerativeAIEmbeddings

    embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001", google_api_key=settings.GOOGLE_API_KEY)
    index_dir = _ascii_safe_faiss_dir(settings.FAISS_INDEX_PATH)
    _vectorstore = FAISS.load_local(index_dir, embeddings, allow_dangerous_deserialization=True)
    return _vectorstore


def _load_llm():
    global _llm
    if _llm is not None:
        return _llm

    from langchain_google_genai import ChatGoogleGenerativeAI

    _llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=settings.GOOGLE_API_KEY)
    return _llm


def _template_answer(class_code: str, question: str) -> str:
    info = mushroom_db.get_core_info(class_code)
    return (
        f"{info.get('name_kr', class_code)}은(는) {info.get('toxin_type', '알 수 없는')} 계열 독소를 가진 독버섯입니다. "
        f"발생 시기/장소: {info.get('onset_time', '정보 없음')} / {info.get('habitat', '정보 없음')}. "
        f"권장 대응: {info.get('emergency_action', '즉시 의료기관 방문')}. "
        "현재는 AI 자유 질의응답 기능이 비활성화된 상태(GOOGLE_API_KEY 또는 RAG 인덱스 미설정)라 "
        "일반 정보만 안내해 드립니다. 실제 중독이 의심되면 즉시 119 또는 응급실에 문의하세요."
    )


def ask_followup(class_code: str, question: str) -> str:
    if is_rag_available():
        try:
            name_kr = mushroom_db.get_core_info(class_code).get("name_kr", class_code)
            vectorstore = _load_vectorstore()
            docs = vectorstore.similarity_search(f"{name_kr} {question}", k=3)
            context = "\n\n".join(d.page_content for d in docs)

            prompt = f"""아래는 독버섯 관련 정보입니다.
{context}

사용자가 '{name_kr}'에 대해 다음 질문을 했습니다: "{question}"
독버섯 정보를 근거로만 답변하고, 확실하지 않으면 반드시 의료진 상담을 안내하세요."""
            return _load_llm().invoke(prompt).content
        except Exception as e:
            logger.warning("RAG answer failed (%s) — falling back to template answer", e)

    return _template_answer(class_code, question)


def get_lookalike_comparison(class_code: str) -> str:
    info = mushroom_db.get_core_info(class_code)
    lookalike = info.get("lookalike_edible")
    if not lookalike:
        return "닮은꼴 식용종 정보가 없습니다."

    if is_rag_available():
        try:
            prompt = f"""독버섯 '{info.get('name_kr', class_code)}' 특징:
{info.get('morphology', '')}

닮은꼴 식용종 정보(원문 그대로): {lookalike}

두 종을 구별할 수 있는 핵심 포인트 2~3가지를 한국어로 간결하게 알려줘."""
            return _load_llm().invoke(prompt).content
        except Exception as e:
            logger.warning("RAG lookalike comparison failed (%s) — returning raw text", e)

    return lookalike
