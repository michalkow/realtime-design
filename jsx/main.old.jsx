/**
 * @jsx React.DOM
 */

Hyperstore.initialize('realtime', ['items']);

var example = [
	{_id: "a", text: "Hello Bird"},
	{_id: "b", text: "Hello World"},
	{_id: "c", text: "Hello Cow"},
	{_id: "d", text: "Hello Dog"},
	{_id: "e", text: "Hello Cat"},
	{_id: "f", text: "Hello Fox"},
	{_id: "g", text: "Hello Owl"},
	{_id: "h", text: "Hello Bat"},
	{_id: "i", text: "Hello Seal"},
];

var zebra = {_id: "z", text: "Hello Zebra"};

var List = React.createClass({
	getInitialState: function() {
		this.isAnimating = false;
		this.animationQueue = [];
		return {items: []};
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		var self = this;
		var oldOrder = _.clone(this.state.items);
		var newOrder = nextState.items;
		window.list = self;

		
		if(!self.animationQueue.length) {
			self.animationQueue.push({oldOrder: oldOrder, newOrder: newOrder});
			self.execAnimation();
		} else {
			self.animationQueue.push({oldOrder: oldOrder, newOrder: newOrder});
		}

/*		console.log(self.isAnimating);
		if(!self.isAnimating) {
			var updateHappened = false;
			self.force = false;
			self.isAnimating = true;

			_.each(helpers, function(helper){
				if(helper.removed) {
					updateHappened = true;
					$(self.getDOMNode()).find('[data-id="'+helper.item._id+'"]').velocity({opacity: 0}, {complete: function(el){
						if(!self.force) {
							self.forceUpdate();
							self.force=true;
							if(self.animationQueue.length > 0) {
								self.execAnimationQueue(self.animationQueue[0]);
							} else {
								self.isAnimating = false;
							}
						}
					}});
				}	else if(helper.added) {
					//$(self.getDOMNode()).find('[data-id="'+helper.item._id+'"]').velocity({opacity: [1, 0]});
				} else if(helper.moved!=0) {
					updateHappened = true;
					var pixels = helper.moved * $('.ListItem').height();
					$(self.getDOMNode()).find('[data-id="'+helper.item._id+'"]').velocity({translateY: pixels}, {complete: function(el){
						if(!self.force) {
							self.forceUpdate();
							self.force=true;
							if(self.animationQueue.length > 0) {
								self.execAnimationQueue(self.animationQueue[0]);
							} else {
								self.isAnimating = false;
							}
						}
						$(el).removeAttr('style');
						$(el).velocity('reverse', {duration: 0.1});
					}});				
				}
			});
			if(!updateHappened) self.isAnimating = false;
		} else {
			this.animationQueue.push(newOrder);
			updateHappened = true;
		}
		if(!updateHappened) return true;*/
		return false;
	},
	execAnimation: function() {
		var self = this;
		var oldOrder = self.animationQueue[0].oldOrder;
		var newOrder = self.animationQueue[0].newOrder;
		var helpers = this.diffArrays(oldOrder, newOrder);
		var updateHappened = false;
		self.force = false;

		_.each(helpers, function(helper){
			if(helper.removed) {
				updateHappened = true;
				$(self.getDOMNode()).find('[data-id="'+helper.item._id+'"]').velocity({opacity: 0}, {complete: function(el){
					self.nextAnimation();
				}});
			}	else if(helper.added) {
				//$(self.getDOMNode()).find('[data-id="'+helper.item._id+'"]').velocity({opacity: [1, 0]});
			} else if(helper.moved!=0) {
				updateHappened = true;
				var pixels = helper.moved * $('.ListItem').height();
				$(self.getDOMNode()).find('[data-id="'+helper.item._id+'"]').velocity({translateY: pixels}, {complete: function(el){
					self.nextAnimation();
					$(el).removeAttr('style');
					$(el).velocity('reverse', {duration: 0.1});
				}});				
			}
		});
		console.log(updateHappened);
		if(!updateHappened) self.nextAnimation();
	},
	nextAnimation: function(){
		if(!this.force) {
			this.force=true;
			this.forceUpdate();
			this.animationQueue.shift();
			if(this.animationQueue.length > 0) this.execAnimation();
		}
	},
	diffArrays: function(oldOrder, newOrder) {
		var helper = [];
		for (var i = 0; i < oldOrder.length; i++) {
			var removed = true;
			var moved = 0;
			var position = [0, 0];
			for (var j = 0; j < newOrder.length; j++) {
				if(newOrder[j]._id == oldOrder[i]._id) {
					removed = false;
					moved = j-i;
					position = [i, j]
				}
			};
			helper.push({item: oldOrder[i], removed: removed, moved: moved, position: position, added: false});
		};
		for (var i = 0; i < newOrder.length; i++) {
			var added = true;
			for (var j = 0; j < oldOrder.length; j++) {
				if(oldOrder[j]._id == newOrder[i]._id) {
					added = false;
				}
			};
			if(added) helper.push({item: newOrder[i], removed: false, position: [0, i], moved: 0, added: true});
		};
		return helper;
	},
	componentDidMount: function() {
		Hyperstore.items.find({}, {sort: {votes: -1, _id: 1}}, function(res, err) {
			this.setState({items: res});
		}.bind(this));
	},
	addItem: function(e) {
		e.preventDefault();
		Hyperstore.items.insert({text: $(e.target).find('#newText').val(), votes: 0});
		$(e.target).find('#newText').val('');
	},
	execAnimationQueue: function(newOrder) {
		this.animationQueue.shift();
		setTimeout(function(){
			this.isAnimating = false;
			this.setState({items: newOrder});
		}.bind(this), 100);			
	},
	render: function() {
		var li = [];
		for (var i = 0; i < this.state.items.length; i++) {
			li.push(<ListItem _id={this.state.items[i]._id} key={this.state.items[i]._id} text={this.state.items[i].text} votes={this.state.items[i].votes} />);
		};
		return (
			<div>
				<ul>
					{li}
				</ul>
				<form onSubmit={this.addItem}>
					<input type="text" id="newText" />
					<button type="submit">Add Item</button>
				</form>
			</div>
		);
	}
});

var ListItem = React.createClass({
	componentDidMount: function() {
		$(this.getDOMNode()).velocity({opacity: [1, 0]});
	},
	remove: function() {
		Hyperstore.items.remove({_id: this.props._id});
	},
	upvote: function() {
		Hyperstore.items.update({_id: this.props._id}, {$set: {votes: this.props.votes+1}});
	},
	downvote: function() {
		Hyperstore.items.update({_id: this.props._id}, {$set: {votes: this.props.votes-1}});
	},
	render: function() {
		return (
			<li className="ListItem" data-id={this.props._id}>
				{this.props.votes} <i className="fa fa-arrow-up" onClick={this.upvote} /> <i className="fa fa-arrow-down" onClick={this.downvote} /> {this.props.text}	<i className="fa fa-times" onClick={this.remove} />
			</li>
		);
	}
});

React.renderComponent(<List />, document.querySelector('body'));