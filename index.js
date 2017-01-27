const Canvas = require('./src/Canvas')
const GrahamScan = require('./src/algorithms/GrahamScan')
const GiftWrapping = require('./src/algorithms/GiftWrapping')
const Triangulation = require('./src/algorithms/Triangulation')

var math = require('mathjs')
var _ = require('lodash')
const canvas = new Canvas(document.getElementById("my-canvas"), document.getElementById('actionSelect'))
// const ctx = canvas.getContext()
var actionSelect = document.getElementById('actionSelect')
var algorithmSelect = document.getElementById('algorithmSelect')
//var points = []

let drawing = true
let triangulationPolygon = false
let movePoint = null
let size = 3

/*function getPointOnCanvas(event) {
  const x = event.pageX - canvas.offsetLeft
  const y = event.pageY - canvas.offsetTop
  return { x: x, y: y }
}*/

/*function generatePoints() {
  for (var i = 0; i < 5; i++) {
    var point = { x: Math.round(Math.random() * canvas.width), y: Math.round(Math.random() * canvas.height) }
    points.push(point);
    drawPoint(point.x, point.y)
  }
}*/

/*function clearCanvas() {
  ctx.fillStyle = '#FFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#000'
}*/

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
    //kDTree(points)
  } else if (algorithmSelect.selectedIndex === 4) {
    //lines = delaunayTriangulation(points)
  } else if (algorithmSelect.selectedIndex === 5) {
    //lines = voronoiDiagram(points)
  }
}

function deepCopy(arr) {
  var newArr = []
  arr.forEach((el) => {
    newArr.push({ x: el.x, y: el.y })
  })
  return newArr
}

function delaunayTriangulation(points) {
  if (points.length < 3) return []

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

  ael[0].trianglePoint1 = point
  ael.push({x1: p2.x, y1: p2.y, x2: point.x, y2: point.y, trianglePoint1: p1})
  ael.push({x1: point.x, y1: point.y, x2: p1.x, y2: p1.y, trianglePoint1: p2})

  // while starts here
  while(ael.length > 0) {
    let e = ael[0]
    // 


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
      const e1 = {x1: e.x2, y1: e.y2, x2: point.x, y2: point.y}
      const e2 = {x1: point.x, y1: point.y, x2: e.x1, y2: e.y1}

      e.trianglePoint2 = point
      e1.trianglePoint1 = {x: e.x1, y: e.y1}
      e2.trianglePoint1 = {x: e.x2, y: e.y2}

      addToAel(e1, ael, dt)
      addToAel(e2, ael, dt)
    }

    dt.push(e)
    ael.shift()
  }

  return dt
}

function addToAel(e, ael, dt) {
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

function edgeSwap(edge) {
  return {x1: edge.x2, y1: edge.y2, x2: edge.x1, y2: edge.y1, trianglePoint1: edge.trianglePoint1, trianglePoint2: edge.trianglePoint2}
}

function delaunayDistance(line, point) {
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

  const c = findCircleCenter({x: line.x1, y: line.y1}, {x: line.x2, y: line.y2}, point)

  if (c === null) return null

  const radius = Math.sqrt((line.x1 - c.x)*(line.x1 - c.x) + (line.y1 - c.y)*(line.y1 - c.y))
  const detS = positionFromLine(line, {x: Xc, y: Yc})

  if (detS >= 0) {
    return radius
  } else {
    return -radius
  }
}

function findCircleCenter(p1, p2, p3) {
  const X1 = p2.x - p1.x;
  const Y1 = p2.y - p1.y;
  const X2 = p3.x - p1.x;
  const Y2 = p3.y - p1.y;

  const Z1 = X1 * X1 + Y1 * Y1;
  const Z2 = X2 * X2 + Y2 * Y2;
  const D = 2 * (X1 * Y2 - X2 * Y1);

  if (D === 0) return null // on one line
  const Xc= (Z1 * Y2 - Z2 * Y1) / D + p1.x;
  const Yc= (X1 * Z2 - X2 * Z1) / D + p1.y;
  return {x: Math.round(Xc), y: Math.round(Yc)}
}

function positionFromLine(line, point) {
  var array = [[(line.x2 - line.x1), (point.x - line.x1)],  [(line.y2 - line.y1), (point.y - line.y1)]]
  var matrix = math.matrix(array)
  return math.det(matrix) // positive if left, negative if right
}

function kDTree(points) {
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
    canvas.drawLine({x1: node.x, y1: node.area.yDown, x2:node.x , y2: node.area.yUp})
  } else {
    // horizontal line
    canvas.drawLine({x1: node.area.xLeft, y1: node.y, x2: node.area.xRight, y2: node.y})
  }
  if (node.lesser) drawkDTree(node.lesser)
  if (node.greater) drawkDTree(node.greater)
}

