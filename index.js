var canvas = document.getElementById("my-canvas")
var ctx = canvas.getContext("2d")
var actionSelect = document.getElementById('actionSelect')
var algorithmSelect = document.getElementById('algorithmSelect')
var points = []

let drawing = true
let movePoint = null
let size = 5

function getPointOnCanvas(event) {
  const x = event.pageX - canvas.offsetLeft
  const y = event.pageY - canvas.offsetTop
  return {x: x, y: y}
}

function generatePoints() {
  for (var i = 0; i < 5; i++) {
    var point = {x: Math.round(Math.random() * canvas.width), y: Math.round(Math.random() * canvas.height)}
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
  }
}

canvas.addEventListener('mousedown', (event) => {
  event.preventDefault()
  var point = getPointOnCanvas(event)

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

function giftWrapping() {
  var pivot = points[0]
  points.forEach((point, index) => {
    if (pivot.y > point.y) {
      pivot = point
    }
  })

  
}
