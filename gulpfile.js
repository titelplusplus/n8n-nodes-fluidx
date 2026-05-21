const { src, dest } = require('gulp');

/**
 * Copies SVG icons next to the compiled .js files in dist/.
 * n8n picks them up via `iconFile` references in the node descriptor.
 */
function buildIcons() {
  return src('nodes/**/*.{png,svg}').pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
