module.exports = class Canvas {
    constructor(canvas, actionSelect) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")
        this.points = []
        this.movePoint = null
        this.generatedPoints = 5
        this.actionSelect = actionSelect

        this.canvas.addEventListener('mousedown', (event) => {
            event.preventDefault()
            let point = this.getPointOnCanvas(event)

            if (this.actionSelect.selectedIndex === 0) {
                this.points.push(point);
                this.drawPoint(point.x, point.y)
            } else if (this.actionSelect.selectedIndex === 1) {
                this.movePoint = this.getExistingPoint(point.x, point.y)
            } else if (this.actionSelect.selectedIndex === 2) {
                this.removePoint(point.x, point.y)
            }
        }, false)

        this.canvas.addEventListener('mousemove', (event) => {
            event.preventDefault()

            if (this.movePoint) {
                const point = this.getPointOnCanvas(event)
                this.movePoint.x = point.x
                this.movePoint.y = point.y
                this.redrawPoints()
            }
        }, false)

        this.canvas.addEventListener('mouseup', (event) => {
            event.preventDefault()
            this.movePoint = null
        }, false)
    }

    onMouseDown(event) {
        event.preventDefault()
        const point = this.getPointOnCanvas(event)

        if (this.actionSelect.selectedIndex === 0) {
            points.push(point);
            this.drawPoint(point.x, point.y)
        } else if (this.actionSelect.selectedIndex === 1) {
            this.movePoint = this.getExistingPoint(point.x, point.y)
        } else if (this.actionSelect.selectedIndex === 2) {
            this.removePoint(point.x, point.y)
        }
    }

    onMouseMove(event) {
        event.preventDefault()

        if (this.movePoint) {
            const point = this.getPointOnCanvas(event)
            this.movePoint.x = point.x
            this.movePoint.y = point.y
            this.redrawPoints()
        }
    }

    drawLine(line) {
        this.ctx.beginPath();
        this.ctx.moveTo(line.x1, line.y1);
        this.ctx.lineTo(line.x2, line.y2);
        this.ctx.stroke()
    }

    drawLines(lines) {
        lines.forEach((line) => {
            this.drawLine(line)
        })
    }

    drawPoint(x, y) {
        this.ctx.beginPath()
        this.ctx.arc(x, y, size, 0, 2 * Math.PI, true)
        this.ctx.fill()
    }

    redrawPoints() {
        this.clearCanvas()
        this.points.forEach((point) => {
            this.drawPoint(point.x, point.y)
        })
    }

    clearCanvas() {
        this.ctx.fillStyle = '#FFF'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = '#000'
    }

    clearAll() {
        this.points = []
        this.clearCanvas()
    }

    getPointOnCanvas(event) {
        const x = event.pageX - this.canvas.offsetLeft
        const y = event.pageY - this.canvas.offsetTop
        return { x: x, y: y }
    }

    getExistingPoint(x, y) {
        let existingPoint = null;
        this.points.forEach((point, index) => {
            const dist = this.distance(x, y, point.x, point.y)
            if (dist <= size) {
                if (existingPoint) {
                    if (dist < this.distance(x, y, existingPoint.x, existingPoint.y)) {
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

    removePoint(x, y) {
        pointToRemove = getExistingPoint(x, y)
        if (pointToRemove) {
            points.splice(pointToRemove.index, 1)
            this.redrawPoints()
        }
    }

    generatePoints() {
        for (var i = 0; i < this.generatedPoints; i++) {
            let point = { x: Math.round(Math.random() * this.canvas.width), y: Math.round(Math.random() * this.canvas.height) }
            this.points.push(point);
            this.drawPoint(point.x, point.y)
        }
    }

    distance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
    }
}
