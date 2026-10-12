/** Shown wherever numbers, funds or projections appear. Wording to be confirmed by Compliance. */
export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-snug text-muted ${className}`}>
      Nội dung mang tính giáo dục, không phải khuyến nghị đầu tư. Lợi nhuận minh họa là giả định, kết quả quá khứ không bảo
      đảm kết quả tương lai. Vui lòng đọc bản cáo bạch trước khi đầu tư.
    </p>
  );
}
