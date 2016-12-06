"use strict";

var Vertex = function(x, y, z) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
    this.z = parseFloat(z);
};
var Vertex2D = function(x, y) {
    this.x = parseFloat(x);
    this.y = parseFloat(y);
};
var Cube = function(center, size) {
    var d = size / 2;
    this.center=center;
    // Generate the vertices
    this.vertices = [
        new Vertex(center.x - d, center.y - d, center.z + d),
        new Vertex(center.x - d, center.y - d, center.z - d),
        new Vertex(center.x + d, center.y - d, center.z - d),
        new Vertex(center.x + d, center.y - d, center.z + d),
        new Vertex(center.x + d, center.y + d, center.z + d),
        new Vertex(center.x + d, center.y + d, center.z - d),
        new Vertex(center.x - d, center.y + d, center.z - d),
        new Vertex(center.x - d, center.y + d, center.z + d)
    ];

    // Generate the faces
    this.faces = [
        [this.vertices[0], this.vertices[1], this.vertices[2], this.vertices[3]],
        [this.vertices[3], this.vertices[2], this.vertices[5], this.vertices[4]],
        [this.vertices[4], this.vertices[5], this.vertices[6], this.vertices[7]],
        [this.vertices[7], this.vertices[6], this.vertices[1], this.vertices[0]],
        [this.vertices[7], this.vertices[0], this.vertices[3], this.vertices[4]],
        [this.vertices[1], this.vertices[6], this.vertices[5], this.vertices[2]]
    ];
    this.rotate=function(theta, phi){
    	for (var i = 0,ln=this.vertices.length; i < ln; ++i){
    		var M=this.vertices[i];
            var ct = Math.cos(theta);
	        var st = Math.sin(theta);
	        var cp = Math.cos(phi);
	        var sp = Math.sin(phi);
	        // Rotation
	        var x = M.x - this.center.x;
	        var y = M.y - this.center.y;
	        var z = M.z - this.center.z;

	        M.x = ct * x - st * cp * y + st * sp * z + this.center.x;
	        M.y = st * x + ct * cp * y - ct * sp * z + this.center.y;
	        M.z = sp * y + cp * z + this.center.z;
    	}
    }
};

function Canvas(canvas){
	var parent=canvas.parentNode;

	var ppl=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-left')),
        ppr=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-right')),
        ppt=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-top')),
        ppb=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-bottom'));

	this.width=parent.clientWidth-ppl-ppr;
	this.height=parent.clientHeight-ppt-ppb;
	this.bounds=canvas.getBoundingClientRect();
	canvas.width=this.width;
	canvas.height=this.height;
	this._mouse={};
    this.ctx=canvas.getContext("2d");
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';

    this._drawables=[];
    var dx=canvas.width/2,dy=canvas.height/2;
    var project=function(M) {
	    return new Vertex2D(M.x, M.z);
	}

    this.render=function(){
		var ctx=this.ctx;
		ctx.clearRect(0,0,this.width,this.height);

		//draw all objects
		for (var i = 0, n_obj = this._drawables.length; i < n_obj; ++i) {
	        // For each face
	        for (var j = 0, n_faces = this._drawables[i].faces.length; j < n_faces; ++j) {
	            // Current face
	            var face = this._drawables[i].faces[j];

	            // Draw the first vertex
	            var P = project(face[0]);
	            ctx.beginPath();
	            ctx.moveTo(P.x + dx, -P.y + dy);

	            // Draw the other vertices
	            for (var k = 1, n_vertices = face.length; k < n_vertices; ++k) {
	                P = project(face[k]);
	                ctx.lineTo(P.x + dx, -P.y + dy);
	            }

	            // Close the path and draw the face
	            ctx.closePath();
	            ctx.stroke();
	            ctx.fill();
	        }
	    }
	};
    
    this.add=function(drawable){
    	if(drawable!=null)this._drawables.push(drawable);
    }
    this.clear=function(){
    	this._drawables=[];
    }

    this.render();
    // Events
    var mousedown = false;
    var mx = 0;
    var my = 0;
    var autorotate_timeout;

    

    

    // Initialize the movement
    this.initMove=function(evt) {
        clearTimeout(autorotate_timeout);
        mousedown = true;
        mx = evt.clientX;
        my = evt.clientY;
    }

    this.move=function(evt) {
        if (mousedown) {
            var theta = (evt.clientX - mx) * Math.PI / 360;
            var phi = (evt.clientY - my) * Math.PI / 180;

            for (var i = 0,ln=this._drawables.length; i < ln; ++i){
            	if(this._drawables[i].rotate && typeof this._drawables[i].rotate==='function')
                this._drawables[i].rotate(theta, phi);
            }
            mx = evt.clientX;
            my = evt.clientY;
            this.render();
        }
    }

    this.stopMove=function() {
        mousedown = false;
        autorotate_timeout = setTimeout(this.autorotate.bind(this), 2000);
    }

    this.autorotate=function() {
    	this._drawables.forEach(function(item,idx){
    		if(item.rotate && typeof item.rotate==='function')
            	item.rotate(-Math.PI / 720, Math.PI / 720);
    	})
        this.render();
        autorotate_timeout = setTimeout(this.autorotate.bind(this), 30);
    }
    autorotate_timeout = setTimeout(this.autorotate.bind(this), 2000);

    canvas.addEventListener('mousedown', this.initMove.bind(this));
    canvas.addEventListener('mousemove', this.move.bind(this));
    canvas.addEventListener('mouseup', this.stopMove.bind(this));
}