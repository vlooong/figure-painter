export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Figure Painter</h1>
      <p className="text-lg text-gray-600 mb-8">科研论文图表数据处理工具</p>
      <div className="flex gap-4">
        <a href="/extract" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          数据提取
        </a>
        <a href="/plot" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
          科研绘图
        </a>
      </div>
    </main>
  )
}
