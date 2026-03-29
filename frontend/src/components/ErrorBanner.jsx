export default function ErrorBanner({ message }) {
  return (
    <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg my-4">
      <div className="flex items-center">
        <span className="text-rose-500 mr-3 text-xl">⚠️</span>
        <div className="text-rose-700 font-medium">{message}</div>
      </div>
    </div>
  );
}
