module.exports = function(nunjucks) {
  return function RenderSvgExtension(_env) {
    this.tags = ['rendersvg'];

    this.parse = function(parser, nodes, lexer) {
      var tok = parser.nextToken();
      parser.advanceAfterBlockEnd(tok.value);

      var body = parser.parseUntilBlocks('endrendersvg');
      parser.advanceAfterBlockEnd();

      return new nodes.CallExtension(this, 'run', null, [body]);
    };

    this.run = function(context, body) {
      var ret = new nunjucks.runtime.SafeString('<div id="svg">'+body()+'</div>');
      return ret;
    };
  }
}
