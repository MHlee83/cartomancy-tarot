import { useState, useEffect, useCallback, useRef } from "react";

// ─── Card Data ───
const SUITS = [
  { id: "hearts", symbol: "♥", color: "#e63946", name: "하트", element: "감정·사랑", tarot: "컵" },
  { id: "diamonds", symbol: "♦", color: "#f4a261", name: "다이아", element: "재물·현실", tarot: "펜타클" },
  { id: "clubs", symbol: "♣", color: "#2a9d8f", name: "클로버", element: "성장·행동", tarot: "완드" },
  { id: "spades", symbol: "♠", color: "#6c63ff", name: "스페이드", element: "시련·지성", tarot: "소드" },
];

const RANKS = [
  { id: "A", name: "에이스", display: "A" },
  { id: "2", name: "2", display: "2" },
  { id: "3", name: "3", display: "3" },
  { id: "4", name: "4", display: "4" },
  { id: "5", name: "5", display: "5" },
  { id: "6", name: "6", display: "6" },
  { id: "7", name: "7", display: "7" },
  { id: "8", name: "8", display: "8" },
  { id: "9", name: "9", display: "9" },
  { id: "10", name: "10", display: "10" },
  { id: "J", name: "잭", display: "J" },
  { id: "Q", name: "퀸", display: "Q" },
  { id: "K", name: "킹", display: "K" },
];

const CARD_MEANINGS = {
  hearts: {
    A: { upright: "새로운 사랑, 감정의 시작, 충만한 기쁨", reversed: "감정적 공허, 사랑의 지연, 내면의 갈등" },
    2: { upright: "조화로운 관계, 파트너십, 상호 이해", reversed: "불균형한 관계, 소통 부재, 갈등" },
    3: { upright: "축하, 우정, 창의적 협업, 기쁜 소식", reversed: "과도한 쾌락, 낭비, 표면적 관계" },
    4: { upright: "안정에 대한 불만, 무관심, 재평가 필요", reversed: "새로운 동기 부여, 변화의 수용" },
    5: { upright: "상실감, 슬픔, 후회, 과거에 대한 집착", reversed: "회복, 용서, 새로운 시작의 가능성" },
    6: { upright: "향수, 순수한 기억, 과거의 행복", reversed: "과거에 갇힘, 비현실적 기대" },
    7: { upright: "환상, 선택의 혼란, 유혹, 꿈과 현실", reversed: "명확한 선택, 결단력, 현실 직시" },
    8: { upright: "떠남, 포기, 더 깊은 의미 추구", reversed: "집착, 떠나지 못함, 두려움" },
    9: { upright: "소원 성취, 만족, 감정적 풍요", reversed: "불만족, 탐욕, 물질주의" },
    10: { upright: "완전한 행복, 가정의 화목, 정서적 충만", reversed: "가정 불화, 관계의 균열" },
    J: { upright: "감성적 청년, 로맨틱한 소식, 직감적 메시지", reversed: "감정적 미성숙, 현실 도피" },
    Q: { upright: "직관력 있는 여성, 공감 능력, 감성적 지혜", reversed: "감정적 조종, 의존성" },
    K: { upright: "감성적 리더, 지혜로운 조언자, 관대함", reversed: "감정적 억압, 조종적 태도" },
  },
  diamonds: {
    A: { upright: "새로운 재정적 기회, 물질적 시작, 번영의 씨앗", reversed: "놓친 기회, 재정적 불안, 탐욕" },
    2: { upright: "균형 잡기, 유연한 대처, 다중 업무 관리", reversed: "균형 상실, 과부하, 우선순위 혼란" },
    3: { upright: "기술 향상, 팀워크, 장인 정신, 인정받음", reversed: "평범함, 동기 부족, 질적 저하" },
    4: { upright: "안정, 보수적 태도, 재정적 안전, 소유욕", reversed: "과도한 집착, 인색함, 변화 거부" },
    5: { upright: "재정적 어려움, 건강 문제, 고립감, 빈곤", reversed: "회복의 조짐, 도움의 손길, 개선" },
    6: { upright: "관대함, 나눔, 재정적 균형, 베풂과 받음", reversed: "빚, 불공정한 거래, 이기심" },
    7: { upright: "인내, 장기 투자, 노력의 결실을 기다림", reversed: "조급함, 잘못된 투자, 포기" },
    8: { upright: "장인 정신, 기술 연마, 꾸준한 노력, 성장", reversed: "완벽주의, 반복적 일상, 열정 상실" },
    9: { upright: "풍요, 자립, 사치, 목표 달성, 재정적 자유", reversed: "과시, 허영, 재정적 의존" },
    10: { upright: "유산, 가문의 번영, 장기적 성공, 안정", reversed: "가족 간 재정 갈등, 유산 분쟁" },
    J: { upright: "성실한 학생, 새로운 사업 아이디어, 실용적 메시지", reversed: "비현실적 계획, 게으름" },
    Q: { upright: "실용적 여성, 재정 관리 능력, 안정적 지원자", reversed: "물질주의, 소유욕, 질투" },
    K: { upright: "사업가, 재정적 성공, 실용적 리더십", reversed: "탐욕, 부패, 물질 만능주의" },
  },
  clubs: {
    A: { upright: "새로운 시작, 영감, 창의적 에너지, 모험", reversed: "지연, 방향 상실, 에너지 부족" },
    2: { upright: "계획 단계, 결정의 기로, 미래 설계", reversed: "우유부단, 두려움, 잘못된 계획" },
    3: { upright: "확장, 성장, 해외 진출, 비전의 실현", reversed: "방향 착오, 과도한 확장, 준비 부족" },
    4: { upright: "축하, 안정, 성과의 기쁨, 가정의 행복", reversed: "불안정, 변화에 대한 두려움" },
    5: { upright: "경쟁, 갈등, 다양한 의견 충돌, 도전", reversed: "갈등 회피, 내면의 싸움, 타협" },
    6: { upright: "승리, 인정, 공적 성취, 자신감", reversed: "교만, 겸손 부족, 일시적 성공" },
    7: { upright: "용기 있는 방어, 신념 지키기, 도전에 맞섬", reversed: "포기, 압도당함, 자신감 상실" },
    8: { upright: "빠른 진전, 여행, 속도감 있는 변화", reversed: "지연, 좌절, 계획 차질" },
    9: { upright: "인내, 경계, 마지막 시험, 지구력", reversed: "의심, 편집증, 과도한 방어" },
    10: { upright: "무거운 짐, 책임감, 과부하, 완수의 의지", reversed: "짐 내려놓기, 위임, 번아웃" },
    J: { upright: "열정적 청년, 모험심, 새로운 소식", reversed: "무모함, 경솔한 행동" },
    Q: { upright: "자신감 있는 여성, 열정, 사교적 매력", reversed: "질투, 공격성, 지배욕" },
    K: { upright: "카리스마 리더, 비전, 대담한 결단", reversed: "독재적, 성급함, 폭군적 태도" },
  },
  spades: {
    A: { upright: "진실의 발견, 돌파구, 정신적 명료함", reversed: "혼란, 잘못된 판단, 파괴적 사고" },
    2: { upright: "균형, 어려운 선택, 교착 상태, 직관 필요", reversed: "정보 과잉, 결정 회피, 자기기만" },
    3: { upright: "이별, 슬픔, 심장의 고통, 배신", reversed: "회복, 용서, 과거 극복" },
    4: { upright: "휴식, 명상, 회복기, 재충전 필요", reversed: "불안, 번아웃, 휴식 거부" },
    5: { upright: "갈등, 패배감, 비겁한 승리, 자존심 상처", reversed: "화해, 과거 청산, 용기" },
    6: { upright: "전환기, 여행, 어려움을 뒤로하고 나아감", reversed: "정체, 해결되지 않은 문제, 저항" },
    7: { upright: "전략, 은밀한 행동, 지혜로운 접근", reversed: "자기 기만, 비겁함, 도둑맞음" },
    8: { upright: "속박, 제한, 무력감, 자기 제한적 사고", reversed: "해방, 새로운 관점, 탈출" },
    9: { upright: "불안, 악몽, 깊은 걱정, 정신적 고통", reversed: "회복, 희망, 최악은 지남" },
    10: { upright: "끝, 종결, 큰 변화, 고통의 정점", reversed: "회복 불가능은 아님, 재기, 저항" },
    J: { upright: "날카로운 관찰자, 진실 추구, 정보 수집", reversed: "험담, 스파이, 불신" },
    Q: { upright: "독립적 여성, 명석한 판단, 진실을 말하는 자", reversed: "냉정함, 편견, 고립" },
    K: { upright: "지적 권위, 공정한 판단, 분석적 리더", reversed: "냉혹함, 권력 남용, 조종" },
  },
};

