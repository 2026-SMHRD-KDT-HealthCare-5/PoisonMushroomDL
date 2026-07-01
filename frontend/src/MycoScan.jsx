// MycoScan.jsx
// 국내 야생버섯 판별 · RAG 교육 서비스 — 프로토타입 (React)
//
// 사용법 (Vite / CRA 등 번들러 환경):
//   import MycoScan from './MycoScan.jsx';
//   <MycoScan />
// 폰트: index.html <head> 에 아래 링크 추가
//   <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500;1,6..72,600&family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
// 그리고 전역 CSS 에 @keyframes camPulse{0%,100%{opacity:.78}50%{opacity:.97}} 추가.

import React, { useState, useRef } from 'react';

/* ---------------- data ---------------- */
const TOP3 = [
  { rank: 1, ko: '독우산광대버섯', la: 'Amanita virosa', wpct: '91.2%', tox: '독' },
  { rank: 2, ko: '흰주름버섯', la: 'Agaricus arvensis', wpct: '6.4%', tox: '식용' },
  { rank: 3, ko: '흰알광대버섯', la: 'Amanita verna', wpct: '2.4%', tox: '독' },
];

const RAG = {
  species: '독우산광대버섯', latin: 'Amanita virosa',
  nickname: '죽음의 천사 (Destroying Angel)',
  risk: '치명적', riskNote: '성숙 자실체 1개로 성인 사망 가능',
  toxins: '아마톡신(α-아마니틴)·팔로톡신 등 환상 펩타이드. 가열·건조로 분해되지 않음.',
  timeline: [
    { t: '섭취 후 6–24시간', d: '잠복기 — 뚜렷한 증상 없음' },
    { t: '6–24시간 경과', d: '극심한 구토·설사·복통 (콜레라 유사)' },
    { t: '1–2일', d: '거짓 회복기 — 증상 완화로 호전 착각' },
    { t: '3–5일', d: '간·신부전, 다발성 장기부전으로 진행' },
  ],
  firstAid: [
    { n: 1, d: '즉시 119 신고 및 응급실 이송' },
    { n: 2, d: '섭취한 버섯·조리물의 실물과 사진을 보관해 종 동정에 활용' },
    { n: 3, d: '자가 구토 유도·민간요법 금지 (오히려 위험)' },
    { n: 4, d: '활성탄·실리빈 등 치료는 의료진 판단에 따름' },
  ],
  sources: ['국립수목원 「한국의 독버섯」 도감', '농촌진흥청 버섯 표본 데이터베이스', '대한응급의학회 중독 진료지침'],
};

const SIMILAR = {
  poison: { ko: '독우산광대버섯', la: 'Amanita virosa' },
  edible: { ko: '흰주름버섯', la: 'Agaricus arvensis' },
  rows: [
    { feat: '대주머니(볼바)', p: '있음 — 밑동에 막질 주머니', e: '없음', key: true },
    { feat: '주름 색', p: '항상 순백색 유지', e: '분홍 → 성숙 시 초콜릿갈색', key: true },
    { feat: '포자문', p: '백색', e: '자갈색~흑갈색', key: true },
    { feat: '턱받이(고리)', p: '있음', e: '있음 (쉽게 탈락)', key: false },
    { feat: '냄새', p: '뚜렷한 향 없음', e: '아니스·아몬드 향', key: false },
  ],
  tip: '백색 주름 + 밑동 대주머니가 함께 보이면 맹독 신호입니다. 흰주름버섯과 가장 흔히 혼동되며, 오동정 시 치명적입니다.',
};

