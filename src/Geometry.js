const math = require('mathjs')

module.exports = class Geometry {
    static distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x2) + (p1.y - p2.y) * (p1.y - p2.y))
    }

    static getAngle(p1, p2) {
        return Math.atan2(p1.x * p2.y - p1.y * p2.x, p1.x * p2.x + p1.y * p2.y)
    }

    static innerProduct(p1, p2, p3) {
        return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)
    }

    static findCircleCenter(p1, p2, p3) {
        const X1 = p2.x - p1.x
        const Y1 = p2.y - p1.y
        const X2 = p3.x - p1.x
        const Y2 = p3.y - p1.y

        const Z1 = X1 * X1 + Y1 * Y1
        const Z2 = X2 * X2 + Y2 * Y2
        const D = 2 * (X1 * Y2 - X2 * Y1)

        if (D === 0) return null // on one line

        const Xc = (Z1 * Y2 - Z2 * Y1) / D + p1.x
        const Yc = (X1 * Z2 - X2 * Z1) / D + p1.y
        return { x: Math.round(Xc), y: Math.round(Yc) }
    }

    static positionFromLine(line, point) {
        const array = [[(line.x2 - line.x1), (point.x - line.x1)], [(line.y2 - line.y1), (point.y - line.y1)]]
        const matrix = math.matrix(array)
        return math.det(matrix) // positive if left, negative if right, 0 if on line
    }
}
