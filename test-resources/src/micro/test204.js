var a = ["foo", "bar", "baz"];
var x = "";

function f() {
	for (var i = 0; i < a.length; i++) {
		TAJS_dumpValue(i);
		x += a[i];
	}
}

if (Math.random()) a[10] = "dyt"; // also try with 2 instead of 100 :-)
TAJS_dumpObject(a);

f();
TAJS_dumpValue(x);
