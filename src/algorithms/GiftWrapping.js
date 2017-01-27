const geometry = require('./../Geometry')

module.exports = class GiftWrapping {
    static draw(canvas) {
        const lines = this.giftWrapping(canvas.points)

        canvas.redrawPoints()
        canvas.drawLines(lines)
    }

    static giftWrapping(points) {
        if (points.length < 2) return []

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
                const currentAngle = geometry.getAngle(vector, { x: point.x - pivot.x, y: point.y - pivot.y })
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

        return convexCase
        /*redrawPoints()
        drawLines(convexCase)*/
    }
}
