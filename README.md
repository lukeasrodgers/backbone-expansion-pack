# Backbone Expansion Pack

Some extensions to Backbone base components.

Most of this code either is or has been running in various production
environments, but as presented here, it should be considered (mostly)
untested, unless otherwise indicated.

In its current incarnation, the code was developed for Backbone 0.9,
0.9.2, etc. At some point I'll be rewriting some of the views
(especially BaseView, ModelView) to take advantage of some of the newer
API that has been introduced as Backbone approaches 1.0 (e.g.
`listenTo`).

## Components

Docs in progress.

### BaseView

Provides methods for assigning child views and tearing them down when
you call `view.remove()`.

Requires a template, which is a string referencing a template on a
global JST object.


```
var ChildView = BaseView.extend({
  template: 'child_tpl'
});
var ParentView = BaseView.extend({
  template: 'parent_tpl',
  initialize: function() {
    this.child_view = new ChildView();
    BaseView.prototype.initialize.call(this);
  },
  render: function() {
    BaseView.prototype.render.call(this);
    this.assign(this.child_view, '#child_view');
    return this;
  }
});
var parent_view = new ParentView();
parent_view.render();
```

### ModelView

Provides simple `render` method to pass the model's attributes to the
template.

```
var MyModelView = ModelView.extend({
  template: 'model_view_tpl'
});
var my_model_view = new MyModelView({model: new Backbone.Model()});
my_model_view.render();
```

### GroupedCollectionView

Provides a way to group views in a collection view according to model properties.

Supports: 

- multiply nested grouping
- group toggling
- dynamic regrouping when watched model change

Built to work with `GrouperView` that controls grouping.

Example in /examples.

### GrouperView

Built to work with GroupedCollectionView, provides a way to toggle groupings on an off.

Example in /examples.

### Backbone Mixin

Provides a way to mix functionality into Backbone components, either
from other Backbone components (e.g. mix View B into View A), or plain
js objects.

For a nice similar project see [Backbone Cocktail](https://github.com/onsi/cocktail).
One difference between that implementation and mine, is mine allows you
to mixin plain js objects. Backbone Cocktail provides a nicer way to do
multiple mixins, and also monkey patch Backbone's own `_.extend`
(optional).

## Tests

More or less full coverage tests using jasmine currently exist for:

- ModelView
- ModelEditView
- CollectionView
- FilteredCollectionView
- FiltererView
- backbone\_mixin

You can run the tests by opening `test/SpecRunner.html`.
