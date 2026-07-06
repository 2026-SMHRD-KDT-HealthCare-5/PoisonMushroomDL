from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from app.config import LATIN_NAMES, settings
from app.schemas import PredictionItem, PredictResponse
from app.services import classifier, mushroom_db

router = APIRouter()


@router.post("/predict", response_model=PredictResponse)
async def predict(request: Request, file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드할 수 있습니다.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="빈 파일입니다.")

    handle = request.app.state.model_handle
    raw_preds = classifier.predict(handle, image_bytes, top_k=settings.TOP_K)

    predictions = [
        PredictionItem(
            class_code=code,
            name_kr=mushroom_db.get_core_info(code).get("name_kr", code),
            latin=LATIN_NAMES.get(code, ""),
            isPoisonous=True,
            prob=round(prob, 1),
        )
        for code, prob in raw_preds
    ]

    top1_code = predictions[0].class_code
    rag_info = mushroom_db.get_rag_info(top1_code)

    return PredictResponse(predictions=predictions, ragInfo=rag_info)
