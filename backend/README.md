# MycoScan Backend

FastAPI 기반 백엔드. `.keras` 모델이나 RAG 산출물이 없어도 바로 실행되며(mock 모드),
실제 파일을 넣으면 자동으로 실제 모드로 전환됩니다.

## 빠른 시작

**Python 버전 주의**: TensorFlow는 아직 Python 3.13/3.14를 지원하지 않는다(설치 시 numpy/tensorflow가 깨질 수 있음).
실제 추론을 쓰려면 **Python 3.10~3.12**로 가상환경을 만들 것.

```bash
cd backend
py -3.10 -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt   # tensorflow/langchain 등 무거운 패키지는 주석 처리해도 mock 모드로 동작
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

`GET http://localhost:8000/health` 로 현재 `model_mode`(`real`/`mock`), `rag_mode`(`real`/`fallback`)를 확인할 수 있습니다.

프론트엔드(`frontend/`)는 `npm run dev`로 실행하면 Vite 프록시를 통해 `/predict`, `/ask`가 자동으로 이 백엔드(8000번 포트)로 전달됩니다.

## 실제 학습 모델 연결하기

1. Colab에서 학습한 `.keras` 가중치 파일을 다운로드합니다.
2. `backend/models/model_b.keras` (EfficientNetB0, 기본값) 또는 `backend/models/model_a.keras` (ResNet50V2) 위치에 놓습니다.
3. ResNet50V2를 쓴다면 `.env`에서 `MODEL_PATH=models/model_a.keras`, `MODEL_BACKEND=resnet`으로 변경합니다.
4. 서버를 재시작하면 `/health`의 `model_mode`가 `real`로 바뀝니다.

## 실제 RAG(Gemini + FAISS) 연결하기

1. `mushroom_rag_2 (1).ipynb`의 마지막 셀에서 export한 `mushroom_db.json`과 `faiss_index/` 폴더를 준비합니다.
2. `faiss_index/`는 통째로 `backend/app/data/faiss_index/`에 복사합니다.
3. `mushroom_db.json`은 **주의**: 노트북 원본은 국문 종명(예: `"마귀광대버섯"`)을 key로 사용하지만,
   이 백엔드는 분류기가 출력하는 영문 slug(`class_code`, 예: `amanita_virosa`)를 key로 기대합니다.
   아래 스니펫으로 한 번 재-키(re-key)한 뒤 `backend/app/data/mushroom_db.json`에 덮어씁니다:

   ```python
   import json
   KR_TO_CODE = {
       "마귀광대버섯": "amanita_pantherina",
       "개나리광대버섯": "amanita_subjunquillea",
       "삿갓외대버섯": "entoloma_rhodopolium",
       "화경버섯": "omphalotus_japonicus",
       "노란개암버섯": "hypholoma_fasciculare",
       "독우산광대버섯": "amanita_virosa",
       "붉은사슴뿔버섯": "trichoderma_cornudamae",
   }
   raw = json.load(open("mushroom_db_raw.json", encoding="utf-8"))
   rekeyed = {KR_TO_CODE[k]: v for k, v in raw.items() if k in KR_TO_CODE}
   json.dump(rekeyed, open("mushroom_db.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
   ```
4. `.env`에 `GOOGLE_API_KEY`를 채웁니다.
5. 서버를 재시작하면 `/health`의 `rag_mode`가 `real`로 바뀝니다.

## API 계약

### `POST /predict`
- 요청: multipart/form-data, 필드명 `file` (이미지)
- 응답:
  ```json
  {
    "predictions": [
      {"class_code": "amanita_virosa", "name_kr": "독우산광대버섯", "latin": "Amanita virosa", "isPoisonous": true, "prob": 91.2},
      ...
    ],
    "ragInfo": {"name": "...", "latin": "...", "toxinType": "...", "symptoms": ["..."], "firstAid": ["..."], "source": "..."}
  }
  ```

### `POST /ask`
- 요청: `{"class_code": "amanita_virosa", "question": "먹은 지 3시간 지났는데 괜찮나요?"}`
- 응답: `{"answer": "..."}`