function buildErr() {
  const truths = ['독우산광대', '흰주름', '흰알광대', '큰갓', '노란다발'];
  const M = [
    [96.8, 0.4, 2.1, 0.2, 0.5],
    [2.1, 95.3, 0.6, 1.4, 0.6],
    [3.0, 0.3, 95.9, 0.4, 0.4],
    [0.2, 0.9, 0.1, 97.6, 1.2],
    [0.4, 0.5, 0.2, 1.7, 97.2],
  ];
  const rows = M.map((r, i) => ({
    truth: truths[i],
    cells: r.map((v, j) => {
      let bg, fg;
      if (i === j) { const al = (0.20 + v / 100 * 0.70).toFixed(2); bg = `rgba(75,107,52,${al})`; fg = v > 55 ? '#F4ECD8' : '#33291B'; }
      else { const al = (Math.min(v / 6, 1) * 0.72).toFixed(2); bg = `rgba(158,43,37,${al})`; fg = (+al > 0.42) ? '#F4ECD8' : '#8A7550'; }
      const hi = (i === 1 && j === 0);
      return { v: v.toFixed(1), bg, fg, ring: hi ? '0 0 0 2px #B07A2E inset' : 'none' };
    }),
  }));
  return {
    metrics: [
      { k: 'Top-1 정확도', v: '94.3%' },
      { k: 'Top-3 정확도', v: '99.1%' },
      { k: 'Macro F1', v: '0.912' },
      { k: '클래스', v: '42종' },
      { k: '검증 이미지', v: '8,640' },
    ],
    short: truths,
    matrixRows: rows,
    confused: [
      { a: '흰주름버섯', b: '독우산광대버섯', v: '2.1%', safe: true, danger: false },
      { a: '노란다발', b: '개암버섯', v: '1.4%', safe: false, danger: true },
      { a: '큰갓버섯', b: '흰독큰갓버섯', v: '0.9%', safe: false, danger: true },
    ],
  };
}
const ERR = buildErr();

/* ---------------- shared style tokens ---------------- */
const panelStyle = { background: '#FBF5E7', border: '1px solid #CDBB98', borderRadius: 10, boxShadow: '0 1px 0 #fffef8 inset,0 10px 26px -20px rgba(60,40,10,.55)', padding: '16px 17px 16px' };
const labelStyle = { fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: '#8A6D3C', fontWeight: 600 };
const serif = "'Newsreader',serif";
const mono = "'IBM Plex Mono',monospace";
const cardStyle = { position: 'relative', flex: '0 0 auto', background: '#EFE5D0', border: '1px solid #C4B08A', borderRadius: 14, overflow: 'hidden', boxShadow: '0 40px 90px -50px rgba(60,40,10,.7)' };

function PanelHead({ dot, children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />
      <span style={labelStyle}>{children}</span>
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </div>
  );
}

function Empty({ title, sub }) {
  return (
    <div style={{ border: '1px dashed #C9B48A', borderRadius: 8, padding: '34px 16px', textAlign: 'center', background: '#F6EDD8' }}>
      <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 15, color: '#A08A5F' }}>{title}</div>
      <div style={{ fontSize: 11.5, color: '#A08A5F', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

/* ---------------- drop slot (drag & drop upload, persisted) ---------------- */
function DropSlot({ id, placeholder, height, camOn, corners = true }) {
  const key = 'myco:' + id;
  const [img, setImg] = useState(() => { try { return localStorage.getItem(key) || ''; } catch (e) { return ''; } });
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);
  const load = (file) => {
    if (!file || !/^image\//.test(file.type)) return;
    const r = new FileReader();
    r.onload = e => { setImg(e.target.result); try { localStorage.setItem(key, e.target.result); } catch (_) {} };
    r.readAsDataURL(file);
  };
  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); load(e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current && inputRef.current.click()}
      style={{ position: 'relative', height, border: '1px solid ' + (over ? '#B07A2E' : '#C4B08A'), borderRadius: 7, overflow: 'hidden', background: '#F2E8D2', cursor: 'pointer' }}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => load(e.target.files[0])} />
      {img
        ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#A99167', pointerEvents: 'none', padding: 12, textAlign: 'center' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#B79B6C" strokeWidth="1.4" /><circle cx="8.5" cy="9.5" r="1.6" fill="#B79B6C" /><path d="M4 18l4.5-5 3.5 3.5L15.5 12 20 17.5" stroke="#B79B6C" strokeWidth="1.4" fill="none" strokeLinejoin="round" /></svg>
            <span style={{ fontSize: 12.5 }}>{placeholder}</span>
            <span style={{ fontSize: 11, color: '#BBA679', textDecoration: 'underline' }}>클릭 또는 드래그하여 업로드</span>
          </div>}
      {corners && ['tl', 'tr', 'bl', 'br'].map(c => {
        const pos = {
          tl: { top: 8, left: 8, borderTop: '2px solid #A78E63', borderLeft: '2px solid #A78E63' },
          tr: { top: 8, right: 8, borderTop: '2px solid #A78E63', borderRight: '2px solid #A78E63' },
          bl: { bottom: 8, left: 8, borderBottom: '2px solid #A78E63', borderLeft: '2px solid #A78E63' },
          br: { bottom: 8, right: 8, borderBottom: '2px solid #A78E63', borderRight: '2px solid #A78E63' },
        }[c];
        return <div key={c} style={{ position: 'absolute', width: 16, height: 16, pointerEvents: 'none', ...pos }} />;
      })}
      {camOn && (
        <>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'multiply', animation: 'camPulse 2.6s ease-in-out infinite', background: 'radial-gradient(circle at 45% 41%,rgba(200,20,10,.92),rgba(255,150,0,.55) 20%,rgba(255,220,60,.28) 36%,rgba(30,90,180,.06) 60%,transparent 72%),radial-gradient(circle at 59% 58%,rgba(220,60,10,.6),rgba(255,170,0,.3) 28%,transparent 52%)' }} />
          <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(43,34,22,.86)', borderRadius: 6, padding: '7px 9px', pointerEvents: 'none' }}>
            <div style={{ fontSize: 9, letterSpacing: '.08em', color: '#EBD9B6', marginBottom: 4 }}>모델이 주목한 영역</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: mono, fontSize: 9, color: '#9FB0C8' }}>낮음</span>
              <span style={{ width: 78, height: 7, borderRadius: 4, background: 'linear-gradient(90deg,#2E5AB4,#E9B84A,#C8140A)' }} />
              <span style={{ fontFamily: mono, fontSize: 9, color: '#E9B84A' }}>높음</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- panels ---------------- */
