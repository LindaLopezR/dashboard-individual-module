import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { Gembas } from 'meteor/igoandsee:gembas-collection';
import { Histories } from 'meteor/igoandsee:histories-collection';

import moment from 'moment';

import './dashboard.html';

Template.dashboard.onCreated(function(){

	let now = moment();
	let midNigth = moment(now).hour(0).minute(0);

	this.now = new ReactiveVar();
	this.midNigth = new ReactiveVar();

	this.now.set(now.valueOf());
	this.midNigth.set(midNigth.valueOf());

	this.interval = setInterval(() => {

		let now = moment();
		let midNigth = moment(now).hour(0).minute(0);

		this.now.set(now.valueOf());
		this.midNigth.set(midNigth.valueOf());

		updateHeader();
	}, 10000);

});

Template.dashboard.onDestroyed(function () {
	console.log('Clear interval');
	clearInterval(this.interval);
});

Template.dashboard.rendered = function(){
	$("#textura").pan({fps:20, speed: 0.5, dir: 'left', depth: 10});
	$('.more').hide();
	updateHeader();
};

Template.dashboard.events({

	'click .info'(e) {
		e.preventDefault();
		let infoParagraph = $(e.target).closest('.info').next('.more');
		infoParagraph.toggle(200);
	}

});

Template.dashboard.helpers({

	getRunningHistories() {
		let now = Template.instance().now.get();
		return Histories.find({enable:true,startDate:{$lt:now}, onDemand:{$exists:false}});
	},

	getBeforeHistories() {
		let midNigth = Template.instance().midNigth.get();
		let query = {
			$or : [
				{ enable : false, finishDate : {$gt:midNigth} },
				{ enable : false, onDemand : true }
			]
		};
		return Histories.find(query);
	},

	getAfterHistories() {
		let now = Template.instance().now.get();
		return Histories.find({enable:true,startDate:{$gt:now}});
	},

	showRunningHistories() {
		let now = Template.instance().now.get();
		return Histories.find({enable:true,startDate:{$lt:now}, onDemand:{$exists:false}}).count() > 0;
	},

	showBeforeHistories() {
		let midNigth = Template.instance().midNigth.get();
		let query = {
			$or : [
				{ enable : false, finishDate : {$gt:midNigth} },
				{ enable : false, onDemand : true }
			]
		};
		return Histories.find(query).count() > 0;
	},

	showAfterHistories() {
		let now = Template.instance().now.get();
		return Histories.find({enable:true,startDate:{$gt:now}}).count() > 0;
	},

	countRunningHistories() {
		let now = Template.instance().now.get();
		let countRunning = Histories.find({enable:true,startDate:{$lt:now}, onDemand:{$exists:false}}).count()
		if (countRunning > 99) {
			return '99+';
		} else {
			return countRunning;
		};
	},

	countBeforeHistories() {

		let midNigth = Template.instance().midNigth.get();
		let query = {
			$or : [
				{ enable : false, finishDate : {$gt:midNigth} },
				{ enable : false, onDemand : true }
			]
		};

		//{enable:false, finishDate:{$gt:midNigth}}
		let countBefore = Histories.find(query).count();
		if (countBefore > 99) {
			return '99+';
		} else {
			return countBefore;
		};

	},

	countAfterHistories() {
		let now = Template.instance().now.get();
		let countAfter = Histories.find({enable:true,startDate:{$gt:now}}).count();
		if (countAfter > 99) {
			return '99+';
		} else {
			return countAfter;
		}
	}

});

Template.historyRealTime.helpers({

	formatDate(date) {
		return moment(date).format('MMM-DD-YYYY hh:mm A');
	},

	gembaName(gemba) {
		try{
			return Gembas.findOne({_id:gemba}).name;
		}catch(err){
			return TAPi18n.__('n_a');
		}
	},

});

function updateHeader() {

	Meteor.call('getHeaderDone', function(error, result) {
		if (result) {
			let text = `${result.done}/${result.total}`;
			$('#headerDoneCount').text(text);
		}
	});

	Meteor.call('getHeaderCompletion', function(error, result) {
		if (result) {
			$('#headerOnTimeCompletion').text(result.count);
		}
	});

}
