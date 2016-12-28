"use strict";

function Vertex(x, y, z) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
	this.z = parseFloat(z);

	this.rotate = function(theta, phi) {
		var ct = Math.cos(theta);
		var st = Math.sin(theta);
		var cp = Math.cos(phi);
		var sp = Math.sin(phi);
		// Rotation
		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = ct * x - st * cp * y + st * sp * z + this.x;
		this.y = st * x + ct * cp * y - ct * sp * z + this.y;
		this.z = sp * y + cp * z + this.z;
	}
};

function Vertex2D(x, y) {
	this.x = parseFloat(x);
	this.y = parseFloat(y);
};

function Cube(center, size) {
	var d = size / 2;
	this.center = center;
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
	this.rotate = function(theta, phi) {
		for (var i = 0, ln = this.vertices.length; i < ln; ++i) {
			var M = this.vertices[i];
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

function Space(parent) {
	var canvas = parent.querySelector('canvas');

	this.width = parent.clientWidth;
	this.height = parent.clientHeight;
	canvas.width = this.width;
	canvas.height = this.height;
	var dx = canvas.width / 2,
		dy = canvas.height / 2;

	this._mouse = {
		'down': false,
		'x': 0,
		'y': 0
	};
	this.ctx = canvas.getContext("2d");
	this.ctx.strokeStyle = 'rgba(68, 68, 68, 0.7)';
	this.ctx.fillStyle = 'rgba(204, 204, 204, 0.7)';

	this.center = new Vertex(0, 11 * dy / 10, 0);
	this._drawables = [];


	this.render = function() {
		var ctx = this.ctx;
		ctx.clearRect(0, 0, this.width, this.height);

		//draw all objects
		for (var i = 0, n_obj = this._drawables.length; i < n_obj; ++i) {
			// For each face
			for (var j = 0, n_faces = this._drawables[i].faces.length; j < n_faces; ++j) {
				// Current face
				var face = this._drawables[i].faces[j];

				// Draw the first vertex
				var P = face[0];
				ctx.beginPath();
				ctx.moveTo(P.x + dx, -P.y + dy);

				// Draw the other vertices
				for (var k = 1, n_vertices = face.length; k < n_vertices; ++k) {
					P = face[k];
					ctx.lineTo(P.x + dx, -P.y + dy);
				}

				// Close the path and draw the face
				ctx.closePath();
				ctx.stroke();
				ctx.fill();
			}
		}
	};

	this.add = function(drawable) {
		if (drawable != null) {
			this._drawables.push(drawable);
			this.render();
		}

	}
	this.clear = function() {
		this._drawables = [];
		this.ctx.clearRect(0, 0, this.width, this.height);
	}


	this.initMove = function(evt) {
		this._mouse.down = true;
		this._mouse.x = evt.clientX;
		this._mouse.y = evt.clientY;
	}

	this.move = function(evt) {
		if (this._mouse.down) {
			var theta = (evt.clientX - this._mouse.x) * Math.PI / 360;
			var phi = (evt.clientY - this._mouse.y) * Math.PI / 180;

			for (var i = 0, ln = this._drawables.length; i < ln; ++i) {
				if (this._drawables[i].rotate && typeof this._drawables[i].rotate === 'function')
					this._drawables[i].rotate(theta, phi);
			}
			this._mouse.x = evt.clientX;
			this._mouse.y = evt.clientY;
			this.render();
		}
	}

	this.stopMove = function() {
		this._mouse.down = false;
	}
	this.zoom = function(e) {
		var delta = e.wheelDelta / 10;
		this.camera += delta;
		this.render();
	}
	this.settings = function(name, val) {
		this._settings[name] = val;
		this.pixelPerAU = Math.min(this.width, this.height) / this._settings.distance;
	}
	canvas.addEventListener('mousedown', this.initMove.bind(this));
	canvas.addEventListener('mousemove', this.move.bind(this));
	canvas.addEventListener('mouseup', this.stopMove.bind(this));
	canvas.addEventListener('wheel', this.zoom.bind(this), true);

	this.rotate = function(deg) {

		this._drawables.forEach(function(item, idx) {
			if (item.rotate && typeof item.rotate === 'function')
				item.rotate(-Math.PI / deg, Math.PI / deg);
		})
		this.render();
	}
}