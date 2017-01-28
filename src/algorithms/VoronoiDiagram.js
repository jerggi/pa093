const DT = require('./DelaunayTriangulation')
const geometry = require('./../Geometry')

module.exports = class VoronoiDiagram {
    static draw(canvas) {
        const diagram = this.voronoiDiagram(canvas.points)

        canvas.redrawPoints()
        canvas.drawLines(diagram)
    }

    static voronoiDiagram(points) {
        if (points.length < 2) return []

        const dt = DT.delaunayTriangulation(points)

        const vd = []
        dt.forEach((e) => {
            const p1 = { x: e.x1, y: e.y1 }
            const p2 = { x: e.x2, y: e.y2 }
            if (e.trianglePoint1 && e.trianglePoint2) {
                const circleCenter1 = geometry.findCircleCenter(p1, p2, e.trianglePoint1)
                const circleCenter2 = geometry.findCircleCenter(p1, p2, e.trianglePoint2)
                vd.push({ x1: circleCenter1.x, y1: circleCenter1.y, x2: circleCenter2.x, y2: circleCenter2.y })
            } else {
                const circleCenter = e.trianglePoint1 ? geometry.findCircleCenter(p1, p2, e.trianglePoint1) : geometry.findCircleCenter(p1, p2, e.trianglePoint2)
                const borderPoint = this.calculateBorderPoint(e, circleCenter)
                vd.push({ x1: circleCenter.x, y1: circleCenter.y, x2: borderPoint.x, y2: borderPoint.y })
            }
        })

        return vd
    }

    static calculateBorderPoint(edge, circleCenter) {
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

        if (leftIntersection && leftIntersection.y >= 0 && leftIntersection.y <= canvas.height) {
            if (geometry.positionFromLine(edge, trianglePoint) * geometry.positionFromLine(edge, leftIntersection) <= 0) {
                return leftIntersection
            }
        }
        if (rightIntersection && rightIntersection.y >= 0 && rightIntersection.y <= canvas.height) {
            if (geometry.positionFromLine(edge, trianglePoint) * geometry.positionFromLine(edge, rightIntersection) <= 0) {
                return rightIntersection
            }
        }
        if (topIntersection && topIntersection.x >= 0 && topIntersection.x <= canvas.width) {
            if (geometry.positionFromLine(edge, trianglePoint) * geometry.positionFromLine(edge, topIntersection) <= 0) {
                return topIntersection
            }
        }
        if (downIntersection && downIntersection.x >= 0 && downIntersection.x <= canvas.width) {
            if (geometry.positionFromLine(edge, trianglePoint) * geometry.positionFromLine(edge, downIntersection) <= 0) {
                return downIntersection
            }
        }
    }
}