function SpecimenPanel({ slotId, placeholder, st, on }) {
  const analyzed = st.analyzed;
  return (
    <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column' }}>
      <PanelHead dot="#B07A2E" right={analyzed && (
        <button onClick={on.toggleCam} style={st.cam
          ? { fontSize: 12, fontWeight: 700, color: '#7A211C', background: '#F3DCD8', border: '1px solid #C24A3E', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }
          : { fontSize: 12, fontWeight: 600, color: '#6B5D45', background: '#F0E6CF', border: '1px solid #CDBB98', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={st.cam ? { width: 8, height: 8, borderRadius: '50%', background: '#C24A3E', boxShadow: '0 0 0 3px rgba(194,74,62,.25)' } : { width: 8, height: 8, borderRadius: 2, background: 'linear-gradient(135deg,#C24A3E,#E9B84A)' }} />
          {st.cam ? 'Grad-CAM 켜짐' : 'Grad-CAM 히트맵'}
        </button>
      )}>표본 이미지 · Specimen</PanelHead>

      <DropSlot id={slotId} placeholder={placeholder} height={340} camOn={st.cam} />

      {!analyzed
        ? <div style={{ marginTop: 13 }}>
            <button onClick={on.analyze} style={{ width: '100%', fontSize: 14, fontWeight: 700, letterSpacing: '.02em', color: '#F6EFDD', background: 'linear-gradient(180deg,#4B6B34,#3D5A2A)', border: '1px solid #34501F', borderRadius: 8, padding: 12, cursor: 'pointer', boxShadow: '0 6px 16px -10px rgba(60,80,30,.8)' }}>이미지 분석 실행</button>
            <div style={{ fontSize: 11.5, color: '#94805C', textAlign: 'center', marginTop: 8 }}>사진을 올린 뒤 분석을 실행하면 Top-3 예측과 정보가 표시됩니다.</div>
          </div>
        : <div style={{ marginTop: 13, display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px', background: '#F3DCD8', border: '1px solid #E0B6AE', borderRadius: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.04em', color: '#F6EFDD', background: '#9E2B25', borderRadius: 5, padding: '5px 9px', flexShrink: 0 }}>독 · 위험</span>
            <div style={{ lineHeight: 1.2, minWidth: 0 }}>
              <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: '#33291B' }}>독우산광대버섯</div>
              <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12.5, color: '#8A6D3C' }}>Amanita virosa · 확률 91.2%</div>
            </div>
            <button onClick={on.reset} style={{ marginLeft: 'auto', flexShrink: 0, fontSize: 12, fontWeight: 600, color: '#6B5D45', background: 'transparent', border: '1px solid #C7A79E', borderRadius: 6, padding: '6px 11px', cursor: 'pointer' }}>다시</button>
          </div>}
    </div>
  );
}

