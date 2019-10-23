"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const paths_1 = require("../../utils/paths");
const INVALID_OFFSET = 0;
const INVALID_RANGE = vscode_languageserver_types_1.Range.create(0, 0, 0, 0);
/**
 * Walk through the validSourceFile, for each Node, find its corresponding Node in syntheticSourceFile.
 *
 * Generate a SourceMap with Nodes looking like this:
 *
 * SourceMapNode {
 *   from: {
 *     start: 0,
 *     end: 8
 *     filename: 'foo.vue'
 *   },
 *   to: {
 *     start: 0,
 *     end: 18
 *     filename: 'foo.vue.template'
 *   },
 *   offsetMapping: {
 *     0: 5,
 *     1: 6,
 *     2, 7
 *   },
 * }
 */
function generateSourceMap(tsModule, syntheticSourceFile, validSourceFile) {
    const walkASTTree = getAstWalker(tsModule);
    const sourceMapNodes = [];
    walkBothNode(syntheticSourceFile, validSourceFile);
    return sourceMapNodes;
    function walkBothNode(syntheticNode, validNode) {
        const validNodeChildren = [];
        tsModule.forEachChild(validNode, c => {
            validNodeChildren.push(c);
            return false;
        });
        const syntheticNodeChildren = [];
        tsModule.forEachChild(syntheticNode, c => {
            syntheticNodeChildren.push(c);
            return false;
        });
        if (validNodeChildren.length !== syntheticNodeChildren.length) {
            return;
        }
        validNodeChildren.forEach((vc, i) => {
            const sc = syntheticNodeChildren[i];
            const scSourceRange = tsModule.getSourceMapRange(sc);
            /**
             * `getSourceMapRange` falls back to return actual Node if sourceMap doesn't exist
             * This check ensure we are checking the actual `sourceMapRange` being set
             */
            if (!scSourceRange.kind && scSourceRange.pos !== -1 && scSourceRange.end !== -1) {
                const sourceMapNode = {
                    from: {
                        start: scSourceRange.pos,
                        end: scSourceRange.end,
                        fileName: syntheticSourceFile.fileName
                    },
                    to: {
                        start: vc.getStart(),
                        end: vc.getEnd(),
                        fileName: validSourceFile.fileName
                    },
                    offsetMapping: {},
                    offsetBackMapping: {}
                };
                const thisDotRanges = [];
                walkASTTree(vc, n => {
                    if (tsModule.isPropertyAccessExpression(n.parent) && n.kind === tsModule.SyntaxKind.ThisKeyword) {
                        thisDotRanges.push({
                            start: n.getStart(),
                            end: n.getEnd() + `.`.length
                        });
                    }
                });
                updateOffsetMapping(sourceMapNode, thisDotRanges);
                sourceMapNodes.push(sourceMapNode);
            }
            walkBothNode(sc, vc);
        });
    }
}
exports.generateSourceMap = generateSourceMap;
function getAstWalker(tsModule) {
    return function walkASTTree(node, f) {
        f(node);
        tsModule.forEachChild(node, c => {
            walkASTTree(c, f);
            return false;
        });
    };
}
exports.getAstWalker = getAstWalker;
/**
 * Map a range from actual `.vue` file to `.vue.template` file
 */
function mapFromPositionToOffset(document, position, sourceMap) {
    const offset = document.offsetAt(position);
    return mapFromOffsetToOffset(document, offset, sourceMap);
}
exports.mapFromPositionToOffset = mapFromPositionToOffset;
/**
 * Map an offset from actual `.vue` file to `.vue.template` file
 */
function mapFromOffsetToOffset(document, offset, sourceMap) {
    const filePath = paths_1.getFileFsPath(document.uri);
    if (!sourceMap[filePath]) {
        return INVALID_OFFSET;
    }
    for (const sourceMapNode of sourceMap[filePath]) {
        if (offset >= sourceMapNode.from.start && offset <= sourceMapNode.from.end) {
            return sourceMapNode.offsetMapping[offset];
        }
    }
    // Handle the case when no original range can be mapped
    return INVALID_OFFSET;
}
/**
 * Map a range from actual `.vue` file to `.vue.template` file
 */
