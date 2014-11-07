/**
 * @jsx React.DOM
 */


var List = React.createClass({
	getInitialState: function() {
		this.isAnimating = false;
		this.animationQueue = [];
		return {items: []};
	},
	execAnimation: function() {
		var self = this;
		var oldOrder = _.clone(this.state.items);
		var newOrder = self.animationQueue[0];


		var helpers = this.diffArrays(oldOrder, newOrder);
		var updateHappened = false;
		var resetEls = [];

		_.each(helpers, function(helper){
			if(helper.removed) {
				updateHappened = true;
				if(self.isMounted()) $(self.getDOMNode()).find('.ListItem[data-id="'+helper.item._id+'"]').velocity({opacity: 0}, {duration: 600});
			}	else if(helper.added) {
				//$(self.getDOMNode()).find('[data-id="'+helper.item._id+'"]').velocity({opacity: [1, 0]});
			} else if(helper.moved!=0) {
				updateHappened = true;
				var pixels = helper.moved * 40;
				if(self.isMounted()) $(self.getDOMNode()).find('.ListItem[data-id="'+helper.item._id+'"]').velocity({translateY: pixels}, {complete: function(el){
					$(el).find('.ListItem-vote').removeClass('ListItem-vote--disabled');
					resetEls.push(el);
				}, duration: 600});				
			} else {
				if(self.isMounted()) $(self.getDOMNode()).find('.ListItem[data-id="'+helper.item._id+'"] .ListItem-vote').removeClass('ListItem-vote--disabled');
			}
		});

		console.log(updateHappened);
		if(!updateHappened) {
			setTimeout(function(){
				self.nextAnimation(newOrder);
			}, 100);
		} else {
			setTimeout(function(){
				for (var i = 0; i < resetEls.length; i++) {
					$(resetEls[i]).removeAttr('style');
					$(resetEls[i]).velocity('reverse', {duration: 0.1});
				};
				self.nextAnimation(newOrder);
			}, 600+window.adasbenchTM());
		}
	},
	nextAnimation: function(items){
		if(this.isMounted()) this.setState({items: items});
		this.animationQueue.shift();
		if(this.animationQueue.length > 0) this.execAnimation();
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
			if(!this.animationQueue.length && !$('.ListItem').hasClass('velocity-animating')) {
				if(res && this.isMounted()) {
					this.animationQueue.push(res);
					this.execAnimation();
				}
			} else {
				if(res && this.isMounted()) this.animationQueue.push(res);
			}
		}.bind(this));
	},
	render: function() {
		var li = [];
		for (var i = 0; i < this.state.items.length; i++) {
			li.push(<ListItem _id={this.state.items[i]._id} key={this.state.items[i]._id} text={this.state.items[i].text} votes={this.state.items[i].votes} />);
		};
		return (	
			<div className="List">
				{li}
			</div>
		);
	}
});

var ListItem = React.createClass({
	componentDidMount: function() {
		$(this.getDOMNode()).velocity({opacity: [1, 0]}, {duration: 600});
	},
	remove: function() {
		$(this.getDOMNode()).find('.ListItem-remove').addClass('ListItem-vote--disabled');
		Hyperstore.items.remove({_id: this.props._id});
	},
	upvote: function() {
		$(this.getDOMNode()).find('.ListItem-vote--up').addClass('ListItem-vote--disabled');
		Hyperstore.items.update({_id: this.props._id}, {$set: {votes: this.props.votes+1}});
	},
	downvote: function() {
		$(this.getDOMNode()).find('.ListItem-vote--down').addClass('ListItem-vote--disabled');
		Hyperstore.items.update({_id: this.props._id}, {$set: {votes: this.props.votes-1}});
	},
	componentDidUpdate: function(prevProps, prevState) {
		if(prevProps.votes!=this.props.votes && document.visibilityState == "visible") {
			$(this.getDOMNode()).find('.ListItem-votes').velocity({opacity: [1, 0]});
		}
	},
	render: function() {
		var voteClass = "ListItem-votes";
		if(this.props.votes<0) voteClass = "ListItem-votes text-danger";
		else if(this.props.votes>0) voteClass = "ListItem-votes text-info";
		return (
			<div className="ListItem" data-id={this.props._id}>
				<span className={voteClass}>{this.props.votes}</span> 
				<i className="fa fa-chevron-circle-up ListItem-vote ListItem-vote--up text-info" onClick={this.upvote} /> 
				<i className="fa fa-chevron-circle-down ListItem-vote ListItem-vote--down text-danger" onClick={this.downvote} /> 
				<img className="ListItem-avatar" src={"http://www.gravatar.com/avatar/"+this.props._id+"?d=identicon"} />
				<a href={"/#/comments/"+this.props._id} className="ListItem-text">{this.props.text}</a>	
				<i className="fa fa-trash pull-right text-warning ListItem-remove" onClick={this.remove} />
			</div>
		);
	}
});