function PredictionPanel({ analyzed }) {
  return (
    <div style={panelStyle}>
      <PanelHead dot="#B07A2E" right={<span style={{ fontFamily: mono, fontSize: 10.5, color: '#94805C' }}>softmax</span>}>예측 결과 · Top-3</PanelHead>
      {!analyzed
        ? <Empty title="분석 대기 중" sub="표본을 분석하면 후보 종과 확률이 표시됩니다." />
        : <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {TOP3.map(item => {
                const poison = item.tox === '독';
                return (
                  <div key={item.rank}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontFamily: mono, fontSize: 11, color: '#B09263', width: 14 }}>{item.rank}</span>
                      <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: '#33291B' }}>{item.ko}</span>
                      <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 12, color: '#9A8560' }}>{item.la}</span>
                      <span style={poison ? { fontSize: 10, fontWeight: 700, color: '#9E2B25', background: '#F3DCD8', borderRadius: 4, padding: '2px 6px' } : { fontSize: 10, fontWeight: 700, color: '#4B6B34', background: '#DFE7CE', borderRadius: 4, padding: '2px 6px' }}>{item.tox}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 13.5, fontWeight: 500, color: '#33291B' }}>{item.wpct}</span>
                    </div>
                    <div style={{ height: 10, background: '#EADFC6', borderRadius: 5, marginTop: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: item.wpct, borderRadius: 5, background: poison ? 'linear-gradient(90deg,#9E2B25,#C24A3E)' : 'linear-gradient(90deg,#4B6B34,#77934B)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 13, paddingTop: 11, borderTop: '1px solid #E7DBC0' }}>
              <span style={{ fontFamily: mono, fontSize: 12, color: '#B07A2E' }}>※</span>
              <span style={{ fontSize: 11.5, lineHeight: 1.45, color: '#8A7550' }}>확률이 높아도 실제 종 동정은 대주머니·포자문 등 실물 형질과 전문가 확인이 반드시 필요합니다.</span>
            </div>
          </>}
    </div>
  );
}

function RagPanel({ analyzed }) {
  return (
    <div style={panelStyle}>
      <PanelHead dot="#9E2B25" right={<span style={{ fontSize: 10, fontWeight: 600, color: '#4B6B34', background: '#DFE7CE', borderRadius: 20, padding: '3px 9px' }}>생태도감 검색 3건</span>}>생태·독성 정보 · RAG</PanelHead>
      {!analyzed
        ? <Empty title="정보 대기 중" sub="예측 종에 맞춰 생태도감에서 독성·증상·대처를 불러옵니다." />
        : <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: '#33291B' }}>{RAG.species}</span>
              <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: '#8A6D3C' }}>{RAG.latin}</span>
            </div>
            <div style={{ fontSize: 12, color: '#9E2B25', fontWeight: 600, marginTop: 2 }}>별칭 · {RAG.nickname}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 12, padding: '11px 13px', background: '#9E2B25', borderRadius: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: '#F2C9A0' }}>위험도</span>
              <span style={{ fontFamily: serif, fontSize: 19, fontWeight: 600, color: '#F6EFDD' }}>{RAG.risk}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#F0C7BE', textAlign: 'right' }}>{RAG.riskNote}</span>
            </div>
            <div style={{ marginTop: 13 }}>
              <div style={{ ...labelStyle, fontSize: 10.5, marginBottom: 5 }}>독성분</div>
              <div style={{ fontSize: 13, color: '#3D3222', lineHeight: 1.5 }}>{RAG.toxins}</div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ ...labelStyle, fontSize: 10.5, marginBottom: 8 }}>증상 경과</div>
              <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '2px solid #E0B6AE', paddingLeft: 14 }}>
                {RAG.timeline.map((s, i) => (
                  <div key={i} style={{ position: 'relative', padding: '0 0 12px' }}>
                    <span style={{ position: 'absolute', left: -21, top: 3, width: 9, height: 9, borderRadius: '50%', background: '#9E2B25', border: '2px solid #FBF5E7' }} />
                    <div style={{ fontFamily: mono, fontSize: 11, color: '#9E2B25', fontWeight: 500 }}>{s.t}</div>
                    <div style={{ fontSize: 12.5, color: '#3D3222', lineHeight: 1.4 }}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ ...labelStyle, fontSize: 10.5, marginBottom: 7 }}>응급 대처</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {RAG.firstAid.map(fa => (
                  <div key={fa.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ flexShrink: 0, marginTop: 2, width: 15, height: 15, borderRadius: '50%', background: '#DFE7CE', color: '#4B6B34', fontFamily: mono, fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{fa.n}</span>
                    <span style={{ fontSize: 12.5, color: '#3D3222', lineHeight: 1.45 }}>{fa.d}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 11, borderTop: '1px solid #E7DBC0' }}>
              <div style={{ fontSize: 10, letterSpacing: '.08em', color: '#94805C', marginBottom: 6 }}>검색 출처 (Retrieved sources)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {RAG.sources.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#6B5D45' }}>
                    <span style={{ flexShrink: 0, width: 13, height: 15, border: '1px solid #B79B6C', borderRadius: 2, background: '#F2E8D2' }} />{s}
                  </div>
                ))}
              </div>
            </div>
          </div>}
    </div>
  );
}

