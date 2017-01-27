module.exports = class KDTree {
    static draw(canvas) {
        const tree = this.kDTree(canvas)

        canvas.redrawPoints()
        this.drawkDTree(tree, canvas)
    }

    static kDTree(canvas) {
        return this.kDTreeBuild(canvas.points, 0, { xLeft: 0, xRight: canvas.width, yDown: 0, yUp: canvas.height })
    }

    static kDTreeBuild(p, depth, area) {
        if (p.length === 0) {
            return null
        }
        if (p.length === 1) {
            return { x: p[0].x, y: p[0].y, depth, area }
        }
        else {
            if (depth % 2 === 0) {
                p.sort((p1, p2) => p1.x - p2.x)
            } else {
                p.sort((p1, p2) => p1.y - p2.y)
            }
            const index = Math.round(p.length / 2) - 1

            let lesserArea, greaterArea
            if (depth % 2 === 0) {
                lesserArea = { xLeft: area.xLeft, xRight: p[index].x, yDown: area.yDown, yUp: area.yUp }
                greaterArea = { xLeft: p[index].x, xRight: area.xRight, yDown: area.yDown, yUp: area.yUp }
            } else {
                lesserArea = { xLeft: area.xLeft, xRight: area.xRight, yDown: area.yDown, yUp: p[index].y }
                greaterArea = { xLeft: area.xLeft, xRight: area.xRight, yDown: p[index].y, yUp: area.yUp }
            }

            const lesser = this.kDTreeBuild(p.slice(0, index), depth + 1, lesserArea)
            const greater = this.kDTreeBuild(p.slice(index + 1, p.length), depth + 1, greaterArea)

            return { x: p[index].x, y: p[index].y, lesser, greater, parent: p[index], depth, area }
        }
    }

    static drawkDTree(node, canvas) {
        if (node.depth % 2 === 0) {
            //vertical line
            canvas.drawLine({ x1: node.x, y1: node.area.yDown, x2: node.x, y2: node.area.yUp })
        } else {
            // horizontal line
            canvas.drawLine({ x1: node.area.xLeft, y1: node.y, x2: node.area.xRight, y2: node.y })
        }
        if (node.lesser) this.drawkDTree(node.lesser, canvas)
        if (node.greater) this.drawkDTree(node.greater, canvas)
    }
}