const JOKER_MEANING = {
  upright: "무한한 가능성, 새로운 여정의 시작, 순수한 잠재력, 자유로운 영혼",
  reversed: "무모함, 방향 상실, 어리석은 선택, 경솔한 모험",
};

// Build full deck
function buildDeck() {
  const deck = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({
        id: `${suit.id}-${rank.id}`,
        suit,
        rank,
        meaning: CARD_MEANINGS[suit.id][rank.id],
      });
    });
  });
  deck.push({
    id: "joker-1",
    suit: { id: "joker", symbol: "★", color: "#ffd700", name: "조커", element: "무한·가능성", tarot: "바보(The Fool)" },
    rank: { id: "joker", name: "조커", display: "🃏" },
    meaning: JOKER_MEANING,
  });
  deck.push({
    id: "joker-2",
    suit: { id: "joker", symbol: "☆", color: "#c0c0c0", name: "조커", element: "무한·가능성", tarot: "바보(The Fool)" },
    rank: { id: "joker", name: "조커", display: "🃏" },
    meaning: JOKER_MEANING,
  });
  return deck;
}

// ─── Spreads ───
const SPREADS = [
  {
    id: "one",
    name: "원카드",
    subtitle: "오늘의 메시지",
    description: "한 장의 카드가 지금 이 순간 당신에게 전하는 메시지를 읽어드립니다.",
    count: 1,
    positions: ["핵심 메시지"],
    icon: "◈",
  },
  {
    id: "three",
    name: "쓰리카드",
    subtitle: "시간의 흐름",
    description: "과거의 원인, 현재의 상황, 미래의 방향을 세 장의 카드로 풀어냅니다.",
    count: 3,
    positions: ["과거", "현재", "미래"],
    icon: "◇◈◇",
  },
  {
    id: "celtic",
    name: "켈틱 크로스",
    subtitle: "깊은 통찰",
    description: "10장의 카드가 만들어내는 가장 깊고 정밀한 리딩입니다. 당신의 상황을 다각도로 분석합니다.",
    count: 10,
    positions: [
      "현재 상황",
      "도전/장애물",
      "의식적 목표",
      "무의식적 영향",
      "과거의 영향",
      "가까운 미래",
      "자신의 태도",
      "주변 환경",
      "희망과 두려움",
      "최종 결과",
    ],
    icon: "✦",
  },
  {
    id: "love",
    name: "연애 스프레드",
    subtitle: "사랑의 지도",
    description: "다섯 장의 카드로 두 사람 사이의 감정, 장애물, 그리고 관계의 방향을 읽어냅니다.",
    count: 5,
    positions: ["나의 감정", "상대의 감정", "관계의 현재", "장애물", "관계의 방향"],
    icon: "♥",
  },
];

