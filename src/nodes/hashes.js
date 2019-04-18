const { concat, group, ifBreak, indent, join, line } = require("prettier").doc.builders;
const { skipAssignIndent } = require("../utils");

const pathDive = (path, steps) => {
  let node = path.getValue();

  steps.forEach(step => {
    node = node[step];
  });

  return node;
};

const makeLabel = (path, { preferHashLabels }, print, steps) => {
  const labelNode = pathDive(path, steps);
  const labelDoc = path.call.apply(path, [print].concat(steps));

  switch (labelNode.type) {
    case "@label":
      if (preferHashLabels) {
        return labelDoc;
      }
      return`:${labelDoc.slice(0, labelDoc.length - 1)} =>`;
    case "symbol_literal":
      if (preferHashLabels && labelNode.body.length === 1) {
        const symbolSteps = steps.concat("body", 0, "body", 0);
        return concat([path.call.apply(path, [print].concat(symbolSteps)), ":"]);
      }
      return concat([labelDoc, " =>"]);
    case "dyna_symbol":
      if (preferHashLabels) {
        return concat(labelDoc.parts.slice(1).concat(":"));
      }
      return concat([labelDoc, " =>"]);
    default:
      return concat([labelDoc, " =>"]);
  }
};

module.exports = {
  assoc_new: (path, opts, print) => {
    const valueDoc = path.call(print, "body", 1);
    const parts = [makeLabel(path, opts, print, ["body", 0])];

    if (skipAssignIndent(path.getValue().body[1])) {
      parts.push(" ", valueDoc);
    } else {
      parts.push(indent(concat([line, valueDoc])));
    }

    return group(concat(parts));
  },
  assoclist_from_args: (path, { addTrailingCommas }, print) => {
    const assocNodes = path.getValue().body[0];
    const assocDocs = [];

    assocNodes.forEach((assocNode, index) => {
      assocDocs.push(path.call(print, "body", 0, index));

      if (index !== assocNodes.length - 1) {
        assocDocs.push(concat([",", line]));
      } else if (addTrailingCommas) {
        assocDocs.push(ifBreak(",", ""));
      }
    });

    return group(concat(assocDocs));
  },
  bare_assoc_hash: (path, opts, print) => group(
    join(concat([",", line]), path.map(print, "body", 0))
  ),
  hash: (path, { addTrailingCommas }, print) => {
    if (path.getValue().body[0] === null) {
      return "{}";
    }

    return group(concat([
      "{",
      indent(concat([line, concat(path.map(print, "body"))])),
      concat([line, "}"])
    ]));
  }
};