function voronoiDiagram(points) {
  if (points.length < 2) return []

  const dt = delaunayTriangulation()
  console.log(dt)

  const vd = []
  dt.forEach((e) => {
    const p1 = {x: e.x1, y: e.y1}
    const p2 = {x: e.x2, y: e.y2}
    if (e.trianglePoint1 && e.trianglePoint2) {
      const circleCenter1 = findCircleCenter(p1, p2, e.trianglePoint1)
      const circleCenter2 = findCircleCenter(p1, p2, e.trianglePoint2)
      vd.push({x1: circleCenter1.x, y1: circleCenter1.y, x2: circleCenter2.x, y2: circleCenter2.y})
    } else {
      const circleCenter = e.trianglePoint1 ? findCircleCenter(p1, p2, e.trianglePoint1) : findCircleCenter(p1, p2, e.trianglePoint2)
      const borderPoint = calculateBorderPoint2(e, circleCenter)
      vd.push({x1: circleCenter.x, y1: circleCenter.y, x2: borderPoint.x, y2: borderPoint.y})
    }
  })

  /*redrawPoints()
  vd.forEach((line) => {
    drawLine(line)
  })*/

  return vd
}

function calculateBorderPoint(edge, p1) {  
  const p2x = (edge.x1 < edge.x2 ? edge.x1 : edge.x2) + Math.abs(edge.x1 - edge.x2) / 2
  const p2y = (edge.y1 < edge.y2 ? edge.y1 : edge.y2) + Math.abs(edge.y1 - edge.y2) / 2
  const p2 = {x: p2x, y: p2y}

  const pBoard = {}

  
  if (p1.x === p2.x) {
    pBoard.x = p1.x
    pBoard.y = p1.y < p2.y ? canvas.height : 0
    return pBoard
  }

  if (p1.y === p2.y) {
    pBoard.x = p1.x < p2.x ? canvas.width : 0
    pBoard.y = p1.y
    return pBoard
  }

  const xyRatio = Math.abs(p1.x - p2.x) / Math.abs(p1.y - p2.y)

  const dX = p1.x < p2.x ? canvas.width - p1.x : p1.x
  const dY = p1.y < p2.y ? canvas.height - p1.y : p1.y
  const wX = xyRatio * dY
  const wY = dX / xyRatio
  const xBoard = p1.x < p2.x ? p1.x + wX : p1.x - wX
  const yBoard = p1.y < p2.y ? p1.y + wY : p1.y - wY
  pBoard.x = Math.round(xBoard < 0 ? 0 : (xBoard > canvas.width ? canvas.width : xBoard))
  pBoard.y = Math.round(yBoard < 0 ? 0 : (yBoard > canvas.height ? canvas.height : yBoard))

  return pBoard
}

function test6(a, b, c, x, y) {
  if(a*x + b*y + c === 0) console.log('ok')
  else console.log('FAIL')
}

function calculateBorderPoint2(edge, circleCenter) {
  // a*x + b*y + c = 0
  const a = edge.x2 - edge.x1
  const b = edge.y2 - edge.y1
  const c = - a * circleCenter.x - b * circleCenter.y




  const trianglePoint = edge.trianglePoint1 ? edge.trianglePoint1 : edge.trianglePoint2

  let leftIntersection, rightIntersection, topIntersection, downIntersection

  if (b !== 0) {
    leftIntersection = {x: 0, y: -c/b}
    rightIntersection = {x: canvas.width, y: (-c - canvas.width * a) / b}
  }
  if (a !== 0) {
    topIntersection = {x: (-c - canvas.height * b) / a, y: canvas.height}
    downIntersection = {x: -c/a, y: 0}
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
