const geometry = require('./../Geometry')

module.exports = class GrahamScan {
    static draw(canvas) {
        const convexCase = this.grahamScan(canvas.points)
        const lines = this.pointsToLines(convexCase)

        canvas.redrawPoints()
        canvas.drawLines(lines)
    }

    static pointsToLines(points) {
        var lines = []
        for (var i = 0; i < points.length - 1; i++) {
            lines.push({ x1: points[i].x, y1: points[i].y, x2: points[i + 1].x, y2: points[i + 1].y })
        }
        lines.push({ x1: points[points.length - 1].x, y1: points[points.length - 1].y, x2: points[0].x, y2: points[0].y })

        return lines
    }

    static grahamScan(points) {
        if (points.length < 2) return []

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
                pointSet.push({ x: point.x, y: point.y, angleXAxe: geometry.getAngle({ x: 1, y: 0 }, { x: point.x - pivot.x, y: point.y - pivot.y }) })
            }
        })

        pointSet.sort((p1, p2) => {
            const angleDifference = p1.angleXAxe - p2.angleXAxe
            //REFACTORING
            if (angleDifference === 0) {
                return geometry.distance(p2, pivot) - geometry.distance(p1, pivot)
            } else {
                return angleDifference
            }
        })

        var convexCase = [];

        while(true) {
            convexCase = [pivot, pointSet[0]]  
            var changed = false

            for (var i = 1; i < pointSet.length; i++) {
                // < 0 : pravotocive, > 0 : lavotocive, = 0 : na jednej priamke
                const ip = geometry.innerProduct(convexCase[convexCase.length - 2], convexCase[convexCase.length - 1], pointSet[i])
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

        return convexCase
    }
}
