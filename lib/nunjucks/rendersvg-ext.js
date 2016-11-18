"use strict";

var d3 = require('d3');
var jsdom = require('jsdom');

module.exports = function(nunjucks) {

  return function RenderSvgExtension(_env) {
    this.tags = ['rendersvg'];

    this.parse = function(parser, nodes, lexer) {
      let tok = parser.nextToken();
      let args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);

      let body = parser.parseUntilBlocks('endrendersvg');
      parser.advanceAfterBlockEnd();

      return new nodes.CallExtensionAsync(this, 'run', args, [body]);
    };

    this.run = function(context, caption, id, body, callback) {

      const script = '(() => { "use strict";' + body() + '})();';

      jsdom.env('<html><body><svg></svg></body></html>', (error, window) => {
        if (error) callback(error, null);

        let svg = new nunjucks.runtime.SafeString(
          '<div class="diagram" id="'+id+'">'+
            eval(script) +
            '<p class="diagram-caption">'+caption+'</p>'+
          '</div>'
        );

        callback(null, svg);
      });

    };
  }
}
