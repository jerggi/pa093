const geometry = require('./../Geometry')
const _ = require('lodash')

module.exports = class DelaunayTriangulation {
    static draw(canvas) {
        const triangulation = this.delaunayTriangulation(canvas.points)

        canvas.redrawPoints()
        canvas.drawLines(triangulation)
    }

    static delaunayTriangulation(points) {
        if (points.length < 3) return []

        var p1 = points[0]
        var p2 = points[1]
        let dist = geometry.distance(p1, p2)

        for (let i = 2; i < points.length; i++) {
            const currDist = geometry.distance(p2, points[i])
            if (dist > currDist) {
                p2 = points[i]
                dist = currDist
            }
        }

        const ael = [{ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }]
        const dt = []
        let point = this.findDelaunayClosestPoint(ael[0], points)

        if (point === null) {
            ael[0] = this.edgeSwap(ael[0])

            let someP = p1
            p1 = p2
            p2 = someP

            point = this.findDelaunayClosestPoint(ael[0], points)
        }

        ael[0].trianglePoint1 = point
        ael.push({ x1: p2.x, y1: p2.y, x2: point.x, y2: point.y, trianglePoint1: p1 })
        ael.push({ x1: point.x, y1: point.y, x2: p1.x, y2: p1.y, trianglePoint1: p2 })

        while (ael.length > 0) {
            let e = ael[0]
            e = this.edgeSwap(e)
            point = this.findDelaunayClosestPoint(e, points)

            if (point) {
                const e1 = { x1: e.x2, y1: e.y2, x2: point.x, y2: point.y }
                const e2 = { x1: point.x, y1: point.y, x2: e.x1, y2: e.y1 }

                e.trianglePoint2 = point
                e1.trianglePoint1 = { x: e.x1, y: e.y1 }
                e2.trianglePoint1 = { x: e.x2, y: e.y2 }

                this.addToAel(e1, ael, dt)
                this.addToAel(e2, ael, dt)
            }

            dt.push(e)
            ael.shift()
        }

        return dt
    }

    static findDelaunayClosestPoint(edge, points) {
        let dist = Number.MAX_VALUE
        let point = null

        for (let i = 0; i < points.length; i++) {
            // is on the left side
            if (geometry.positionFromLine(edge, points[i]) > 0) {

                const currDist = this.delaunayDistance(edge, points[i])
                if (currDist !== null && currDist < dist) {
                    point = points[i]
                    dist = currDist
                }
            }
        }

        return point
    }

    static addToAel(e, ael, dt) {
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

    static edgeSwap(edge) {
        return { x1: edge.x2, y1: edge.y2, x2: edge.x1, y2: edge.y1, trianglePoint1: edge.trianglePoint1, trianglePoint2: edge.trianglePoint2 }
    }

    static delaunayDistance(line, point) {
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

        const c = geometry.findCircleCenter({ x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 }, point)

        if (c === null) return null

        const radius = Math.sqrt((line.x1 - c.x) * (line.x1 - c.x) + (line.y1 - c.y) * (line.y1 - c.y))
        const detS = geometry.positionFromLine(line, { x: Xc, y: Yc })

        if (detS >= 0) {
            return radius
        } else {
            return -radius
        }
    }
}
