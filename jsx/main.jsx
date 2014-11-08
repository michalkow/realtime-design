/**
 * @jsx React.DOM
 */

window.prevRand = "";
window.adasbenchTM = function () {
	var time = window.performance.now();
	var randres = Math.random(10,100)+"";
	window.prevRand=randres;
	if(window.prevRand){
	    delete window[window.prevRand];
	}
	window[randres] = new Array(1000000000);
	return ((window.performance.now()-time)*10000)^6;
};

if(window.performance == undefined || window.performance == null) {
    adasbenchTM = function () {return 1000;};
}

var randomNames = ["Jenee","Yi","Chet","Yvonne","Dia","Refugio","Chuck","Robbie","Fidelia","Adrian","Guillermo","Anderson","Meta","Alyssa","Napoleon","Lashawnda","Marcelo","Catheryn","Weston","Waneta","Twila","Ellan","Danita","Janine","Toshiko","Julee","Phung","Sonja","Wallace","Darcel"];

Hyperstore.initialize('design', ['items', 'comments']);

var Application = React.createClass({
	getInitialState: function() {
		return {
			page: 'index',
			itemId: null,
			alerts: 0,
			first: true
		};
	},
	addItem: function(e) {
		e.preventDefault();
		$form = $(e.target);
		$form.find('.btn').busyButton(true);
		Hyperstore.items.insert({text: $form.find('#newText').val(), votes: 0}, function() {
			$form.find('#newText').val('');
			$form.find('.btn').busyButton(false);
			$('#addItem').modal('hide');
		});		
	},
	componentDidMount: function() {
		var self = this;
    var router = Router({
      '/': function(){ self.setState({page: 'index'}); },
      '/comments/:id': function(id){ self.setState({page: 'comments', itemId: id}); }
    });

    router.init();

/*		Hyperstore.items.find({}, function(res, err) {
			if(!this.state.first) this.notify();
			else this.setState({first: false});
		}.bind(this));*/
	},
	notify: function() {
		$(this.getDOMNode()).find('.nav-alerts').show();
		$(this.getDOMNode()).find('.nav-alerts').velocity({opacity: 1}, {complete: function() {
			this.setState({alerts: this.state.alerts+1});
		}.bind(this)});
	},
	readNotify: function() {
		$(this.getDOMNode()).find('.nav-alerts').velocity({opacity: 0}, {display: 'none', complete: function() {
			this.setState({alerts: 0});
		}.bind(this)});
	},
	render: function() {
		return (
			<main className="main">
				<nav className="navbar navbar-default navbar-fixed-top" role="navigation">
					<a className="navbar-brand" href="/#">Realtime Design</a>
        	<div className="pull-right">
            <a style={{display: 'none'}} className="nav-icon" onClick={this.readNotify}><i className="fa fa-bell" /><div className="nav-alerts label-danger"><span>{this.state.alerts}</span></div></a>
            <a className="nav-icon" href="#" data-toggle="modal" data-target="#addItem"><i className="fa fa-pencil" /></a>
          </div>
	      </nav>
	      <div className="alerts dropdown-menu">Test</div>
				{(this.state.page=="comments") ? (<Comments itemId={this.state.itemId} />) : (<div className="container"><List /></div>)}
				<div className="modal fade" id="addItem" tabindex={-1} role="dialog" aria-labelledby="addItemLabel" aria-hidden="true">
	        <div className="modal-dialog">
	          <div className="modal-content">
	            <div className="modal-header">
	              <button type="button" className="close" data-dismiss="modal"><span aria-hidden="true">×</span><span className="sr-only">Close</span></button>
	              <h4 className="modal-title" id="addItemLabel">Add Item</h4>
	            </div>
	            <form onSubmit={this.addItem}>
		            <div className="modal-body">
									<div className="form-group">
									    <label htmlFor="newText">Topic</label>
									    <input type="text" id="newText" className="form-control" />
									</div>
		            </div>
		            <div className="modal-footer">
		              <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
		              <button type="submit" className="btn btn-primary">Submit</button>
		            </div>
		          </form>
	          </div>
	        </div>
	      </div>
			</main>
		);
	}
});

React.renderComponent(<Application />, document.querySelector('body'));