// ─── Shuffle Utility ───
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Styles ───
const cssText = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Crimson+Pro:ital,wght@0,400;0,700;1,400&display=swap');

  :root {
    --bg-deep: #0a0a12;
    --bg-card: #12121f;
    --bg-surface: #1a1a2e;
    --gold: #d4a853;
    --gold-light: #f0d78c;
    --gold-dim: #8a6f2f;
    --purple: #6c63ff;
    --purple-dim: #3d3580;
    --text-primary: #e8e6e3;
    --text-secondary: #8a8a9a;
    --text-dim: #55556a;
    --card-width: 120px;
    --card-height: 180px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg-deep);
    color: var(--text-primary);
    font-family: 'Noto Serif KR', serif;
    overflow-x: hidden;
  }

  .app-container {
    min-height: 100vh;
    position: relative;
  }

  /* ─── Mystical Background ─── */
  .bg-stars {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }
  .bg-stars::before {
    content: '';
    position: absolute;
    inset: -50%;
    background: radial-gradient(2px 2px at 20% 30%, rgba(212,168,83,0.3) 0%, transparent 100%),
                radial-gradient(2px 2px at 40% 70%, rgba(108,99,255,0.2) 0%, transparent 100%),
                radial-gradient(1px 1px at 60% 20%, rgba(212,168,83,0.2) 0%, transparent 100%),
                radial-gradient(1px 1px at 80% 60%, rgba(108,99,255,0.15) 0%, transparent 100%),
                radial-gradient(1.5px 1.5px at 10% 80%, rgba(212,168,83,0.25) 0%, transparent 100%),
                radial-gradient(1.5px 1.5px at 90% 40%, rgba(108,99,255,0.2) 0%, transparent 100%),
                radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 100%);
    background-size: 300px 300px;
    animation: twinkle 8s ease-in-out infinite alternate;
  }
  @keyframes twinkle { 0% { opacity: 0.5; } 100% { opacity: 1; } }

  .bg-glow {
    position: fixed;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    filter: blur(150px);
    opacity: 0.08;
    pointer-events: none;
    z-index: 0;
  }
  .bg-glow-1 { top: -200px; left: -200px; background: var(--gold); }
  .bg-glow-2 { bottom: -200px; right: -200px; background: var(--purple); }

  /* ─── Layout ─── */
  .content {
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }

  /* ─── Header ─── */
  .header {
    text-align: center;
    padding: 40px 0 20px;
  }
  .header-icon {
    font-size: 28px;
    color: var(--gold);
    letter-spacing: 12px;
    margin-bottom: 12px;
    animation: pulse-gold 3s ease-in-out infinite;
  }
  @keyframes pulse-gold {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; text-shadow: 0 0 20px rgba(212,168,83,0.5); }
  }
  .header h1 {
    font-size: 32px;
    font-weight: 900;
    background: linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-dim));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 6px;
    margin-bottom: 8px;
  }
  .header p {
    color: var(--text-secondary);
    font-size: 13px;
    letter-spacing: 4px;
  }

  /* ─── Spread Selection ─── */
  .spread-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin: 30px 0;
  }
  .spread-card {
    background: linear-gradient(145deg, var(--bg-surface), var(--bg-card));
    border: 1px solid rgba(212,168,83,0.15);
    border-radius: 16px;
    padding: 28px 20px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .spread-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(212,168,83,0.05), transparent);
    opacity: 0;
    transition: opacity 0.4s;
  }
  .spread-card:hover {
    border-color: var(--gold);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(212,168,83,0.15);
  }
  .spread-card:hover::before { opacity: 1; }
  .spread-card .icon {
    font-size: 24px;
    color: var(--gold);
    margin-bottom: 12px;
    letter-spacing: 4px;
  }
  .spread-card h3 {
    font-size: 18px;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  .spread-card .subtitle {
    font-size: 12px;
    color: var(--gold-dim);
    letter-spacing: 3px;
    margin-bottom: 12px;
  }
  .spread-card .desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.7;
  }
  .spread-card .count {
    margin-top: 12px;
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 2px;
  }

  /* ─── Question Input ─── */
  .question-section {
    text-align: center;
    margin: 30px 0;
    animation: fadeInUp 0.6s ease;
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .question-label {
    font-size: 16px;
    color: var(--gold);
    margin-bottom: 16px;
    letter-spacing: 3px;
  }
  .question-input {
    width: 100%;
    max-width: 600px;
    padding: 16px 24px;
    background: var(--bg-surface);
    border: 1px solid rgba(212,168,83,0.2);
    border-radius: 12px;
    color: var(--text-primary);
    font-family: 'Noto Serif KR', serif;
    font-size: 15px;
    outline: none;
    transition: border-color 0.3s;
    resize: none;
  }
  .question-input::placeholder { color: var(--text-dim); }
  .question-input:focus { border-color: var(--gold); }

  /* ─── Buttons ─── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 36px;
    border: 1px solid var(--gold);
    background: transparent;
    color: var(--gold);
    font-family: 'Noto Serif KR', serif;
    font-size: 15px;
    letter-spacing: 3px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 20px;
  }
  .btn:hover {
    background: var(--gold);
    color: var(--bg-deep);
  }
  .btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .btn-secondary {
    border-color: var(--text-dim);
    color: var(--text-secondary);
    padding: 10px 24px;
    font-size: 13px;
  }
  .btn-secondary:hover {
    background: var(--bg-surface);
    color: var(--text-primary);
  }

  /* ─── Card Styles ─── */
  .playing-card {
    width: var(--card-width);
    height: var(--card-height);
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    perspective: 800px;
    flex-shrink: 0;
  }
  .playing-card.small {
    --card-width: 90px;
    --card-height: 135px;
  }
  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .card-inner.flipped { transform: rotateY(180deg); }
  .card-inner.reversed { transform: rotateY(180deg) rotate(180deg); }
  .card-face {
    position: absolute;
    inset: 0;
    border-radius: 10px;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  /* Card back */
  .card-back {
    background: linear-gradient(145deg, #1a1a3e, #0d0d24);
    border: 2px solid var(--gold-dim);
    overflow: hidden;
  }
  .card-back::before {
    content: '';
    position: absolute;
    inset: 6px;
    border: 1px solid rgba(212,168,83,0.2);
    border-radius: 6px;
  }
  .card-back::after {
    content: '✦';
    font-size: 36px;
    color: var(--gold-dim);
    opacity: 0.6;
  }
  .card-back-pattern {
    position: absolute;
    inset: 10px;
    border: 1px solid rgba(212,168,83,0.1);
    border-radius: 4px;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 8px,
      rgba(212,168,83,0.03) 8px,
      rgba(212,168,83,0.03) 9px
    );
  }

  /* Card front */
  .card-front {
    background: linear-gradient(160deg, #faf8f5, #ede8df);
    border: 2px solid #c8b88a;
    transform: rotateY(180deg);
    padding: 8px;
    justify-content: space-between;
  }
  .card-corner {
    align-self: flex-start;
    text-align: center;
    line-height: 1.1;
    position: absolute;
  }
  .card-corner-top { top: 6px; left: 8px; }
  .card-corner-bottom { bottom: 6px; right: 8px; transform: rotate(180deg); }
  .card-corner .rank-text {
    font-family: 'Crimson Pro', serif;
    font-size: 16px;
    font-weight: 700;
  }
  .card-corner .suit-text { font-size: 14px; }
  .card-center-suit {
    font-size: 42px;
    opacity: 0.9;
  }
  .card-joker-face {
    font-size: 48px;
  }
  .card-reversed-marker {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 9px;
    color: #999;
    letter-spacing: 1px;
  }

  /* ─── Shuffle Animation ─── */
  .shuffle-area {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    position: relative;
    margin: 20px 0;
  }
  .shuffle-stack {
    position: relative;
    width: 140px;
    height: 200px;
  }
  .shuffle-card {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--card-width);
    height: var(--card-height);
    border-radius: 10px;
    background: linear-gradient(145deg, #1a1a3e, #0d0d24);
    border: 2px solid var(--gold-dim);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gold-dim);
    font-size: 28px;
    transition: all 0.3s;
  }
  .shuffle-card.shuffling {
    animation: shuffleMove 0.5s ease-in-out;
  }
  @keyframes shuffleMove {
    0% { transform: translateX(0) translateY(0) rotate(0deg); }
    25% { transform: translateX(-60px) translateY(-20px) rotate(-8deg); }
    50% { transform: translateX(60px) translateY(-10px) rotate(8deg); }
    75% { transform: translateX(-30px) translateY(-15px) rotate(-4deg); }
    100% { transform: translateX(0) translateY(0) rotate(0deg); }
  }

  /* ─── Draw Area ─── */
  .draw-area {
    margin: 20px 0;
    animation: fadeInUp 0.5s ease;
  }
  .draw-fan {
    display: flex;
    justify-content: center;
    gap: 3px;
    flex-wrap: wrap;
    padding: 20px 0;
    position: relative;
  }
  .fan-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    animation: fanIn 0.3s ease forwards;
  }
  .fan-card:hover {
    transform: translateY(-15px) scale(1.05);
    z-index: 10;
  }
  .fan-card.picked {
    opacity: 0.2;
    transform: scale(0.9);
    pointer-events: none;
  }
  @keyframes fanIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .draw-instructions {
    text-align: center;
    color: var(--gold);
    font-size: 14px;
    letter-spacing: 2px;
    margin-bottom: 16px;
  }

  /* ─── Selected Cards Display ─── */
  .selected-cards-row {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
    margin: 30px 0;
    min-height: 200px;
  }
  .selected-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .slot-placeholder {
    width: var(--card-width);
    height: var(--card-height);
    border: 2px dashed rgba(212,168,83,0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-dim);
    font-size: 24px;
  }
  .slot-label {
    font-size: 11px;
    color: var(--text-secondary);
    letter-spacing: 2px;
    text-align: center;
    max-width: 100px;
  }

  /* ─── Celtic Cross Layout ─── */
  .celtic-layout {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(4, auto);
    gap: 10px;
    justify-items: center;
    align-items: center;
    margin: 30px auto;
    max-width: 700px;
  }
  .celtic-pos-0 { grid-column: 2; grid-row: 2; z-index: 2; }
  .celtic-pos-1 { grid-column: 2; grid-row: 2; z-index: 1; transform: rotate(90deg); }
  .celtic-pos-2 { grid-column: 2; grid-row: 1; }
  .celtic-pos-3 { grid-column: 2; grid-row: 3; }
  .celtic-pos-4 { grid-column: 1; grid-row: 2; }
  .celtic-pos-5 { grid-column: 3; grid-row: 2; }
  .celtic-pos-6 { grid-column: 5; grid-row: 4; }
  .celtic-pos-7 { grid-column: 5; grid-row: 3; }
  .celtic-pos-8 { grid-column: 5; grid-row: 2; }
  .celtic-pos-9 { grid-column: 5; grid-row: 1; }

  /* ─── Reading Result ─── */
  .reading-section {
    margin: 40px 0;
    animation: fadeInUp 0.8s ease;
  }
  .reading-header {
    text-align: center;
    margin-bottom: 30px;
  }
  .reading-header h2 {
    font-size: 22px;
    color: var(--gold);
    letter-spacing: 4px;
    margin-bottom: 6px;
  }
  .reading-divider {
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 16px auto;
  }

  .card-reading-item {
    background: linear-gradient(145deg, var(--bg-surface), var(--bg-card));
    border: 1px solid rgba(212,168,83,0.1);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    display: flex;
    gap: 20px;
    align-items: flex-start;
    animation: fadeInUp 0.5s ease;
  }
  .card-reading-info {
    flex: 1;
  }
  .card-reading-position {
    font-size: 11px;
    color: var(--gold);
    letter-spacing: 3px;
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  .card-reading-name {
    font-size: 18px;
    margin-bottom: 4px;
  }
  .card-reading-direction {
    font-size: 12px;
    margin-bottom: 10px;
    letter-spacing: 1px;
  }
  .card-reading-direction.upright { color: var(--gold); }
  .card-reading-direction.reversed { color: #e63946; }
  .card-reading-meaning {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.8;
  }
  .card-reading-element {
    font-size: 12px;
    color: var(--text-dim);
    margin-top: 8px;
  }

  /* ─── AI Interpretation ─── */
  .ai-reading {
    background: linear-gradient(145deg, rgba(212,168,83,0.05), var(--bg-card));
    border: 1px solid rgba(212,168,83,0.2);
    border-radius: 16px;
    padding: 32px;
    margin: 30px 0;
    position: relative;
    overflow: hidden;
  }
  .ai-reading::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
  }
  .ai-reading h3 {
    color: var(--gold);
    font-size: 16px;
    letter-spacing: 4px;
    margin-bottom: 20px;
    text-align: center;
  }
  .ai-reading-text {
    color: var(--text-primary);
    font-size: 15px;
    line-height: 2;
    white-space: pre-wrap;
  }
  .ai-loading {
    text-align: center;
    padding: 40px;
  }
  .ai-loading-dots {
    display: inline-flex;
    gap: 6px;
  }
  .ai-loading-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gold);
    animation: dotPulse 1.4s ease-in-out infinite;
  }
  .ai-loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .ai-loading-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotPulse {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40% { opacity: 1; transform: scale(1.2); }
  }
  .ai-loading-text {
    color: var(--text-secondary);
    font-size: 13px;
    margin-top: 16px;
    letter-spacing: 2px;
  }

  /* ─── Navigation ─── */
  .nav-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    margin-bottom: 10px;
  }
  .nav-back {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 13px;
    transition: color 0.3s;
    background: none;
    border: none;
    font-family: 'Noto Serif KR', serif;
  }
  .nav-back:hover { color: var(--gold); }

  .step-indicator {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-dim);
    transition: all 0.3s;
  }
  .step-dot.active {
    background: var(--gold);
    box-shadow: 0 0 8px rgba(212,168,83,0.5);
  }
  .step-dot.done {
    background: var(--gold-dim);
  }

  /* ─── Responsive ─── */
  @media (max-width: 640px) {
    .header h1 { font-size: 24px; letter-spacing: 4px; }
    .spread-grid { grid-template-columns: 1fr; }
    .playing-card { --card-width: 80px; --card-height: 120px; }
    .playing-card.small { --card-width: 65px; --card-height: 97px; }
    .card-center-suit { font-size: 30px; }
    .card-corner .rank-text { font-size: 12px; }
    .card-corner .suit-text { font-size: 10px; }
    .card-reading-item { flex-direction: column; align-items: center; text-align: center; }
    .celtic-layout { gap: 4px; }
    .content { padding: 12px; }
    .draw-fan { gap: 1px; }
  }

  /* Misc */
  .fade-in { animation: fadeInUp 0.5s ease; }
  .text-center { text-align: center; }
  .mt-20 { margin-top: 20px; }
  .section-title {
    text-align: center;
    color: var(--gold);
    font-size: 14px;
    letter-spacing: 4px;
    margin-bottom: 8px;
  }

  .error-box {
    background: rgba(230, 57, 70, 0.1);
    border: 1px solid rgba(230, 57, 70, 0.3);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    color: #e63946;
    margin: 20px 0;
  }
