var math = require('mathjs')
var _ = require('lodash')
var canvas = document.getElementById("my-canvas")
var ctx = canvas.getContext("2d")
var actionSelect = document.getElementById('actionSelect')
var algorithmSelect = document.getElementById('algorithmSelect')
var points = []

let drawing = true
let triangulationPolygon = false
let movePoint = null
let size = 3

function getPointOnCanvas(event) {
  const x = event.pageX - canvas.offsetLeft
  const y = event.pageY - canvas.offsetTop
  return { x: x, y: y }
}

function generatePoints() {
  for (var i = 0; i < 5; i++) {
    var point = { x: Math.round(Math.random() * canvas.width), y: Math.round(Math.random() * canvas.height) }
    points.push(point);
    drawPoint(point.x, point.y)
  }
}

function clearAll() {
  points = []
  clearCanvas()
}

function clearCanvas() {
  ctx.fillStyle = '#FFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#000'
}

function drawAlgorithm() {
  if (algorithmSelect.selectedIndex === 0) {
    giftWrapping()
  } else if (algorithmSelect.selectedIndex === 1) {
    grahamScan()
  } else if (algorithmSelect.selectedIndex === 2) {
    triangulation()
  } else if (algorithmSelect.selectedIndex === 3) {
    kDTree()
  } else if (algorithmSelect.selectedIndex === 4) {
    delaunayTriangulation()
  } else if (algorithmSelect.selectedIndex === 5) {
    voronoiDiagram()
  }
}

canvas.addEventListener('mousedown', (event) => {
  event.preventDefault()
  var point = getPointOnCanvas(event)

  //kreslenie speci konvexnej obalky
  /* if (algorithmSelect.selectedIndex === 2 && triangulationPolygon) {
    drawTriangulationPolygon(point.x, point.y)
    return
  }*/

  if (actionSelect.selectedIndex === 0) {
    points.push(point);
    drawPoint(point.x, point.y)
  } else if (actionSelect.selectedIndex === 1) {
    movePoint = getExistingPoint(point.x, point.y)
  } else {
    removePoint(point.x, point.y)
  }
}, false)

canvas.addEventListener('mousemove', (event) => {
  event.preventDefault()

  if (movePoint) {
    const point = getPointOnCanvas(event)
    movePoint.x = point.x
    movePoint.y = point.y
    redrawPoints()
  }
}, false)

canvas.addEventListener('mouseup', (event) => {
  event.preventDefault()
  movePoint = null
}, false)

// keby bol cas na speci polygon
document.addEventListener('keypress', (event) => {
  event.preventDefault()
  if (triangulationPolygon) {
    const line = { x1: points[points.length - 1].x, y1: points[points.length - 1].y, x2: points[0].x, y2: points[0].y }
    drawLine(line)
    triangulationPolygon = false
    document.getElementById('infoText').innerHTML = ""
  }
})

function drawTriangulationPolygon(x, y) {
  points.push({ x: x, y: y })
  drawPoint(x, y)
  if (points.length > 1) {
    const line = { x1: points[points.length - 2].x, y1: points[points.length - 2].y, x2: x, y2: y }
    drawLine(line)
  }
}

function removePoint(x, y) {
  pointToRemove = getExistingPoint(x, y)
  if (pointToRemove) {
    points.splice(pointToRemove.index, 1)
    redrawPoints()
  }
}

function drawPoint(x, y) {
  ctx.beginPath()
  ctx.arc(x, y, size, 0, 2 * Math.PI, true)
  ctx.fill()
}

function redrawPoints() {
  clearCanvas()
  points.forEach((point) => {
    drawPoint(point.x, point.y)
  })
}

function drawLines(lines) {
  lines.forEach((line) => {
    drawLine(line)
  })
}

function drawLine(line) {
  ctx.beginPath();
  ctx.moveTo(line.x1, line.y1);
  ctx.lineTo(line.x2, line.y2);
  ctx.stroke()
}

function getExistingPoint(x, y) {
  var existingPoint = null;
  points.forEach((point, index) => {
    const dist = distance(x, y, point.x, point.y)
    if (dist <= size) {
      if (existingPoint) {
        if (dist < distance(x, y, existingPoint.x, existingPoint.y)) {
          existingPoint = point
          existingPoint.index = index
        }
      } else {
        existingPoint = point
        existingPoint.index = index
      }
    }
  })

  return existingPoint
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}

function getAngle(p1, p2) {
  return Math.atan2(p1.x * p2.y - p1.y * p2.x, p1.x * p2.x + p1.y * p2.y)
}

