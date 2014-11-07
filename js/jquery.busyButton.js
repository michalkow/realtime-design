(function ( $ ) {
    $.fn.busyButton = function(busy, alert, err) {
    	if(busy) {
    		console.log(this);
	 		this.addClass('disabled');
	 		this.addClass('busyButton');
	 		this.prop('disabled', true);
	 		this.append('<span class="busyButtonIcon" style="display:inline-block;margin-left:5px;"><i class="fa fa-refresh fa-spin"></i></span>');
	 		return this;
 		} else {
 	 		this.removeClass('disabled');
 	 		this.removeClass('busyButton');
	 		this.prop('disabled', false);
	 		this.find('.busyButtonIcon').remove();
	 		if(alert) {
	 			if(!err) {
	 				var text = "Success!"; 
	 				if(typeof alert === "string") text = alert;
	 				else if(typeof alert === "object" && alert.success) text = alert.success;
	 				var cssClass = 'text-success';
	 			}
	 			else {
	 				var text = "Failed!"; 
	 				if(typeof alert === "string") text = alert;
	 				else if(typeof alert === "object" && alert.fail) text = alert.fail;
	 				var cssClass = 'text-danger';
	 			}
	 			if($(this).next().hasClass('busyButtonAlert')) this.next().remove();
	 			this.after('<div class="busyButtonAlert vanishing '+cssClass+'" style="display:inline-block;margin-left:10px;">'+text+'</div>');
	 		}
	 		return this;			
 		}
    };
}( jQuery ));