`;

// ─── Card Component ───
function PlayingCard({ card, isReversed, flipped, onClick, small, style, className = "" }) {
  const isJoker = card.suit.id === "joker";
  return (
    <div
      className={`playing-card ${small ? "small" : ""} ${className}`}
      onClick={onClick}
      style={style}
    >
      <div className={`card-inner ${flipped ? (isReversed ? "reversed" : "flipped") : ""}`}>
        <div className="card-face card-back">
          <div className="card-back-pattern" />
        </div>
        <div className="card-face card-front">
          {isJoker ? (
            <>
              <div className="card-joker-face">{card.rank.display}</div>
              <div style={{ fontSize: "10px", color: card.suit.color, fontWeight: 700 }}>JOKER</div>
            </>
          ) : (
            <>
              <div className="card-corner card-corner-top">
                <div className="rank-text" style={{ color: card.suit.color }}>{card.rank.display}</div>
                <div className="suit-text" style={{ color: card.suit.color }}>{card.suit.symbol}</div>
              </div>
              <div className="card-center-suit" style={{ color: card.suit.color }}>
                {card.suit.symbol}
              </div>
              <div className="card-corner card-corner-bottom">
                <div className="rank-text" style={{ color: card.suit.color }}>{card.rank.display}</div>
                <div className="suit-text" style={{ color: card.suit.color }}>{card.suit.symbol}</div>
              </div>
            </>
          )}
          {isReversed && <div className="card-reversed-marker">REVERSED</div>}
        </div>
      </div>
    </div>
  );
}

// ─── App States ───
const STEPS = { HOME: 0, QUESTION: 1, SHUFFLE: 2, DRAW: 3, READING: 4 };

export default function TarotApp() {
  const [step, setStep] = useState(STEPS.HOME);
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [question, setQuestion] = useState("");
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [drawnCards, setDrawnCards] = useState([]);
  const [cardDirections, setCardDirections] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [pickedIndices, setPickedIndices] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [aiReading, setAiReading] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [allFlipped, setAllFlipped] = useState(false);
  const shuffleTimerRef = useRef(null);

  // ─── Handlers ───
  const selectSpread = (spread) => {
    setSelectedSpread(spread);
    setStep(STEPS.QUESTION);
    setDrawnCards([]);
    setCardDirections([]);
    setFlippedCards([]);
    setPickedIndices([]);
    setAiReading("");
    setAiError("");
    setAllFlipped(false);
  };

  const goHome = () => {
    setStep(STEPS.HOME);
    setSelectedSpread(null);
    setQuestion("");
    setDrawnCards([]);
    setCardDirections([]);
    setFlippedCards([]);
    setPickedIndices([]);
    setAiReading("");
    setAiError("");
    setAllFlipped(false);
  };

  const startShuffle = () => {
    setStep(STEPS.SHUFFLE);
    setIsShuffling(true);
    const deck = buildDeck();
    let count = 0;
    const interval = setInterval(() => {
      setShuffledDeck(shuffleArray(deck));
      count++;
      if (count >= 6) {
        clearInterval(interval);
        setIsShuffling(false);
        setTimeout(() => {
          setShuffledDeck(shuffleArray(deck));
          setStep(STEPS.DRAW);
        }, 500);
      }
    }, 400);
    shuffleTimerRef.current = interval;
  };

  const pickCard = (index) => {
    if (!selectedSpread || drawnCards.length >= selectedSpread.count) return;
    if (pickedIndices.includes(index)) return;

    const card = shuffledDeck[index];
    const isReversed = Math.random() < 0.35;

    setPickedIndices((prev) => [...prev, index]);
    setDrawnCards((prev) => [...prev, card]);
    setCardDirections((prev) => [...prev, isReversed]);
    setFlippedCards((prev) => [...prev, false]);
  };

  useEffect(() => {
    if (selectedSpread && drawnCards.length === selectedSpread.count && drawnCards.length > 0) {
      const timer = setTimeout(() => {
        setStep(STEPS.READING);
        // Flip cards one by one
        drawnCards.forEach((_, i) => {
          setTimeout(() => {
            setFlippedCards((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }, i * 400);
        });
        setTimeout(() => {
          setAllFlipped(true);
        }, drawnCards.length * 400 + 500);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [drawnCards, selectedSpread]);

  // AI reading
  useEffect(() => {
    if (!allFlipped || !selectedSpread) return;
    fetchAiReading();
  }, [allFlipped]);

  const fetchAiReading = async () => {
    setAiLoading(true);
    setAiError("");

    const cardsInfo = drawnCards.map((card, i) => {
      const dir = cardDirections[i] ? "역방향" : "정방향";
      const meaning = cardDirections[i] ? card.meaning.reversed : card.meaning.upright;
      const position = selectedSpread.positions[i];
      const isJoker = card.suit.id === "joker";
      const cardName = isJoker ? "조커 (The Fool)" : `${card.suit.name} ${card.rank.name}`;
      return `[${position}] ${cardName} (${dir}) - 기본 의미: ${meaning} / 원소: ${card.suit.element}`;
    }).join("\n");

    const systemPrompt = `당신은 30년 경력의 전문 타로 마스터입니다. 플레잉 카드(트럼프 카드) 기반의 카르토만시(Cartomancy) 전통에 깊이 정통합니다.