function innerProduct(p1, p2, p3) {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)
}

function deepCopy(arr) {
  var newArr = []
  arr.forEach((el) => {
    newArr.push({ x: el.x, y: el.y })
  })
  return newArr
}

function pointsToLines(points) {
  var lines = []
  for (var i = 0; i < points.length - 1; i++) {
    lines.push({ x1: points[i].x, y1: points[i].y, x2: points[i + 1].x, y2: points[i + 1].y })
  }
  return lines
}

function giftWrapping() {
  if (points.length < 2) return

  var pivotIndex = 0
  var startIndex = 0
  points.forEach((point, index) => {
    if (points[pivotIndex].y > point.y) {
      pivotIndex = startIndex = index
    }
  })
  var vector = { x: 1, y: 0 }
  var convexCase = []

  do {
    var angle = 2 * Math.PI
    var nextIndex = 0
    const pivot = points[pivotIndex]
    //find point with smallest angle
    points.forEach((point, index) => {
      if (index !== pivotIndex) {
        const currentAngle = getAngle(vector, { x: point.x - pivot.x, y: point.y - pivot.y })
        if (currentAngle < angle) {
          angle = currentAngle
          nextIndex = index
        }
      }
    })

    const nextPivot = points[nextIndex]
    vector = { x: nextPivot.x - pivot.x, y: nextPivot.y - pivot.y }
    convexCase.push({ x1: pivot.x, y1: pivot.y, x2: nextPivot.x, y2: nextPivot.y })
    pivotIndex = nextIndex
  } while (pivotIndex !== startIndex)
  redrawPoints()
  drawLines(convexCase)
}

function grahamScan() {
  if (points.length < 2) return

  var pivotIndex = 0
  var pointSet = []
  points.forEach((point, index) => {
    if (points[pivotIndex].y >= point.y) {
      if (points[pivotIndex].y == point.y) {
        if (points[pivotIndex].x > point.x) {
          pivotIndex = index
        }
      } else {
        pivotIndex = index
      }
    }
  })

  const pivot = points[pivotIndex]
  points.forEach((point, index) => {
    if (pivotIndex !== index) {
      pointSet.push({ x: point.x, y: point.y, angleXAxe: getAngle({ x: 1, y: 0 }, { x: point.x - pivot.x, y: point.y - pivot.y }) })
    }
  })

  pointSet.sort((p1, p2) => {
    const angleDifference = p1.angleXAxe - p2.angleXAxe
    //REFACTORING
    if (angleDifference === 0) {
      return distance(p2.x, p2.y, pivot.x, pivot.y) - distance(p1.x, p1.y, pivot.x, pivot.y)
    } else {
      return angleDifference
    }
  })

  var convexCase = [];

  while(true) {
    convexCase = [pivot, pointSet[0]]  
    var changed = false;

    for (var i = 1; i < pointSet.length; i++) {
      // < 0 : pravotocive, > 0 : lavotocive, = 0 : na jednej priamke
      const ip = innerProduct(convexCase[convexCase.length - 2], convexCase[convexCase.length - 1], pointSet[i])
      if (ip > 0) {
        convexCase.push(pointSet[i])
      } else {
        convexCase[convexCase.length - 1] = pointSet[i]
        changed = true
      }
    }

    if (!changed) break;
    convexCase.splice(0, 1);
    pointSet = convexCase
  }

  convexCase.push(pivot)
  redrawPoints()
  drawLines(pointsToLines(convexCase))

  return convexCase;
}

