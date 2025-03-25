import MazeSolver from "@/components/maze-solver"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-6 sm:px-8 md:px-10 max-w-7xl min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8 text-center">Maze Solver BFS/DFS Visualization</h1>
      <MazeSolver />
    </main>
  )
}

