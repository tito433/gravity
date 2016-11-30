"use strict";

function Gravity(parent,domSett){
	var canvas=parent.querySelector('canvas');

	var ppl=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-left')),
        ppr=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-right')),
        ppt=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-top')),
        ppb=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-bottom'));

	this.width=parent.clientWidth-ppl-ppr;
	this.height=parent.clientHeight-ppt-ppb;
	this.centerX=this.width/2;
	this.centerY=this.height/2;
	this.bounds=canvas.getBoundingClientRect();
	this.domSettings=domSett;
	canvas.width=this.width;
	canvas.height=this.height;

	this.ctx=canvas.getContext("2d");
	this.mass=[];

	this.draw=function(){
		var ctx=this.ctx;
		//clear all
		ctx.clearRect(0,0,this.width,this.height);
		//draw center of mass
		ctx.beginPath();
        ctx.strokeStyle='#F00';
        ctx.moveTo(this.centerX-10,this.centerY);
        ctx.lineTo(this.centerX+10,this.centerY);
        ctx.stroke();
        ctx.moveTo(this.centerX,this.centerY-10);
        ctx.lineTo(this.centerX,this.centerY+10);
        ctx.stroke();
        ctx.closePath();
        //draw all mass
        for(var i=0,ln=this.mass.length;i<ln;i++){
			this.mass[i].draw(ctx);
		}
		requestAnimationFrame(this.draw.bind(this));
	};
	this.calcCenter=function(){
		var sumX=0,sumY=0,sumM=0;

		for(var i=0,ln=this.mass.length;i<ln;i++){
			sumX+=this.mass[i].m*this.mass[i].x;
			sumY+=this.mass[i].m*this.mass[i].y;
			sumM+=this.mass[i].m;
		}
		this.centerX=sumX/sumM;
		this.centerY=sumY/sumM;
	}

	this._onClick=function(evt){
		var x=evt.clientX - this.bounds.left,y=evt.clientY - this.bounds.top;
		var inputMass=this.domSettings.querySelector("input[name='mass']"),
			m=parseInt(inputMass.value),
			mass=new Mass(x,y,m);

		this.mass.push(mass);
		this.calcCenter();
	}

	canvas.addEventListener("mouseup", this._onClick.bind(this), false);
	this.draw();

}
//taken from: https://codepen.io/akm2/pen/rHIsa
function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vector.prototype = {
    set: function(x, y) {
        if (typeof x === 'object') {
            y = x.y;
            x = x.x;
        }
        this.x = x || 0;
        this.y = y || 0;
        return this;
    },
    add: function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    },
    sub: function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    },
    scale: function(s) {
        this.x *= s;
        this.y *= s;
        return this;
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    lengthSq: function() {
        return this.x * this.x + this.y * this.y;
    },
    normalize: function() {
        var m = Math.sqrt(this.x * this.x + this.y * this.y);
        if (m) {
            this.x /= m;
            this.y /= m;
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
        return new Vector(this.x, this.y);
    },
    toString: function() {
        return '(x:' + this.x + ', y:' + this.y + ')';
    }
};

function Mass(){
	Vector.apply(this,arguments);
	this.m=arguments[2];
	this.color='#'+Math.floor(Math.random()*16777215).toString(16);
	this.r=Math.max(2,this.m/10);

	this.draw=function(ctx){
		ctx.beginPath();
        ctx.fillStyle=this.color;
        ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
        ctx.fill();
	}
}
Mass.prototype = Object.create(Vector.prototype);
Mass.prototype.constructor = Mass;