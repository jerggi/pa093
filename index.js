const Canvas = require('./src/Canvas')
const GrahamScan = require('./src/algorithms/GrahamScan')
const GiftWrapping = require('./src/algorithms/GiftWrapping')
const Triangulation = require('./src/algorithms/Triangulation')
const KDTree = require('./src/algorithms/KDTree')
const DelaunayTriangulation = require('./src/algorithms/DelaunayTriangulation')
const VoronoiDiagram = require('./src/algorithms/VoronoiDiagram')

const canvas = new Canvas(document.getElementById("my-canvas"), document.getElementById('actionSelect'))
const algorithmSelect = document.getElementById('algorithmSelect')

function clearAll() {
    canvas.clearAll()
}

function drawAlgorithm() {
    if (algorithmSelect.selectedIndex === 0) {
        GiftWrapping.draw(canvas)
    } else if (algorithmSelect.selectedIndex === 1) {
        GrahamScan.draw(canvas)
    } else if (algorithmSelect.selectedIndex === 2) {
        Triangulation.draw(canvas)
    } else if (algorithmSelect.selectedIndex === 3) {
        KDTree.draw(canvas)
    } else if (algorithmSelect.selectedIndex === 4) {
        DelaunayTriangulation.draw(canvas)
    } else if (algorithmSelect.selectedIndex === 5) {
        VoronoiDiagram.draw(canvas)
    }
}

function generatePoints() {
    canvas.generatePoints()
}
