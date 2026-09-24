type NoticeProps = {
  tone: "success" | "error";
  message: string;
};

export function Notice({ tone, message }: NoticeProps) {
  const className =
    tone === "error"
      ? "mb-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700"
      : "mb-6 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800";

  return (
    <p role="status" className={className}>
      {message}
    </p>
  );
}
