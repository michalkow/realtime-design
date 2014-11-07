/**
 * @jsx React.DOM
 */


var Comments = React.createClass({
	getInitialState: function() {
		return {comments: []};
	},
	componentDidMount: function() {
		Hyperstore.comments.find({itemId: this.props.itemId}, {sort: {createdAt: 1}}, function(res, err) {
			if(this.isMounted()) this.setState({comments: res});
		}.bind(this));
	},
	addComment: function(e) {
		e.preventDefault();
		$form = $(e.target);
		$form.find('.btn').busyButton(true);
		Hyperstore.comments.insert({
			itemId: this.props.itemId,
			text: $form.find('#newComment').val(),
			name: randomNames[Math.floor(Math.random() * (randomNames.length-1))]
		}, function() {
			console.log('insert');
			$form.find('#newComment').val('');
			$form.find('.btn').busyButton(false);
		});
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		if($(this.getDOMNode()).find('#newComment').is( ":focus" )) {
			$(this.getDOMNode()).find('.Comments-updates').show();
			$(this.getDOMNode()).find('.Comments-updates').velocity({height: 24});
			return false;
		} else {
			return true;
		}
	},
	showNew: function() {
		$(this.getDOMNode()).find('.Comments-updates').velocity({height: 0}, {display: 'none', complete: function() {
			this.forceUpdate();
		}.bind(this)});
	},
	render: function() {
		var comments = [];
		for (var i = 0; i < this.state.comments.length; i++) {
			comments.push(<Comment comment={this.state.comments[i]} />);
		};
		if(!comments.length) comments = (<div className="container"><h2 className="nocomments text-muted">No comments.</h2></div>) 
		return (
			<div className="Comments">
				{comments}
				<div className="Comments-updates label label-success" onClick={this.showNew}>Show New Comments</div>
				<form onSubmit={this.addComment} className="container">
					<div className="form-group">
					  <label htmlFor="newComment">Comment</label>
					  <textarea id="newComment" className="form-control" rows="4" />
					</div>
					<div className="form-group">
					 	<button type="submit" className="btn btn-primary">Submit</button>
					</div>
				</form>
			</div>
		);
	}
});

var Comment = React.createClass({
	componentDidMount: function() {
		$(this.getDOMNode()).velocity({height: [120, 0]}, {duration: 600});
	},
	render: function() {
		return (
			<div className="Comment">
				<div>
					<img className="Comment-avatar" src={"http://www.gravatar.com/avatar/"+this.props.comment._id+"?d=identicon"} />
					<span className="Comment-name text-primary">{this.props.comment.name}</span>
				</div>	
				<p className="Comment-text">
					{this.props.comment.text}
				</p>	
			</div>
		);
	}
});
