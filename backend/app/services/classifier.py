import hashlib
import logging
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

from app.config import CLASS_NAMES, settings

logger = logging.getLogger(__name__)

IMG_SIZE = (224, 224)


@dataclass
class ModelHandle:
    model: Any | None
    mode: str  # "real" | "mock"
    backend: str


def _patch_keras_dense_for_newer_configs() -> None:
    """Colab에서 학습에 쓰인 Keras가 이 서버의 keras보다 최신이라 저장된
    .keras 안의 Dense 레이어 config에 아직 지원하지 않는 키(quantization_config 등)가
    포함될 수 있다. 값 자체는 사용하지 않으므로 안전하게 무시하고 로드한다."""
    import keras

    if getattr(keras.layers.Dense.__init__, "_quant_config_patched", False):
        return

    original_init = keras.layers.Dense.__init__

    def patched_init(self, *args, quantization_config=None, **kwargs):
        original_init(self, *args, **kwargs)

    patched_init._quant_config_patched = True
    keras.layers.Dense.__init__ = patched_init


def load_model(cfg=settings) -> ModelHandle:
    """실제 .keras 가중치 로드를 시도한다. tensorflow 미설치나 가중치 파일 부재 등
    어떤 이유로든 실패하면 예외를 삼키고 mock 모드로 폴백한다 — 서버는 항상 뜬다."""
    model_path = Path(cfg.MODEL_PATH)
    if not model_path.exists():
        logger.warning("model file not found at %s — classifier running in mock mode", model_path)
        return ModelHandle(model=None, mode="mock", backend=cfg.MODEL_BACKEND)

    try:
        import tensorflow as tf

        _patch_keras_dense_for_newer_configs()
        model = tf.keras.models.load_model(str(model_path))
        logger.info("loaded model from %s (backend=%s)", model_path, cfg.MODEL_BACKEND)
        return ModelHandle(model=model, mode="real", backend=cfg.MODEL_BACKEND)
    except Exception as e:  # ImportError(텐서플로 미설치), OSError(손상된 파일) 등
        logger.warning("failed to load model (%s) — classifier running in mock mode", e)
        return ModelHandle(model=None, mode="mock", backend=cfg.MODEL_BACKEND)


def preprocess(image_bytes: bytes, backend: str) -> np.ndarray:
    """두 모델 다 학습 노트북에서 `x = data_augmentation(inputs); x = preprocess_input(x)`처럼
    전처리를 모델 그래프 내부(Functional 정의)에 포함시켜 저장했다. 즉 저장된 .keras 파일이
    이미 원본 0~255 픽셀을 받아 내부에서 알아서 정규화한다 — 여기서 또 preprocess_input을
    적용하면 이중 정규화가 되어 값이 뭉개진다. 그래서 리사이즈만 하고 그대로 넘긴다."""
    img = Image.open(BytesIO(image_bytes)).convert("RGB").resize(IMG_SIZE)
    arr = np.asarray(img, dtype=np.float32)
    return np.expand_dims(arr, axis=0)


def _mock_probs(image_bytes: bytes) -> np.ndarray:
    """이미지 바이트 해시로 시드한 Dirichlet 분포로 그럴듯한(=한쪽으로 쏠린) top-3를 생성한다.
    같은 이미지를 다시 올리면 같은 결과가 나오도록 결정론적으로 시드한다."""
    seed = int(hashlib.md5(image_bytes).hexdigest(), 16) % (2**32)
    rng = np.random.RandomState(seed)
    return rng.dirichlet(alpha=[0.5] * len(CLASS_NAMES))


def predict(handle: ModelHandle, image_bytes: bytes, top_k: int = 3) -> list[tuple[str, float]]:
    if handle.mode == "real":
        batch = preprocess(image_bytes, handle.backend)
        probs = handle.model.predict(batch, verbose=0)[0]
    else:
        probs = _mock_probs(image_bytes)

    top_indices = np.argsort(probs)[::-1][:top_k]
    return [(CLASS_NAMES[i], float(probs[i]) * 100) for i in top_indices]
