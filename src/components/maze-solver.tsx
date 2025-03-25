"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Edit3, Navigation, MousePointer2, MousePointerClick, Shuffle } from "lucide-react"

class Point {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y
  }

  toString(): string {
    return `(${this.x}, ${this.y})`
  }
}

// Node class for the algorithms
class Node {
  point: Point
  path: Point[]

  constructor(point: Point, path: Point[]) {
    this.point = point
    this.path = path
  }
}

export default function MazeSolver() {
  const [rows, setRows] = useState(10)
  const [cols, setCols] = useState(10)
  const [maze, setMaze] = useState<number[][]>([])
  const [start, setStart] = useState<Point | null>(null)
  const [end, setEnd] = useState<Point | null>(null)
  const [path, setPath] = useState<Point[]>([])
  const [animatedPath, setAnimatedPath] = useState<Point[]>([])
  const [visited, setVisited] = useState<boolean[][]>([])
  const [algorithm, setAlgorithm] = useState("bfs")
  const [editMode, setEditMode] = useState("wall") // "wall", "start", "end"
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(50) // 1-100
  const [currentStep, setCurrentStep] = useState(0)
  const [pathAnimationStep, setPathAnimationStep] = useState(0)
  const [animationSteps, setAnimationSteps] = useState<Point[]>([])
  const [isRightMouseDown, setIsRightMouseDown] = useState(false)
  const [dragValue, setDragValue] = useState<number | null>(null)
  const [mazeComplexity, setMazeComplexity] = useState(50) // 1-100, controls wall density
  const [animationPhase, setAnimationPhase] = useState<"search" | "path" | "complete">("search")

  // Initialize maze
  useEffect(() => {
    initializeMaze()
  }, [rows, cols])

  const initializeMaze = () => {
    const newMaze = Array(rows)
      .fill(0)
      .map(() => Array(cols).fill(0))
    setMaze(newMaze)
    setVisited(
      Array(rows)
        .fill(false)
        .map(() => Array(cols).fill(false)),
    )
    setStart(new Point(0, 0))
    setEnd(new Point(rows - 1, cols - 1))
    setPath([])
    setAnimatedPath([])
    setAnimationSteps([])
    setCurrentStep(0)
    setPathAnimationStep(0)
    setAnimationPhase("search")
  }

  // Fisher-Yates shuffle algorithm for randomizing directions
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // Generate a random maze using randomized DFS algorithm
  const generateRandomMaze = () => {
    resetAnimation()

    // Start with all walls
    const newMaze = Array(rows)
      .fill(0)
      .map(() => Array(cols).fill(1))

    // Create a grid for the maze generation algorithm
    // We'll use a grid with cells that have walls between them
    // For an n×m maze, we need a 2n-1 × 2m-1 grid
    const gridRows = rows * 2 - 1
    const gridCols = cols * 2 - 1
    const grid = Array(gridRows)
      .fill(0)
      .map(() => Array(gridCols).fill(1)) 

    const startX = 0
    const startY = 0
    grid[startX * 2][startY * 2] = 0 // Mark the starting cell as visited

    // Stack for DFS
    const stack: [number, number][] = [[startX, startY]]

    // Directions: up, right, down, left
    const directions = [
      [-1, 0], // up
      [0, 1], // right
      [1, 0], // down
      [0, -1], // left
    ]

    // Run the maze generation algorithm
    while (stack.length > 0) {
      const [x, y] = stack[stack.length - 1]

      const neighbors: [number, number][] = []

      const shuffledDirections = shuffleArray(directions)

      for (const [dx, dy] of shuffledDirections) {
        const nx = x + dx
        const ny = y + dy

        // Check if the neighbor is valid and unvisited
        if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && grid[nx * 2][ny * 2] === 1) {
          neighbors.push([nx, ny])
        }
      }

      if (neighbors.length > 0) {
        // Choose a random unvisited neighbor
        const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)]

        // Remove the wall between the current cell and the chosen neighbor
        grid[(x + nx) * 1][(y + ny) * 1] = 0

        // Mark the neighbor as visited
        grid[nx * 2][ny * 2] = 0

        // Push the neighbor to the stack
        stack.push([nx, ny])
      } else {
        // Backtrack
        stack.pop()
      }
    }

    // Convert the grid back to maze format
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // Add some randomness based on complexity
        if (grid[i * 2][j * 2] === 0) {
          // This is a path cell
          newMaze[i][j] = 0
        } else {
          // This is a wall cell
          newMaze[i][j] = 1
        }
      }
    }

    // Add additional random walls based on complexity
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // Skip start and end points
        if ((i === 0 && j === 0) || (i === rows - 1 && j === cols - 1)) {
          continue
        }

        // Add random walls based on complexity
        if (newMaze[i][j] === 0 && Math.random() * 100 < mazeComplexity / 3) {
          newMaze[i][j] = 1
        }
      }
    }

    // Ensure start and end are open
    newMaze[0][0] = 0
    newMaze[rows - 1][cols - 1] = 0

    setMaze(newMaze)
    setStart(new Point(0, 0))
    setEnd(new Point(rows - 1, cols - 1))
  }

  // Simpler random maze generator that creates a more open maze with random walls
  const generateSimpleRandomMaze = () => {
    resetAnimation()

    // Start with all open spaces
    const newMaze = Array(rows)
      .fill(0)
      .map(() => Array(cols).fill(0))

    // Add random walls based on complexity
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // Skip start and end points
        if ((i === 0 && j === 0) || (i === rows - 1 && j === cols - 1)) {
          continue
        }

        // Add random walls based on complexity
        if (Math.random() * 100 < mazeComplexity) {
          newMaze[i][j] = 1
        }
      }
    }

    // Ensure start and end are open
    newMaze[0][0] = 0
    newMaze[rows - 1][cols - 1] = 0

    // Set the maze
    setMaze(newMaze)
    setStart(new Point(0, 0))
    setEnd(new Point(rows - 1, cols - 1))
  }

  const handleCellClick = (x: number, y: number, event: React.MouseEvent) => {
    if (isAnimating) return

    // Only process left clicks for single cell placement
    if (event.button !== 0) return

    const newMaze = [...maze]

    if (editMode === "wall") {
      // Toggle between wall and open space
      newMaze[x][y] = newMaze[x][y] === 1 ? 0 : 1
      setMaze(newMaze)
    } else if (editMode === "start") {
      if (newMaze[x][y] === 0) {
        setStart(new Point(x, y))
      }
    } else if (editMode === "end") {
      if (newMaze[x][y] === 0) {
        setEnd(new Point(x, y))
      }
    }
  }

  const handleMouseDown = (x: number, y: number, event: React.MouseEvent) => {
    if (isAnimating || editMode !== "wall") return

    // Prevent default context menu on right click
    if (event.button === 2) {
      event.preventDefault()
      setIsRightMouseDown(true)

      // Set the drag value to the opposite of the current cell value
      const newValue = maze[x][y] === 1 ? 0 : 1
      setDragValue(newValue)

      // Update the first cell
      const newMaze = [...maze]
      newMaze[x][y] = newValue
      setMaze(newMaze)
    }
  }

  const handleMouseEnter = (x: number, y: number) => {
    if (!isRightMouseDown || isAnimating || editMode !== "wall" || dragValue === null) return

    // Update cells as we drag over them
    const newMaze = [...maze]
    newMaze[x][y] = dragValue
    setMaze(newMaze)
  }

  const handleMouseUp = (event: React.MouseEvent) => {
    if (event.button === 2) {
      setIsRightMouseDown(false)
      setDragValue(null)
    }
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    // Prevent the context menu from appearing on right-click
    event.preventDefault()
  }

  useEffect(() => {
    const handleGlobalMouseUp = (event: MouseEvent) => {
      if (event.button === 2) {
        setIsRightMouseDown(false)
        setDragValue(null)
      }
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("contextmenu", (e) => e.preventDefault())

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("contextmenu", (e) => e.preventDefault())
    }
  }, [])

  const isValid = (x: number, y: number, visited: boolean[][]): boolean => {
    return x >= 0 && x < rows && y >= 0 && y < cols && maze[x][y] === 0 && !visited[x][y]
  }

  // BFS implementation
  const bfs = (start: Point, end: Point): Point[] => {
    const queue: Node[] = []
    const visitedCells: boolean[][] = Array(rows)
      .fill(false)
      .map(() => Array(cols).fill(false))
    const allVisited: Point[] = []

    visitedCells[start.x][start.y] = true
    allVisited.push(new Point(start.x, start.y))
    queue.push(new Node(start, [start]))

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]

    while (queue.length > 0) {
      const current = queue.shift()!
      const point = current.point
      const path = current.path

      if (point.equals(end)) {
        setAnimationSteps(allVisited)
        return path
      }

      for (const [dx, dy] of directions) {
        const newX = point.x + dx
        const newY = point.y + dy

        if (isValid(newX, newY, visitedCells)) {
          visitedCells[newX][newY] = true
          allVisited.push(new Point(newX, newY))
          const newPoint = new Point(newX, newY)
          const newPath = [...path, newPoint]
          queue.push(new Node(newPoint, newPath))
        }
      }
    }

    setAnimationSteps(allVisited)
    return []
  }

  // DFS implementation
  const dfs = (start: Point, end: Point): Point[] => {
    const stack: Node[] = []
    const visitedCells: boolean[][] = Array(rows)
      .fill(false)
      .map(() => Array(cols).fill(false))
    const allVisited: Point[] = []

    visitedCells[start.x][start.y] = true
    allVisited.push(new Point(start.x, start.y))
    stack.push(new Node(start, [start]))

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]

    while (stack.length > 0) {
      const current = stack.pop()!
      const point = current.point
      const path = current.path

      if (point.equals(end)) {
        setAnimationSteps(allVisited)
        return path
      }

      for (const [dx, dy] of directions) {
        const newX = point.x + dx
        const newY = point.y + dy

        if (isValid(newX, newY, visitedCells)) {
          visitedCells[newX][newY] = true
          allVisited.push(new Point(newX, newY))
          const newPoint = new Point(newX, newY)
          const newPath = [...path, newPoint]
          stack.push(new Node(newPoint, newPath))
        }
      }
    }

    setAnimationSteps(allVisited)
    return []
  }

  const solveMaze = () => {
    if (!start || !end) return

    setPath([])
    setAnimatedPath([])
    setVisited(
      Array(rows)
        .fill(false)
        .map(() => Array(cols).fill(false)),
    )
    setCurrentStep(0)
    setPathAnimationStep(0)
    setAnimationPhase("search")

    let result: Point[] = []
    if (algorithm === "bfs") {
      result = bfs(start, end)
    } else {
      result = dfs(start, end)
    }

    if (result.length > 0) {
      setPath(result)
    }
  }

  const startAnimation = () => {
    if (animationSteps.length === 0) {
      solveMaze()
    }

    setIsAnimating(true)
  }

  const pauseAnimation = () => {
    setIsAnimating(false)
  }

  const resetAnimation = () => {
    setIsAnimating(false)
    setCurrentStep(0)
    setPathAnimationStep(0)
    setVisited(
      Array(rows)
        .fill(false)
        .map(() => Array(cols).fill(false)),
    )
    setPath([])
    setAnimatedPath([])
    setAnimationSteps([])
    setAnimationPhase("search")
  }

  // Animation effect for search phase
  useEffect(() => {
    if (!isAnimating || animationPhase !== "search" || currentStep >= animationSteps.length) {
      if (currentStep >= animationSteps.length && animationPhase === "search") {
        setAnimationPhase("path")
      }
      return
    }

    const timer = setTimeout(() => {
      const newVisited = [...visited]
      const point = animationSteps[currentStep]
      newVisited[point.x][point.y] = true
      setVisited(newVisited)
      setCurrentStep(currentStep + 1)
    }, 101 - animationSpeed)

    return () => clearTimeout(timer)
  }, [isAnimating, currentStep, animationSteps, animationSpeed, visited, animationPhase])

  // Animation effect for path phase
  useEffect(() => {
    if (!isAnimating || animationPhase !== "path" || pathAnimationStep >= path.length) {
      if (pathAnimationStep >= path.length && animationPhase === "path") {
        setAnimationPhase("complete")
        setIsAnimating(false)
      }
      return
    }

    const timer = setTimeout(() => {
      // Skip the start point
      if (pathAnimationStep === 0) {
        setAnimatedPath([path[0]])
        setPathAnimationStep(1)
      } else {
        const newAnimatedPath = [...animatedPath, path[pathAnimationStep]]
        setAnimatedPath(newAnimatedPath)
        setPathAnimationStep(pathAnimationStep + 1)
      }
    }, 101 - animationSpeed)

    return () => clearTimeout(timer)
  }, [isAnimating, pathAnimationStep, path, animationSpeed, animatedPath, animationPhase])

  const getCellClass = (x: number, y: number) => {
    const baseClass = "border border-gray-200 "

    if (start && start.x === x && start.y === y) {
      return baseClass + "bg-green-500"
    }
    if (end && end.x === x && end.y === y) {
      return baseClass + "bg-red-500"
    }
    if (maze[x][y] === 1) {
      return baseClass + "bg-gray-800"
    }
    if (animatedPath.some((p) => p.x === x && p.y === y)) {
      return baseClass + "bg-blue-500"
    }
    if (visited[x][y]) {
      return baseClass + "bg-purple-300"
    }
    return baseClass + "bg-white"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Maze Builder</CardTitle>
          <CardDescription>
            <div className="flex flex-col space-y-1">
              <span>Click on cells to toggle walls, or set start/end points based on the selected edit mode</span>
              <div className="flex items-center text-sm text-muted-foreground">
                <MousePointerClick className="h-3 w-3 mr-1" /> Left click: Place single walls
                <MousePointer2 className="h-3 w-3 ml-3 mr-1" /> Right click + drag: Place multiple walls
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="grid border border-gray-300 rounded overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              width: "100%",
              aspectRatio: `${cols}/${rows}`,
            }}
            onContextMenu={handleContextMenu}
          >
            {maze.map((row, x) =>
              row.map((_, y) => (
                <div
                  key={`${x}-${y}`}
                  className={`${getCellClass(x, y)} cursor-pointer transition-colors duration-200 hover:opacity-80`}
                  onClick={(e) => handleCellClick(x, y, e)}
                  onMouseDown={(e) => handleMouseDown(x, y, e)}
                  onMouseEnter={() => handleMouseEnter(x, y)}
                  onMouseUp={handleMouseUp}
                />
              )),
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rows">Rows</Label>
                <Input
                  id="rows"
                  type="number"
                  min={2}
                  max={30}
                  value={rows}
                  onChange={(e) => setRows(Number.parseInt(e.target.value) || 10)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cols">Columns</Label>
                <Input
                  id="cols"
                  type="number"
                  min={2}
                  max={30}
                  value={cols}
                  onChange={(e) => setCols(Number.parseInt(e.target.value) || 10)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="complexity">Maze Complexity</Label>
                <span className="text-sm text-muted-foreground">{mazeComplexity}%</span>
              </div>
              <Slider
                id="complexity"
                value={[mazeComplexity]}
                min={10}
                max={90}
                step={5}
                onValueChange={(value) => setMazeComplexity(value[0])}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={generateSimpleRandomMaze} variant="outline" className="w-full" disabled={isAnimating}>
                <Shuffle className="h-4 w-4 mr-1" /> Random Maze
              </Button>
              <Button onClick={initializeMaze} variant="outline" className="w-full" disabled={isAnimating}>
                <RotateCcw className="h-4 w-4 mr-1" /> Clear Maze
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Edit Mode</Label>
              <RadioGroup value={editMode} onValueChange={setEditMode} className="flex space-x-2">
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="wall" id="wall" />
                  <Label htmlFor="wall" className="flex items-center">
                    <Edit3 className="h-4 w-4 mr-1" /> Wall
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="start" id="start" />
                  <Label htmlFor="start" className="flex items-center text-green-500">
                    <Navigation className="h-4 w-4 mr-1" /> Start
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="end" id="end" />
                  <Label htmlFor="end" className="flex items-center text-red-500">
                    <Navigation className="h-4 w-4 mr-1" /> End
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="algorithm">Algorithm</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bfs">Breadth-First Search (BFS)</SelectItem>
                  <SelectItem value="dfs">Depth-First Search (DFS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Algorithm Info</TabsTrigger>
              <TabsTrigger value="legend">Legend</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-2 text-sm">
              {algorithm === "bfs" ? (
                <>
                  <h3 className="font-medium">Breadth-First Search (BFS)</h3>
                  <p>
                    Explores all neighbor nodes at the present depth before moving to nodes at the next depth level.
                    Guarantees the shortest path in an unweighted graph.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-medium">Depth-First Search (DFS)</h3>
                  <p>
                    Explores as far as possible along each branch before backtracking. May not find the shortest path,
                    but can be more memory efficient.
                  </p>
                </>
              )}
            </TabsContent>
            <TabsContent value="legend" className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-white border border-gray-300 mr-2"></div>
                  <span>Open Space</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-800 mr-2"></div>
                  <span>Wall</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 mr-2"></div>
                  <span>Start Point</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 mr-2"></div>
                  <span>End Point</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-300 mr-2"></div>
                  <span>Visited Cell</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 mr-2"></div>
                  <span>Path</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <CardFooter className="flex justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <Button onClick={startAnimation} disabled={isAnimating || !start || !end} variant="default" size="sm">
              <Play className="h-4 w-4 mr-1" /> Start
            </Button>
            <Button onClick={pauseAnimation} disabled={!isAnimating} variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
            <Button onClick={resetAnimation} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Speed:</span>
            <div className="relative group">
              <Slider
                value={[animationSpeed]}
                min={1}
                max={100}
                step={1}
                className="w-24"
                onValueChange={(value) => setAnimationSpeed(value[0])}
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {animationSpeed}%
              </div>
            </div>
          </div>
        </CardFooter>
        </CardContent>
      </Card>
    </div>
  )
}

