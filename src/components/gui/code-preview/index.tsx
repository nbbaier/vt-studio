export default function CodePreview({ code }: { code: string }) {
  return (
    <code className="bg-secondary block w-full overflow-x-auto p-2 text-sm">
      <pre>{code}</pre>
    </code>
  );
}
