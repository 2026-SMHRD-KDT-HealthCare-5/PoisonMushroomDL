import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";

// MushroomChatbot 컴포넌트
export default function MushroomChatbot({ classCode, speciesName }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `${speciesName}에 대해 궁금한 점을 물어보세요. 예: "먹은 지 3시간 지났는데 괜찮나요?"`,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_code: classCode, question }),
      });

      if (!res.ok) throw new Error("서버 응답 오류");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setError("답변을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!classCode) {
    return (
      <div className="w-full mx-auto bg-white rounded-xl border border-gray-200 flex-1 min-h-0 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm text-gray-400">챗봇 대기 중</p>
          <p className="text-xs text-gray-400 mt-1">이미지를 분석하면 예측된 종에 대해 질문할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (

    <div className="w-full mx-auto bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden flex-1 min-h-0">

      {/* 헤더 영역 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-900">더 궁금한 점 물어보기</p>
        <p className="text-xs text-gray-500">{speciesName} 관련 자유 질문 · RAG 기반 답변</p>
      </div>

      {/* 채팅 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 min-h-[80px] overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* 로딩 상태 표시 */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              답변 생성 중...
            </div>
          </div>
        )}

        {/* 에러 메시지 표시 */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 px-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 p-3">

        {/* 입력 필드 */}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예: 먹은 지 3시간 지났는데 괜찮나요?"
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />

          {/* 전송 버튼 */}
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="shrink-0 w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center disabled:opacity-40"
            aria-label="질문 보내기"
          >
            <Send className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* 하단 안내 문구 */}
      <div className="bg-amber-50 px-4 py-2">
        <p className="text-[11px] text-amber-800 leading-snug">
          본 답변은 참고용 보조 정보이며 실제 진단·치료 결정은 반드시 의료진 판단에 따라야 합니다.
        </p>
      </div>
    </div>
  );
}
