function getMeZipMap(s){
	d = {}
	for (var i=0; i<s.length; i++) {
		d[s.charAt(i)] = i}
	d.length = s.length
	d._s = s
	return d
}

var MeZip = 
{
	separate_with: '~',
	encodable: getMeZipMap('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.'), // - is reserved for negatives obviously :-P
	base10: getMeZipMap('0123456789'),

	baseconvert: function(number, fromdigits, todigits) {
		var number = String(number)
		if (number.charAt(0) == '-') {
			number = number.slice(1, number.length)
			neg=1}
		else {
			neg=0}
		// make an integer out of the number
		var x = 0
		for (var i=0; i<number.length; i++) {
			var digit = number.charAt(i)
			x = x*fromdigits.length + fromdigits[digit]
		}
		// create the result in base 'todigits.length'
		res = ""
		while (x>0) {
			remainder = x % todigits.length
			res = todigits._s.charAt(remainder) + res
			x = parseInt(x/todigits.length)
		}
		if (neg) res = "-"+res
		return res
	},
	encodeArray: function(L){
		var r = []
		for (var i=0; i<L.length; i++) {
			 r.push(this.baseconvert(L[i], this.base10, this.encodable))
		}
		return r.join(this.separate_with)
	},
	decodeArray: function(s) {
		var r = []
		var s = s.split(this.separate_with)
		for (var i=0; i<s.length; i++) {
			 r.push(parseInt(this.baseconvert(s[i], this.encodable, this.base10)))
		}
		return r
	},
	encode: function(n){
		return this.baseconvert(n, this.base10, this.encodable)
	},
	decode: function(s) {
		return parseInt(this.baseconvert(s, this.encodable, this.base10))
	}
}

// UNCOMMENT ME for length/speed testing in a wider base!
// You may wish to experiment with the ranges for a happy medium between bandwidth and DB space :-P
/*var encodable = ''
for (var i=1; i<128; i++) {
	encodable += String.fromCharCode(i)
}
encodable = getMeZipMap(encodable)*/

//var test = [5, 654645, 24324, 652124, 65, 65289543, 65278432, 643175874158, 652754327543]
//console.log(MeZip.encodeArray(test))
//console.log(MeZip.decodeArray(MeZip.encodeArray(test)))


