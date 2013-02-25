describe('SpeedyCollectionView', function() {
  describe('rendering methods', function() {
    beforeEach(function() {
      // group render-related methods here since they share so much setup and teardown
      this.collection = new Backbone.Collection([{id: 2, fiz: 'buzz'}, {id: 3, fiz: 'buzzard'}]);
      this.child_view_constructor = SpeedyCollectionModelView.extend({
        template: 'child_view_tpl',
        click: function() { return; }
      });
      this.constructor = SpeedyCollectionView.extend({
        events: { 'click .clicker': 'click' },
        template: 'tpl',
        child_view_constructor: this.child_view_constructor,
        list_selector: '#list',
        click: function(e) {
          var view = this.view_for_event(e);
          view.click();
        }
      });
      $('body').append('<div id="renderer" />');
      window.JST.tpl = _.template('some tpl <ul id="list"></ul>');
      window.JST.child_view_tpl = _.template('<a href="#" class="clicker">click <%= fiz %></a>');
    });
    afterEach(function() {
      this.view.remove();
      $('#renderer').remove();
      delete window.JST.tpl;
    });
    describe('render', function() {
      it('should append child view elements to the node specified by list selector, with events bound', function() {
        var clicker_spy = spyOn(this.child_view_constructor.prototype, 'click');
        this.view = new this.constructor({collection: this.collection, el: '#renderer'});
        this.view.render();
        expect(this.view.$('#list li').length).toBe(2);
        expect(this.view.$('#list li:first').html()).toContain('buzz');
        this.view.$('#list li:first .clicker').click();
        expect(clicker_spy).toHaveBeenCalled();
      });
    });
  });
});