function delaunayTriangulation() {
  if (points.length < 3) return

  var p1 = points[0];
  var p2 = points[1];
  let dist = distance(p1.x, p1.y, p2.x, p2.y)
  
  for (let i = 2; i < points.length; i++) {
    const currDist = distance(p2.x, p2.y, points[i].x, points[i].y)
    if (dist > currDist) {
      p2 = points[i]
      dist = currDist
    }
  }
  
  const ael = [{x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y}]
  const dt = []
  let point = null

  dist = Number.MAX_VALUE
  for (let i = 1; i < points.length; i++) {
    // is on the left side

    if (positionFromLine(ael[0], points[i]) > 0) {
      const currDist = delaunayDistance(ael[0], points[i])
      if (currDist !== null && currDist < dist) {
        point = points[i]
        dist = currDist
      }
    }
  }
  
  if (point === null) {
    ael[0] = edgeSwap(ael[0])

    someP = p1
    p1 = p2
    p2 = someP

    for (let i = 1; i < points.length; i++) {
      // is on the left side
      if (positionFromLine(ael[0], points[i]) > 0) {
        const currDist = delaunayDistance(ael[0], points[i])
        if (currDist !== null && currDist < dist) {
          point = points[i]
          dist = currDist
        }
      }
    }

  }

  ael.push({x1: p2.x, y1: p2.y, x2: point.x, y2: point.y})
  ael.push({x1: point.x, y1: point.y, x2: p1.x, y2: p1.y})

  // while starts here
  while(ael.length > 0) {
    let e = ael[0]
    e = edgeSwap(e)

    dist = Number.MAX_VALUE
    point = null
    for (let i = 0; i < points.length; i++) {
      // is on the left side
      if (positionFromLine(e, points[i]) > 0) {

        const currDist = delaunayDistance(e, points[i])
        if (currDist !== null && currDist < dist) {
          point = points[i]
          dist = currDist
        }
      }
    }

    if (point) {
      addToAel({x1: e.x2, y1: e.y2, x2: point.x, y2: point.y}, ael, dt)
      addToAel({x1: point.x, y1: point.y, x2: e.x1, y2: e.y1}, ael, dt)
    }

    dt.push(e)
    ael.shift()
  }

  redrawPoints()
  dt.forEach((line) => {
    drawLine(line)
  })

  return dt
}

function addToAel(e, ael, dt) {
    //finding opposite oriented edge
    let index = _.findIndex(ael, (edge) => {
      return e.x1 === edge.x2 && e.y1 === edge.y2 && e.x2 === edge.x1 && e.y2 === edge.y1
    })

    if (index === -1) {
      index = _.findIndex(ael, (edge) => {
        return e.x1 === edge.x1 && e.y1 === edge.y1 && e.x2 === edge.x2 && e.y2 === edge.y2
      })
    }

    if (index === -1) {
      index = _.findIndex(dt, (edge) => {
        return e.x1 === edge.x1 && e.y1 === edge.y1 && e.x2 === edge.x2 && e.y2 === edge.y2
      })
    }

    if (index === -1) {
      index = _.findIndex(dt, (edge) => {
        return e.x1 === edge.x2 && e.y1 === edge.y2 && e.x2 === edge.x1 && e.y2 === edge.y1
      })
    }
    
    if (index === -1) {
      //not found - push e to ael
      ael.push(e)
    }
}

// bad
function delaunayClosestPoint(point, line) {
  let dist = Number.MAX_VALUE
  let closestPoint = null
  _.forEach(points, (p) => {
    if (!(p.x === point.x && p.y === point.y)) {
      // is on the left side
      if (positionFromLine(line, points[i]) > 0) {
        const currDist = delaunayDistance(line, points[i])
        if (currDist !== null && currDist < dist) {
          closestPoint = points[i]
          dist = currDist
        }
      }
    }
  })

  return closestPoint
}

function edgeSwap(edge) {
  // [edge.x1, edge.x2, edge.y1, edge.y2] = [edge.x2, edge.x1, edge.y2, edge.y1]
  return {x1: edge.x2, y1: edge.y2, x2: edge.x1, y2: edge.y1}
}

function edgeCompare(e1, e2, bothSides) {
  return e1.x1 === e2.x1 && e1.y1 === e2.y1 && e1.x2 === e2.x2 && e1.y2 === e2.y2
}

function delaunayDistance(line, point) {
  // mozno netrebaaa
  if ((line.x1 === point.x && line.y1 === point.y) || (line.x2 === point.x && line.y2 === point.y)) return null

  const X1 = line.x2 - line.x1; 
  const Y1 = line.y2 - line.y1;
  const X2 = point.x - line.x1;
  const Y2 = point.y - line.y1;

  const Z1 = X1 * X1 + Y1 * Y1;
  const Z2 = X2 * X2 + Y2 * Y2;
  const D = 2 * (X1 * Y2 - X2 * Y1);
  if (D === 0) return null // on one line

  const Xc= (Z1 * Y2 - Z2 * Y1) / D + line.x1;
  const Yc= (X1 * Z2 - X2 * Z1) / D + line.y1;
  const radius = Math.sqrt((line.x1 - Xc)*(line.x1 - Xc) + (line.y1 - Yc)*(line.y1 - Yc))
  const detS = positionFromLine(line, {x: Xc, y: Yc})

  if (detS >= 0) {
    return radius
  } else {
    return -radius
  }
}

