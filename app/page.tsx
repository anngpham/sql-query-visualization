import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to SQL Visualizer</h1>

      <p className="text-lg text-center max-w-2xl mb-8">
        Explore and understand SQL queries through interactive visualizations.
        Transform complex database operations into clear, intuitive diagrams.
      </p>

      <Link
        href="/sql-visualization"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Start Visualizing SQL
      </Link>
    </div>
  );
}
