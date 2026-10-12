# Công thức câu hỏi (Quiz formula)

Every graded question in `content/segments/*` follows the house formula from
*Công thức Quiz Giáo dục Đầu tư*. The schema (`content/schema.ts`) enforces the parts a
machine can check; reviewers check the rest.

```
CONTEXT  → 1–2 câu: một tình huống thật hoặc một con số gây chú ý
QUESTION → 1 câu hỏi về nguyên nhân, kết quả hoặc quyết định
OPTIONS  → 3 lựa chọn: 1 đúng, 2 nhiễu hợp lý dựa trên hiểu lầm phổ biến
INSIGHT  → 1–2 câu: bản chất tài chính + bài học cần nhớ
```

| Field (`select`) | Rule | Enforced by |
|---|---|---|
| `context` | 20–320 ký tự; nhân vật / tình huống + con số + kết quả đáng chú ý | schema |
| `prompt` | đúng một câu hỏi | review |
| `options` | đúng 3, khác nhau; 2 phương án sai là hiểu lầm có thật | schema + `validateContent` |
| `explain` (insight) | 20–320 ký tự; nêu nguyên nhân + nguyên tắc + bài học, không lặp lại đáp án | schema + `validateContent` |
| `pattern` | một trong 4 mẫu bên dưới; hiển thị thành nhãn phía trên câu hỏi | schema |

`scenario` items follow the same rule: `says` is the context, exactly 3 options, an insight.
`numeric` ("Đoán số") needs a context and an insight, and its arithmetic must take one easy
step. `true_false` was removed: a bare statement has no context.

## Bốn mẫu câu hỏi

| `pattern` | Nhãn | Khung | Ví dụ trong nội dung |
|---|---|---|---|
| `prediction` | Dự đoán | Vốn + thời gian → "tài khoản sẽ đạt bao nhiêu?" | `b2-billion-years`, `a3-sell-after-2y` |
| `why` | Vì sao? | Kết quả bất ngờ → "vì sao?" | `b3-three-years`, `c2-seesaw` |
| `misconception` | Hiểu lầm phổ biến | Một nhận định phổ biến → "nhận định nào đúng?" | `b3-dca-no-loss`, `a1-nav-expensive` |
| `decision` | Ra quyết định | Một tình huống đầu tư → "nên cân nhắc gì trước khi quyết định?" | `b1-tuition-money`, `a5-otp` |

Ưu tiên **Dự đoán** để tạo tò mò và **Vì sao?** để giải thích bản chất.

## Quy tắc biên tập

- Mỗi câu chỉ một insight.
- Số liệu lịch sử của quỹ chỉ để minh họa: nói rõ "minh họa", "kết quả quá khứ" hoặc "không phải cam kết".
- Phí, thuế, giờ chốt lệnh và lịch giao dịch lấy từ `content/library/fund-facts.ts`; test
  `content/library/library.test.ts` kiểm tra các con số được trích trong bài.
- Tính nhẩm được: nếu cần máy tính mới trả lời được, hãy đổi thành Dự đoán 3 lựa chọn.
- Không ghi "Nguồn: FAQ …" cho người học. Tài liệu nội bộ (`internal: true` trong
  `content/sources.ts`) chỉ giữ để kiểm tra; người học chỉ thấy nguồn là bài viết đã xuất bản.

## Mẫu

> **Context.** Một nhà đầu tư góp đều 10 triệu đồng/tháng vào DCDS. Sau 3 năm, tổng vốn góp
> là 360 triệu đồng, tài khoản đạt khoảng 404 triệu đồng.
> **Question.** Vì sao sau 3 năm, gần 90% giá trị tài khoản vẫn đến từ vốn góp?
> A. Lãi kép chỉ bắt đầu sau 3 năm. **B. Các khoản tiền góp sau chưa có nhiều thời gian
> sinh lời.** C. Đầu tư định kỳ không tận dụng được lãi kép.
> **Insight.** Lãi kép bắt đầu ngay khi lợi nhuận được tái đầu tư, nhưng mỗi khoản góp có
> thời gian sinh lời khác nhau. Đầu tư lâu dài giúp hiệu ứng tích lũy rõ rệt hơn.
