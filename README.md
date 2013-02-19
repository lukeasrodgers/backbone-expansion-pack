# Backbone Expansion Pack

Some extensions to Backbone base components.

Most of this code either is or has been running in various production
environments, but as presented here, it should be considered (mostly)
untested, unless otherwise indicated.

## Components

Docs in progress.

### backbone mixin

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
