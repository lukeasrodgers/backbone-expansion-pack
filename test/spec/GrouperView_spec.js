describe('GrouperView', function() {
  describe('initialize', function() {
    beforeEach(function() {
      window.JST.tpl = _.template('some tpl');
    });
    it('should throw an error if there is no view to group', function() {
      var ViewConstructor = GrouperView.extend({
        template: 'tpl'
      });
      expect(function() { new ViewConstructor(); }).toThrow('Grouper view requires view to group');
    });
  });
  describe('toggle_group', function() {
    beforeEach(function() {
      window.JST.tpl = _.template('some tpl');
    });
    it('should trigger render events', function() {
      var ViewConstructor = BaseView.extend({
        template: 'tpl'
      });
      var spy = spyOn(ViewConstructor.prototype, 'trigger');
      var view = new ViewConstructor();
      view.render();
      expect(spy).toHaveBeenCalledWith('before:render');
      expect(spy).toHaveBeenCalledWith('after:render');
      expect(spy).toHaveBeenCalledWith('html_ready');
    });
  });
});