function SimilarPanel({ analyzed, poisonSlot, edibleSlot }) {
  const cols = [
    { d: SIMILAR.poison, slot: poisonSlot, tox: '독', bg: '#9E2B25', ph: '독종 참고 사진' },
    { d: SIMILAR.edible, slot: edibleSlot, tox: '식용', bg: '#4B6B34', ph: '식용종 참고 사진' },
  ];
  return (
    <div style={panelStyle}>
      <PanelHead dot="#B07A2E">닮은꼴 비교 · Look-alike</PanelHead>
      {!analyzed
        ? <Empty title="비교 대기 중" sub="가장 헷갈리는 식용 짝과 나란히 비교합니다." />
        : <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {cols.map((c, i) => (
                <div key={i}>
                  <div style={{ position: 'relative' }}>
                    <DropSlot id={c.slot} placeholder={c.ph} height={150} camOn={false} corners={false} />
                    <span style={{ position: 'absolute', top: 7, left: 7, fontSize: 10, fontWeight: 700, color: '#F6EFDD', background: c.bg, borderRadius: 4, padding: '3px 7px', pointerEvents: 'none' }}>{c.tox}</span>
                  </div>
                  <div style={{ fontFamily: serif, fontSize: 15, fontWeight: 600, color: '#33291B', marginTop: 7 }}>{c.d.ko}</div>
                  <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 11.5, color: '#8A6D3C' }}>{c.d.la}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, border: '1px solid #E1D4B4', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.35fr 1.35fr', background: '#EFE3C7' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#8A6D3C', padding: '7px 10px' }}>감별 형질</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9E2B25', padding: '7px 10px', borderLeft: '1px solid #E1D4B4' }}>독우산광대버섯</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#4B6B34', padding: '7px 10px', borderLeft: '1px solid #E1D4B4' }}>흰주름버섯</div>
              </div>
              {SIMILAR.rows.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.35fr 1.35fr', borderTop: '1px solid #ECE0C4', background: row.key ? '#FBF2E3' : '#FBF5E7' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#5A4A2F', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {row.key && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#B07A2E', flexShrink: 0 }} />}{row.feat}
                  </div>
                  <div style={{ fontSize: 12, color: '#3D3222', padding: '8px 10px', borderLeft: '1px solid #ECE0C4', lineHeight: 1.35 }}>{row.p}</div>
                  <div style={{ fontSize: 12, color: '#3D3222', padding: '8px 10px', borderLeft: '1px solid #ECE0C4', lineHeight: 1.35 }}>{row.e}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 12, padding: '11px 13px', background: '#F3DCD8', border: '1px solid #E0B6AE', borderRadius: 8 }}>
              <span style={{ flexShrink: 0, fontFamily: serif, fontWeight: 700, fontSize: 16, color: '#9E2B25', lineHeight: 1 }}>!</span>
              <span style={{ fontSize: 12.5, lineHeight: 1.5, color: '#7A2A24' }}>{SIMILAR.tip}</span>
            </div>
          </>}
    </div>
  );
}

