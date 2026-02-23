import { useState, useEffect, useCallback, useRef } from "react";

// ─── Card Data ───
// ─── i18n ───
const LANG = {
  ko: {
    flag: "🇰🇷", label: "한국어",
    suits: {
      hearts: { name: "하트", element: "감정·사랑", tarot: "컵" },
      diamonds: { name: "다이아", element: "재물·현실", tarot: "펜타클" },
      clubs: { name: "클로버", element: "성장·행동", tarot: "완드" },
      spades: { name: "스페이드", element: "시련·지성", tarot: "소드" },
      joker: { name: "조커", element: "무한·가능성", tarot: "바보(The Fool)" },
    },
    ranks: { A: "에이스", J: "잭", Q: "퀸", K: "킹", joker: "조커" },
    spreads: {
      one: { name: "원카드", subtitle: "오늘의 메시지", description: "한 장의 카드가 지금 이 순간 당신에게 전하는 메시지를 읽어드립니다.", positions: ["핵심 메시지"], unit: "장" },
      three: { name: "쓰리카드", subtitle: "시간의 흐름", description: "과거의 원인, 현재의 상황, 미래의 방향을 세 장의 카드로 풀어냅니다.", positions: ["과거", "현재", "미래"], unit: "장" },
      celtic: { name: "켈틱 크로스", subtitle: "깊은 통찰", description: "10장의 카드가 만들어내는 가장 깊고 정밀한 리딩입니다.", positions: ["현재 상황", "도전/장애물", "의식적 목표", "무의식적 영향", "과거의 영향", "가까운 미래", "자신의 태도", "주변 환경", "희망과 두려움", "최종 결과"], unit: "장" },
      love: { name: "연애 스프레드", subtitle: "사랑의 지도", description: "다섯 장의 카드로 두 사람 사이의 감정, 장애물, 그리고 관계의 방향을 읽어냅니다.", positions: ["나의 감정", "상대의 감정", "관계의 현재", "장애물", "관계의 방향"], unit: "장" },
    },
    ui: {
      title: "카르토만시",
      selectSpread: "스프레드를 선택해주세요",
      questionHint: "마음속 질문을 떠올려 보세요.\n질문이 구체적일수록 카드의 메시지도 명확해집니다.",
      questionPlaceholder: "예: 올해 나의 커리어는 어떤 방향으로 흘러갈까요?",
      shuffle: "✦ 카드 섞기",
      skipQuestion: "질문 없이 바로 시작",
      shuffling: "카드를 섞고 있습니다...",
      selectCards: (r, c, t) => `카드를 ${r}장 더 선택해주세요 (${c}/${t})`,
      readingResult: "「 리딩 결과 」",
      aiTitle: "✦ 종합 리딩 ✦",
      aiLoading: "카드의 메시지를 읽고 있습니다...",
      aiError: "리딩을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      newReading: "✦ 새로운 리딩 시작",
      back: "← 처음으로",
      upright: "✨ 긍정적 흐름",
      reversed: "🔄 도전적 흐름",
      dirLabel: (r) => r ? "도전적 흐름" : "긍정적 흐름",
      tarotMatch: "상징",
      freeReading: "(자유 리딩 - 특별한 질문 없음)",
    },
    aiSystem: `당신은 30년 경력의 전문 타로 상담사입니다. 플레잉 카드 기반 카르토만시(Cartomancy) 전문가입니다.

핵심 원칙:
- 질문자의 상황에 바로 적용할 수 있는 구체적인 해석을 합니다.
- "정방향/역방향" 같은 전문용어를 쓰지 마세요. 카드의 에너지가 긍정적인지, 도전적인지를 자연스럽게 설명합니다.
- 각 카드 해석은 5-7문장으로 충분히 풀어주되, 핵심을 잃지 마세요.
- 마크다운 문법(**, ##, --- 등)을 절대 사용하지 마세요. 순수 텍스트만.
- "~의 에너지가 느껴집니다" 같은 모호한 표현보다는 "~하세요", "~할 때입니다" 같은 직접적 조언을 섞어주세요.
- 카드 간의 연결고리와 흐름도 읽어주세요.

구조:
1. 전체 분위기 요약 (2-3문장으로 이 리딩의 큰 그림)
2. 각 카드별 해석 (포지션명과 함께, 각 5-7문장. 카드의 의미를 질문과 연결지어 설명)
3. 카드들의 흐름 분석 (카드들이 함께 말해주는 이야기 3-4문장)
4. 구체적 행동 조언 (2-3가지)
5. 반드시 마지막에 아래 형식으로 3줄 요약을 넣으세요:

[오늘의 핵심]
1. (첫 번째 핵심 메시지)
2. (두 번째 핵심 메시지)  
3. (세 번째 핵심 메시지)

말투는 따뜻한 존댓말로, 친구 같은 상담사 느낌으로.`,
    aiUserPrompt: (spread, question, cards) => `스프레드: ${spread}\n질문: ${question}\n\n뽑힌 카드:\n${cards}\n\n충분히 풀어서 설명해주되 뜬구름 잡는 말은 빼주세요. 마크다운 문법 금지. 반드시 마지막에 [오늘의 핵심] 3줄 요약으로 마무리해주세요.`,
  },
  vi: {
    flag: "🇻🇳", label: "Tiếng Việt",
    suits: {
      hearts: { name: "Cơ", element: "Cảm xúc·Tình yêu", tarot: "Cốc" },
      diamonds: { name: "Rô", element: "Tài chính·Thực tế", tarot: "Pentacle" },
      clubs: { name: "Chuồn", element: "Phát triển·Hành động", tarot: "Gậy" },
      spades: { name: "Bích", element: "Thử thách·Trí tuệ", tarot: "Kiếm" },
      joker: { name: "Joker", element: "Vô hạn·Tiềm năng", tarot: "Kẻ Ngốc (The Fool)" },
    },
    ranks: { A: "Át", J: "Bồi", Q: "Đầm", K: "Già", joker: "Joker" },
    spreads: {
      one: { name: "Một lá", subtitle: "Thông điệp hôm nay", description: "Một lá bài truyền tải thông điệp dành cho bạn ngay lúc này.", positions: ["Thông điệp chính"], unit: "lá" },
      three: { name: "Ba lá", subtitle: "Dòng chảy thời gian", description: "Quá khứ, hiện tại và tương lai được hé lộ qua ba lá bài.", positions: ["Quá khứ", "Hiện tại", "Tương lai"], unit: "lá" },
      celtic: { name: "Celtic Cross", subtitle: "Thấu hiểu sâu sắc", description: "10 lá bài tạo nên bài đọc sâu sắc và chính xác nhất.", positions: ["Tình huống hiện tại", "Thách thức", "Mục tiêu ý thức", "Ảnh hưởng tiềm thức", "Ảnh hưởng quá khứ", "Tương lai gần", "Thái độ bản thân", "Môi trường xung quanh", "Hy vọng và nỗi sợ", "Kết quả cuối cùng"], unit: "lá" },
      love: { name: "Tình yêu", subtitle: "Bản đồ tình yêu", description: "Năm lá bài hé lộ cảm xúc, trở ngại và hướng đi của mối quan hệ.", positions: ["Cảm xúc của tôi", "Cảm xúc đối phương", "Hiện tại mối quan hệ", "Trở ngại", "Hướng đi mối quan hệ"], unit: "lá" },
    },
    ui: {
      title: "Cartomancy",
      selectSpread: "Vui lòng chọn kiểu trải bài",
      questionHint: "Hãy nghĩ về câu hỏi trong lòng bạn.\nCâu hỏi càng cụ thể, thông điệp từ lá bài càng rõ ràng.",
      questionPlaceholder: "VD: Sự nghiệp của tôi năm nay sẽ đi theo hướng nào?",
      shuffle: "✦ Xào bài",
      skipQuestion: "Bắt đầu không cần câu hỏi",
      shuffling: "Đang xào bài...",
      selectCards: (r, c, t) => `Vui lòng chọn thêm ${r} lá (${c}/${t})`,
      readingResult: "「 Kết quả 」",
      aiTitle: "✦ Giải bài tổng hợp ✦",
      aiLoading: "Đang đọc thông điệp từ các lá bài...",
      aiError: "Đã xảy ra lỗi khi tải kết quả. Vui lòng thử lại sau.",
      newReading: "✦ Bắt đầu lượt mới",
      back: "← Trang chủ",
      upright: "✨ Thuận lợi",
      reversed: "🔄 Thử thách",
      dirLabel: (r) => r ? "Thử thách" : "Thuận lợi",
      tarotMatch: "Biểu tượng",
      freeReading: "(Đọc tự do - không có câu hỏi cụ thể)",
    },
    aiSystem: `Bạn là nhà tư vấn Tarot chuyên nghiệp 30 năm kinh nghiệm, chuyên về Cartomancy dựa trên bài tây.

Nguyên tắc:
- Đưa ra lời khuyên cụ thể, áp dụng được ngay.
- Không dùng thuật ngữ chuyên môn như "xuôi/ngược". Mô tả tự nhiên năng lượng tích cực hay thử thách.
- Mỗi lá bài giải thích 5-7 câu, đủ chi tiết nhưng trọng tâm.
- KHÔNG dùng Markdown (**, ##, ---). Chỉ văn bản thuần.
- Thay vì "năng lượng này cho thấy...", hãy nói "bạn nên...", "đây là lúc để...".
- Phân tích mối liên kết giữa các lá bài.

Cấu trúc:
1. Tóm tắt bức tranh tổng thể (2-3 câu)
2. Giải thích từng lá bài (tên vị trí + 5-7 câu, liên kết với câu hỏi)
3. Phân tích dòng chảy giữa các lá (3-4 câu)
4. Lời khuyên hành động cụ thể (2-3 việc)
5. Bắt buộc kết thúc bằng:

[Tóm tắt hôm nay]
1. (Điểm chính thứ nhất)
2. (Điểm chính thứ hai)
3. (Điểm chính thứ ba)

Giọng ấm áp, lịch sự, như một người bạn tư vấn.`,
    aiUserPrompt: (spread, question, cards) => `Kiểu trải bài: ${spread}\nCâu hỏi: ${question}\n\nCác lá bài:\n${cards}\n\nGiải bài đầy đủ nhưng cụ thể, không chung chung. Không Markdown. Bắt buộc kết thúc bằng [Tóm tắt hôm nay] 3 dòng.`,
  },
};

