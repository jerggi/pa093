const GrahamScan = require('./GrahamScan')

module.exports = class Triangulation {
    static draw(canvas) {
        const lines = this.triangulation(canvas.points)

        canvas.redrawPoints()
        canvas.drawLines(lines)
    }

    static triangulation(points) {
        if (points.length < 2) return []

        const convexCase = GrahamScan.grahamScan(points)
        const lines = GrahamScan.pointsToLines(convexCase)

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

        let stack = [convexCase[0], convexCase[1]]
        for (let i = 2; i < convexCase.length; i++) {
            if (convexCase[i].path === stack[stack.length - 1].path) {
                for (let j = 0; j < stack.length - 1; j++) {
                    lines.push({ x1: stack[j].x, y1: stack[j].y, x2: convexCase[i].x, y2: convexCase[i].y })
                }
                stack = [stack[0], convexCase[i]]
            } else {
                for (let j = 0; j < stack.length; j++) {
                    lines.push({ x1: stack[j].x, y1: stack[j].y, x2: convexCase[i].x, y2: convexCase[i].y })
                }
                stack = [stack[stack.length - 1], convexCase[i]]
            }
        }

        return lines
    }
}
