const Canvas = require('./src/Canvas')
const GrahamScan = require('./src/algorithms/GrahamScan')
const GiftWrapping = require('./src/algorithms/GiftWrapping')
const Triangulation = require('./src/algorithms/Triangulation')
const KDTree = require('./src/algorithms/KDTree')

const math = require('mathjs')
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
    //lines = delaunayTriangulation(points)
  } else if (algorithmSelect.selectedIndex === 5) {
    //lines = voronoiDiagram(points)
  }
}

function generatePoints() {
  canvas.generatePoints()
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

  const ael = [{ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }]
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
  ael.push({ x1: p2.x, y1: p2.y, x2: point.x, y2: point.y, trianglePoint1: p1 })
  ael.push({ x1: point.x, y1: point.y, x2: p1.x, y2: p1.y, trianglePoint1: p2 })

  // while starts here
  while (ael.length > 0) {
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
      const e1 = { x1: e.x2, y1: e.y2, x2: point.x, y2: point.y }
      const e2 = { x1: point.x, y1: point.y, x2: e.x1, y2: e.y1 }

      e.trianglePoint2 = point
      e1.trianglePoint1 = { x: e.x1, y: e.y1 }
      e2.trianglePoint1 = { x: e.x2, y: e.y2 }

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
  return { x1: edge.x2, y1: edge.y2, x2: edge.x1, y2: edge.y1, trianglePoint1: edge.trianglePoint1, trianglePoint2: edge.trianglePoint2 }
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

  const Xc = (Z1 * Y2 - Z2 * Y1) / D + line.x1;
  const Yc = (X1 * Z2 - X2 * Z1) / D + line.y1;

  const c = findCircleCenter({ x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 }, point)

  if (c === null) return null

  const radius = Math.sqrt((line.x1 - c.x) * (line.x1 - c.x) + (line.y1 - c.y) * (line.y1 - c.y))
  const detS = positionFromLine(line, { x: Xc, y: Yc })

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
  const Xc = (Z1 * Y2 - Z2 * Y1) / D + p1.x;
  const Yc = (X1 * Z2 - X2 * Z1) / D + p1.y;
  return { x: Math.round(Xc), y: Math.round(Yc) }
}

function positionFromLine(line, point) {
  var array = [[(line.x2 - line.x1), (point.x - line.x1)], [(line.y2 - line.y1), (point.y - line.y1)]]
  var matrix = math.matrix(array)
  return math.det(matrix) // positive if left, negative if right
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

  /*redrawPoints()
  vd.forEach((line) => {
    drawLine(line)
  })*/

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
