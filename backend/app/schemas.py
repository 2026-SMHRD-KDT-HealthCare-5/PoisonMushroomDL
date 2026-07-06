from pydantic import BaseModel


class PredictionItem(BaseModel):
    class_code: str
    name_kr: str
    latin: str
    isPoisonous: bool
    prob: float  # 0~100 (프론트 PredictionResult가 그대로 %로 사용)


class RagInfo(BaseModel):
    name: str
    latin: str
    toxinType: str
    symptoms: list[str]
    firstAid: list[str]
    source: str


class PredictResponse(BaseModel):
    predictions: list[PredictionItem]
    ragInfo: RagInfo


class AskRequest(BaseModel):
    class_code: str
    question: str


class AskResponse(BaseModel):
    answer: str