const CARD_MEANINGS_VI = {
  hearts: {
    A: { upright: "Tình yêu mới, khởi đầu cảm xúc, niềm vui tràn đầy", reversed: "Trống rỗng cảm xúc, tình yêu trì hoãn, xung đột nội tâm" },
    2: { upright: "Mối quan hệ hài hòa, đối tác, hiểu biết lẫn nhau", reversed: "Mất cân bằng, thiếu giao tiếp, xung đột" },
    3: { upright: "Ăn mừng, tình bạn, hợp tác sáng tạo, tin vui", reversed: "Hưởng thụ quá mức, lãng phí, quan hệ hời hợt" },
    4: { upright: "Bất mãn với sự ổn định, thờ ơ, cần đánh giá lại", reversed: "Động lực mới, chấp nhận thay đổi" },
    5: { upright: "Mất mát, buồn bã, hối tiếc, bám víu quá khứ", reversed: "Phục hồi, tha thứ, khả năng bắt đầu mới" },
    6: { upright: "Hoài niệm, ký ức ngây thơ, hạnh phúc quá khứ", reversed: "Mắc kẹt trong quá khứ, kỳ vọng phi thực tế" },
    7: { upright: "Ảo tưởng, bối rối lựa chọn, cám dỗ, mơ và thực", reversed: "Lựa chọn rõ ràng, quyết đoán, đối mặt thực tế" },
    8: { upright: "Ra đi, từ bỏ, tìm kiếm ý nghĩa sâu sắc hơn", reversed: "Bám víu, không thể rời đi, sợ hãi" },
    9: { upright: "Ước nguyện thành tựu, mãn nguyện, giàu có cảm xúc", reversed: "Bất mãn, tham lam, chủ nghĩa vật chất" },
    10: { upright: "Hạnh phúc trọn vẹn, gia đình hòa thuận, đầy đủ tình cảm", reversed: "Bất hòa gia đình, rạn nứt quan hệ" },
    J: { upright: "Thanh niên giàu cảm xúc, tin lãng mạn, thông điệp trực giác", reversed: "Chưa trưởng thành cảm xúc, trốn tránh thực tế" },
    Q: { upright: "Người phụ nữ trực giác, khả năng đồng cảm, trí tuệ cảm xúc", reversed: "Thao túng cảm xúc, phụ thuộc" },
    K: { upright: "Người lãnh đạo giàu cảm xúc, cố vấn khôn ngoan, rộng lượng", reversed: "Kìm nén cảm xúc, thái độ thao túng" },
  },
  diamonds: {
    A: { upright: "Cơ hội tài chính mới, khởi đầu vật chất, hạt giống thịnh vượng", reversed: "Bỏ lỡ cơ hội, bất ổn tài chính, tham lam" },
    2: { upright: "Cân bằng, ứng phó linh hoạt, quản lý đa nhiệm", reversed: "Mất cân bằng, quá tải, rối loạn ưu tiên" },
    3: { upright: "Nâng cao kỹ năng, làm việc nhóm, tinh thần thợ lành nghề", reversed: "Bình thường, thiếu động lực, giảm chất lượng" },
    4: { upright: "Ổn định, bảo thủ, an toàn tài chính, sở hữu", reversed: "Bám víu quá mức, keo kiệt, từ chối thay đổi" },
    5: { upright: "Khó khăn tài chính, vấn đề sức khỏe, cô lập, nghèo khó", reversed: "Dấu hiệu phục hồi, bàn tay giúp đỡ, cải thiện" },
    6: { upright: "Hào phóng, chia sẻ, cân bằng tài chính, cho và nhận", reversed: "Nợ nần, giao dịch bất công, ích kỷ" },
    7: { upright: "Kiên nhẫn, đầu tư dài hạn, chờ đợi kết quả", reversed: "Nóng vội, đầu tư sai, bỏ cuộc" },
    8: { upright: "Tinh thần thợ lành nghề, rèn luyện kỹ năng, nỗ lực đều đặn", reversed: "Hoàn hảo chủ nghĩa, nhàm chán, mất đam mê" },
    9: { upright: "Thịnh vượng, tự lập, xa xỉ, đạt mục tiêu, tự do tài chính", reversed: "Phô trương, hư danh, phụ thuộc tài chính" },
    10: { upright: "Di sản, thịnh vượng gia tộc, thành công dài hạn", reversed: "Xung đột tài chính gia đình, tranh chấp di sản" },
    J: { upright: "Học sinh chăm chỉ, ý tưởng kinh doanh mới, thông điệp thực tế", reversed: "Kế hoạch phi thực tế, lười biếng" },
    Q: { upright: "Phụ nữ thực tế, khả năng quản lý tài chính, hỗ trợ ổn định", reversed: "Chủ nghĩa vật chất, sở hữu, ghen tị" },
    K: { upright: "Doanh nhân, thành công tài chính, lãnh đạo thực tế", reversed: "Tham lam, tham nhũng, chủ nghĩa tiền bạc" },
  },
  clubs: {
    A: { upright: "Khởi đầu mới, cảm hứng, năng lượng sáng tạo, phiêu lưu", reversed: "Trì hoãn, mất phương hướng, thiếu năng lượng" },
    2: { upright: "Giai đoạn lên kế hoạch, ngã ba quyết định, thiết kế tương lai", reversed: "Do dự, sợ hãi, kế hoạch sai lầm" },
    3: { upright: "Mở rộng, phát triển, tầm nhìn thành hiện thực", reversed: "Sai hướng, mở rộng quá mức, thiếu chuẩn bị" },
    4: { upright: "Ăn mừng, ổn định, niềm vui thành quả, hạnh phúc gia đình", reversed: "Bất ổn, sợ thay đổi" },
    5: { upright: "Cạnh tranh, xung đột, va chạm ý kiến, thách thức", reversed: "Tránh xung đột, đấu tranh nội tâm, thỏa hiệp" },
    6: { upright: "Chiến thắng, được công nhận, thành tựu công khai, tự tin", reversed: "Kiêu ngạo, thiếu khiêm tốn, thành công tạm thời" },
    7: { upright: "Bảo vệ dũng cảm, giữ niềm tin, đối mặt thách thức", reversed: "Từ bỏ, bị áp đảo, mất tự tin" },
    8: { upright: "Tiến triển nhanh, du lịch, thay đổi nhanh chóng", reversed: "Trì hoãn, thất vọng, kế hoạch trật bánh" },
    9: { upright: "Kiên nhẫn, cảnh giác, thử thách cuối cùng, sức bền", reversed: "Nghi ngờ, hoang tưởng, phòng thủ quá mức" },
    10: { upright: "Gánh nặng, trách nhiệm, quá tải, ý chí hoàn thành", reversed: "Buông bỏ gánh nặng, ủy thác, kiệt sức" },
    J: { upright: "Thanh niên nhiệt huyết, tinh thần phiêu lưu, tin mới", reversed: "Liều lĩnh, hành động khinh suất" },
    Q: { upright: "Phụ nữ tự tin, đam mê, sức hấp dẫn xã giao", reversed: "Ghen tị, hung hăng, ham muốn thống trị" },
    K: { upright: "Lãnh đạo lôi cuốn, tầm nhìn, quyết định táo bạo", reversed: "Độc tài, nóng vội, thái độ bạo chúa" },
  },
  spades: {
    A: { upright: "Phát hiện sự thật, đột phá, sáng suốt tinh thần", reversed: "Hỗn loạn, phán đoán sai, tư duy phá hoại" },
    2: { upright: "Cân bằng, lựa chọn khó khăn, bế tắc, cần trực giác", reversed: "Quá tải thông tin, trốn tránh quyết định, tự lừa dối" },
    3: { upright: "Chia ly, buồn bã, đau lòng, phản bội", reversed: "Phục hồi, tha thứ, vượt qua quá khứ" },
    4: { upright: "Nghỉ ngơi, thiền định, thời kỳ phục hồi, cần nạp lại năng lượng", reversed: "Bất an, kiệt sức, từ chối nghỉ ngơi" },
    5: { upright: "Xung đột, cảm giác thất bại, chiến thắng hèn nhát", reversed: "Hòa giải, thanh toán quá khứ, dũng cảm" },
    6: { upright: "Giai đoạn chuyển tiếp, du hành, để khó khăn lại phía sau", reversed: "Trì trệ, vấn đề chưa giải quyết, kháng cự" },
    7: { upright: "Chiến lược, hành động bí mật, tiếp cận khôn ngoan", reversed: "Tự lừa dối, hèn nhát, bị đánh cắp" },
    8: { upright: "Trói buộc, hạn chế, bất lực, tư duy tự giới hạn", reversed: "Giải thoát, góc nhìn mới, thoát ra" },
    9: { upright: "Lo âu, ác mộng, lo lắng sâu sắc, đau khổ tinh thần", reversed: "Phục hồi, hy vọng, tệ nhất đã qua" },
    10: { upright: "Kết thúc, khép lại, thay đổi lớn, đỉnh điểm đau khổ", reversed: "Không phải không thể phục hồi, tái sinh, kháng cự" },
    J: { upright: "Người quan sát sắc bén, tìm kiếm sự thật, thu thập thông tin", reversed: "Nói xấu, gián điệp, ngờ vực" },
    Q: { upright: "Phụ nữ độc lập, phán đoán sáng suốt, người nói sự thật", reversed: "Lạnh lùng, thiên kiến, cô lập" },
    K: { upright: "Quyền uy trí tuệ, phán đoán công bằng, lãnh đạo phân tích", reversed: "Tàn nhẫn, lạm dụng quyền lực, thao túng" },
  },
};

