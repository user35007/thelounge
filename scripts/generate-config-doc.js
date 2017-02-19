"use strict";

// Usage: `node generate-config-doc.js DOC_REPO_PATH`
//
// Example:
//
// ```sh
// node scripts/generate-config-doc.js ../thelounge.github.io/
// ```

const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(
	path.join(__dirname, "..", "defaults", "config.js"),
	"utf8"
);

const docPath = path.join(process.argv[2], "_includes", "config.js.md");

let extractedDoc = content
	.split("\n")
	.reduce((acc, line) => {
		line = line.trim();
		if (line.startsWith("// ")) {
			acc.push(line.substr(3));
		} else if (acc.length > 0 && acc[acc.length - 1] !== "") {
			acc.push("");
		}
		return acc;
	}, []).join("\n");

fs.writeFileSync(docPath, extractedDoc);
