

# Plan: AI Coach hàng ngày + AI Nhật ký cảm xúc

## Tổng quan

Thay thế các tính năng AI hiện tại (quá rời rạc, phải bấm thủ công) bằng 2 tính năng chính có chiều sâu hơn:

1. **AI Daily Coach** — Mỗi ngày hiện 1 thông điệp cá nhân hóa + 1 mini challenge dựa trên mood gần đây
2. **AI Guided Journal** — AI đặt câu hỏi gợi mở để bạn viết journal, sau đó tóm tắt insight

---

## Tính năng 1: AI Daily Coach (Home tab)

Thay thế card "For You Right Now" (AiActivitySuggestions) và floating bubble (MoodCompanion).

- Card hiện trên Home, tự động load 1 lần/ngày (cache theo ngày trong localStorage)
- Nội dung: 1 lời chào cá nhân + 1 mini challenge cụ thể (VD: "Hôm nay thử ghi lại 3 điều tốt đẹp nhé", "Nghe thử bài Weightless - Marconi Union")
- Nút refresh để lấy thông điệp mới
- Dựa trên: mood hôm nay, pattern 7 ngày qua, task completion rate

**Thay đổi:**
- Xóa `AiActivitySuggestions.tsx` và `MoodCompanion.tsx`
- Tạo `AiDailyCoach.tsx` — card đẹp với icon, message, challenge badge
- Cập nhật edge function `mood-insights` thêm type `daily-coach`
- Cập nhật `Index.tsx` để dùng component mới

## Tính năng 2: AI Guided Journal (tab riêng hoặc trong Insights)

Thay thế AiWeeklyJournal bằng trải nghiệm tương tác hơn.

- Khi mở, AI đặt 2-3 câu hỏi gợi mở dựa trên mood tuần qua (VD: "Thứ 4 bạn cảm thấy buồn, chuyện gì đã xảy ra?")
- Người dùng trả lời ngắn gọn qua text input
- AI tổng hợp câu trả lời + mood data thành 1 bản journal summary đẹp
- Có thể lưu journal vào database để xem lại

**Thay đổi:**
- Xóa `AiWeeklyJournal.tsx`
- Tạo `AiGuidedJournal.tsx` — UI dạng conversation: AI hỏi → user trả lời → AI tóm tắt
- Cập nhật edge function `mood-insights` thêm type `journal-questions` và `journal-summary`
- Tạo bảng `journal_entries` trong database (user_id, date, questions, answers, summary)
- Cập nhật `Index.tsx`

## Giữ lại

- `AiTrendAnalysis` trên Insights tab (vẫn hữu ích)

## Kỹ thuật

- Edge function `mood-insights` thêm 3 branch mới: `daily-coach`, `journal-questions`, `journal-summary`
- Prompt `daily-coach`: trả về JSON `{ message, challenge }` qua tool calling
- Prompt `journal-questions`: trả về 2-3 câu hỏi dựa trên mood data
- Prompt `journal-summary`: nhận câu trả lời + mood, trả về bản tóm tắt cảm xúc
- Database migration: tạo bảng `journal_entries` với RLS
- localStorage cache cho daily coach để không gọi AI lặp lại trong ngày