function positionFromLine(line, point) {
  var array = [[(line.x2 - line.x1), (point.x - line.x1)],  [(line.y2 - line.y1), (point.y - line.y1)]]
  var matrix = math.matrix(array)
  return math.det(matrix) // positive if left, negative if right
}

function triangulation() {
  if (points.length < 2) return
  // keby nahodou bol cas na vytvorenie speci konvexnej obalky
  /* clearAll()
  document.getElementById('infoText').innerHTML = "Start drawing polygon, press 'Enter' to finish."
  triangulationPolygon = true*/
  const convexCase = grahamScan()

  points = convexCase;
  redrawPoints();
  drawLines(pointsToLines(convexCase))  

  convexCase.splice(-1, 1)  
  // rozdelenie na lavu a pravu cestu
  for (let i = 0; i < convexCase.length; i++) {
    if (convexCase[i + 1]) {
      if (convexCase[i].y <= convexCase[i + 1].y) {
        convexCase[i].path = 'right'
      } else {
        convexCase[i].path = 'right'
        for (let j = i + 1; j < convexCase.length; j++) {
          convexCase[j].path = 'left'
        }
        break
      }
    } else {
      convexCase[i].path = 'right'
    }
  }
  // lexikograficke usporiadanie od najvacsieho Y po najmensie
  convexCase.sort((p1, p2) => {
    if (p1.y === p2.y) return p1.x - p2.x
    else return p2.y - p1.y
  })
  console.log(convexCase)

  const lines = [];
  let stack = [convexCase[0], convexCase[1]]
  for (let i = 2; i < convexCase.length; i++) {
    if (convexCase[i].path === stack[stack.length - 1].path) {
      for (let j = 0; j < stack.length - 1; j++) {
        lines.push({x1: stack[j].x, y1: stack[j].y, x2: convexCase[i].x, y2 :convexCase[i].y})
      }
      stack = [stack[0], convexCase[i]];
    } else {
      for (let j = 0; j < stack.length; j++) {
        lines.push({x1: stack[j].x, y1: stack[j].y, x2: convexCase[i].x, y2 :convexCase[i].y})
      }
      stack = [stack[stack.length - 1], convexCase[i]];
    }
  }
  
  drawLines(lines);
}

function kDTree() {
  const tree = kDTreeBuild(points, 0, {xLeft: 0, xRight: canvas.width, yDown: 0, yUp: canvas.height})
  redrawPoints()
  drawkDTree(tree)
}

function kDTreeBuild(p, depth, area) {
  if (p.length === 0) {
    return null
  }
  if (p.length === 1) {
    return {x: p[0].x, y: p[0].y, depth, area}
  }
  else {
    if (depth % 2 === 0) {
      p.sort((p1, p2) => p1.x - p2.x)
    } else {
      p.sort((p1, p2) => p1.y - p2.y)
    }
    const index = Math.round(p.length / 2) - 1

    let lesserArea, greaterArea
    if (depth % 2 === 0) {
      lesserArea = {xLeft: area.xLeft, xRight: p[index].x, yDown: area.yDown, yUp: area.yUp}
      greaterArea = {xLeft: p[index].x, xRight: area.xRight, yDown: area.yDown, yUp: area.yUp}
    } else {
      lesserArea = {xLeft: area.xLeft, xRight: area.xRight, yDown: area.yDown, yUp: p[index].y}
      greaterArea = {xLeft: area.xLeft, xRight: area.xRight, yDown: p[index].y, yUp: area.yUp}
    }

    const lesser = kDTreeBuild(p.slice(0, index), depth + 1, lesserArea)
    const greater = kDTreeBuild(p.slice(index + 1, p.length), depth + 1, greaterArea)

    return {x: p[index].x, y: p[index].y, lesser, greater, parent: p[index], depth, area}
  }
}

function drawkDTree(node) {
  if (node.depth % 2 === 0) {
    //vertical line
    drawLine({x1: node.x, y1: node.area.yDown, x2:node.x , y2: node.area.yUp})
  } else {
    // horizontal line
    drawLine({x1: node.area.xLeft, y1: node.y, x2: node.area.xRight, y2: node.y})
  }
  if (node.lesser) drawkDTree(node.lesser)
  if (node.greater) drawkDTree(node.greater)
}

function voronoiDiagram() {
  const dt = delaunayTriangulation()

  while (dt.length > 0) {
    const edge = dt.pop()

  }
}

function findTrianglePoints(edge, dt) {
  for (let i = 0; i < edge.length; i++) {
    
  }
}
