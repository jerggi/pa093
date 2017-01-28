const Canvas = require('./src/Canvas')
const GrahamScan = require('./src/algorithms/GrahamScan')
const GiftWrapping = require('./src/algorithms/GiftWrapping')
const Triangulation = require('./src/algorithms/Triangulation')
const KDTree = require('./src/algorithms/KDTree')
const DelaunayTriangulation = require('./src/algorithms/DelaunayTriangulation')
const VoronoiDiagram = require('./src/algorithms/VoronoiDiagram')

const _ = require('lodash')
const canvas = new Canvas(document.getElementById("my-canvas"), document.getElementById('actionSelect'))
const actionSelect = document.getElementById('actionSelect')
const algorithmSelect = document.getElementById('algorithmSelect')

function clearAll() {
    canvas.clearAll()
}

function drawAlgorithm() {
    if (algorithmSelect.selectedIndex === 0) {
        GiftWrapping.draw(canvas)
    } else if (algorithmSelect.selectedIndex === 1) {
        GrahamScan.draw(canvas)
    } else if (algorithmSelect.selectedIndex === 2) {
        Triangulation.draw(canvas)
    } else if (algorithmSelect.selectedIndex === 3) {
        KDTree.draw(canvas)
    } else if (algorithmSelect.selectedIndex === 4) {
        DelaunayTriangulation.draw(canvas)
    } else if (algorithmSelect.selectedIndex === 5) {
      //lines = voronoiDiagram(points)
    }
}

function generatePoints() {
    canvas.generatePoints()
}

function voronoiDiagram(points) {
  if (points.length < 2) return []

  const dt = delaunayTriangulation()
  console.log(dt)

  const vd = []
  dt.forEach((e) => {
    const p1 = { x: e.x1, y: e.y1 }
    const p2 = { x: e.x2, y: e.y2 }
    if (e.trianglePoint1 && e.trianglePoint2) {
      const circleCenter1 = findCircleCenter(p1, p2, e.trianglePoint1)
      const circleCenter2 = findCircleCenter(p1, p2, e.trianglePoint2)
      vd.push({ x1: circleCenter1.x, y1: circleCenter1.y, x2: circleCenter2.x, y2: circleCenter2.y })
    } else {
      const circleCenter = e.trianglePoint1 ? findCircleCenter(p1, p2, e.trianglePoint1) : findCircleCenter(p1, p2, e.trianglePoint2)
      const borderPoint = calculateBorderPoint(e, circleCenter)
      vd.push({ x1: circleCenter.x, y1: circleCenter.y, x2: borderPoint.x, y2: borderPoint.y })
    }
  })

  return vd
}

function calculateBorderPoint(edge, circleCenter) {
  // a*x + b*y + c = 0
  const a = edge.x2 - edge.x1
  const b = edge.y2 - edge.y1
  const c = - a * circleCenter.x - b * circleCenter.y

  const trianglePoint = edge.trianglePoint1 ? edge.trianglePoint1 : edge.trianglePoint2

  let leftIntersection, rightIntersection, topIntersection, downIntersection

  if (b !== 0) {
    leftIntersection = { x: 0, y: -c / b }
    rightIntersection = { x: canvas.width, y: (-c - canvas.width * a) / b }
  }
  if (a !== 0) {
    topIntersection = { x: (-c - canvas.height * b) / a, y: canvas.height }
    downIntersection = { x: -c / a, y: 0 }
  }

  let inter
  if (leftIntersection && leftIntersection.y >= 0 && leftIntersection.y <= canvas.height) {
    if (positionFromLine(edge, trianglePoint) * positionFromLine(edge, leftIntersection) <= 0) {
      //return leftIntersection
      inter = leftIntersection
    }
  }
  if (rightIntersection && rightIntersection.y >= 0 && rightIntersection.y <= canvas.height) {
    if (positionFromLine(edge, trianglePoint) * positionFromLine(edge, rightIntersection) <= 0) {
      //return rightIntersection
      inter = rightIntersection
    }
  }
  if (topIntersection && topIntersection.x >= 0 && topIntersection.x <= canvas.width) {
    if (positionFromLine(edge, trianglePoint) * positionFromLine(edge, topIntersection) <= 0) {
      //return topIntersection
      inter = topIntersection
    }
  }
  if (downIntersection && downIntersection.x >= 0 && downIntersection.x <= canvas.width) {
    if (positionFromLine(edge, trianglePoint) * positionFromLine(edge, downIntersection) <= 0) {
      //return downIntersection
      inter = downIntersection
    }
  }

  return inter
}