function mapToRange(toDocument, from, sourceMap) {
    const filePath = paths_1.getFileFsPath(toDocument.uri);
    if (!sourceMap[filePath]) {
        return INVALID_RANGE;
    }
    for (const sourceMapNode of sourceMap[filePath]) {
        if (from.start >= sourceMapNode.from.start && from.start + from.length <= sourceMapNode.from.end) {
            const mappedStart = sourceMapNode.offsetMapping[from.start];
            const mappedEnd = sourceMapNode.offsetMapping[from.start + from.length];
            return {
                start: toDocument.positionAt(mappedStart),
                end: toDocument.positionAt(mappedEnd)
            };
        }
    }
    // Handle the case when no original range can be mapped
    return INVALID_RANGE;
}
exports.mapToRange = mapToRange;
/**
 * Map a range from virtual `.vue.template` file back to original `.vue` file
 */
function mapBackRange(fromDocumnet, to, sourceMap) {
    const filePath = paths_1.getFileFsPath(fromDocumnet.uri);
    if (!sourceMap[filePath]) {
        return INVALID_RANGE;
    }
    for (const sourceMapNode of sourceMap[filePath]) {
        if (to.start >= sourceMapNode.to.start && to.start + to.length <= sourceMapNode.to.end) {
            const mappedStart = sourceMapNode.offsetBackMapping[to.start];
            const mappedEnd = sourceMapNode.offsetBackMapping[to.start + to.length];
            return {
                start: fromDocumnet.positionAt(mappedStart),
                end: fromDocumnet.positionAt(mappedEnd)
            };
        }
    }
    // Handle the case when no original range can be mapped
    return INVALID_RANGE;
}
exports.mapBackRange = mapBackRange;
function updateOffsetMapping(node, thisDotRanges) {
    const from = [...Array(node.from.end - node.from.start + 1).keys()];
    const to = [...Array(node.to.end - node.to.start + 1).keys()];
    thisDotRanges.forEach(tdr => {
        for (let i = tdr.start; i < tdr.end; i++) {
            to[i - node.to.start] = undefined;
        }
    });
    const toFiltered = to.filter(x => x !== undefined);
    from.forEach((offset, i) => {
        const from = offset + node.from.start;
        const to = toFiltered[i] + node.to.start;
        node.offsetMapping[from] = to;
        node.offsetBackMapping[to] = from;
    });
    /**
     * The case such as `foo` mapped to `this.foo`
     * Both `|this.foo` and `this.|foo` should map to `|foo`
     * Without this back mapping, mapping error from `this.bar` in `f(this.bar)` would fail
     */
    thisDotRanges.forEach(tdr => {
        node.offsetBackMapping[tdr.start] = node.offsetBackMapping[tdr.end];
    });
}
function printSourceMap(sourceMap, vueFileSrc, tsFileSrc) {
    for (const fileName in sourceMap) {
        console.log(`Sourcemap for ${fileName}`);
        sourceMap[fileName].forEach(node => {
            const sf = vueFileSrc.slice(node.from.start, node.from.end);
            const st = vueFileSrc.slice(node.to.start, node.to.end);
            console.log(`[${node.from.start}, ${node.from.end}, ${sf}] => [${node.to.start}, ${node.to.end}, ${st}]`);
        });
        // console.log(JSON.stringify(sourceMap[fileName].offsetMapping));
    }
}
exports.printSourceMap = printSourceMap;
function stringifySourceMapNodes(sourceMapNodes, vueFileSrc, tsFileSrc) {
    let result = '';
    sourceMapNodes.forEach(node => {
        const sf = vueFileSrc.slice(node.from.start, node.from.end);
        const st = tsFileSrc.slice(node.to.start, node.to.end);
        result += `[${node.from.start}, ${node.from.end}, ${sf}] => [${node.to.start}, ${node.to.end}, ${st}]\n`;
    });
    return result;
}
exports.stringifySourceMapNodes = stringifySourceMapNodes;
//# sourceMappingURL=sourceMap.js.map