function ErrorPanel() {
  return (
    <div style={panelStyle}>
      <PanelHead dot="#5A4A2F">모델 오류 분석 · Diagnostics</PanelHead>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ERR.metrics.map((m, i) => (
          <div key={i} style={{ flex: 1, minWidth: 88, background: '#F6EDD8', border: '1px solid #E1D4B4', borderRadius: 7, padding: '9px 10px' }}>
            <div style={{ fontFamily: mono, fontSize: 17, fontWeight: 500, color: '#33291B' }}>{m.v}</div>
            <div style={{ fontSize: 10, color: '#8A7550', marginTop: 1 }}>{m.k}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 16, marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#5A4A2F' }}>혼동 행렬</span>
        <span style={{ fontSize: 10.5, color: '#94805C' }}>행 = 실제 · 열 = 예측 (%)</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(5,1fr)', gap: 2 }}>
        <div />
        {ERR.short.map((c, i) => (<div key={i} style={{ fontSize: 9.5, fontWeight: 600, color: '#8A7550', textAlign: 'center', paddingBottom: 2 }}>{c}</div>))}
        {ERR.matrixRows.map((mr, ri) => (
          <React.Fragment key={ri}>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: '#8A7550', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, textAlign: 'right' }}>{mr.truth}</div>
            {mr.cells.map((cell, ci) => (
              <div key={ci} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, fontFamily: mono, fontSize: 10.5, background: cell.bg, color: cell.fg, boxShadow: cell.ring }}>{cell.v}</div>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9 }}>
        <span style={{ width: 11, height: 11, borderRadius: 3, boxShadow: '0 0 0 2px #B07A2E inset', background: 'rgba(158,43,37,.25)' }} />
        <span style={{ fontSize: 10.5, color: '#8A7550' }}>흰주름버섯을 독우산광대버섯으로 오분류 (2.1%) — 안전 방향 오류지만 반대 방향은 치명적.</span>
      </div>
      <div style={{ marginTop: 15 }}>
        <div style={{ ...labelStyle, fontSize: 11, letterSpacing: '.1em', marginBottom: 8 }}>최다 혼동 쌍</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {ERR.confused.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: '#F6EDD8', border: '1px solid #E7DBC0', borderRadius: 7 }}>
              <span style={{ fontSize: 12.5, color: '#3D3222' }}>{p.a}</span>
              <span style={{ fontFamily: mono, fontSize: 12, color: '#B07A2E' }}>→</span>
              <span style={{ fontSize: 12.5, color: '#3D3222' }}>{p.b}</span>
              <span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 12, fontWeight: 500, color: '#9E2B25' }}>{p.v}</span>
              {p.safe && <span style={{ fontSize: 9.5, fontWeight: 700, color: '#4B6B34', background: '#DFE7CE', borderRadius: 4, padding: '2px 6px' }}>안전 방향</span>}
              {p.danger && <span style={{ fontSize: 9.5, fontWeight: 700, color: '#9E2B25', background: '#F3DCD8', borderRadius: 4, padding: '2px 6px' }}>주의</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- shared chrome ---------------- */
function Banner({ rightText }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#7A211C', padding: '11px 22px 11px 150px' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M12 3L22 20H2L12 3Z" fill="#E9B84A" stroke="#F6EFDD" strokeWidth="1.2" strokeLinejoin="round" /><rect x="11.1" y="9" width="1.8" height="5.5" rx=".9" fill="#7A211C" /><circle cx="12" cy="17" r="1.1" fill="#7A211C" /></svg>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#F6EFDD' }}>교육용 도구입니다 · 이 결과로 식용 여부를 판단하거나 버섯을 섭취하지 마세요.</span>
      <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#EFC3B9' }}>{rightText}</span>
    </div>
  );
}

function VariantBadge({ children }) {
  return <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 5, fontFamily: mono, fontSize: 12, fontWeight: 500, color: '#F6EFDD', background: '#5A4A2F', borderRadius: 6, padding: '4px 10px' }}>{children}</div>;
}

/* ---------------- variant A : dense console ---------------- */
function VariantA({ st, on }) {
  return (
    <div id="1a" style={{ ...cardStyle, width: 1400 }}>
      <VariantBadge>1a · 밀집 콘솔</VariantBadge>
      <Banner rightText="야생 버섯 식별은 반드시 전문가 확인 필요 · 상단 고정" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 22px', borderBottom: '1px solid #D8C6A2' }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#4B6B34,#B07A2E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 13a8 8 0 0116 0v.5H4V13z" fill="#F6EFDD" /><rect x="10" y="13.5" width="4" height="7" rx="1.6" fill="#EFE5D0" /></svg>
        </div>
        <div>
          <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: '#33291B', lineHeight: 1.05 }}>MycoScan</div>
          <div style={{ fontSize: 11.5, color: '#8A7550' }}>국내 야생버섯 판별 · 교육 콘솔</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: '#6B5D45', background: '#F6EDD8', border: '1px solid #D8C6A2', borderRadius: 20, padding: '5px 11px' }}>EfficientNet-B4 · 42종</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#4B6B34', background: '#DFE7CE', border: '1px solid #C3D3A5', borderRadius: 20, padding: '5px 11px' }}>RAG 도감 연동</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '390px 1fr 400px', gap: 18, padding: '20px 22px 24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <SpecimenPanel slotId="a-specimen" placeholder="버섯 사진을 여기에 끌어다 놓으세요" st={st} on={on} />
          <PredictionPanel analyzed={st.analyzed} />
        </div>
        <RagPanel analyzed={st.analyzed} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <SimilarPanel analyzed={st.analyzed} poisonSlot="a-sim-poison" edibleSlot="a-sim-edible" />
          <ErrorPanel />
        </div>
      </div>
    </div>
  );
}

