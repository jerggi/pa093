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
}