const JOKER_MEANING_VI = {
  upright: "Tiềm năng vô hạn, khởi đầu hành trình mới, tiềm năng thuần khiết, linh hồn tự do",
  reversed: "Liều lĩnh, mất phương hướng, lựa chọn ngu ngốc, phiêu lưu khinh suất",
};

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
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Crimson+Pro:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

  :root {
    --bg-deep: #060610;
    --bg-card: #0e0e1c;
    --bg-surface: #161630;
    --gold: #d4a853;
    --gold-light: #f0d78c;
    --gold-dim: #8a6f2f;
    --purple: #7b6cf6;
    --purple-dim: #3d3580;
    --rose: #e6395a;
    --text-primary: #e8e6e3;
    --text-secondary: #8a8a9a;
    --text-dim: #55556a;
    --card-width: 120px;
    --card-height: 180px;
    --glow-gold: rgba(212,168,83,0.35);
    --glow-purple: rgba(123,108,246,0.25);
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
    background: 
      radial-gradient(1.5px 1.5px at 15% 25%, rgba(212,168,83,0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 35% 65%, rgba(123,108,246,0.3) 0%, transparent 100%),
      radial-gradient(2px 2px at 55% 15%, rgba(212,168,83,0.2) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 75% 55%, rgba(123,108,246,0.2) 0%, transparent 100%),
      radial-gradient(1px 1px at 10% 75%, rgba(255,215,0,0.3) 0%, transparent 100%),
      radial-gradient(1px 1px at 85% 35%, rgba(123,108,246,0.25) 0%, transparent 100%),
      radial-gradient(2px 2px at 45% 85%, rgba(212,168,83,0.15) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 65% 45%, rgba(255,255,255,0.08) 0%, transparent 100%),
      radial-gradient(1px 1px at 25% 95%, rgba(212,168,83,0.2) 0%, transparent 100%),
      radial-gradient(1px 1px at 95% 10%, rgba(123,108,246,0.15) 0%, transparent 100%);
    background-size: 400px 400px;
    animation: twinkle 6s ease-in-out infinite alternate;
  }
  .bg-stars::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(123,108,246,0.06) 0%, transparent 60%),
                radial-gradient(ellipse at 50% 100%, rgba(212,168,83,0.04) 0%, transparent 60%);
  }
  @keyframes twinkle { 
    0% { opacity: 0.4; transform: translateY(0); } 
    100% { opacity: 1; transform: translateY(-10px); } 
  }

  .bg-glow {
    position: fixed;
    width: 700px;
    height: 700px;
    border-radius: 50%;
    filter: blur(180px);
    opacity: 0.07;
    pointer-events: none;
    z-index: 0;
    animation: glowFloat 12s ease-in-out infinite alternate;
  }
  .bg-glow-1 { top: -250px; left: -250px; background: var(--gold); }
  .bg-glow-2 { bottom: -250px; right: -250px; background: var(--purple); }
  @keyframes glowFloat {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(30px, 20px) scale(1.1); }
  }

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
    padding: 48px 0 24px;
  }
  .header-icon {
    font-size: 20px;
    color: var(--gold);
    letter-spacing: 20px;
    margin-bottom: 16px;
    animation: pulse-gold 4s ease-in-out infinite;
    opacity: 0.7;
  }
  @keyframes pulse-gold {
    0%, 100% { opacity: 0.4; letter-spacing: 20px; }
    50% { opacity: 1; letter-spacing: 24px; text-shadow: 0 0 30px rgba(212,168,83,0.6); }
  }
  .header h1 {
    font-family: 'Cormorant Garamond', 'Noto Serif KR', serif;
    font-size: 40px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 40%, #c4915c 70%, var(--gold-light) 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 8px;
    margin-bottom: 8px;
    animation: shimmerText 4s linear infinite;
  }
  @keyframes shimmerText {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  .header p {
    color: var(--text-dim);
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    letter-spacing: 8px;
    font-weight: 400;
  }

  /* ─── Spread Selection ─── */
  .spread-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin: 30px 0;
  }
  .spread-card {
    background: linear-gradient(160deg, rgba(22,22,48,0.9), rgba(14,14,28,0.95));
    border: 1px solid rgba(212,168,83,0.1);
    border-radius: 20px;
    padding: 32px 22px;
    cursor: pointer;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: center;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }
  .spread-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(212,168,83,0.08), transparent 70%);
    opacity: 0;
    transition: opacity 0.5s;
  }
  .spread-card::after {
    content: '';
    position: absolute;
    top: -1px; left: -1px; right: -1px; bottom: -1px;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(212,168,83,0.3), transparent 40%, transparent 60%, rgba(123,108,246,0.2));
    opacity: 0;
    transition: opacity 0.5s;
    z-index: -1;
  }
  .spread-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(212,168,83,0.12), 0 0 40px rgba(212,168,83,0.06);
    border-color: rgba(212,168,83,0.3);
  }
  .spread-card:hover::before { opacity: 1; }
  .spread-card:hover::after { opacity: 1; }
  .spread-card .icon {
    font-size: 28px;
    color: var(--gold);
    margin-bottom: 14px;
    letter-spacing: 4px;
    filter: drop-shadow(0 0 8px rgba(212,168,83,0.3));
  }
  .spread-card h3 {
    font-size: 19px;
    color: var(--text-primary);
    margin-bottom: 4px;
    font-weight: 700;
  }
  .spread-card .subtitle {
    font-size: 11px;
    color: var(--gold-dim);
    letter-spacing: 4px;
    margin-bottom: 14px;
    text-transform: uppercase;
  }
  .spread-card .desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.8;
  }
  .spread-card .count {
    margin-top: 14px;
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
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .question-label {
    font-family: 'Cormorant Garamond', 'Noto Serif KR', serif;
    font-size: 18px;
    color: var(--gold);
    margin-bottom: 16px;
    letter-spacing: 3px;
  }
  .question-input {
    width: 100%;
    max-width: 600px;
    padding: 18px 24px;
    background: rgba(22,22,48,0.8);
    border: 1px solid rgba(212,168,83,0.15);
    border-radius: 16px;
    color: var(--text-primary);
    font-family: 'Noto Serif KR', serif;
    font-size: 15px;
    outline: none;
    transition: all 0.4s;
    resize: none;
    backdrop-filter: blur(10px);
  }
  .question-input::placeholder { color: var(--text-dim); }
  .question-input:focus { 
    border-color: var(--gold); 
    box-shadow: 0 0 30px rgba(212,168,83,0.1);
  }

  /* ─── Buttons ─── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 16px 40px;
    border: 1px solid var(--gold);
    background: transparent;
    color: var(--gold);
    font-family: 'Noto Serif KR', serif;
    font-size: 15px;
    letter-spacing: 3px;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    margin-top: 20px;
    position: relative;
    overflow: hidden;
  }
  .btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--gold), #c4915c);
    opacity: 0;
    transition: opacity 0.4s;
    border-radius: 50px;
  }
  .btn:hover {
    color: var(--bg-deep);
    border-color: transparent;
    box-shadow: 0 8px 32px rgba(212,168,83,0.3);
    transform: translateY(-2px);
  }
  .btn:hover::before { opacity: 1; }
  .btn span, .btn { position: relative; z-index: 1; }
  .btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn-secondary {
    border-color: var(--text-dim);
    color: var(--text-secondary);
    padding: 12px 28px;
    font-size: 13px;
  }
  .btn-secondary::before { background: rgba(255,255,255,0.05); }
  .btn-secondary:hover {
    color: var(--text-primary);
    border-color: var(--text-secondary);
    box-shadow: none;
  }

  /* ─── Card Styles ─── */
  .playing-card {
    width: var(--card-width);
    height: var(--card-height);
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    perspective: 1000px;
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
    border-radius: 12px;
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
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  .card-back::before {
    content: '';
    position: absolute;
    inset: 5px;
    border: 1px solid rgba(212,168,83,0.15);
    border-radius: 8px;
  }
  .card-back::after {
    content: '✦';
    font-size: 32px;
    color: var(--gold-dim);
    opacity: 0.5;
    text-shadow: 0 0 20px rgba(212,168,83,0.3);
  }
  .card-back-pattern {
    position: absolute;
    inset: 10px;
    border-radius: 6px;
    background: 
      repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(212,168,83,0.03) 6px, rgba(212,168,83,0.03) 7px),
      repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(123,108,246,0.02) 6px, rgba(123,108,246,0.02) 7px);
  }

  /* Card front */
  .card-front {
    background: linear-gradient(160deg, #fdfbf7, #ede8df);
    border: 2px solid #c8b88a;
    transform: rotateY(180deg);
    padding: 8px;
    justify-content: space-between;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
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
    font-size: 44px;
    opacity: 0.9;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
  .card-joker-face { font-size: 48px; }
  .card-reversed-marker {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 8px;
    color: #999;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  /* ─── Shuffle Animation ─── */
  .shuffle-area {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 350px;
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
    border-radius: 12px;
    background: linear-gradient(145deg, #1a1a3e, #0d0d24);
    border: 2px solid var(--gold-dim);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gold-dim);
    font-size: 28px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
  .shuffle-card.shuffling {
    animation: shuffleMove 0.5s ease-in-out;
  }
  @keyframes shuffleMove {
    0% { transform: translateX(0) translateY(0) rotate(0deg); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
    20% { transform: translateX(-80px) translateY(-30px) rotate(-12deg); box-shadow: 0 8px 40px rgba(212,168,83,0.2); }
    50% { transform: translateX(80px) translateY(-15px) rotate(10deg); box-shadow: 0 12px 50px rgba(123,108,246,0.15); }
    75% { transform: translateX(-40px) translateY(-20px) rotate(-6deg); }
    100% { transform: translateX(0) translateY(0) rotate(0deg); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
  }
  .shuffle-text {
    position: absolute;
    bottom: 20px;
    color: var(--gold);
    font-size: 13px;
    letter-spacing: 4px;
    animation: breathe 2s ease-in-out infinite;
  }
  @keyframes breathe {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
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
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    animation: fanIn 0.4s ease forwards;
  }
  .fan-card:hover {
    transform: translateY(-20px) scale(1.08);
    z-index: 10;
    filter: drop-shadow(0 12px 24px rgba(212,168,83,0.25));
  }
  .fan-card.picked {
    opacity: 0.15;
    transform: scale(0.85);
    pointer-events: none;
    filter: grayscale(1);
  }
  @keyframes fanIn {
    from { opacity: 0; transform: translateY(40px) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .draw-instructions {
    text-align: center;
    color: var(--gold);
    font-size: 14px;
    letter-spacing: 3px;
    margin-bottom: 16px;
    animation: breathe 2.5s ease-in-out infinite;
  }

  /* ─── Selected Cards Display ─── */
  .selected-cards-row {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    margin: 30px 0;
    min-height: 200px;
  }
  .selected-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    animation: slotAppear 0.5s ease;
  }
  @keyframes slotAppear {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  .slot-placeholder {
    width: var(--card-width);
    height: var(--card-height);
    border: 2px dashed rgba(212,168,83,0.15);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-dim);
    font-size: 24px;
    animation: placeholderPulse 3s ease-in-out infinite;
  }
  @keyframes placeholderPulse {
    0%, 100% { border-color: rgba(212,168,83,0.1); }
    50% { border-color: rgba(212,168,83,0.25); }
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
    margin-bottom: 36px;
  }
  .reading-header h2 {
    font-family: 'Cormorant Garamond', 'Noto Serif KR', serif;
    font-size: 26px;
    color: var(--gold);
    letter-spacing: 6px;
    margin-bottom: 6px;
  }
  .reading-divider {
    width: 80px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 18px auto;
  }

  /* ─── Card Readings Grid (horizontal) ─── */
  .card-readings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    margin: 30px 0;
  }
  .card-reading-card {
    background: linear-gradient(160deg, rgba(22,22,48,0.8), rgba(14,14,28,0.9));
    border: 1px solid rgba(212,168,83,0.08);
    border-radius: 20px;
    padding: 20px 16px;
    text-align: center;
    animation: readingItemIn 0.6s ease;
    transition: all 0.3s;
    backdrop-filter: blur(10px);
  }
  .card-reading-card:hover {
    border-color: rgba(212,168,83,0.2);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    transform: translateY(-4px);
  }
  @keyframes readingItemIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .card-reading-top {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }
  .card-reading-bottom { }
  .card-reading-position {
    font-size: 11px;
    color: var(--gold);
    letter-spacing: 3px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  .card-reading-name {
    font-size: 16px;
    margin-bottom: 6px;
    font-weight: 700;
  }
  .card-reading-direction {
    font-size: 12px;
    margin-bottom: 10px;
    letter-spacing: 1px;
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
  }
  .card-reading-direction.upright { 
    color: var(--gold); 
    background: rgba(212,168,83,0.1);
  }
  .card-reading-direction.reversed { 
    color: var(--rose); 
    background: rgba(230,57,90,0.1);
  }
  .card-reading-meaning {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.8;
  }

  /* ─── AI Interpretation ─── */
  .ai-reading {
    background: linear-gradient(160deg, rgba(212,168,83,0.04), rgba(14,14,28,0.95));
    border: 1px solid rgba(212,168,83,0.15);
    border-radius: 24px;
    padding: 40px 36px;
    margin: 36px 0;
    position: relative;
    overflow: hidden;
  }
  .ai-reading::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), var(--purple), transparent);
    animation: shimmerLine 3s linear infinite;
  }
  @keyframes shimmerLine {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .ai-reading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(212,168,83,0.03), transparent 70%);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .ai-reading h3 {
    color: var(--gold);
    font-family: 'Cormorant Garamond', 'Noto Serif KR', serif;
    font-size: 18px;
    letter-spacing: 6px;
    margin-bottom: 24px;
    text-align: center;
    position: relative;
    z-index: 1;
  }
  .ai-reading-text {
    color: var(--text-primary);
    font-size: 15px;
    line-height: 2.1;
    white-space: pre-wrap;
    position: relative;
    z-index: 1;
  }
  .ai-loading {
    text-align: center;
    padding: 50px;
  }
  .ai-loading-dots {
    display: inline-flex;
    gap: 8px;
  }
  .ai-loading-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--gold);
    animation: dotPulse 1.4s ease-in-out infinite;
  }
  .ai-loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .ai-loading-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotPulse {
    0%, 80%, 100% { opacity: 0.15; transform: scale(0.6); }
    40% { opacity: 1; transform: scale(1.3); box-shadow: 0 0 12px rgba(212,168,83,0.5); }
  }
  .ai-loading-text {
    color: var(--text-secondary);
    font-size: 13px;
    margin-top: 20px;
    letter-spacing: 3px;
    animation: breathe 2s ease-in-out infinite;
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
    transition: all 0.3s;
    background: none;
    border: none;
    font-family: 'Noto Serif KR', serif;
    padding: 8px 16px;
    border-radius: 20px;
  }
  .nav-back:hover { 
    color: var(--gold); 
    background: rgba(212,168,83,0.08);
  }

  .step-indicator {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-dim);
    transition: all 0.4s;
  }
  .step-dot.active {
    background: var(--gold);
    box-shadow: 0 0 12px rgba(212,168,83,0.6);
    transform: scale(1.3);
  }
  .step-dot.done { background: var(--gold-dim); }

  /* ─── Responsive ─── */
  @media (max-width: 640px) {
    .header h1 { font-size: 28px; letter-spacing: 4px; }
    .spread-grid { grid-template-columns: 1fr; }
    .playing-card { --card-width: 80px; --card-height: 120px; }
    .playing-card.small { --card-width: 65px; --card-height: 97px; }
    .card-center-suit { font-size: 30px; }
    .card-corner .rank-text { font-size: 12px; }
    .card-corner .suit-text { font-size: 10px; }
    .card-reading-item { flex-direction: column; align-items: center; text-align: center; }
    .card-readings-grid { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
    .celtic-layout { gap: 4px; }
    .content { padding: 12px; }
    .draw-fan { gap: 1px; }
    .ai-reading { padding: 28px 20px; }
  }

  /* Misc */
  .fade-in { animation: fadeInUp 0.5s ease; }
  .text-center { text-align: center; }
  .mt-20 { margin-top: 20px; }
  .section-title {
    text-align: center;
    color: var(--gold);
    font-size: 13px;
    letter-spacing: 5px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .error-box {
    background: rgba(230, 57, 70, 0.08);
    border: 1px solid rgba(230, 57, 70, 0.25);
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    color: var(--rose);
    margin: 20px 0;
  }

  /* Language Toggle */
  .lang-toggle {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 100;
    display: flex;
    gap: 4px;
    background: rgba(14, 14, 28, 0.85);
    border: 1px solid rgba(212,168,83,0.15);
    border-radius: 28px;
    padding: 4px;
    backdrop-filter: blur(20px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  .lang-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 14px;
    border: none;
    border-radius: 24px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;
    font-family: 'Noto Serif KR', serif;
  }
  .lang-btn.active {
    background: rgba(212,168,83,0.15);
    color: var(--gold);
    box-shadow: 0 0 12px rgba(212,168,83,0.1);
  }
  .lang-btn:hover { color: var(--gold-light); transform: scale(1.05); }
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
  const [lang, setLang] = useState("ko");
  const shuffleTimerRef = useRef(null);

  const t = LANG[lang];

  // Helper: get localized card info
  const getCardName = (card) => {
    if (card.suit.id === "joker") return lang === "ko" ? "조커 (The Fool)" : "Joker (The Fool)";
    const suitName = t.suits[card.suit.id]?.name || card.suit.name;
    const rankName = t.ranks[card.rank.id] || card.rank.name;
    return `${suitName} ${rankName}`;
  };
  const getCardMeaning = (card, isReversed) => {
    if (lang === "vi") {
      const viMeaning = card.suit.id === "joker" ? JOKER_MEANING_VI : CARD_MEANINGS_VI[card.suit.id]?.[card.rank.id];
      if (viMeaning) return isReversed ? viMeaning.reversed : viMeaning.upright;
    }
    return isReversed ? card.meaning.reversed : card.meaning.upright;
  };
  const getSpread = (spread) => t.spreads[spread.id] || {};
  const getSuitInfo = (card) => t.suits[card.suit.id] || {};

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

    const ls = t;
    const spreadInfo = getSpread(selectedSpread);

    const cardsInfo = drawnCards.map((card, i) => {
      const dir = ls.ui.dirLabel(cardDirections[i]);
      const meaning = getCardMeaning(card, cardDirections[i]);
      const position = spreadInfo.positions?.[i] || selectedSpread.positions[i];
      const cardName = getCardName(card);
      const suitInfo = getSuitInfo(card);
      return `[${position}] ${cardName} (${dir}) - ${meaning} / ${suitInfo.element}`;
    }).join("\n");

    const systemPrompt = ls.aiSystem;
    const spreadLabel = `${spreadInfo.name} (${spreadInfo.subtitle})`;
    const userPrompt = ls.aiUserPrompt(spreadLabel, question || ls.ui.freeReading, cardsInfo);

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
      setAiError(t.ui.aiError);
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
    const spreadInfo = getSpread(selectedSpread);
    const positions = spreadInfo.positions || selectedSpread.positions;

    // Celtic Cross uses a special layout
    if (selectedSpread.id === "celtic" && step === STEPS.READING) {
      return (
        <div className="celtic-layout">
          {positions.map((pos, i) => (
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
        {positions.map((pos, i) => (
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
      <p className="section-title">{t.ui.selectSpread}</p>
      <div className="spread-grid">
        {SPREADS.map((s) => {
          const ls = getSpread(s);
          return (
            <div key={s.id} className="spread-card" onClick={() => selectSpread(s)}>
              <div className="icon">{s.icon}</div>
              <h3>{ls.name}</h3>
              <div className="subtitle">{ls.subtitle}</div>
              <div className="desc">{ls.description}</div>
              <div className="count">{s.count}{ls.unit}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderQuestion = () => {
    const ls = getSpread(selectedSpread);
    return (
    <div className="question-section">
      <div className="question-label">「 {ls.name} 」 — {ls.subtitle}</div>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20, lineHeight: 1.8, whiteSpace: "pre-line" }}>
        {t.ui.questionHint}
      </p>
      <textarea
        className="question-input"
        rows={3}
        placeholder={t.ui.questionPlaceholder}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <br />
      <button className="btn" onClick={startShuffle}>
        {t.ui.shuffle}
      </button>
      <br />
      <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={startShuffle}>
        {t.ui.skipQuestion}
      </button>
    </div>
    );
  };

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
      <p className="shuffle-text">
        {t.ui.shuffling}
      </p>
    </div>
  );

  const renderDraw = () => {
    const remaining = selectedSpread.count - drawnCards.length;
    const spreadInfo = getSpread(selectedSpread);
    return (
      <div className="draw-area">
        <div className="draw-instructions">
          {t.ui.selectCards(remaining, drawnCards.length, selectedSpread.count)}
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

  const renderReading = () => {
    const spreadInfo = getSpread(selectedSpread);
    return (
    <div className="reading-section">
      <div className="reading-header">
        <h2>{t.ui.readingResult}</h2>
        <div className="reading-divider" />
        {question && (
          <p style={{ color: "var(--text-secondary)", fontSize: 13, fontStyle: "italic" }}>
            "{question}"
          </p>
        )}
      </div>

      {renderSelectedCards()}

      {/* Individual card readings - horizontal grid */}
      <div className="card-readings-grid">
        {drawnCards.map((card, i) => {
          if (!flippedCards[i]) return null;
          const cardName = getCardName(card);
          const dir = cardDirections[i];
          const meaning = getCardMeaning(card, dir);
          const suitInfo = getSuitInfo(card);
          const position = spreadInfo.positions?.[i] || selectedSpread.positions[i];
          return (
            <div key={i} className="card-reading-card" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="card-reading-top">
                <PlayingCard card={card} isReversed={dir} flipped={true} small />
              </div>
              <div className="card-reading-bottom">
                <div className="card-reading-position">{position}</div>
                <div className="card-reading-name">{cardName}</div>
                <div className={`card-reading-direction ${dir ? "reversed" : "upright"}`}>
                  {dir ? t.ui.reversed : t.ui.upright}
                </div>
                <div className="card-reading-meaning">{meaning}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Reading */}
      <div className="ai-reading">
        <h3>{t.ui.aiTitle}</h3>
        {aiLoading && (
          <div className="ai-loading">
            <div className="ai-loading-dots">
              <div className="ai-loading-dot" />
              <div className="ai-loading-dot" />
              <div className="ai-loading-dot" />
            </div>
            <div className="ai-loading-text">{t.ui.aiLoading}</div>
          </div>
        )}
        {aiError && <div className="error-box">{aiError}</div>}
        {aiReading && <div className="ai-reading-text">{aiReading}</div>}
      </div>

      <div className="text-center mt-20">
        <button className="btn" onClick={goHome}>
          {t.ui.newReading}
        </button>
      </div>
    </div>
    );
  };

  return (
    <>
      <style>{cssText}</style>
      <div className="app-container">
        <div className="bg-stars" />
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />
        <div className="content">
          {/* Language Toggle */}
          <div className="lang-toggle">
            {Object.entries(LANG).map(([key, val]) => (
              <button key={key} className={`lang-btn ${lang === key ? "active" : ""}`} onClick={() => setLang(key)}>
                {val.flag}
              </button>
            ))}
          </div>

          {/* Navigation */}
          {step !== STEPS.HOME && (
            <div className="nav-bar">
              <button className="nav-back" onClick={goHome}>
                {t.ui.back}
              </button>
              {renderStepDots()}
            </div>
          )}

          {/* Header */}
          <div className="header">
            <div className="header-icon">✦ ✦ ✦</div>
            <h1>{t.ui.title}</h1>
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