당신의 역할:
- 고객에게 깊이 있고 전문적인 타로 리딩을 제공합니다.
- 각 카드의 의미를 포지션과 연결하여 해석합니다.
- 카드들 사이의 관계와 흐름을 읽어냅니다.
- 따뜻하지만 신비로운 어조로 말합니다.
- 구체적이고 실용적인 조언을 포함합니다.
- 한국어로 답변합니다.

해석 구조:
1. 전체적인 에너지/인상 (2-3문장)
2. 각 카드 포지션별 상세 해석 (포지션명과 함께)
3. 카드 간의 연결고리와 패턴 분석
4. 종합 메시지와 조언

말투는 존댓말을 사용하되, 너무 딱딱하지 않게 따뜻한 상담사의 느낌으로 해주세요. "~입니다", "~하시네요" 등의 자연스러운 존댓말을 사용하세요.`;

    const userPrompt = `스프레드: ${selectedSpread.name} (${selectedSpread.subtitle})
질문: ${question || "(자유 리딩 - 특별한 질문 없음)"}

뽑힌 카드:
${cardsInfo}

위 카드들을 기반으로 전문적이고 깊이 있는 타로 리딩을 해주세요.`;

    try {
      const response = await fetch("/.netlify/functions/tarot-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.map((b) => b.text || "").join("") || "";
      setAiReading(text);
    } catch (err) {
      console.error(err);
      setAiError("리딩을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setAiLoading(false);
    }
  };

  // ─── Render Helpers ───
  const renderStepDots = () => {
    const steps = [STEPS.HOME, STEPS.QUESTION, STEPS.SHUFFLE, STEPS.READING];
    const currentIdx = steps.indexOf(step);
    return (
      <div className="step-indicator">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`step-dot ${i === currentIdx ? "active" : i < currentIdx ? "done" : ""}`}
          />
        ))}
      </div>
    );
  };

  const renderSelectedCards = () => {
    if (!selectedSpread) return null;

    // Celtic Cross uses a special layout
    if (selectedSpread.id === "celtic" && step === STEPS.READING) {
      return (
        <div className="celtic-layout">
          {selectedSpread.positions.map((pos, i) => (
            <div key={i} className={`celtic-pos-${i} selected-slot`}>
              {drawnCards[i] ? (
                <PlayingCard
                  card={drawnCards[i]}
                  isReversed={cardDirections[i]}
                  flipped={flippedCards[i]}
                  small
                />
              ) : (
                <div className="slot-placeholder" style={{ width: 90, height: 135 }}>?</div>
              )}
              <div className="slot-label">{pos}</div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="selected-cards-row">
        {selectedSpread.positions.map((pos, i) => (
          <div key={i} className="selected-slot" style={{ animationDelay: `${i * 0.1}s` }}>
            {drawnCards[i] ? (
              <PlayingCard
                card={drawnCards[i]}
                isReversed={cardDirections[i]}
                flipped={flippedCards[i]}
                small={selectedSpread.count > 3}
              />
            ) : (
              <div className="slot-placeholder">?</div>
            )}
            <div className="slot-label">{pos}</div>
          </div>
        ))}
      </div>
    );
  };

  // ─── Pages ───
  const renderHome = () => (
    <div className="fade-in">
      <p className="section-title">스프레드를 선택해주세요</p>
      <div className="spread-grid">
        {SPREADS.map((s) => (
          <div key={s.id} className="spread-card" onClick={() => selectSpread(s)}>
            <div className="icon">{s.icon}</div>
            <h3>{s.name}</h3>
            <div className="subtitle">{s.subtitle}</div>
            <div className="desc">{s.description}</div>
            <div className="count">{s.count}장</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuestion = () => (
    <div className="question-section">
      <div className="question-label">「 {selectedSpread.name} 」 — {selectedSpread.subtitle}</div>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20, lineHeight: 1.8 }}>
        마음속 질문을 떠올려 보세요.<br />
        질문이 구체적일수록 카드의 메시지도 명확해집니다.
      </p>
      <textarea
        className="question-input"
        rows={3}
        placeholder="예: 올해 나의 커리어는 어떤 방향으로 흘러갈까요?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <br />
      <button className="btn" onClick={startShuffle}>
        ✦ 카드 섞기
      </button>
      <br />
      <button
        className="btn btn-secondary"
        style={{ marginTop: 10 }}
        onClick={startShuffle}
      >
        질문 없이 바로 시작
      </button>
    </div>
  );

  const renderShuffle = () => (
    <div className="shuffle-area fade-in">
      <div className="shuffle-stack">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`shuffle-card ${isShuffling ? "shuffling" : ""}`}
            style={{
              top: `${i * -3}px`,
              left: `${i * 2}px`,
              zIndex: 5 - i,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            ✦
          </div>
        ))}
      </div>
      <p style={{ position: "absolute", bottom: 0, color: "var(--gold)", fontSize: 13, letterSpacing: 3 }}>
        카드를 섞고 있습니다...
      </p>
    </div>
  );

  const renderDraw = () => {
    const remaining = selectedSpread.count - drawnCards.length;
    return (
      <div className="draw-area">
        <div className="draw-instructions">
          카드를 {remaining}장 더 선택해주세요 ({drawnCards.length}/{selectedSpread.count})
        </div>
        {renderSelectedCards()}
        <div className="draw-fan">
          {shuffledDeck.slice(0, 21).map((card, idx) => (
            <div
              key={card.id}
              className={`fan-card ${pickedIndices.includes(idx) ? "picked" : ""}`}
              style={{ animationDelay: `${idx * 0.03}s` }}
              onClick={() => pickCard(idx)}
            >
              <PlayingCard card={card} flipped={false} small />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReading = () => (
    <div className="reading-section">
      <div className="reading-header">
        <h2>「 리딩 결과 」</h2>
        <div className="reading-divider" />
        {question && (
          <p style={{ color: "var(--text-secondary)", fontSize: 13, fontStyle: "italic" }}>
            "{question}"
          </p>
        )}
      </div>

      {renderSelectedCards()}

      {/* Individual card readings */}
      {drawnCards.map((card, i) => {
        if (!flippedCards[i]) return null;
        const isJoker = card.suit.id === "joker";
        const cardName = isJoker ? "조커 (The Fool)" : `${card.suit.name} ${card.rank.name}`;
        const dir = cardDirections[i];
        const meaning = dir ? card.meaning.reversed : card.meaning.upright;
        return (
          <div key={i} className="card-reading-item" style={{ animationDelay: `${i * 0.15}s` }}>
            <PlayingCard card={card} isReversed={dir} flipped={true} small />
            <div className="card-reading-info">
              <div className="card-reading-position">{selectedSpread.positions[i]}</div>
              <div className="card-reading-name">{cardName}</div>
              <div className={`card-reading-direction ${dir ? "reversed" : "upright"}`}>
                {dir ? "⟲ 역방향 (Reversed)" : "⟳ 정방향 (Upright)"}
              </div>
              <div className="card-reading-meaning">{meaning}</div>
              <div className="card-reading-element">
                {card.suit.symbol} {card.suit.element} — 타로 대응: {card.suit.tarot}
              </div>
            </div>
          </div>
        );
      })}

      {/* AI Reading */}
      <div className="ai-reading">
        <h3>✦ 종합 리딩 ✦</h3>
        {aiLoading && (
          <div className="ai-loading">
            <div className="ai-loading-dots">
              <div className="ai-loading-dot" />
              <div className="ai-loading-dot" />
              <div className="ai-loading-dot" />
            </div>
            <div className="ai-loading-text">카드의 메시지를 읽고 있습니다...</div>
          </div>
        )}
        {aiError && <div className="error-box">{aiError}</div>}
        {aiReading && <div className="ai-reading-text">{aiReading}</div>}
      </div>

      <div className="text-center mt-20">
        <button className="btn" onClick={goHome}>
          ✦ 새로운 리딩 시작
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{cssText}</style>
      <div className="app-container">
        <div className="bg-stars" />
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />
        <div className="content">
          {/* Navigation */}
          {step !== STEPS.HOME && (
            <div className="nav-bar">
              <button className="nav-back" onClick={goHome}>
                ← 처음으로
              </button>
              {renderStepDots()}
            </div>
          )}

          {/* Header */}
          <div className="header">
            <div className="header-icon">✦ ✦ ✦</div>
            <h1>카르토만시</h1>
            <p>CARTOMANCY</p>
          </div>

          {/* Steps */}
          {step === STEPS.HOME && renderHome()}
          {step === STEPS.QUESTION && renderQuestion()}
          {step === STEPS.SHUFFLE && renderShuffle()}
          {step === STEPS.DRAW && renderDraw()}
          {step === STEPS.READING && renderReading()}
        </div>
      </div>
    </>
  );
}
