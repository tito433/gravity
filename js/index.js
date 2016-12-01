"use strict";

function Gravity(parent,domSett){
	var canvas=parent.querySelector('canvas');

	var ppl=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-left')),
        ppr=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-right')),
        ppt=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-top')),
        ppb=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-bottom'));

	this.width=parent.clientWidth-ppl-ppr;
	this.height=parent.clientHeight-ppt-ppb;

    this.center=new Vector(this.width/2,this.height/2);
	this.bounds=canvas.getBoundingClientRect();
    this._settings=arguments[1]||{'pulse':200,'mass':200};

	this.domSettings=domSett;
	canvas.width=this.width;
	canvas.height=this.height;

    this.timer=false;
    this.isAlive=false;
	this.ctx=canvas.getContext("2d");
	this.mass=[];

	this.draw=function(){
		var ctx=this.ctx;
		//clear all
		ctx.clearRect(0,0,this.width,this.height);
		//draw all mass
        this.mass.forEach(function(mt){ mt.draw.call(mt,ctx); });

		//draw center of mass
		ctx.beginPath();
        ctx.strokeStyle='#F00';
        ctx.moveTo(this.center.x-10,this.center.y);
        ctx.lineTo(this.center.x+10,this.center.y);
        ctx.stroke();
        ctx.moveTo(this.center.x,this.center.y-10);
        ctx.lineTo(this.center.x,this.center.y+10);
        ctx.stroke();
        ctx.closePath();
	};
    this.move=function(){
        for(var i=0,ln=this.mass.length;i<ln;i++){
            this.mass[i].move.call(this.mass[i],this.center);
        }
      //my place?
      this._calcCenter();
      this.draw();
    }
    this._calcCenter=function(){
        var sumX=0,sumY=0,sumM=0;
        this.mass.forEach(function(mt){
            sumX+=mt.m*mt.x;
            sumY+=mt.m*mt.y;
            sumM+=mt.m;
        });
        this.center.set(sumX/sumM,sumY/sumM);
    }

	this._onClick=function(evt){
		var x=evt.clientX - this.bounds.left,y=evt.clientY - this.bounds.top;
		var m=parseInt(this._settings.mass),mass=new Mass(x,y,m);
		this.mass.push(mass);
        this._calcCenter();
	}
    this.createTwinMass=function(){
        console.log('crate twin');
    }
    this.createRandsMass=function(){
        var rnd=function(min,max){
            return Math.ceil(Math.random()*(max-min)+min);
        };
        var count=rnd(43,100);
        do{
            var m=rnd(10,100);
            var x=rnd(10,this.width-m),
                y=rnd(10,this.height-m);
            this.mass.push(new Mass(x,y,m));
        }while(count--);
        this._calcCenter();

    }
    this.start=function(){
        if(!this.isAlive){
            this.isAlive=window.setInterval(this.move.bind(this),this._settings.pulse);
        }else{
            window.clearInterval(this.isAlive);
            this.isAlive=false;
        }
    }
    this.reset=function(){
        this.mass=[];
        this.draw();
    }
	canvas.addEventListener("mouseup", this._onClick.bind(this), false);
    
    this.timer=window.setInterval(this.draw.bind(this),this._settings.pulse/10);
}
//taken from: https://codepen.io/akm2/pen/rHIsa
function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}
Vector.sub = function(a, b) {
    return new Vector(a.x - b.x, a.y - b.y);
};

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
    this._speed=new Vector();

    this.addSpeed=function(d) {
        this._speed = this._speed.add(d);
    }

	this.draw=function(ctx){
		ctx.beginPath();
        ctx.fillStyle=this.color;
        ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
        ctx.fill();
	}
    this.move=function(center){
        this.addSpeed(Vector.sub(center,this).normalize());
        this.add(this._speed);
    }
}
Mass.prototype = Object.create(Vector.prototype);
Mass.prototype.constructor = Mass;