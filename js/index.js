"use strict";

function Space(parent) {
	var canvas = parent.querySelector('canvas');

	var ppl = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-left')),
		ppr = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-right')),
		ppt = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-top')),
		ppb = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-bottom'));

	this.width = parent.clientWidth - ppl - ppr;
	this.height = parent.clientHeight - ppt - ppb;

	this.center = new Vector(this.width / 2, this.height / 2, this.height / 2);

	this.bounds = canvas.getBoundingClientRect();

	canvas.width = this.width;
	canvas.height = this.height;

	this.ctx = canvas.getContext("2d");

	this.mass = [];

	this._mouse = {
		'drag': false,
		'x': 0,
		'y': 0
	};

	this.draw = function() {
		var ctx = this.ctx;
		ctx.clearRect(0, 0, this.width, this.height);
		this.mass.forEach(function(mt) {
			mt.draw.call(mt, ctx);
		});
		//draw axis
		//draw center of mass
		ctx.beginPath();
		ctx.strokeStyle = '#F00';
		ctx.moveTo(this.center.x - 10, this.center.y);
		ctx.lineTo(this.center.x + 10, this.center.y);
		ctx.stroke();
		ctx.moveTo(this.center.x, this.center.y - 10);
		ctx.lineTo(this.center.x, this.center.y + 10);
		ctx.stroke();
		ctx.closePath();
	};

	this.onDrag = function(dx, dy) {
		this.mass.forEach(function(item) {
			item.rotateX((Math.PI / 180) * dy);
			item.rotateY((Math.PI / 180) * dy);
		});
	}
	this._mouseDown = function(evt) {
		this._mouse.drag = true;
		this._mouse.x = evt.clientX - this.bounds.left;
		this._mouse.y = evt.clientY - this.bounds.top;
	};
	this._mouseUp = function(evt) {
		this._mouse.drag = false;
	};

	this._mouseMove = function(evt) {
		if (this._mouse.drag) {
			var x = evt.clientX - this.bounds.left,
				y = evt.clientY - this.bounds.top;
			this.onDrag(x - this._mouse.x, y - this._mouse.y);
			this._mouse.x = x;
			this._mouse.y = y;
		}
	};


	canvas.addEventListener("mousedown", this._mouseDown.bind(this), false);
	canvas.addEventListener("mouseup", this._mouseUp.bind(this), false);
	canvas.addEventListener("mousemove", this._mouseMove.bind(this), false);

	this.timer = window.setInterval(this.draw.bind(this), this._settings.pulse / 10);
}
//taken from: https://codepen.io/akm2/pen/rHIsa
function Vector(x, y, z) {
	if (typeof x === 'object') {
		this.y = x.y;
		this.x = x.x;
		this.z = x.z;
	} else {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	}

}
Vector.sub = function(a, b) {
	return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
};

Vector.prototype = {
	set: function(x, y, z) {
		if (typeof x === 'object') {
			y = x.y;
			x = x.x;
			z = x.z;
		}
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		return this;
	},
	add: function(v) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	},
	sub: function(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	},
	scale: function(s) {
		this.x *= s;
		this.y *= s;
		this.z *= s;
		return this;
	},
	length: function() {
		return Math.sqrt(this.x * this.x + this.y + this.y + this.z * this.z);
	},
	lengthSq: function() {
		return this.x * this.x + this.y * this.y + this.y + this.z * this.z;
	},
	normalize: function() {
		var m = Math.sqrt(this.x * this.x + this.y * this.y + this.y + this.z * this.z);
		if (m) {
			this.x /= m;
			this.y /= m;
			this.z /= m;
		}
		return this;
	},
	angle: function() {
		return Math.atan2(this.y, this.x);
	},
	angleTo: function(v) {
		var dx = v.x - this.x,
			dy = v.y - this.y;
		return Math.atan2(dy, dx);
	},
	distanceTo: function(v) {
		var dx = v.x - this.x,
			dy = v.y - this.y;
		return Math.sqrt(dx * dx + dy * dy);
	},
	distanceToSq: function(v) {
		var dx = v.x - this.x,
			dy = v.y - this.y;
		return dx * dx + dy * dy;
	},
	lerp: function(v, t) {
		this.x += (v.x - this.x) * t;
		this.y += (v.y - this.y) * t;
		return this;
	},
	clone: function() {
		return new Vector(this.x, this.y, this.z);
	},
	rotateX: function(deg) {
		var y = this.y,
			z = this.z;
		this.y = y * Math.cos(deg) - z * Math.sin(deg);
		this.z = y * Math.sin(deg) + z * Math.cos(deg);
		return this;
	},
	rotateY: function(deg) {
		var x = this.x,
			z = this.z;
		this.z = z * Math.cos(deg) - x * Math.sin(deg);
		this.x = z * Math.sin(deg) + x * Math.cos(deg);
		return this;
	},
	toString: function() {
		return '(x:' + this.x + ', y:' + this.y + ', z:' + this.z + ')';
	}
};