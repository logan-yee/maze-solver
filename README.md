# Maze Solver: BFS/DFS Visualization

A visual web application that demonstrates the difference between Depth-First Search (DFS) and Breadth-First Search (BFS) algorithms in maze solving. This application allows users to create and edit mazes, then visualize how different pathfinding algorithms navigate through them.

## Features

- Interactive maze builder with tools to create walls and set start/end points
- Support for both Depth-First Search (DFS) and Breadth-First Search (BFS) algorithms
- Visual step-by-step animation of the pathfinding process
- Customizable maze dimensions and animation speed
- Random maze generation with adjustable complexity

## Installation

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/maze-solver.git
   cd maze-solver
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Application

### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run dev
# or
yarn dev
```

Then open your browser and navigate to [http://localhost:3000](http://localhost:3000).

### Production Build

To create a production build:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## Usage

### Creating Mazes

- Adjust rows and columns using the control panel
- Choose an edit mode (Wall, Start Point, End Point)
- Left-click to place/remove walls individually
- Right-click and drag to place multiple walls at once
- Use the "Generate Random Maze" button for quick creation

### Running Algorithms

1. Select an algorithm (BFS or DFS) from the dropdown menu
2. Adjust animation speed as needed
3. Click "Start" to begin the visualization
4. Use "Pause" and "Reset" buttons to control the animation

### Understanding the Visualization

- **Green Cell**: Start point
- **Red Cell**: End point
- **Black Cells**: Walls
- **Purple Cells**: Visited cells during algorithm execution
- **Blue Cells**: Final path from start to end

## Algorithm Information

### Breadth-First Search (BFS)
Explores all neighbor nodes at the present depth before moving to nodes at the next depth level.
Guarantees the shortest path in an unweighted graph.

### Depth-First Search (DFS)
Explores as far as possible along each branch before backtracking. May not find the shortest path,
but can be more memory efficient.

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components with Radix UI primitives

