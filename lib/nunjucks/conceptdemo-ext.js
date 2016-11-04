module.exports = function(nunjucks) {
  return function ConceptDemoExtension(_env) {
    this.tags = ['conceptdemo'];

    this.parse = function(parser, nodes, lexer) {
      var tok = parser.nextToken();
      var args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(tok.value);

      var body = parser.parseUntilBlocks('endconceptdemo');
      parser.advanceAfterBlockEnd();

      return new nodes.CallExtension(this, 'run', args, [body]);
    };

    this.run = function(context, path, body) {
      var ret = null;
      try {
        var regex = /(\w+).js/;
        var id = regex.exec(path)[1];
        ret = new nunjucks.runtime.SafeString('<div class="conceptdemo" id="'+id+'"></div>'+ 
          '<script src="'+path+'"></script>');
      } catch(err) {
        console.error("ConceptDemo - File path does not point to a JS file.");
      }
      return ret;
    };
  }
}
