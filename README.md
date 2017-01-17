# CCSM Builder

This is a static web generator for the *Creative Coding Strategies for
Musicians* online textbook. It was created because existing generators lacked
certain functionality that I was looking for. This generator has unique content
generation directives similar to [reStructuredText][rest] such as admonitions,
as well as static image generation using [D3][d3] at compile-time.

I am currently in the process of separating the textbook content from the
generator to have distinct versioning from each, as well as adding additional
features. You can see the intended features [here][todo]. Eventually this
generator could conceivably be used by others in creating other websites.

[rest]: http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html#directives
[d3]: https://d3js.org/
[todo]: TODO.md

## Directives

### Admonitions

Similar to [reStructuredText admonitions][admonitions], these are inline text
blocks that are visually distinct from the rest of the content. This can be used
to create things *"Warning"* and *"Spotlight"* messages.

```
{% admonition "warning", "This Is A Warning!" %}
For real though, this is a warning.
{% endadmonition %}
```

<img width="720" alt="admonition" src="https://cloud.githubusercontent.com/assets/7128551/22041498/b674b650-dccc-11e6-9810-e055dc98d38c.png">

[admonitions]: http://docutils.sourceforge.net/docs/ref/rst/directives.html#admonitions

### Code Tabs

The CCSM textbook is intended to be platform-agnostic, so each code example is
demonstrated in multiple languages. This directive will generate a tabbed
display where users can select their preferred language can compare the
implementation against other languages. Eventually, this directive will support
the pairing of static/rendered [Max][max] patches with a patch download.

```
{% codetabs "sc", "faust", "max" %}
play{ SinOsc.ar(440).dup\*0.1 }
{% lang %}
random = +(12345) ~ \*(1103515245); // overflowing mpy & offset
RANDMAX = 2147483647.0;
noise = random / RANDMAX;
{% lang %}
Max code here.
{% endcodetabs %}
```

<img width="692" alt="codetabs" src="https://cloud.githubusercontent.com/assets/7128551/22041515/cb87f35e-dccc-11e6-9fcb-271353b9f92a.png">

[max]: https://cycling74.com/products/max/

### Concept Demonstrations

This directive inserts an inline `<div>` element and pairs it with a `<script>`
tag that populates the prior element. The scripts automatically have [D3][d3]
pulled in as a dependency. This can be used to visually demonstrate theorems and
concepts mentioned in the book, as seen below:

```
{% conceptdemo "phasing.js" %}
{% endconceptdemo %}
```

<img width="470" alt="conceptdemo" src="https://cloud.githubusercontent.com/assets/7128551/22041696/68b585ce-dccd-11e6-832f-833f27c659d7.png">

### Statically Rendered SVGs

Similar to the concept demonstration directive, this will execute a fenced
Javascript code block that uses [D3][d3] to render a static SVG that is
embedded in the generated HTML. This enables authors to use the same workflow
as the prior directive while not slowing down page loads by generating SVGs
each time.

```
{% rendersvg "This is a caption. It's also a sphere.", "mySvg" %}
var svg = d3.select(window.document).select('svg');
svg.attr('height', 100).attr('width', 100);
svg.append('circle')
  .style('stroke', 'gray')
  .style('fill', 'rgb(241, 159, 77)')
  .attr('r', 40)
  .attr('cx', 50)
  .attr('cy', 50);
return d3.select(window.document).select('body').html();
{% endrendersvg %}
```

<img width="301" alt="staticsvg" src="https://cloud.githubusercontent.com/assets/7128551/22041803/f6cf6d0c-dccd-11e6-99a8-8a4318942ae0.png">
