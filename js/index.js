"use strict";

function Gravity(parent,domSett){
	var canvas=parent.querySelector('canvas');

	var ppl=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-left')),
        ppr=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-right')),
        ppt=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-top')),
        ppb=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-bottom'));

	this.width=parent.clientWidth-ppl-ppr;
	this.height=parent.clientHeight-ppt-ppb;

    this.center=new Vector(this.width/2,this.height/2,this.height/2);

	this.bounds=canvas.getBoundingClientRect();
    this._settings=arguments[1]||{'pulse':200,'mass':200};

	this.domSettings=domSett;
	canvas.width=this.width;
	canvas.height=this.height;

    this.timer=false;
    this.isAlive=false;
	this.ctx=canvas.getContext("2d");
	this.mass=[];
    this.pixPerAU=Math.min(this.width,this.height)/this.domSettings.distance;
	this._mouse={'drag':false,'x':0,'y':0};

    this.draw=function(){
		var ctx=this.ctx;
		ctx.clearRect(0,0,this.width,this.height);
        this.mass.forEach(function(mt){ mt.draw.call(mt,ctx); });
        //draw axis
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

    this.createSolar=function(){
        this.mass=[];
        //the sun
        this.mass.push(new Mass(this.center,200000).color('#F8D52E'));
        //mercury
        var mm=this.center.clone();
        mm.x+=0.466697 * this.pixPerAU; 
        this.mass.push(new Mass(mm,3.3022).color('#949297'));

        //venus
        var mv=this.center.clone();
        mv.x+=0.72823128 * this.pixPerAU; 
        this.mass.push(new Mass(mv,48.685).color('#BA7323'));
        //earch
        var me=this.center.clone();
        me.x+=1.0167103335  * this.pixPerAU; 
        this.mass.push(new Mass(me,59.736).color('#1F2B5F'));
        //Jupiter
        var mj=this.center.clone();
        mj.x+=5.4581  * this.pixPerAU; 
        this.mass.push(new Mass(mj,18986).color('#C3CEE0'));
    }

    this.createRandsMass=function(){
        var rnd=function(min,max){
            return Math.ceil(Math.random()*(max-min)+min);
        };
        var count=rnd(43,100);
        do{
            var m=rnd(10,100);
            var x=rnd(10,this.width),
                y=rnd(10,this.height),
                z=rnd(10,this.height);

            this.mass.push(new Mass(x,y,z,m));
        }while(count--);
        // this._calcCenter();

    }
    this.settings=function(name,val){
        this._settings[name]=val;
        if(this.isAlive){
            this.stop();
            this.start();
        }
    }
    this.stop=function(){
        if(this.isAlive){
            window.clearInterval(this.isAlive);
            this.isAlive=false;
        }
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
    this.onDrag=function(dx,dy){
        this.mass.forEach(function(item){
            item.rotateX((Math.PI/180)*dy);
            item.rotateY((Math.PI/180)*dy);
        });
    }
    this._mouseDown=function(evt){
        this._mouse.drag=true;
        this._mouse.x=evt.clientX - this.bounds.left;
        this._mouse.y=evt.clientY - this.bounds.top;
    };
    this._mouseUp=function(evt){
        
        // var x=evt.clientX - this.bounds.left,y=evt.clientY - this.bounds.top;
        // var m=parseInt(this._settings.mass),mass=new Mass(x,y,0,m);
        // this.mass.push(mass);
        this._mouse.drag=false;
    };
    
    this._mouseMove=function(evt){
        if(this._mouse.drag){
            var x=evt.clientX - this.bounds.left,y=evt.clientY - this.bounds.top;
            this.onDrag(x-this._mouse.x,y-this._mouse.y);
            this._mouse.x=x;
            this._mouse.y=y;
        }
    };


    canvas.addEventListener("mousedown", this._mouseDown.bind(this), false);
    canvas.addEventListener("mouseup", this._mouseUp.bind(this), false);
	canvas.addEventListener("mousemove", this._mouseMove.bind(this), false);
    
    this.timer=window.setInterval(this.draw.bind(this),this._settings.pulse/10);
}
//taken from: https://codepen.io/akm2/pen/rHIsa
function Vector(x, y,z) {
    if (typeof x === 'object') {
        this.y = x.y;
        this.x = x.x;
        this.z = x.z;
    }else{
        this.x = x || 0;
        this.y = y || 0;
        this.z = z  || 0;    
    }
    
}
Vector.sub = function(a, b) {
    return new Vector(a.x - b.x, a.y - b.y,a.z-b.z);
};

Vector.prototype = {
    set: function(x, y,z) {
        if (typeof x === 'object') {
            y = x.y;
            x = x.x;
            z = x.z;
        }
        this.x = x || 0;
        this.y = y || 0;
        this.z=  z || 0;
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
        this.z *=s;
        return this;
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y + this.y+this.z*this.z);
    },
    lengthSq: function() {
        return this.x * this.x + this.y * this.y + this.y+this.z*this.z;
    },
    normalize: function() {
        var m = Math.sqrt(this.x * this.x + this.y * this.y+ this.y+this.z*this.z);
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
        return new Vector(this.x, this.y,this.z);
    },
    rotateX:function(deg){
        var y=this.y,z=this.z;
        this.y = y*Math.cos(deg) - z*Math.sin(deg);
        this.z = y*Math.sin(deg) + z*Math.cos(deg);
        return this;
    },
    rotateY:function(deg){
        var x=this.x,z=this.z;
        this.z = z*Math.cos(deg) - x*Math.sin(deg);
        this.x= z*Math.sin(deg) + x*Math.cos(deg);
        return this;
    },
    toString: function() {
        return '(x:' + this.x + ', y:' + this.y +  ', z:' + this.z+')';
    }
};

function Mass(){
	Vector.apply(this,arguments);
	this.m=arguments[0] instanceof Vector?arguments[1]:arguments[3];

	this._color='#'+Math.floor(Math.random()*16777215).toString(16);
	this.r=Math.max(2,this.m/10000);

    this._speed=new Vector();

    this.addSpeed=function(d) {
        this._speed = this._speed.add(d);
    }
    this.color=function(){
        if(arguments.length){
            this._color=arguments[0];
            return this;
        }else{
            return this._color;
        }
    }
	this.draw=function(ctx){
		ctx.beginPath();
        ctx.fillStyle=this._color;
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

function randomNumber(min,max){
    return Math.ceil(Math.random()*(max-min)+min);
}