/* ---------------- variant B : field-guide tabbed ---------------- */
function VariantB({ st, on }) {
  const tabs = [['similar', '닮은꼴 비교'], ['rag', '생태·독성 정보'], ['err', '모델 오류 분석']];
  return (
    <div id="1b" style={{ ...cardStyle, width: 1120 }}>
      <VariantBadge>1b · 도감 탭형</VariantBadge>
      <Banner rightText="상단 고정" />
      <div style={{ textAlign: 'center', padding: '22px 22px 6px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: '#B07A2E', fontWeight: 600 }}>한국 야생버섯 도감</div>
        <div style={{ fontFamily: serif, fontSize: 29, fontWeight: 600, color: '#33291B', marginTop: 2 }}>버섯 판별대</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18, padding: '14px 24px 4px', alignItems: 'start' }}>
        <SpecimenPanel slotId="b-specimen" placeholder="버섯 사진을 여기에 끌어다 놓으세요" st={st} on={on} />
        <PredictionPanel analyzed={st.analyzed} />
      </div>
      <div style={{ padding: '16px 24px 26px' }}>
        <div style={{ display: 'flex', gap: 6, borderBottom: '1.5px solid #D8C6A2', paddingLeft: 2 }}>
          {tabs.map(([id, label]) => {
            const active = st.tab === id;
            return (
              <button key={id} onClick={() => on.setTab(id)} style={active
                ? { fontSize: 13, fontWeight: 700, color: '#33291B', background: '#FBF5E7', border: '1.5px solid #D8C6A2', borderBottom: '1.5px solid #FBF5E7', borderRadius: '8px 8px 0 0', padding: '9px 18px', marginBottom: -1.5, cursor: 'pointer' }
                : { fontSize: 13, fontWeight: 500, color: '#8A7550', background: 'transparent', border: 'none', padding: '9px 18px', cursor: 'pointer' }}>{label}</button>
            );
          })}
        </div>
        <div style={{ paddingTop: 16 }}>
          {st.tab === 'similar' && <SimilarPanel analyzed={st.analyzed} poisonSlot="b-sim-poison" edibleSlot="b-sim-edible" />}
          {st.tab === 'rag' && <RagPanel analyzed={st.analyzed} />}
          {st.tab === 'err' && <ErrorPanel />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- root ---------------- */
export default function MycoScan() {
  const [a, setA] = useState({ analyzed: false, cam: false });
  const [b, setB] = useState({ analyzed: false, cam: false, tab: 'similar' });
  const onA = {
    analyze: () => setA(s => ({ ...s, analyzed: true })),
    reset: () => setA(s => ({ ...s, analyzed: false, cam: false })),
    toggleCam: () => setA(s => ({ ...s, cam: !s.cam })),
  };
  const onB = {
    analyze: () => setB(s => ({ ...s, analyzed: true })),
    reset: () => setB(s => ({ ...s, analyzed: false, cam: false })),
    toggleCam: () => setB(s => ({ ...s, cam: !s.cam })),
    setTab: (t) => setB(s => ({ ...s, tab: t })),
  };
  return (
    <div style={{ padding: '64px 72px', display: 'flex', flexDirection: 'column', gap: 18, minWidth: 'max-content', background: '#E6D9BE', fontFamily: "'Instrument Sans',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: '#5A4A2F' }}>MycoScan · 레이아웃 탐색</span>
        <span style={{ fontSize: 13, color: '#8A7550' }}>두 가지 배치를 비교하세요 — <b>1a</b> 밀집 콘솔 / <b>1b</b> 도감 탭형</span>
      </div>
      <div style={{ display: 'flex', gap: 72, alignItems: 'flex-start' }}>
        <VariantA st={a} on={onA} />
        <VariantB st={b} on={onB} />
      </div>
    </div>
  );
}
